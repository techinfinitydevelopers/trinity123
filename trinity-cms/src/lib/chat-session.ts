"use server";
import { z } from "zod";
import { db } from "./db";
import { getSetting } from "./settings-server";
import { sendUrgentEmail } from "./notify";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true; sessionId?: string } | { ok: false; error: string };

const startSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  visitorId: z.string().min(6).max(64),
});

/** Creates the conversation up front, before the student asks anything — the pre-chat form. */
export async function startChatSessionAction(input: { name: string; email: string; phone: string; visitorId: string }): Promise<ActionResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please enter a valid name, email and phone number." };
  const { name, email, phone, visitorId } = parsed.data;
  try {
    const session = await db.chatSession.create({ data: { visitorId, name, email, phone } });
    return { ok: true, sessionId: session.id };
  } catch (err) {
    console.error("[chat-session] start", err);
    return { ok: false, error: "Could not start the chat. Please refresh and try again." };
  }
}

const urgentSchema = z.object({
  sessionId: z.string().min(1).max(40),
  visitorId: z.string().min(6).max(64),
  question: z.string().trim().max(2000).optional(),
});

/** Flags the conversation urgent and emails the configured admin address (best-effort — the
    student always gets a confirmation even if no notify email is configured yet). */
export async function markUrgentAction(input: { sessionId: string; visitorId: string; question?: string }): Promise<ActionResult> {
  const parsed = urgentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const { sessionId, visitorId, question } = parsed.data;
  try {
    const session = await db.chatSession.findFirst({ where: { id: sessionId, visitorId } });
    if (!session) return { ok: false, error: "Session not found." };

    const lastUserMsg = question || (await db.chatMessage.findFirst({ where: { sessionId, role: "user" }, orderBy: { createdAt: "desc" }, select: { content: true } }))?.content || "(no question given)";

    await db.chatSession.update({ where: { id: sessionId }, data: { isUrgent: true, urgentQuestion: lastUserMsg, urgentAt: new Date(), status: "OPEN" } });

    const [cfg, contact, site] = await Promise.all([getSetting("chatbot"), getSetting("contact"), getSetting("site")]);
    await sendUrgentEmail(session, lastUserMsg, cfg, contact, site);
    revalidatePath("/admin/chats");
    return { ok: true };
  } catch (err) {
    console.error("[chat-session] urgent", err);
    return { ok: false, error: "Could not send your request. Please call or WhatsApp us directly." };
  }
}
