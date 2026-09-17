import Link from "next/link";
import { db } from "@/lib/db";
import { getSession, requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { fmt } from "@/lib/format";

export const metadata = { title: "Dashboard" };

const ICONS = {
  leads: "M4 6h16v12H4V6zm0 1l8 6 8-6",
  inbox: "M4 13h4l2 3h4l2-3h4M4 13l2-8h12l2 8v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z",
  posts: "M5 4h14v16H5V4zm3 4h8M8 12h8M8 16h5",
  pages: "M7 3h7l5 5v13H7V3zm7 1.5V9h4.5",
} as const;

const Stat = ({ label, value, href, icon, tint, accent }: {
  label: string; value: string | number; href: string; icon: keyof typeof ICONS; tint: string; accent?: string;
}) => (
  <Link href={href} className="card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lift">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">{label}</p>
      <span className={`icon-tile h-9 w-9 ${tint}`}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[icon]} /></svg>
      </span>
    </div>
    <p className={`mt-3 text-[34px] font-bold leading-none tracking-tight ${accent ?? "text-navy"}`}>{value}</p>
    <p className="mt-3 inline-flex items-center gap-1 text-[12px] text-ink-3 transition group-hover:text-brand">
      Open <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
    </p>
  </Link>
);



export default async function Dashboard() {
  await requireAdminPage();
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
        <Stat label="Unread leads" value={unread} href="/admin/leads" icon="inbox" tint="bg-brand-soft text-brand" accent={unread ? "text-brand" : undefined} />
        <Stat label="Total leads" value={leads} href="/admin/leads" icon="leads" tint="bg-emerald-50 text-emerald-600" />
        <Stat label="Blog posts" value={`${published}${drafts ? ` +${drafts} draft` : ""}`} href="/admin/posts" icon="posts" tint="bg-amber-50 text-amber-600" />
        <Stat label="Pages" value={pages} href="/admin/pages" icon="pages" tint="bg-sky-50 text-sky-600" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-tile h-7 w-7 bg-brand-soft text-brand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v12H4V6zm0 1l8 6 8-6" /></svg></span>
              Recent leads
            </h2>
            <Link href="/admin/leads" className="text-[13px] font-medium text-brand hover:underline">View all</Link>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-line-2">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3 transition hover:bg-canvas/60">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${l.isRead ? "bg-line" : "bg-brand shadow-[0_0_0_3px_rgba(87,81,225,.15)]"}`} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-navy">{l.name} <span className="font-normal text-ink-3">· {l.phone}</span></p><p className="truncate text-[13px] text-ink-2">{l.subject || l.message || l.email}</p></div>
                  <span className="shrink-0 text-[11px] text-ink-3">{fmt(l.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid place-items-center px-5 py-12 text-center">
              <span className="icon-tile mb-3 h-11 w-11 bg-brand-soft text-brand"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v12H4V6zm0 1l8 6 8-6" /></svg></span>
              <p className="text-[13px] text-ink-2">No leads yet — they’ll appear here when students submit the contact form.</p>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="card-title mb-3">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
              {[["/admin/pages/home", "Edit home page"], ["/admin/theme", "Change colours"], ["/admin/media", "Upload images"], ["/admin/settings", "Contact details"], ["/admin/chatbot", "Train chatbot"], ["/", "View website ↗"]].map(([h, l]) => (
                <Link key={h} href={h} target={h === "/" ? "_blank" : undefined} className="rounded-xl border border-line bg-white px-3 py-2.5 text-ink transition duration-200 hover:-translate-y-px hover:border-brand/40 hover:bg-brand-soft/40 hover:text-brand">{l}</Link>
              ))}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="card-title mb-3">Recently edited posts</h2>
            <ul className="space-y-1.5">
              {recentPosts.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-[13px]">
                  <span className={p.status === "PUBLISHED" ? "chip-live" : "chip-draft"}>{p.status === "PUBLISHED" ? "Live" : "Draft"}</span>
                  <Link href={`/admin/posts/${p.id}`} className="truncate text-navy transition hover:text-brand">{p.title}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="card-title mb-3">System</h2>
            <ul className="space-y-2 text-[13px]">
              {health.map((h) => (
                <li key={h.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${h.ok ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.15)]" : "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,.15)]"}`} />
                  <span className="text-ink">{h.label}</span>
                  {!h.ok ? <span className="ml-auto text-right text-[12px] text-amber-600">{h.fix}</span> : <span className="ml-auto text-[12px] font-medium text-emerald-600">OK</span>}
                </li>
              ))}
              <li className="flex items-center gap-2 border-t border-line-2 pt-2 text-ink-3"><span className="h-2 w-2 shrink-0 rounded-full bg-line" />{media} media files · {chats} chat sessions</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
