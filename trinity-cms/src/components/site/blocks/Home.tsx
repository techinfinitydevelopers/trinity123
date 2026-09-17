import type { AboutBlock, StepsBlock, UniversitiesBlock } from "@/lib/blocks";
import type { ContactSettings, SiteSettings } from "@/lib/settings";
import { A, FLAG, SectionHead, Stars, PhonePill, Title, d } from "../ui";

export function About({ b, contact, site }: { b: AboutBlock; contact: ContactSettings; site: SiteSettings }) {
  return (
    <section className="section" id="about">
      <div className="container split">
        <div className="bento" data-reveal="left">
          <div className="bento__main" data-plx="-0.06">
            <img src={b.mainImg} alt={b.mainAlt} loading="lazy" />
            <div className="bento__cap"><small>{b.capSmall}</small><strong>{b.capStrong}</strong>{b.capSpan ? <span>{b.capSpan}</span> : null}</div>
          </div>
          <div className="bento__img" data-plx="0.08"><img src={b.sideImg} alt={b.sideAlt} loading="lazy" /></div>
          <div className="bento__stat" data-plx="0.14"><span className="ring" /><strong>{b.statNum}<em>+</em></strong><p>{b.statText}</p></div>
          {b.chip ? <div className="chip chip--float"><img src={site.logo} alt="" height={30} /><span><strong>{b.chip.strong}</strong><small>{b.chip.small}</small></span></div> : null}
        </div>
        <div>
          <SectionHead kicker={b.kicker} title={b.title} />
          {b.paragraphs.map((p, i) => <p key={i} data-reveal>{p}</p>)}
          <div className="tagcards">
            {b.tags.map((t, i) => <div key={i} className="tagcard" data-reveal style={d(i)}><span className="tagcard__ico"><i className={t.icon} /></span><strong>{t.text}</strong></div>)}
          </div>
          {b.showPhone ? (
            <div className="btn-row" data-reveal>
              <A href={b.primary.href} contact={contact} className="btn btn--primary">{b.primary.label} <i className="fas fa-arrow-right" /></A>
              <PhonePill contact={contact} small="Talk to an expert" />
            </div>
          ) : (
            <A href={b.primary.href} contact={contact} className="btn btn--primary" data-reveal>{b.primary.label} <i className="fas fa-arrow-right" /></A>
          )}
        </div>
      </div>
    </section>
  );
}

export function Steps({ b, contact }: { b: StepsBlock; contact: ContactSettings }) {
  const n = b.steps.length;
  return (
    <section className="section" id="how">
      <div className="container">
        <SectionHead kicker={b.kicker} title={b.title} center />
        <div className="stack">
          {b.steps.map((s, i) => (
            <div key={i} className="stack__wrap" style={{ ["--i" as string]: i }}>
              <article className={i % 2 ? "stack__card stack__card--purple" : "stack__card"} data-stack>
                <span className="stack__grid" /><span className="stack__glow" /><span className="stack__ghost" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className="stack__copy">
                  <div className="stack__head">
                    <span className="stack__ico"><i className={s.icon} /></span>
                    <div>
                      <small>Step {String(i + 1).padStart(2, "0")} of {String(n).padStart(2, "0")}</small>
                      <span className="dots">{b.steps.map((_, j) => <i key={j} className={j < i ? "on" : j === i ? "on cur" : ""} />)}</span>
                    </div>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="checks">{s.checks.map((c) => <li key={c}><i className="fas fa-check" />{c}</li>)}</ul>
                  <A href={s.href} contact={contact} className="pill-link">Get started <span className="circle"><i className="fas fa-arrow-right" /></span></A>
                </div>
                <div className="stack__visual">
                  <span className="stack__frame" />
                  <div className="stack__img"><img src={s.img} alt="" loading="lazy" /></div>
                  <div className="chip chip--sa"><span className="chip__ico"><i className={s.chipIcon} /></span><span><strong>{s.chipStrong}</strong><small>{s.chipSmall}</small></span></div>
                  <div className="chip chip--sb chip--glass"><span className="live" />{s.live}</div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Universities({ b, contact }: { b: UniversitiesBlock; contact: ContactSettings }) {
  const n = b.items.length;
  return (
    <section className="pin" id="universities" data-pin>
      <div className="pin__sticky">
        <span className="pin__glow" />
        <p className="pin__ghost" data-pin-ghost aria-hidden="true">{b.ghost}</p>
        <div className="container pin__head">
          <div><SectionHeadInline kicker={b.kicker} title={b.title} /></div>
          <p className="pin__lead">{b.lead}</p>
        </div>
        <div className="pin__track" data-pin-track>
          {b.items.map((u, i) => (
            <A key={i} href={u.href} contact={contact} className="ucard">
              <img className="ucard__img" src={u.img} alt={u.name} loading="lazy" />
              <span className="ucard__shade" />
              <span className="ucard__city"><img src={FLAG(u.flag)} alt="" />{u.city}</span>
              <span className="ucard__idx">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
              <span className="ucard__body">
                <Stars /><small>{u.rating} · Reviews</small><h3>{u.name}</h3>
                <span className="ucard__foot"><span>Enroll Now</span><span className="circle"><i className="fas fa-arrow-right" /></span></span>
              </span>
            </A>
          ))}
        </div>
        <div className="container pin__prog">
          <span className="pin__count" data-pin-count>01 <small>/ {String(n).padStart(2, "0")}</small></span>
          <span className="pin__bar"><span data-pin-bar /></span>
          <span className="pin__hint"><i className="fas fa-mouse" /> Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}

function SectionHeadInline({ kicker, title }: { kicker: string; title: string }) {
  return <><p className="kicker kicker--gold">{kicker}</p><Title text={title} className="h2 h2--light" /></>;
}
