import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCountries } from "@/lib/content";
import { FLAG } from "@/components/site/ui";
import { getLabels } from "@/lib/labels";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const q = (await searchParams).q?.trim() ?? "";
  const all = await getLabels();
  const L = { ...all.search, readArticle: all.common.readArticle };

  /* Countries come from the cached helper and are filtered in memory — there are only a dozen,
     so a query per keystroke would cost more than it saves. Posts go to the database because
     the body text is large and there is no point pulling every row back to filter it here. */
  const [countries, posts] = q
    ? await Promise.all([
        getCountries().then((all) =>
          all.filter((c) => `${c.name} ${c.tag}`.toLowerCase().includes(q.toLowerCase())),
        ),
        db.post.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              { tags: { has: q.toLowerCase() } },
            ],
          },
          orderBy: { publishedAt: "desc" },
          take: 12,
          select: { slug: true, title: true, excerpt: true, category: true },
        }),
      ])
    : [[], []];

  const total = countries.length + posts.length;

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__grid" />
        <div className="container" style={{ position: "relative" }}>
          <p className="kicker kicker--gold">{L.kicker}</p>
          <h1 className="page-hero__title">
            {q ? <>Results for “{q}”</> : <>{L.heading}</>}
          </h1>
          <p style={{ marginTop: 14, maxWidth: 620 }}>
            {q
              ? `${total} ${total === 1 ? "match" : "matches"} across study destinations and articles.`
              : L.lead}
          </p>
          <form action="/search" role="search" className="searchbig">
            <i className="fas fa-search" aria-hidden="true" />
            <input name="q" type="search" defaultValue={q} placeholder={L.placeholder} aria-label="Search universities or courses" autoFocus={!q} />
            <button className="btn btn--primary" type="submit">{L.submit}</button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!q ? (
            <p style={{ color: "var(--muted)" }}>{L.emptyPrompt}</p>
          ) : total === 0 ? (
            <div className="searchempty">
              <h2 style={{ fontSize: 22, marginBottom: 10 }}>No matches for “{q}”</h2>
              <p style={{ color: "var(--muted)", marginBottom: 22 }}>
                {L.noMatchText}
              </p>
              <Link className="btn btn--primary" href="/contact-us">{L.counsellorButton} <span className="btn__circle"><i className="fas fa-arrow-right" /></span></Link>
            </div>
          ) : (
            <>
              {countries.length ? (
                <>
                  <p className="kicker">{L.destinationsKicker}</p>
                  <div className="grid grid--3" style={{ marginBottom: 56 }}>
                    {countries.map((c) => (
                      <Link key={c.slug} className="ccard" href={`/destinations/${c.slug}`}>
                        <img src={FLAG(c.code)} alt="" width={34} height={34} />
                        <span>{c.name}</span>
                        <small>{c.tag}</small>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {posts.length ? (
                <>
                  <p className="kicker">{L.articlesKicker}</p>
                  <div className="grid grid--3">
                    {posts.map((p) => (
                      <Link key={p.slug} className="pcard" href={`/blog/${p.slug}`}>
                        <div className="pcard__body">
                          <span className="pcard__cat">{p.category}</span>
                          <h3>{p.title}</h3>
                          <p>{p.excerpt}</p>
                          <span className="pcard__more">{L.readArticle} <i className="fas fa-arrow-right" /></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
