import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { fmt } from "@/lib/format";

export const metadata = { title: "Dashboard" };

const Stat = ({ label, value, href, accent }: { label: string; value: string | number; href: string; accent?: string }) => (
  <Link href={href} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
    <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">{label}</p>
    <p className={`mt-2 text-[32px] font-bold leading-none ${accent ?? "text-navy"}`}>{value}</p>
    <p className="mt-3 text-[12px] text-ink-3 group-hover:text-brand">Open →</p>
  </Link>
);



export default async function Dashboard() {
  const me = await getSession();
  const [pages, published, drafts, leads, unread, media, chats, recent, recentPosts] = await Promise.all([
    db.page.count(), db.post.count({ where: { status: "PUBLISHED" } }), db.post.count({ where: { status: "DRAFT" } }),
    db.lead.count(), db.lead.count({ where: { isRead: false } }), db.media.count(), db.chatSession.count(),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.post.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
  ]);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const health = [
    { ok: Boolean(process.env.ANTHROPIC_API_KEY), label: "Chatbot API key", fix: "Add ANTHROPIC_API_KEY to enable the assistant" },
    { ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.NODE_ENV !== "production", label: "Media storage", fix: "Add BLOB_READ_WRITE_TOKEN on Vercel" },
    { ok: (process.env.AUTH_SECRET ?? "").length >= 32 && !process.env.AUTH_SECRET?.startsWith("dev-only"), label: "Auth secret", fix: "Set a long random AUTH_SECRET" },
  ];

  return (
    <>
      <PageHeader title={`${greet}, ${me?.name.split(" ")[0]}`} sub="Here’s what’s happening on trinitystudyabroad.com.">
        <Link href="/admin/posts/new" className="btn-primary btn-sm">+ New blog post</Link>
        <Link href="/admin/pages" className="btn-ghost btn-sm">Edit pages</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Unread leads" value={unread} href="/admin/leads" accent={unread ? "text-brand" : undefined} />
        <Stat label="Total leads" value={leads} href="/admin/leads" />
        <Stat label="Blog posts" value={`${published}${drafts ? ` +${drafts} draft` : ""}`} href="/admin/posts" />
        <Stat label="Pages" value={pages} href="/admin/pages" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3"><h2 className="text-[15px] font-bold text-navy">Recent leads</h2><Link href="/admin/leads" className="text-[13px] text-brand hover:underline">View all</Link></div>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${l.isRead ? "bg-line" : "bg-brand"}`} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-navy">{l.name} <span className="font-normal text-ink-3">· {l.phone}</span></p><p className="truncate text-[13px] text-ink-2">{l.subject || l.message || l.email}</p></div>
                  <span className="text-[11px] text-ink-3">{fmt(l.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="px-5 py-10 text-center text-[13px] text-ink-3">No leads yet — they’ll appear here when students submit the contact form.</p>}
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-[15px] font-bold text-navy">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
              {[["/admin/pages/home", "Edit home page"], ["/admin/theme", "Change colours"], ["/admin/media", "Upload images"], ["/admin/settings", "Contact details"], ["/admin/chatbot", "Train chatbot"], ["/", "View website ↗"]].map(([h, l]) => (
                <Link key={h} href={h} target={h === "/" ? "_blank" : undefined} className="rounded-xl border border-line px-3 py-2.5 text-ink hover:border-brand hover:text-brand">{l}</Link>
              ))}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 text-[15px] font-bold text-navy">Recently edited posts</h2>
            <ul className="space-y-2">
              {recentPosts.map((p) => <li key={p.id} className="flex items-center gap-2 text-[13px]"><span className={`chip ${p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status === "PUBLISHED" ? "Live" : "Draft"}</span><Link href={`/admin/posts/${p.id}`} className="truncate text-navy hover:text-brand">{p.title}</Link></li>)}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 text-[15px] font-bold text-navy">System</h2>
            <ul className="space-y-2 text-[13px]">
              {health.map((h) => <li key={h.label} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${h.ok ? "bg-emerald-500" : "bg-amber-500"}`} /><span className="text-ink">{h.label}</span>{!h.ok ? <span className="ml-auto text-[12px] text-amber-600">{h.fix}</span> : <span className="ml-auto text-[12px] text-emerald-600">OK</span>}</li>)}
              <li className="flex items-center gap-2 text-ink-3"><span className="h-2 w-2 rounded-full bg-line" />{media} media files · {chats} chat sessions</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
