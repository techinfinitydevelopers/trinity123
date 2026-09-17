import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostForm from "@/components/admin/PostForm";
import type { PostInput } from "@/lib/actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return { title: "New post" };
  const p = await db.post.findUnique({ where: { id }, select: { title: true } });
  return { title: p ? `Edit · ${p.title}` : "Post" };
}

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cats = (await db.post.findMany({ select: { category: true }, distinct: ["category"] })).map((c) => c.category);
  let initial: PostInput = { title: "", slug: "", excerpt: "", coverImage: "", category: "Guides", readMins: 0, body: "", faqs: [], takeaways: [], sources: [], tags: [], seoTitle: "", seoDesc: "", status: "DRAFT", publishedAt: new Date().toISOString().slice(0, 10) };
  if (id !== "new") {
    const p = await db.post.findUnique({ where: { id } });
    if (!p) notFound();
    initial = { id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, coverImage: p.coverImage ?? "", category: p.category, readMins: p.readMins, body: p.body, faqs: (p.faqs as { q: string; a: string }[]) ?? [], takeaways: (p.takeaways as string[]) ?? [], sources: (p.sources as { label: string; href: string }[]) ?? [], tags: p.tags ?? [], seoTitle: p.seoTitle ?? "", seoDesc: p.seoDesc ?? "", status: p.status, publishedAt: (p.publishedAt ?? new Date()).toISOString().slice(0, 10) };
  }
  return (
    <>
      <div className="mb-5 flex items-center gap-3 text-[13px]"><Link href="/admin/posts" className="text-ink-3 hover:text-brand">‹ Blog</Link><span className="text-ink-3">/</span><span className="font-semibold text-navy">{id === "new" ? "New post" : "Edit post"}</span></div>
      <PostForm initial={initial} categories={cats} />
    </>
  );
}
