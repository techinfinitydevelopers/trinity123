import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { fmt } from "@/lib/format";

export const metadata = { title: "Blog" };

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const posts = await db.post.findMany({ where: status === "draft" ? { status: "DRAFT" } : status === "published" ? { status: "PUBLISHED" } : undefined, orderBy: { updatedAt: "desc" }, include: { author: { select: { name: true } } } });
  const counts = { all: await db.post.count(), published: await db.post.count({ where: { status: "PUBLISHED" } }), draft: await db.post.count({ where: { status: "DRAFT" } }) };
  const tab = (k: string, l: string, n: number) => <Link href={k === "all" ? "/admin/posts" : `/admin/posts?status=${k}`} className={`rounded-md px-3 py-1.5 ${(status ?? "all") === k ? "bg-white shadow-card text-navy" : "text-ink-3"}`}>{l} ({n})</Link>;
  return (
    <>
      <PageHeader title="Blog" sub="Write and manage articles. Published posts appear on /blog instantly."><Link href="/admin/posts/new" className="btn-primary btn-sm">+ New post</Link></PageHeader>
      <div className="mb-4 inline-flex rounded-lg bg-white p-0.5 text-[13px] font-semibold shadow-card">{tab("all", "All", counts.all)}{tab("published", "Published", counts.published)}{tab("draft", "Drafts", counts.draft)}</div>
      <div className="card overflow-hidden">
        {posts.length ? (
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-canvas/60">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-canvas">{p.coverImage ? <img src={p.coverImage} alt="" className="h-full w-full object-cover" /> : null}</div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/posts/${p.id}`} className="block truncate text-[15px] font-semibold text-navy hover:text-brand">{p.title || "(untitled)"}</Link>
                  <p className="truncate text-[12px] text-ink-3">{p.category} · {p.readMins} min · {p.author?.name ?? "—"} · updated {fmt(p.updatedAt)}</p>
                </div>
                <span className={`chip ${p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status === "PUBLISHED" ? "Published" : "Draft"}</span>
                {p.status === "PUBLISHED" ? <a className="btn-ghost btn-xs" href={`/blog/${p.slug}`} target="_blank" rel="noopener">View</a> : null}
                <Link className="btn-dark btn-xs" href={`/admin/posts/${p.id}`}>Edit</Link>
              </li>
            ))}
          </ul>
        ) : <p className="px-4 py-14 text-center text-[13px] text-ink-3">No posts here yet.</p>}
      </div>
    </>
  );
}
