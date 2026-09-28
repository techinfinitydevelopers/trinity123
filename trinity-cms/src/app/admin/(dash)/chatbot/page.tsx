import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings-server";
import { PageHeader } from "@/components/admin/ui";
import ChatbotTabs from "@/components/admin/ChatbotTabs";

export const metadata = { title: "Chatbot" };

export default async function ChatbotPage() {
  await requireAdminPage();
  const [cfg, items, unansweredRaw, sessions] = await Promise.all([
    getSetting("chatbot"),
    db.knowledgeItem.findMany({ orderBy: { updatedAt: "desc" } }),
    db.chatMessage.findMany({
      where: { unmatched: true, unmatchedResolved: false },
      orderBy: { createdAt: "desc" }, take: 200,
      include: { session: { select: { id: true, name: true, email: true, phone: true } } },
    }),
    db.chatSession.count(),
  ]);
  const unanswered = unansweredRaw.map((m) => ({
    id: m.id, content: m.content, createdAt: m.createdAt, sessionId: m.session.id,
    studentName: m.session.name, studentEmail: m.session.email, studentPhone: m.session.phone,
  }));
  const keyOk = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <>
      <PageHeader title="Student assistant" sub={`AI chat on the website that answers student questions from your knowledge base. ${sessions} conversations so far.`} />
      {!keyOk ? <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] text-amber-800"><b>API key missing.</b> Add <code className="rounded bg-white px-1">ANTHROPIC_API_KEY</code> to enable meaning-based (semantic) matching — exact keyword matching still works without it.</div> : null}
      <ChatbotTabs cfg={cfg} items={items} unanswered={unanswered} />
    </>
  );
}
