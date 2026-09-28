/* Urgent-query email alerts via Resend. Silently no-ops without RESEND_API_KEY so the urgent
   flow always works for the student even before the client wires up email delivery. */
import type { ChatSession } from "@/generated/prisma";
import type { ContactSettings, ChatbotSettings, SiteSettings } from "./settings";

export async function sendUrgentEmail(
  session: Pick<ChatSession, "id" | "name" | "email" | "phone" | "createdAt">,
  question: string,
  cfg: ChatbotSettings,
  contact: ContactSettings,
  site: SiteSettings,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (cfg.notifyEmail || "").trim() || contact.email;
  if (!apiKey || !to) return { sent: false, reason: !apiKey ? "RESEND_API_KEY not set" : "no notify email configured" };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const link = `${siteUrl}/admin/chats?id=${session.id}`;
  const when = session.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#232F70;max-width:520px">
      <h2 style="margin:0 0 12px">🚩 Urgent chatbot query — ${site.siteName}</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:4px 0;color:#6B7280">Student</td><td style="padding:4px 0"><b>${escapeHtml(session.name || "Not given")}</b></td></tr>
        <tr><td style="padding:4px 0;color:#6B7280">Email</td><td style="padding:4px 0">${escapeHtml(session.email || "—")}</td></tr>
        <tr><td style="padding:4px 0;color:#6B7280">Phone</td><td style="padding:4px 0">${escapeHtml(session.phone || "—")}</td></tr>
        <tr><td style="padding:4px 0;color:#6B7280">Conversation ID</td><td style="padding:4px 0;font-family:monospace">${session.id}</td></tr>
        <tr><td style="padding:4px 0;color:#6B7280">Started</td><td style="padding:4px 0">${when}</td></tr>
      </table>
      <p style="margin:16px 0 6px;color:#6B7280">Student's question</p>
      <blockquote style="margin:0;padding:10px 14px;background:#F5F7FA;border-left:3px solid #232F70;border-radius:4px">${escapeHtml(question)}</blockquote>
      <p style="margin:20px 0"><a href="${link}" style="background:#232F70;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View full conversation →</a></p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Trinity Chatbot <onboarding@resend.dev>",
        to: [to],
        subject: `Urgent chatbot query from ${session.name || "a student"}`,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[notify] resend", res.status, body);
      return { sent: false, reason: `Resend API error ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[notify] resend", err);
    return { sent: false, reason: "network error" };
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
