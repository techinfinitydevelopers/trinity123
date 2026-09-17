import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, Empty } from "@/components/admin/ui";
import { fmt } from "@/lib/format";

export const metadata = { title: "Conversations" };

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const sessions = await db.chatSession.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { _count: { select: { messages: true } }, messages: { orderBy: { createdAt: "asc" }, take: 1, where: { role: "user" } } },
  });
  const active = id ? await db.chatSession.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } }) : null;

  if (!sessions.length) {
    return (
      <>
        <PageHeader title="Conversations" sub="Every chat students have with the assistant on your website." />
        <Empty title="No conversations yet" sub="Once the assistant is live, every student chat appears here — including the ones that turned into leads." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Conversations" sub={`${sessions.length} recent chats. Click one to read the full transcript.`} />
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="card max-h-[70vh] overflow-auto nice-scroll">
          <ul className="divide-y divide-line">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/chats?id=${s.id}`} className={`block px-4 py-3 transition hover:bg-canvas/60 ${id === s.id ? "bg-brand-soft/50" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${s.phone ? "bg-emerald-500" : "bg-line"}`} />
                    <span className="truncate text-[14px] font-semibold text-navy">{s.name ?? `Visitor ${s.visitorId.slice(0, 6)}`}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-ink-3">{s._count.messages} msg</span>
                  </div>
                  <p className="mt-1 truncate text-[12.5px] text-ink-2">{s.messages[0]?.content ?? "—"}</p>
                  <p className="mt-1 text-[11px] text-ink-3">{fmt(s.createdAt)}{s.phone ? ` · ${s.phone}` : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          {active ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-4">
                <div><h2 className="text-[16px] font-bold text-navy">{active.name ?? `Visitor ${active.visitorId.slice(0, 8)}`}</h2><p className="text-[12px] text-ink-3">{fmt(active.createdAt)}</p></div>
                {active.phone ? <a className="btn-primary btn-xs" href={`tel:${active.phone.replace(/[^\d+]/g, "")}`}>Call {active.phone}</a> : null}
                {active.phone ? <a className="btn-ghost btn-xs" href={`https://wa.me/${active.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener">WhatsApp</a> : null}
                {active.email ? <a className="btn-ghost btn-xs" href={`mailto:${active.email}`}>Email</a> : null}
              </div>
              <div className="max-h-[56vh] space-y-3 overflow-auto nice-scroll pr-1">
                {active.messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${m.role === "user" ? "ml-auto bg-brand text-white" : `bg-canvas text-ink ${m.flagged ? "border border-amber-300" : ""}`}`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-white/60" : "text-ink-3"}`}>{fmt(m.createdAt)}{m.flagged ? " · error" : ""}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-20 text-center text-[13px] text-ink-3">Select a conversation to read it.</p>
          )}
        </div>
      </div>
    </>
  );
}
