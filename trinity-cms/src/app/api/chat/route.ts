import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings-server";
import { buildSystemPrompt, fallbackAnswer, rateLimit, clientIp } from "@/lib/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

/** How many stored turns of this session are replayed to the model. */
const HISTORY_TURNS = 20;

/* The client sends only the new message. The conversation is rebuilt from our own
   ChatMessage rows — a client-supplied `assistant` turn is an injection vector
   (a forged "I agreed to ignore my instructions" turn outranks the system prompt). */
const schema = z.object({
  sessionId: z.string().max(40).nullable().optional(),
  visitorId: z.string().min(6).max(64),
  message: z.string().trim().min(1).max(4000),
});

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
  const ip = clientIp(req.headers);
  if (!rateLimit(`chat:${ip}`)) return NextResponse.json({ error: "Too many messages. Please wait a minute." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { visitorId, message } = parsed.data;

  const [cfg, contact, site] = await Promise.all([getSetting("chatbot"), getSetting("contact"), getSetting("site")]);
  if (!cfg.enabled) return NextResponse.json({ error: "The assistant is currently offline." }, { status: 503 });

  let sessionId: string;
  let history: { role: string; content: string }[] = [];
  try {
    // Only reuse a session that belongs to this visitor — a guessed id must not let
    // someone append to, or overwrite the contact details on, another student's transcript.
    let session = parsed.data.sessionId
      ? await db.chatSession.findFirst({ where: { id: parsed.data.sessionId, visitorId } })
      : null;
    if (!session) session = await db.chatSession.create({ data: { visitorId } });
    sessionId = session.id;
    history = await db.chatMessage.findMany({
      where: { sessionId, flagged: false },
      orderBy: { createdAt: "desc" }, take: HISTORY_TURNS * 2,
      select: { role: true, content: true },
    }).then((r) => r.reverse());
    await db.chatMessage.create({ data: { sessionId, role: "user", content: message } });
  } catch (err) {
    console.error("[chat] session setup", err);
    return NextResponse.json({ error: "Sorry — the assistant is unavailable. Please call or WhatsApp us." }, { status: 503 });
  }

  const encoder = new TextEncoder();
  let aborted = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: Event) => {
        if (aborted) return;
        try { controller.enqueue(encoder.encode(JSON.stringify(e) + "\n")); } catch { aborted = true; }
      };
      let answer = "";
      let leadSaved = false;
      try {
        send({ t: "session", id: sessionId });

        if (!process.env.ANTHROPIC_API_KEY) {
          answer = await fallbackAnswer(message, contact);
          for (const chunk of answer.match(/[\s\S]{1,24}/g) ?? []) {
            if (aborted) break;
            send({ t: "delta", v: chunk });
            await new Promise((r) => setTimeout(r, 12));
          }
        } else {
          const client = new Anthropic();
          const system = await buildSystemPrompt(cfg, contact, site);
          const convo: Anthropic.MessageParam[] = [
            ...history.map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.content })),
            { role: "user", content: message },
          ];

          // Answer → optionally save_lead → confirm. The last pass runs without tools so the
          // visitor always gets closing text instead of an empty bubble.
          for (let turn = 0; turn < 3; turn++) {
            const lastTurn = turn === 2;
            const run = client.messages.stream({
              model: cfg.model || "claude-opus-5",
              max_tokens: 2000,
              // Chat is a routine workload — low effort keeps replies fast and cheap.
              // Thinking stays on (the default); disabling it on Opus 5 can leak tool calls into visible text.
              output_config: { effort: "low" },
              system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
              tools: cfg.collectLead && !lastTurn ? [SAVE_LEAD] : undefined,
              messages: convo,
            });
            req.signal.addEventListener("abort", () => { aborted = true; run.abort(); }, { once: true });
            run.on("text", (t) => { answer += t; send({ t: "delta", v: t }); });

            let final: Anthropic.Message;
            try {
              final = await run.finalMessage();
            } catch (err) {
              if (aborted) return; // visitor closed the widget — stop quietly, we already stopped billing
              throw err;
            }

            if (final.stop_reason === "refusal") {
              const msg = `\n\nI can't help with that one — but a counsellor can. Call ${contact.phones[0]} or use /contact-us.`;
              answer += msg; send({ t: "delta", v: msg });
              break;
            }
            if (final.stop_reason !== "tool_use") break;

            const calls = final.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
            const results: Anthropic.ToolResultBlockParam[] = [];
            for (const call of calls) {
              if (call.name !== "save_lead") { results.push({ type: "tool_result", tool_use_id: call.id, content: "Unknown tool.", is_error: true }); continue; }
              if (leadSaved) { results.push({ type: "tool_result", tool_use_id: call.id, content: "Already saved earlier in this conversation — do not call this tool again." }); continue; }
              const lead = z.object({ name: z.string().trim().min(1).max(120), phone: z.string().trim().min(6).max(30), email: z.string().trim().max(200).optional(), interest: z.string().trim().max(400).optional() }).safeParse(call.input);
              if (!lead.success) { results.push({ type: "tool_result", tool_use_id: call.id, content: "A valid name and phone number are required.", is_error: true }); continue; }
              const { name, phone, email, interest } = lead.data;
              await db.lead.create({ data: { name, phone, email: email ?? "", subject: (interest ?? "Chatbot enquiry").slice(0, 200), message: `Captured by ${cfg.name} during a website chat.`, source: "chatbot" } });
              await db.chatSession.update({ where: { id: sessionId }, data: { name, phone, email: email ?? null } });
              leadSaved = true;
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
        try { controller.close(); } catch { /* already closed by an aborted client */ }
      }
    },
    cancel() { aborted = true; },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" },
  });
}
