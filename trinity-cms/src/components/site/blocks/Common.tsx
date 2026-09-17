import type { BandBlock, StatsBlock, CtaBlock, CountriesBlock, OfferBlock, RichTextBlock } from "@/lib/blocks";
import type { ContactSettings } from "@/lib/settings";
import { A, FLAG, SectionHead, Title, PhonePill, d } from "../ui";

export function Band({ b }: { b: BandBlock }) {
  const reps = [0, 1, 2, 3];
  return (
    <div className="band" aria-hidden="true">
      <div className="marquee__track">
        {reps.map((r) => b.items.map((it, i) => (
          <span key={`${r}-${i}`}><b className={it.strong ? "is-strong" : ""}>{it.text}</b><i className="fas fa-star" /></span>
        )))}
      </div>
    </div>
  );
}

export function Stats({ b }: { b: StatsBlock }) {
  return (
    <section className="section stats" id="stats" aria-label="Key numbers">
      <div className="container grid grid--4">
        {b.items.map((s, i) => (
          <div key={i} className={i % 2 ? "stat stat--dark" : "stat"} data-reveal style={d(i)}>
            <span className="stat__ring" />
            <p className="stat__num"><span className="counter" data-count={s.count}>0</span><em>{s.suffix}</em></p>
            <p className="stat__label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Cta({ b, contact }: { b: CtaBlock; contact: ContactSettings }) {
  if (b.layout === "center") {
    return (
      <section className="section section--tight">
        <div className="container cta cta--center" data-reveal="scale">
          <span className="cta__grid" /><span className="cta__glow cta__glow--mid" />
          <div>
            <p className="badge badge--gold"><i className={b.badgeIcon} /> {b.badge}</p>
            <Title text={b.title} className="h2 h2--light" />
            <p>{b.text}</p>
            <div className="btn-row btn-row--center">
              <A href={b.primary.href} contact={contact} className="btn btn--gold">{b.primary.label} <i className="fas fa-arrow-right" /></A>
              <A href={b.secondary.href} contact={contact} className="btn btn--ghost"><i className="fab fa-whatsapp gold" /> {b.secondary.label}</A>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="section section--tight" id="cta">
      <div className="container cta" data-reveal="scale">
        <span className="cta__grid" /><span className="cta__glow" /><p className="cta__ghost" aria-hidden="true">GO GLOBAL</p>
        <div className="cta__copy">
          <p className="badge badge--gold"><i className={b.badgeIcon} /> {b.badge}</p>
          <Title text={b.title} className="h2 h2--light" />
          <p>{b.text}</p>
          {b.checks.length ? <ul className="cta__checks">{b.checks.map((c) => <li key={c}><i className="fas fa-check" />{c}</li>)}</ul> : null}
          <div className="btn-row">
            <A href={b.primary.href} contact={contact} className="btn btn--gold">{b.primary.label} <i className="fas fa-arrow-right" /></A>
            {b.secondaryKind === "phone"
              ? <PhonePill contact={contact} small={b.secondary.label} light />
              : <A href={b.secondary.href} contact={contact} className="btn btn--ghost"><i className="fab fa-whatsapp gold" /> {b.secondary.label}</A>}
          </div>
        </div>
        <div className="cta__visual">
          <span className="cta__disc" /><span className="cta__ring" /><img src={b.img} alt="Student holding folder" data-plx="-0.05" loading="lazy" />
          <div className="chip chip--ca"><span className="chip__ico"><i className={b.chipA.icon} /></span><span><strong>{b.chipA.strong}</strong><small>{b.chipA.small}</small></span></div>
          <div className="chip chip--cb chip--gold"><i className={b.chipB.icon} /><span><strong>{b.chipB.strong}</strong><small>{b.chipB.small}</small></span></div>
        </div>
      </div>
    </section>
  );
}

export function Countries({ b, contact }: { b: CountriesBlock; contact: ContactSettings }) {
  const grid = (
    <div className="cgrid">
      {b.items.map((c, i) => (
        <A key={c.name} href={c.href} contact={contact} className="ccard" data-reveal style={d(i % 4)}>
          <span className="ccard__fill" />
          <span className="ccard__flag"><img src={FLAG(c.flag)} alt={`${c.name} flag`} loading="lazy" /></span>
          <span className="ccard__text"><strong>{c.name}</strong><small>{c.tag}</small></span>
          <span className="ccard__arrow"><i className="fas fa-arrow-right" /></span>
        </A>
      ))}
      <A href={b.dark.href} contact={contact} className="ccard ccard--dark" data-reveal>
        <strong>{b.dark.num}<em>+</em></strong><span>{b.dark.text}<small>{b.dark.small} <i className="fas fa-arrow-right" /></small></span>
      </A>
    </div>
  );
  if (b.layout === "center") {
    return (
      <section className="section section--tight"><div className="container">
        <SectionHead kicker={b.kicker} title={b.title} lead={b.lead} center />
        {grid}
      </div></section>
    );
  }
  return (
    <section className="section" id="countries">
      <div className="container split split--top">
        <div><SectionHead kicker={b.kicker} title={b.title} lead={b.lead} /></div>
        {grid}
      </div>
      {b.marquee ? (
        <div className="marquee marquee--outline" aria-hidden="true">
          <div className="marquee__track marquee__track--rev">
            {[0, 1].map((r) => b.items.map((c) => <span key={`${r}${c.name}`}>{c.name}</span>))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function Offer({ b, contact }: { b: OfferBlock; contact: ContactSettings }) {
  return (
    <section className="section section--grey" id="offer">
      <div className="container">
        <SectionHead kicker={b.kicker} title={b.title} center />
        <div className="grid grid--3">
          {b.cards.map((c, i) => (
            <A key={i} href={c.href} contact={contact} className="ocard" data-reveal style={d(i)}>
              <div className="ocard__media">
                <img src={c.img} alt={c.title} loading="lazy" />
                <span className="ocard__icon"><img src={c.icon} alt="" width={28} height={28} /></span>
                <span className="ocard__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ocard__metric">{c.metric}<small>{c.metricLabel}</small></span>
              </div>
              <div className="ocard__body">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <div className="ocard__foot"><span>Explore</span><span className="circle"><i className="fas fa-arrow-right" /></span></div>
              </div>
            </A>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RichText({ b }: { b: RichTextBlock }) {
  return (
    <section className={b.grey ? "section section--grey" : "section"}>
      <div className="container post__body" style={{ maxWidth: 860 }} dangerouslySetInnerHTML={{ __html: b.html }} />
    </section>
  );
}
