import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings-server";
import { rateLimit, clientIp } from "@/lib/chat";
import { matchKnowledgeBase, isNonEnglish } from "@/lib/chat-match";

const ENGLISH_ONLY_MESSAGE = "This assistant answers in English only — could you please ask your question in English?";

export const runtime = "nodejs";
export const maxDuration = 30;

/** How many stored turns of this session are fed to the semantic matcher for context. */
const HISTORY_TURNS = 20;

const schema = z.object({
  sessionId: z.string().min(1).max(40),
  visitorId: z.string().min(6).max(64),
  message: z.string().trim().min(1).max(2000),
});

type Event =
  | { t: "delta"; v: string }
  | { t: "unmatched" }
  | { t: "matched"; question: string }
  | { t: "done" }
  | { t: "error"; v: string };

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`chat:${ip}`)) return NextResponse.json({ error: "Too many messages. Please wait a minute." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { sessionId, visitorId, message } = parsed.data;

  const [cfg, contact] = await Promise.all([getSetting("chatbot"), getSetting("contact")]);
  if (!cfg.enabled) return NextResponse.json({ error: "The assistant is currently offline." }, { status: 503 });

  // The conversation must already exist — created by the pre-chat name/email/phone form
  // (startChatSessionAction). A guessed id must not let someone append to another student's
  // transcript, so we require BOTH id and visitorId to match.
  const session = await db.chatSession.findFirst({ where: { id: sessionId, visitorId } });
  if (!session) return NextResponse.json({ error: "Your session has expired. Please refresh and start again." }, { status: 404 });

  let history: { role: string; content: string }[] = [];
  let userMessageId: string;
  try {
    history = await db.chatMessage.findMany({
      where: { sessionId, flagged: false },
      orderBy: { createdAt: "desc" }, take: HISTORY_TURNS * 2,
      select: { role: true, content: true },
    }).then((r) => r.reverse());
    userMessageId = (await db.chatMessage.create({ data: { sessionId, role: "user", content: message } })).id;
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
      req.signal.addEventListener("abort", () => { aborted = true; }, { once: true });

      const stream_text = async (text: string) => {
        for (const chunk of text.match(/[\s\S]{1,28}/g) ?? []) {
          if (aborted) return;
          send({ t: "delta", v: chunk });
          await new Promise((r) => setTimeout(r, 10));
        }
      };

      try {
        if (isNonEnglish(message)) {
          await stream_text(ENGLISH_ONLY_MESSAGE);
          send({ t: "done" });
          await db.chatMessage.create({ data: { sessionId, role: "assistant", content: ENGLISH_ONLY_MESSAGE } });
          return;
        }

        const match = await matchKnowledgeBase(message, history, cfg.matchThreshold);

        if (match) {
          await stream_text(match.answer);
          send({ t: "matched", question: match.question });
          await db.chatMessage.create({
            data: {
              sessionId, role: "assistant", content: match.answer,
              matchedKnowledgeId: match.id, matchedQuestion: match.question,
              confidence: match.confidence, fromKnowledgeBase: true,
            },
          });
        } else {
          await stream_text(cfg.unmatchedMessage);
          send({ t: "unmatched" });
          // Flag the STUDENT'S question, not the canned reply, so the admin's "Unanswered
          // questions" list shows what was actually asked.
          await db.chatMessage.update({ where: { id: userMessageId }, data: { unmatched: true } });
          await db.chatMessage.create({ data: { sessionId, role: "assistant", content: cfg.unmatchedMessage } });
        }
        send({ t: "done" });
      } catch (err) {
        console.error("[chat]", err);
        await db.chatMessage.create({ data: { sessionId, role: "assistant", content: "(failed)", flagged: true } }).catch(() => {});
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
