import Link from "next/link";
import type { BlogListBlock } from "@/lib/blocks";
import { db } from "@/lib/db";
import { getLabels } from "@/lib/labels";

export const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export type PostCard = { slug: string; title: string; excerpt: string; coverImage: string | null; category: string; readMins: number; publishedAt: Date | null };

export async function PostCardView({ p, big }: { p: PostCard; big?: boolean }) {
  const L = (await getLabels()).common;
  const href = `/blog/${p.slug}`;
  const H = big ? "h2" : "h3";
  return (
    <article className={big ? "pcard pcard--big" : "pcard"} data-reveal>
      <Link className="pcard__media" href={href} aria-label={p.title}><img src={p.coverImage ?? "/assets/img/unversity/z1.jpg"} alt="" loading="lazy" /><span className="pcard__cat">{p.category}</span></Link>
      <div className="pcard__body">
        <p className="pcard__meta"><time dateTime={p.publishedAt?.toISOString().slice(0, 10)}>{fmtDate(p.publishedAt)}</time><span>·</span><span>{p.readMins} min read</span></p>
        <H><Link href={href}>{p.title}</Link></H>
        <p>{p.excerpt}</p>
        <Link className="pcard__more" href={href}>{L.readArticle} <i className="fas fa-arrow-right" /></Link>
      </div>
    </article>
  );
}

export async function BlogList({ b, tag }: { b: BlogListBlock; tag?: string }) {
  const L = (await getLabels()).blog;
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED", ...(tag ? { category: tag } : {}) },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, excerpt: true, coverImage: true, category: true, readMins: true, publishedAt: true },
  });
  return (
    <section className="section section--grey">
      <div className="container">
        <div className="blog-tags" data-reveal>
          <Link href="/blog" className={!tag ? "is-active" : ""}>{L.allTag}</Link>
          {b.tags.map((t) => <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className={tag === t ? "is-active" : ""}>{t}</Link>)}
        </div>
        <div className="bgrid">
          {posts.length === 0 ? <p className="lead">{L.empty}</p> : null}
          {posts.map((p, i) => <PostCardView key={p.slug} p={p} big={i === 0 && !tag} />)}
        </div>
      </div>
    </section>
  );
}
