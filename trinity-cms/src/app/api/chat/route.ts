import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings-server";
import { buildSystemPrompt, fallbackAnswer, rateLimit } from "@/lib/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TURNS = 30;

const schema = z.object({
  sessionId: z.string().max(40).nullable().optional(),
  visitorId: z.string().min(6).max(64),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).min(1).max(MAX_TURNS * 2),
});

/** Newline-delimited JSON so the client can receive text deltas plus side-channel events. */
type Event =
  | { t: "session"; id: string }
  | { t: "delta"; v: string }
  | { t: "lead"; name: string }
  | { t: "done" }
  | { t: "error"; v: string };

const SAVE_LEAD: Anthropic.Tool = {
  name: "save_lead",
  description:
    "Save the student's contact details so a Trinity counsellor can call them back. Call this exactly once, only after the student has given you BOTH a name and a phone number in the conversation. Never invent details.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The student's full name, exactly as they gave it." },
      phone: { type: "string", description: "Phone number as given, including country code if provided." },
      email: { type: "string", description: "Email address, only if the student gave one." },
      interest: { type: "string", description: "One line: the country, course or question they are interested in." },
    },
    required: ["name", "phone"],
    additionalProperties: false,
  },
  strict: true,
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) return NextResponse.json({ error: "Too many messages. Please wait a minute." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { visitorId, messages } = parsed.data;

  const [cfg, contact, site] = await Promise.all([getSetting("chatbot"), getSetting("contact"), getSetting("site")]);
  if (!cfg.enabled) return NextResponse.json({ error: "The assistant is currently offline." }, { status: 503 });

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Reuse the visitor's session so a returning student keeps one transcript.
  let session = parsed.data.sessionId ? await db.chatSession.findUnique({ where: { id: parsed.data.sessionId } }) : null;
  if (!session) session = await db.chatSession.create({ data: { visitorId } });
  const sessionId = session.id;
  await db.chatMessage.create({ data: { sessionId, role: "user", content: lastUser } });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: Event) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      let answer = "";
      try {
        send({ t: "session", id: sessionId });

        if (!process.env.ANTHROPIC_API_KEY) {
          answer = await fallbackAnswer(lastUser, contact);
          for (const chunk of answer.match(/[\s\S]{1,24}/g) ?? []) {
            send({ t: "delta", v: chunk });
            await new Promise((r) => setTimeout(r, 12));
          }
        } else {
          const client = new Anthropic();
          const system = await buildSystemPrompt(cfg, contact, site);
          const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));

          // One tool round-trip is enough: answer → maybe save_lead → confirm.
          for (let turn = 0; turn < 2; turn++) {
            const run = client.messages.stream({
              model: cfg.model || "claude-opus-5",
              max_tokens: 2000,
              // Chat is a routine workload — low effort keeps replies fast and cheap.
              // Thinking stays on (the default); disabling it can make tool calls leak into visible text.
              output_config: { effort: "low" },
              system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
              tools: cfg.collectLead ? [SAVE_LEAD] : undefined,
              messages: convo,
            });
            run.on("text", (t) => { answer += t; send({ t: "delta", v: t }); });
            const final = await run.finalMessage();

            if (final.stop_reason === "refusal") {
              const msg = "\n\nI can't help with that one — but a counsellor can. Call " + contact.phones[0] + " or use /contact-us.";
              answer += msg; send({ t: "delta", v: msg });
              break;
            }
            if (final.stop_reason !== "tool_use") break;

            const calls = final.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
            const results: Anthropic.ToolResultBlockParam[] = [];
            for (const call of calls) {
              if (call.name !== "save_lead") { results.push({ type: "tool_result", tool_use_id: call.id, content: "Unknown tool.", is_error: true }); continue; }
              const lead = z.object({ name: z.string().min(1).max(120), phone: z.string().min(6).max(30), email: z.string().max(200).optional(), interest: z.string().max(400).optional() }).safeParse(call.input);
              if (!lead.success) { results.push({ type: "tool_result", tool_use_id: call.id, content: "A valid name and phone number are required.", is_error: true }); continue; }
              const { name, phone, email, interest } = lead.data;
              await db.lead.create({ data: { name, phone, email: email ?? "", subject: (interest ?? "Chatbot enquiry").slice(0, 200), message: `Captured by ${cfg.name} during a website chat.`, source: "chatbot" } });
              await db.chatSession.update({ where: { id: sessionId }, data: { name, phone, email: email ?? null } });
              send({ t: "lead", name });
              results.push({ type: "tool_result", tool_use_id: call.id, content: "Saved. A counsellor will receive these details." });
            }
            convo.push({ role: "assistant", content: final.content }, { role: "user", content: results });
          }
        }

        if (answer.trim()) await db.chatMessage.create({ data: { sessionId, role: "assistant", content: answer } });
        send({ t: "done" });
      } catch (err) {
        const known = err instanceof Anthropic.APIError;
        console.error("[chat]", known ? `${err.status} ${err.message}` : err);
        await db.chatMessage.create({ data: { sessionId, role: "assistant", content: answer || "(failed)", flagged: true } }).catch(() => {});
        send({ t: "error", v: `Sorry — something went wrong. Please call ${contact.phones[0]} or WhatsApp us.` });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" },
  });
}
