import Link from "next/link";
import type { HeroBlock, PageHeroBlock } from "@/lib/blocks";
import type { ContactSettings } from "@/lib/settings";
import { A, Words, Stars, resolveHref } from "../ui";

export function Hero({ b, contact }: { b: HeroBlock; contact: ContactSettings }) {
  return (
    <section className="hero">
      <div className="hero__bg" /><div className="hero__grid" />
      <div className="hero__glows" data-hero-parallax><span className="glow glow--a" /><span className="glow glow--b" /></div>
      <p className="hero__side" aria-hidden="true">{b.sideText}</p>
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 className="h1 hero__title"><Words words={b.words} start={0.25} capsule={b.capsuleImg} /></h1>
          <p className="hero__text w__in" style={{ animationDelay: ".85s" }}>{b.text}</p>
          <div className="btn-row w__in" style={{ animationDelay: "1s" }}>
            <A href={b.primary.href} contact={contact} className="btn btn--primary">{b.primary.label} <i className="fas fa-arrow-right" /></A>
            <A href={b.ghost.href} contact={contact} className="btn btn--ghost"><i className="fab fa-whatsapp gold" /> {b.ghost.label}</A>
          </div>
          <ul className="hero__stats w__in" style={{ animationDelay: "1.15s" }}>
            {b.stats.map((s) => <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>)}
          </ul>
        </div>
        <div className="hero-visual w__in" style={{ animationDelay: ".3s" }}>
          <div className="hero-visual__img hero-visual__img--cutout"><img src={b.photo} alt="Student ready to study abroad" /></div>
          <div className="chip chip--glass chip--hv-b">
            <span className="avatars"><img src="/assets/img/home/client-1.png" alt="" /><img src="/assets/img/home/client-2.png" alt="" /></span>
            <span><Stars /><small>{b.chipCText}</small></span>
          </div>
          <div className="hive" aria-hidden="true">
            {b.hive.map((h, i) => (
              <div key={i} className={`hive__item hive__item--${i + 1}`}>
                <div className="hive__item__face" style={{ backgroundImage: `url(${h.img})` }}>
                  <strong>{h.value}</strong><span>{h.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="hero__scroll" aria-hidden="true">Scroll<span /></p>
    </section>
  );
}

export function PageHero({ b, contact }: { b: PageHeroBlock; contact: ContactSettings }) {
  const a = b.aside;
  return (
    <section className={b.short ? "page-hero page-hero--short" : "page-hero"}>
      <div className="page-hero__bg" />
      <div className="page-hero__grid" />
      <p className="page-hero__ghost" data-plx="0.12" aria-hidden="true">{b.ghost}</p>
      <div className="container page-hero__inner">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i className="fas fa-chevron-right" /><span>{b.crumb}</span></nav>
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
            <div className="hero-visual__img"><img src={a.img} alt="Students abroad" /></div>
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
              <span className="quick__ico"><i className="fab fa-whatsapp" /></span><span><small>Fastest reply</small><strong>Chat on WhatsApp</strong></span><i className="fas fa-arrow-right" />
            </a>
            <a className="quick__item" href={resolveHref("phone", contact)}>
              <span className="quick__ico quick__ico--gold"><i className="fas fa-phone-alt" /></span><span><small>Call us</small><strong>{contact.phones[0]}</strong></span>
            </a>
            <a className="quick__item" href={`mailto:${contact.email}`}>
              <span className="quick__ico quick__ico--purple"><i className="fas fa-envelope" /></span><span><small>Email</small><strong className="sm">{contact.email}</strong></span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
