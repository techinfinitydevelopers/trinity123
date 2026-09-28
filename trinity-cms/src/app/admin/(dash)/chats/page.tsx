import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";
import { PageHeader, Empty } from "@/components/admin/ui";
import ChatDetail from "@/components/admin/ChatDetail";
import { fmt } from "@/lib/format";

export const metadata = { title: "Conversations" };

type SearchParams = { id?: string; status?: string; urgent?: string; q?: string; date?: string };

export default async function ChatsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const { id, status, urgent, q, date } = await searchParams;

  const where: Prisma.ChatSessionWhereInput = {};
  if (status && ["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) where.status = status as never;
  if (urgent === "1") where.isUrgent = true;
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    where.createdAt = { gte: start, lte: end };
  }

  const [sessions, total, urgentCount] = await Promise.all([
    db.chatSession.findMany({
      where, orderBy: { createdAt: "desc" }, take: 150,
      include: { _count: { select: { messages: true } }, messages: { orderBy: { createdAt: "asc" }, take: 1, where: { role: "user" } } },
    }),
    db.chatSession.count(),
    db.chatSession.count({ where: { isUrgent: true } }),
  ]);
  const active = id
    ? await db.chatSession.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } }, notes: { orderBy: { createdAt: "asc" } } } })
    : null;

  const qs = (over: Partial<SearchParams>) => {
    const next = { id, status, urgent, q, date, ...over };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    return `/admin/chats?${p.toString()}`;
  };

  if (!total) {
    return (
      <>
        <PageHeader title="Conversations" sub="Every chat students have with the assistant on your website." />
        <Empty title="No conversations yet" sub="Once the assistant is live, every student chat appears here." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Conversations" sub={`${total} total · ${urgentCount} urgent. Click a conversation to read the full transcript.`}>
        <Link href={qs({ urgent: urgent === "1" ? undefined : "1" })} className={urgent === "1" ? "btn-primary btn-sm" : "btn-ghost btn-sm"}>🚩 Urgent only</Link>
      </PageHeader>

      <form className="mb-4 flex flex-wrap items-center gap-2" action="/admin/chats">
        {id ? <input type="hidden" name="id" value={id} /> : null}
        <input className="inp inp-sm max-w-[220px]" name="q" defaultValue={q} placeholder="Search name, email or phone…" />
        <select className="inp inp-sm max-w-[150px]" name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <input className="inp inp-sm max-w-[160px]" type="date" name="date" defaultValue={date} />
        {urgent === "1" ? <input type="hidden" name="urgent" value="1" /> : null}
        <button className="btn-ghost btn-sm" type="submit">Filter</button>
        {(q || status || date || urgent) ? <Link href={qs({ q: undefined, status: undefined, date: undefined, urgent: undefined })} className="text-[12px] text-ink-3 hover:underline">Clear</Link> : null}
      </form>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="card max-h-[70vh] overflow-auto nice-scroll">
          <ul className="divide-y divide-line">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link href={qs({ id: s.id })} className={`block px-4 py-3 transition hover:bg-canvas/60 ${id === s.id ? "bg-brand-soft/50" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${s.phone ? "bg-emerald-500" : "bg-line"}`} />
                    <span className="truncate text-[14px] font-semibold text-navy">{s.name ?? `Visitor ${s.visitorId.slice(0, 6)}`}</span>
                    {s.isUrgent ? <span className="shrink-0 text-[11px]">🚩</span> : null}
                    <span className="ml-auto shrink-0 text-[11px] text-ink-3">{s._count.messages} msg</span>
                  </div>
                  <p className="mt-1 truncate text-[12.5px] text-ink-2">{s.messages[0]?.content ?? "—"}</p>
                  <p className="mt-1 text-[11px] text-ink-3">{fmt(s.createdAt)}{s.phone ? ` · ${s.phone}` : ""}</p>
                </Link>
              </li>
            ))}
            {!sessions.length ? <li className="px-4 py-10 text-center text-[13px] text-ink-3">No conversations match these filters.</li> : null}
          </ul>
        </div>

        <div className="card p-5">
          {active ? <ChatDetail session={active} /> : <p className="py-20 text-center text-[13px] text-ink-3">Select a conversation to read it.</p>}
        </div>
      </div>
    </>
  );
}
