import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings-server";
import { PageHeader } from "@/components/admin/ui";
import { ChatbotSettingsForm } from "@/components/admin/SettingsForms";
import KnowledgeEditor from "@/components/admin/KnowledgeEditor";

export const metadata = { title: "Chatbot" };

export default async function ChatbotPage() {
  await requireAdminPage();
  const [cfg, items, sessions] = await Promise.all([
    getSetting("chatbot"),
    db.knowledgeItem.findMany({ orderBy: { updatedAt: "desc" } }),
    db.chatSession.count(),
  ]);
  const keyOk = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <>
      <PageHeader title="Student assistant" sub={`AI chat on the website that answers student questions in real time. ${sessions} conversations so far.`} />
      {!keyOk ? <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] text-amber-800"><b>API key missing.</b> Add <code className="rounded bg-white px-1">ANTHROPIC_API_KEY</code> to the environment to activate the assistant. Everything else can be configured now.</div> : null}
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <ChatbotSettingsForm initial={cfg} />
        <KnowledgeEditor items={items} />
      </div>
    </>
  );
}
