import Link from "next/link";
import type { HeroBlock, PageHeroBlock } from "@/lib/blocks";
import { getLabels } from "@/lib/labels";
import type { ContactSettings } from "@/lib/settings";
import { A, Words, Stars, resolveHref } from "../ui";

export async function Hero({ b, contact }: { b: HeroBlock; contact: ContactSettings }) {
  const L = (await getLabels()).common;
  /* Blocks are stored as JSON, so a page saved before the 2026-09 hero redesign still has the old
     orbit fields and none of these. Render the copy column rather than throwing on the home page. */
  const hive = Array.isArray(b.hive) ? b.hive : [];
  return (
    <section className="hero">
      <div className="hero__bg" /><div className="hero__grid" />
      <div className="hero__glows" data-hero-parallax><span className="glow glow--a" /><span className="glow glow--b" /></div>
      <div className="container hero__inner">
        {/* The headline spans the container rather than sitting in the left column: the client
            wants the tagline on one line, and half the grid cannot hold it at hero size. */}
        <h1 className="h1 hero__title"><Words words={b.words} start={0.25} capsule={b.capsuleImg} /></h1>
        <div className="hero__cols">
        <div className="hero__copy">
          <p className="hero__text w__in" style={{ animationDelay: ".85s" }}>{b.text}</p>
          <div className="btn-row w__in" style={{ animationDelay: "1s" }}>
            <A href={b.primary.href} contact={contact} className="btn btn--primary">{b.primary.label} <i className="fas fa-arrow-right" /></A>
            <A href={b.ghost.href} contact={contact} className="btn btn--ghost"><i className="fab fa-whatsapp gold" /> {b.ghost.label}</A>
          </div>
          {/* The plain stat row is gone: the honeycomb carries the same claims, and the two
              disagreed on screen ("100k+ Courses" here against "1 lakh+ Courses" there).
              `stats` stays on the block so it can be brought back from the editor. */}
        </div>
        {b.photo || hive.length ? (
        <div className="hero-visual w__in" style={{ animationDelay: ".3s" }}>
          {b.photo ? <div className="hero-visual__img hero-visual__img--cutout"><img src={b.photo} alt={L.heroPhotoAlt} /></div> : null}
          <div className="chip chip--glass chip--hv-b">
            <span className="avatars"><img src={L.avatarImage1} alt="" /><img src={L.avatarImage2} alt="" /></span>
            <span><Stars label={L.ratingLabel} /><small>{b.chipCText}</small></span>
          </div>
          <div className="hive">
            {hive.map((h, i) => (
              <div key={i} className={`hive__item hive__item--${i + 1}`}>
                <div
                  className={h.img ? "hive__item__face has-photo" : "hive__item__face"}
                  style={h.img ? ({ ["--photo" as string]: `url(${h.img})` }) : undefined}
                >
                  <strong>{h.value}</strong><span>{h.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        ) : null}
        </div>
      </div>
      <p className="hero__scroll" aria-hidden="true">{L.scrollLabel}<span /></p>
    </section>
  );
}

export async function PageHero({ b, contact }: { b: PageHeroBlock; contact: ContactSettings }) {
  const L = (await getLabels()).common;
  const a = b.aside;
  return (
    <section className={b.short ? "page-hero page-hero--short" : "page-hero"}>
      <div className="page-hero__bg" />
      <div className="page-hero__grid" />
      <p className="page-hero__ghost" data-plx="0.12" aria-hidden="true">{b.ghost}</p>
      <div className="container page-hero__inner">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">{L.home}</Link><i className="fas fa-chevron-right" /><span>{b.crumb}</span></nav>
          <h1 className="h1"><Words words={b.words} /></h1>
          <p className="page-hero__sub">{b.sub}</p>
        </div>

        {a.kind === "statchips" && (
          <div className="statchips w__in" style={{ animationDelay: ".6s" }}>
            {a.items.map((s, i) => (
              <div key={i} className={`statchip statchip--${s.style}${s.icon ? " statchip--wide" : ""}`}>
                {s.icon ? (
                  <><span><strong>{s.strong}</strong><small>{s.small}</small></span><i className={s.icon} /></>
                ) : (
                  <><strong>{s.strong}{s.suffix ? <em className={s.style === "gold" ? "purple" : undefined}>{s.suffix}</em> : null}</strong><small>{s.small}</small></>
                )}
              </div>
            ))}
          </div>
        )}

        {a.kind === "visual" && (
          <div className="hero-visual w__in" style={{ animationDelay: ".6s" }}>
            <div className="hero-visual__img"><img src={a.img} alt={L.asideImageAlt} /></div>
            <div className="chip chip--gold chip--hv-a"><span><strong className="big">{a.chipA.big}</strong><small>{a.chipA.small}</small></span></div>
            <div className="chip chip--hv-b"><span className="chip__ico"><i className={a.chipB.icon} /></span><span><strong>{a.chipB.strong}</strong><small>{a.chipB.small}</small></span></div>
          </div>
        )}

        {a.kind === "svcchips" && (
          <div className="svc-chips w__in" style={{ animationDelay: ".6s" }}>
            {a.items.map((s, i) => (
              <div key={i} className="svc-chip" style={{ ["--x" as string]: `${-18 * i}px` }}>
                <span className="svc-chip__ico"><i className={s.icon} /></span><strong>{s.label}</strong><i className="fas fa-check-circle gold" />
              </div>
            ))}
          </div>
        )}

        {a.kind === "quick" && (
          <div className="quick w__in" style={{ animationDelay: ".6s" }}>
            <a className="quick__item quick__item--wa" href={resolveHref("whatsapp", contact)} target="_blank" rel="noopener">
              <span className="quick__ico"><i className="fab fa-whatsapp" /></span><span><small>{L.quickWhatsappSmall}</small><strong>{L.quickWhatsappStrong}</strong></span><i className="fas fa-arrow-right" />
            </a>
            <a className="quick__item" href={resolveHref("phone", contact)}>
              <span className="quick__ico quick__ico--gold"><i className="fas fa-phone-alt" /></span><span><small>{L.quickCallSmall}</small><strong>{contact.phones[0]}</strong></span>
            </a>
            <a className="quick__item" href={`mailto:${contact.email}`}>
              <span className="quick__ico quick__ico--purple"><i className="fas fa-envelope" /></span><span><small>{L.quickEmailSmall}</small><strong className="sm">{contact.email}</strong></span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
