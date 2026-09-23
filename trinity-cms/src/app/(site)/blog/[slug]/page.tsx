/* Blog post — canvas "Blog Post" layout: key takeaways, sticky TOC, sources, destinations grid, prev/next, topics. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getPost, getRelatedPosts, getPublishedPostSlugs, getAdjacentPosts, getCountries, extractToc } from "@/lib/content";
import { getAllSettings } from "@/lib/settings-server";
import { PostCardView, fmtDate } from "@/components/site/blocks/BlogList";
import { FLAG } from "@/components/site/ui";

type Props = { params: Promise<{ slug: string }> };
const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
/** JSON.stringify does not escape "<", so a title containing </script> would break out of the tag. */
const jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");
const P = "Poppins,sans-serif";
const jcard: CSSProperties = { position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: "20px 22px", color: "var(--navy)", transition: "all .4s", overflow: "hidden", display: "block" };

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs().catch(() => []);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: p.seoTitle || p.title, description: p.seoDesc || p.excerpt, alternates: { canonical: `${base()}/blog/${p.slug}` },
    openGraph: { type: "article", images: p.coverImage ? [p.coverImage] : undefined, publishedTime: p.publishedAt?.toISOString(), modifiedTime: p.updatedAt.toISOString() },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getAllSettings()]);
  if (!post) notFound();
  const [related, adjacent, countries] = await Promise.all([getRelatedPosts(slug), getAdjacentPosts(slug), getCountries().catch(() => [])]);
  const toc = extractToc(post.body);
  const faqs = (post.faqs as { q: string; a: string }[]) ?? [];
  const takeaways = (post.takeaways as string[]) ?? [];
  const sources = (post.sources as { label: string; href: string }[]) ?? [];
  const url = `${base()}/blog/${post.slug}`;
  const author = post.author?.name ?? settings.site.siteName;
  const dest = countries.slice(0, 6);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting", headline: post.title, description: post.excerpt, image: post.coverImage ? `${base()}${post.coverImage}` : undefined,
        datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), inLanguage: "en-IN", keywords: post.tags.join(", "), articleSection: post.category, mainEntityOfPage: url,
        author: { "@type": post.author ? "Person" : "Organization", name: author },
        publisher: { "@id": `${base()}/#org` },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base()}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${base()}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ] },
      ...(faqs.length ? [{ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <article className="post" itemScope itemType="https://schema.org/Article">
        <header className="post__hero">
          <div className="page-hero__bg" /><div className="page-hero__grid" />
          <div className="container post__hero-inner">
            <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i className="fas fa-chevron-right" /><Link href="/blog">Blog</Link><i className="fas fa-chevron-right" /><span>{post.category}</span></nav>
            <h1 className="post__title" itemProp="headline">{post.title}</h1>
            <p className="post__meta">
              <span className="post__author"><img src={settings.site.logo} alt="" />{author}</span>
              <span><i className="fas fa-calendar-alt" style={{ color: "var(--gold)", marginRight: 7, fontSize: 12 }} />Published <time dateTime={post.publishedAt?.toISOString().slice(0, 10)} itemProp="datePublished">{fmtDate(post.publishedAt)}</time></span>
              <span><i className="fas fa-sync-alt" style={{ color: "var(--gold)", marginRight: 7, fontSize: 12 }} />Updated {fmtDate(post.updatedAt)}</span>
              <span><i className="fas fa-clock" style={{ color: "var(--gold)", marginRight: 7, fontSize: 12 }} />{post.readMins} min read</span>
              <span><i className="fas fa-tag" style={{ color: "var(--gold)", marginRight: 7, fontSize: 12 }} />{post.category}</span>
            </p>
          </div>
        </header>
        {post.coverImage ? <div className="container post__cover" data-reveal="scale"><img src={post.coverImage} alt={post.title} itemProp="image" /></div> : null}
        <div className="container post__layout">
          <aside className="post__side">
            {toc.length ? (
              <nav className="toc" aria-label="Table of contents"><h2>On this page</h2><ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol></nav>
            ) : null}
            <div className="share">
              <span>Share</span>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title)}%20${encodeURIComponent(url)}`} aria-label="Share on WhatsApp" target="_blank" rel="noopener"><i className="fab fa-whatsapp" /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} aria-label="Share on LinkedIn" target="_blank" rel="noopener"><i className="fab fa-linkedin-in" /></a>
              <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} aria-label="Share on X" target="_blank" rel="noopener"><i className="fab fa-twitter" /></a>
            </div>
            <div className="post__cta"><span className="glow" /><strong>Need help with this?</strong><p>Free 1:1 counselling with a Trinity expert.</p><Link className="btn btn--gold" href="/contact-us">Book a call <i className="fas fa-arrow-right" /></Link></div>
          </aside>

          <div className="post__body" itemProp="articleBody">
            {takeaways.length ? (
              <div style={{ background: "var(--grey)", borderRadius: 24, padding: "28px 30px", marginBottom: 38 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: P, fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "var(--primary)", marginBottom: 18 }}><i className="fas fa-bolt" style={{ color: "var(--gold)" }} />Key takeaways</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                  {takeaways.map((t, i) => <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 16, lineHeight: 1.7, color: "var(--text)" }}><span style={{ fontFamily: P, fontWeight: 700, fontSize: 11, color: "#fff", background: "var(--primary)", width: 26, height: 26, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>{String(i + 1).padStart(2, "0")}</span><span>{t}</span></li>)}
                </ul>
              </div>
            ) : null}

            <div dangerouslySetInnerHTML={{ __html: post.body }} />

            <div style={{ marginTop: 44, background: "linear-gradient(135deg,var(--navy) 0%,var(--navy-2) 60%,var(--primary-2) 100%)", borderRadius: 26, padding: 32, position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "var(--gold)", filter: "blur(90px)", opacity: 0.25, right: -70, top: -70 }} />
              <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ maxWidth: 420 }}>
                  <strong style={{ color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 20, display: "block", lineHeight: 1.3 }}>Want this mapped to your profile?</strong>
                  <p style={{ color: "rgba(255,255,255,.75)", fontSize: 15, lineHeight: 1.7, marginTop: 8 }}>A counsellor will review your academics, budget and target intake — free of charge.</p>
                </div>
                <Link className="btn btn--gold" href="/contact-us">Book free counselling <i className="fas fa-arrow-right" /></Link>
              </div>
            </div>

            {faqs.length ? (
              <section className="post__faq" aria-labelledby="faq-h">
                <h2 id="faq-h">Frequently asked questions</h2>
                {faqs.map((f, i) => <details key={i} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>)}
              </section>
            ) : null}

            {dest.length ? (
              <section style={{ marginTop: 52, paddingTop: 36, borderTop: "1px solid var(--line)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>Explore destinations mentioned in this guide</h2>
                <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 18 }}>Country-wise costs, entry requirements, visa steps and stay-back rules.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  {dest.map((c) => (
                    <Link key={c.code} className="cv-ccard" href={`/destinations/${c.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: "14px 16px", color: "var(--navy)", transition: "all .35s", position: "relative", overflow: "hidden" }}>
                      <span className="cv-cfill" style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--primary),var(--primary-2))", transform: "translateY(100%)", transition: "transform .45s cubic-bezier(.4,0,.2,1)" }} />
                      <img src={FLAG(c.code)} alt="" style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      <span style={{ position: "relative", display: "flex", flexDirection: "column", minWidth: 0 }}><span className="cv-cname" style={{ fontFamily: P, fontWeight: 600, fontSize: 14.5, lineHeight: 1.2, transition: "color .3s" }}>Study in {c.name}</span><span className="cv-csub" style={{ fontSize: 12, color: "var(--muted)", transition: "color .3s" }}>{c.tag}</span></span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {sources.length ? (
              <section style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid var(--line)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 16 }}>Sources &amp; further reading</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {sources.map((s, i) => <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 15, lineHeight: 1.7 }}><i className="fas fa-link" style={{ color: "var(--primary)", fontSize: 12, marginTop: 6 }} /><a href={s.href} target="_blank" rel="noopener nofollow" style={{ color: "var(--primary)" }}>{s.label}</a></li>)}
                </ul>
                <p style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.7, color: "var(--muted)" }}>Visa rules, fees and stay-back periods change frequently. Always confirm current requirements with the official source or with a Trinity counsellor before applying.</p>
              </section>
            ) : null}

            {adjacent.prev && adjacent.next ? (
              <nav style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }} aria-label="More articles">
                <Link className="cv-jcard" href={`/blog/${adjacent.prev.slug}`} style={jcard}>
                  <span className="cv-jfill" style={{ position: "absolute", inset: 0, background: "var(--grey)", opacity: 0, transition: "opacity .4s" }} />
                  <span style={{ position: "relative", display: "block", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", fontFamily: P, fontWeight: 600, marginBottom: 8 }}><i className="fas fa-arrow-left" style={{ color: "var(--gold)", marginRight: 8 }} />Previous</span>
                  <span style={{ position: "relative", fontFamily: P, fontWeight: 600, fontSize: 15.5, lineHeight: 1.4 }}>{adjacent.prev.title}</span>
                </Link>
                <Link className="cv-jcard" href={`/blog/${adjacent.next.slug}`} style={{ ...jcard, textAlign: "right" }}>
                  <span className="cv-jfill" style={{ position: "absolute", inset: 0, background: "var(--grey)", opacity: 0, transition: "opacity .4s" }} />
                  <span style={{ position: "relative", display: "block", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", fontFamily: P, fontWeight: 600, marginBottom: 8 }}>Next<i className="fas fa-arrow-right" style={{ color: "var(--gold)", marginLeft: 8 }} /></span>
                  <span style={{ position: "relative", fontFamily: P, fontWeight: 600, fontSize: 15.5, lineHeight: 1.4 }}>{adjacent.next.title}</span>
                </Link>
              </nav>
            ) : null}

            {post.tags.length ? (
              <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: P, fontWeight: 600, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginRight: 6 }}>Topics</span>
                {post.tags.map((t) => <Link key={t} className="cv-jumper" href="/blog" style={{ fontFamily: P, fontWeight: 500, fontSize: 13.5, color: "var(--navy)", background: "var(--grey)", padding: "9px 16px", borderRadius: 50, transition: "all .3s" }}>#{t}</Link>)}
              </div>
            ) : null}

            <div className="post__author-box">
              <img src={settings.site.logo} alt={settings.site.siteName} />
              <div>
                <strong>{author}</strong>
                <span style={{ display: "block", fontSize: 13, color: "var(--primary)", fontWeight: 500, margin: "2px 0 8px" }}>Reviewed by Trinity’s senior counselling desk · 30 years of student placements</span>
                <p>{settings.site.footerText}</p>
                <Link href="/about-us">About us <i className="fas fa-arrow-right" /></Link>
              </div>
            </div>
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="section section--grey">
          <div className="container">
            <div className="section-head" data-reveal><p className="kicker">Keep reading</p><h2 className="h2">Related <span className="accent">articles</span></h2></div>
            <div className="bgrid bgrid--2">{related.map((p) => <PostCardView key={p.slug} p={p} />)}</div>
          </div>
        </section>
      ) : null}
    </>
  );
}
