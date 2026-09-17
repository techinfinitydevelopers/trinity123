import type { JourneyBlock, TestimonialsBlock, IntroBlock, FeatureCardsBlock, ServicesBlock, ContactBlock } from "@/lib/blocks";
import type { ContactSettings } from "@/lib/settings";
import { A, SectionHead, Title, Stars, d } from "../ui";
import ContactForm from "../ContactForm";

export function Journey({ b }: { b: JourneyBlock }) {
  return (
    <section className="section section--dark">
      <span className="section__glow" />
      <div className="container">
        <div className="split split--end">
          <div><p className="kicker kicker--gold" data-reveal>{b.kicker}</p><Title text={b.title} className="h2 h2--light" /></div>
          <p className="lead lead--light" data-reveal>{b.lead}</p>
        </div>
        <div className="grid grid--4">
          {b.cards.map((c, i) => (
            <div key={i} className="jcard" data-reveal style={d(i)}>
              <span className="jcard__fill" /><span className="jcard__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="jcard__ico"><img src={c.icon} alt="" width={34} height={34} /></span>
              <h3>{c.title}</h3><p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ b }: { b: TestimonialsBlock }) {
  return (
    <section className="section testi">
      <span className="testi__quote" aria-hidden="true">“</span>
      <div className="container">
        <SectionHead kicker={b.kicker} title={b.title} lead={b.lead} center />
        <div className="grid grid--2">
          {b.items.map((t, i) => (
            <blockquote key={i} className="tcard" data-reveal style={d(i)}>
              <span className="tcard__blob" />
              <div className="tcard__head">
                <div className="tcard__who"><img src={t.img} alt={t.name} loading="lazy" /><div><strong>{t.name}</strong><small>{t.course}</small></div></div>
                <span className="tcard__q"><i className="fas fa-quote-right" /></span>
              </div>
              <Stars />
              <p>{t.text}</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Intro({ b }: { b: IntroBlock }) {
  return (
    <section className="section">
      <div className="container split">
        <div>
          <SectionHead kicker={b.kicker} title={b.title} />
          <p data-reveal>{b.paragraph}</p>
          <div className="note" data-reveal><span className="note__ico"><i className={b.noteIcon} /></span><p><strong>{b.noteStrong}</strong> {b.noteText}</p></div>
        </div>
        <div className="bento2" data-reveal="right">
          <div className="bento2__wide" data-plx="-0.05"><img src={b.wideImg} alt={b.wideAlt} loading="lazy" /></div>
          <div className="bento2__sq" data-plx="0.08"><img src={b.sqImg} alt={b.sqAlt} loading="lazy" /></div>
          <div className="bento2__stat" data-plx="0.12"><span className="glow" /><strong>{b.statNum}<em>+</em></strong><p>{b.statText}</p></div>
        </div>
      </div>
    </section>
  );
}

export function FeatureCards({ b }: { b: FeatureCardsBlock }) {
  return (
    <section className="section section--grey">
      <div className="container">
        <SectionHead kicker={b.kicker} title={b.title} lead={b.lead} />
        <div className="grid grid--4">
          {b.cards.map((c, i) => (
            <div key={i} className="wcard" data-reveal style={d(i)}>
              <span className="wcard__fill" /><span className="wcard__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="wcard__ico"><i className={c.icon} /></span>
              <h3>{c.title}</h3><p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services({ b, contact }: { b: ServicesBlock; contact: ContactSettings }) {
  return (
    <section className="section section--grey">
      <div className="container">
        <SectionHead kicker={b.kicker} title={b.title} lead={b.lead} center />
        <div className="grid grid--3 sgrid">
          {b.items.map((s, i) => (
            <article key={i} className={s.wide ? "scard scard--wide" : "scard"} data-reveal style={d(i % 4)}>
              <span className="scard__fill" /><span className="scard__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="scard__ico"><i className={s.icon} /></span>
              <h3>{s.title}</h3><p>{s.text}</p>
              {s.checks.length ? <ul className="checks checks--dark">{s.checks.map((c) => <li key={c}><i className="fas fa-check-circle" />{c}</li>)}</ul> : null}
              <A href={s.href} contact={contact} className="scard__link">{s.linkLabel} <i className="fas fa-arrow-right" /></A>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ b, contact }: { b: ContactBlock; contact: ContactSettings }) {
  const mapQ = encodeURIComponent(contact.address);
  return (
    <section className="section section--grey contact">
      <div className="container grid grid--3 contact__cards">
        <div className="icard" data-reveal>
          <span className="icard__blob" /><span className="icard__ico"><i className="fas fa-phone-alt" /></span><h3>Phone</h3>
          {contact.phones.map((p) => <a key={p} href={`tel:${p.replace(/[^\d+]/g, "")}`}>{p}</a>)}
          {contact.landline ? <a href={`tel:${contact.landline.replace(/[^\d+]/g, "")}`}>{contact.landline}</a> : null}
        </div>
        <div className="icard" data-reveal style={{ ["--d" as string]: ".08s" }}>
          <span className="icard__blob" /><span className="icard__ico"><i className="fas fa-envelope" /></span><h3>E-mail Address</h3>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>
        <div className="icard" data-reveal style={{ ["--d" as string]: ".16s" }}>
          <span className="icard__blob" /><span className="icard__ico"><i className="fas fa-map-marker-alt" /></span><h3>Head Office</h3>
          <a href={`https://maps.google.com/?q=${mapQ}`} target="_blank" rel="noopener">{contact.address}</a>
        </div>
      </div>
      <div className="container split split--top contact__main">
        <div className="formcard" data-reveal="left">
          <span className="formcard__ring" />
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="h2 h2--sm" />
          <p className="lead">{b.lead}</p>
          <ContactForm okMsg={b.okMsg} />
        </div>
        <div className="mapcol" data-reveal="right">
          <div className="map">
            <iframe title="Office location" src={contact.mapEmbed || `https://www.google.com/maps?q=${mapQ}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="chip chip--map"><span className="chip__ico chip__ico--gold"><i className="fas fa-map-marker-alt" /></span><span><strong>{b.mapChipStrong}</strong><small>{b.mapChipSmall}</small></span></div>
          </div>
          <div className="joinstrip">
            <span className="glow" />
            <span className="avatars"><img src="/assets/img/home/client-1.png" alt="" /><img src="/assets/img/home/client-2.png" alt="" /></span>
            <span><strong>{b.joinStrong}</strong><small>{b.joinSmall.split(" · ").map((s, i) => i ? <em key={i}> · {s}</em> : s)}</small></span>
          </div>
        </div>
      </div>
    </section>
  );
}
