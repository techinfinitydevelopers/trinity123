/* Home V2 — the sections.
   One markup set, three motion variants. Nothing here knows which variant is running: the
   markup carries the hooks (data attributes, custom properties, `--i` indices) and
   `motion.tsx` decides what drives them. That is what lets the same page be shipped as
   pure CSS, as sticky panels, or as a GSAP timeline without three copies of the content. */
import Image from "next/image";
import type {
  HeroBlock, StatsBlock, OfferBlock, StepsBlock, CountriesBlock,
  UniversitiesBlock, TestimonialsBlock, WebinarBlock, CampusBlock, CtaBlock,
} from "@/lib/blocks";
import type { ContactSettings, LabelSettings } from "@/lib/settings";
import { A, Title, Words, FLAG } from "@/components/site/ui";
import LeadForm from "@/components/site/LeadForm";

/* An index on every repeated child, so a stagger is one `calc()` away in CSS and one
   `stagger()` away in GSAP. */
const i = (n: number) => ({ ["--i" as string]: n });

/* ============================================================================================
   1 · HERO — the scroll-driven open
   Rest: headline, the student in a tall pill, the enquiry card.
   Open: the pill widens to a full card, the campus fades up behind her, the headline recolours
   and the honeycomb figures collapse into a list beside her.
   The enquiry card never moves. It is the one thing the reference does not have and the thing
   that actually earns leads, so the animation is built around it rather than over it. */
export function V2Hero({ b, contact, labels }: { b: HeroBlock; contact: ContactSettings; labels: LabelSettings }) {
  return (
    <section className="v2hero" data-v2="hero">
      <div className="v2hero__sticky">
        <div className="shell v2hero__grid">
          <div className="v2hero__copy">
            <p className="v2hero__kicker">{b.sideText}</p>
            <h1 className="v2hero__title"><Words words={b.words} start={0.2} /></h1>
            <p className="v2hero__lead">{b.text}</p>
          </div>

          <div className="v2hero__stage">
            {/* The frame is what animates: a tall pill at progress 0, a wide card at 1. */}
            <div className="v2hero__frame">
              <div className="v2hero__scene" aria-hidden="true" />
              <Image className="v2hero__student" src={b.photo} alt="" width={720} height={900} priority sizes="(max-width:860px) 80vw, 420px" />
              <span className="v2hero__badge">
                <i className="fas fa-graduation-cap" aria-hidden="true" />
                <span><strong>{b.hive[0]?.value}</strong><small>{b.hive[0]?.label}</small></span>
              </span>
            </div>

            {/* Scattered at rest, a tidy column once the frame is open. */}
            <ul className="v2hero__nodes">
              {b.hive.map((h, n) => (
                <li className="v2hero__node" key={h.label} style={i(n)}>
                  <span className="v2hero__dot" aria-hidden="true" />
                  {h.icon ? <i className={`${h.icon} v2hero__nodeIco`} aria-hidden="true" /> : null}
                  <span className="v2hero__nodeTxt"><strong>{h.value}</strong>{h.label}</span>
                </li>
              ))}
            </ul>

            {/* The plane the client supplied, flying the dotted path from the current hero. */}
            <span className="v2hero__flight" aria-hidden="true">
              <svg viewBox="0 0 520 150" overflow="visible" focusable="false">
                <path id="v2-flightpath" d="M6 140C84 140 150 112 206 66 242 36 280 16 322 9 386 -2 452 -8 516 -14"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="7 10" />
                <g className="v2hero__plane">
                  <image href="/assets/img/home/plane.webp" x="-26" y="-27" width="52" height="54" transform="rotate(-90)" />
                </g>
              </svg>
            </span>
          </div>

          {/* `hero__form` as well as the V2 class, deliberately: every rule that styles this
              card — the field icons, the flag beside the dialling code, the green button — is
              scoped under that class in site.css. Carrying it means V2 gets the card the client
              already signed off rather than a second copy of it that can drift. */}
          {b.form ? (
            <aside className="v2hero__form hero__form">
              <LeadForm
                title={b.form.title} cities={b.form.cities} destinations={b.form.destinations}
                okMsg={b.form.okMsg} submitLabel={b.form.submitLabel} trust={b.form.trust ?? []} labels={labels.forms}
              />
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================================
   2 · NUMBERS
   Trinity's counters already count up, which the reference's do not. Kept. */
export function V2Numbers({ b }: { b: StatsBlock }) {
  return (
    <section className="v2num" data-v2="numbers">
      <div className="shell v2num__grid">
        <header className="v2num__head" data-reveal>
          <h2 className="v2num__title">Numbers that speak<br />for themselves</h2>
          <svg className="v2num__scribble" viewBox="0 0 220 18" fill="none" aria-hidden="true">
            <path d="M3 13C28 5 44 15 68 8s38 7 62 0 42 6 84-4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </header>
        <ul className="v2num__cards">
          {b.items.map((s, n) => (
            <li className="v2num__card" key={s.label} style={i(n)} data-reveal>
              <strong className="v2num__fig"><span className="count" data-count={s.count}>0</span>{s.suffix}</strong>
              <span className="v2num__lbl">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================================
   3 · THE STACK — three panels over one pinned viewport
   Panel 1 is a scroll-driven ticker of what Trinity does, panel 2 the partner universities as
   drifting pills, panel 3 the destinations over a globe. `--panels` lets the CSS and the GSAP
   timeline agree on how many there are without either hard-coding it. */
export function V2Stack({ offer, unis, countries, contact }: {
  offer: OfferBlock; unis: UniversitiesBlock; countries: CountriesBlock; contact: ContactSettings;
}) {
  const services = offer.cards.slice(0, 6);
  const rows = [unis.items.slice(0, 4), unis.items.slice(4, 7), unis.items.slice(7, 10)];
  return (
    <section className="v2stack" data-v2="stack" style={{ ["--panels" as string]: 3 }}>
      <div className="v2stack__intro">
        <div className="shell">
          <p className="kicker v2stack__kicker" data-reveal>{offer.kicker}</p>
          <h2 className="v2stack__display" data-reveal>
            Everything you need.<br />All in one place
            {/* The reference floats its chips over the letterforms. Trinity's sit on the
                baseline beside the words instead — same idea, without costing legibility. */}
            <span className="v2stack__chips" aria-hidden="true">
              <span className="v2stack__chip v2stack__chip--a">Universities</span>
              <span className="v2stack__chip v2stack__chip--b">Scholarships</span>
              <span className="v2stack__chip v2stack__chip--c"><i className="fas fa-passport" /></span>
            </span>
          </h2>
        </div>
      </div>

      <div className="v2stack__pin">
        <div className="v2stack__deck">
          <span className="v2stack__shim v2stack__shim--1" aria-hidden="true" />
          <span className="v2stack__shim v2stack__shim--2" aria-hidden="true" />

          {/* — panel 1 · the ticker — */}
          <article className="v2panel v2panel--dark" data-panel="0">
            <div className="v2panel__text">
              <h3 className="v2panel__h">Find where your<br />goals take you</h3>
              <p className="v2panel__p">{countries.lead}</p>
              <A href={countries.dark.href} contact={contact} className="v2btn">Book a consultation <i className="fas fa-arrow-right" /></A>
            </div>
            <ul className="v2tick" data-tick>
              {services.map((c, n) => (
                <li className="v2tick__row" key={c.title} style={i(n)}>
                  <span className="v2tick__lbl">{c.title}</span>
                  {/* `offer.cards[].icon` is a path to an SVG, not a Font Awesome class —
                      rendering it as one gives an empty square with a file path for a class. */}
                  <span className="v2tick__ico"><Image src={c.icon} alt="" width={22} height={22} /></span>
                </li>
              ))}
            </ul>
          </article>

          {/* — panel 2 · the universities — */}
          <article className="v2panel v2panel--light" data-panel="1">
            <div className="v2panel__text">
              <h3 className="v2panel__h">Find the right<br />university for you</h3>
              <p className="v2panel__p">{unis.lead}</p>
              <A href={unis.items[0]?.href ?? "/contact-us"} contact={contact} className="v2btn">See the shortlist <i className="fas fa-arrow-right" /></A>
            </div>
            <div className="v2panel__media v2unis">
              <Image className="v2unis__sky" src={unis.items[0]?.img ?? ""} alt="" width={900} height={700} sizes="(max-width:860px) 100vw, 560px" />
              {rows.map((row, r) => (
                <div className={`v2unis__row v2unis__row--${r + 1}`} key={r} aria-hidden={r > 0}>
                  {/* Doubled so the drift can loop seamlessly. */}
                  {[...row, ...row].map((u, n) => (
                    <span className="v2pill" key={`${u.name}-${n}`}>
                      <Image src={FLAG(u.flag)} alt="" width={20} height={20} />{u.name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </article>

          {/* — panel 3 · the destinations — */}
          <article className="v2panel v2panel--warm" data-panel="2">
            <div className="v2panel__text">
              <h3 className="v2panel__h">Choose the<br />right country</h3>
              <p className="v2panel__p">{countries.dark.text}</p>
              <A href={countries.dark.href} contact={contact} className="v2btn">{countries.dark.small} <i className="fas fa-arrow-right" /></A>
            </div>
            <div className="v2panel__media v2globe">
              <span className="v2globe__ball" aria-hidden="true" />
              <ul className="v2globe__names" data-drift>
                {[...countries.items, ...countries.items].map((c, n) => (
                  <li key={`${c.name}-${n}`} style={i(n % countries.items.length)}>{c.name}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================================
   4 · THE PIPELINE
   The reference hides its week numbers on desktop and only shows them on a phone, which buries
   real information behind decoration. Trinity's carry the stage number at every size, and the
   labels alternate above and below so seven steps fit one row. */
export function V2Pipeline({ b, contact }: { b: StepsBlock; contact: ContactSettings }) {
  return (
    <section className="v2pipe" data-v2="pipeline">
      <div className="shell">
        <div className="v2pipe__head">
          <div data-reveal>
            <p className="kicker">{b.kicker}</p>
            <Title text={b.title} className="v2pipe__title" />
          </div>
          <div className="v2pipe__aside" data-reveal>
            <p>Seven stages, from the first conversation to the week after you land.</p>
            <A href={b.steps[0]?.href ?? "/contact-us"} contact={contact} className="v2btn">Start your journey <i className="fas fa-arrow-right" /></A>
          </div>
        </div>

        <ol className="v2pipe__band">
          {b.steps.map((s, n) => (
            <li className={`v2chev v2chev--${(n % 7) + 1}`} key={s.title} style={i(n)} data-reveal>
              <span className="v2chev__body"><span className="v2chev__no">Stage {n + 1}</span></span>
              <span className="v2chev__lbl">{s.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================================================
   5 · THE BENTO
   Deliberately irregular: wide and narrow cards share a row, each with its own ground. */
export function V2Bento({ b, contact }: { b: OfferBlock; contact: ContactSettings }) {
  return (
    <section className="v2bento" data-v2="bento">
      <div className="shell">
        <header className="v2bento__head" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <h2 className="v2bento__title">All the right support,<span className="v2bento__tag"><i className="fas fa-graduation-cap" /></span><br />in one place</h2>
        </header>
        <div className="v2bento__grid">
          {b.cards.map((c, n) => (
            <article className={`v2cell v2cell--${(n % 6) + 1}`} key={c.title} style={i(n)} data-reveal>
              <div className="v2cell__art">
                <Image src={c.img} alt="" width={640} height={420} sizes="(max-width:860px) 100vw, 420px" />
                <span className="v2cell__metric"><strong>{c.metric}</strong>{c.metricLabel}</span>
              </div>
              <div className="v2cell__body">
                <span className="v2cell__ico"><Image src={c.icon} alt="" width={24} height={24} /></span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <A href={c.href} contact={contact} className="v2cell__link">Explore now <i className="fas fa-chevron-right" /></A>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================================
   6 · VOICES */
export function V2Voices({ b }: { b: TestimonialsBlock }) {
  return (
    <section className="v2voice" data-v2="voices">
      <span className="v2voice__plane" aria-hidden="true"><i className="fas fa-paper-plane" /></span>
      <span className="v2voice__grid" aria-hidden="true" />
      <div className="shell">
        <header className="v2voice__head" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="v2voice__title" />
        </header>
        <ul className="v2voice__rail">
          {b.items.map((t, n) => (
            <li className="v2quote" key={t.name} style={i(n)} data-reveal>
              <div className="v2quote__who">
                <Image src={t.img} alt="" width={160} height={160} sizes="96px" />
                <strong>{t.name}</strong><small>{t.course}</small>
              </div>
              <blockquote className="v2quote__txt">{t.text}</blockquote>
              <span className="v2quote__seal" aria-hidden="true"><i className="fas fa-check" /></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================================
   7 · EVENTS — the chevron thumbnail from the reference, carrying Trinity's webinars */
export function V2Events({ b, contact }: { b: WebinarBlock; contact: ContactSettings }) {
  const rows = [...b.current.map((c) => ({ title: c.title, when: c.when, img: c.img, badge: c.badge })),
                ...b.past.map((p) => ({ title: p.title, when: p.when, img: p.img, badge: "Recording" }))].slice(0, 5);
  return (
    <section className="v2ev" data-v2="events">
      <div className="shell v2ev__grid">
        <header className="v2ev__head" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="v2ev__title" />
          <p className="v2ev__lead">{b.lead}</p>
          <A href={b.ctaHref} contact={contact} className="v2btn">{b.ctaLabel} <i className="fas fa-arrow-right" /></A>
        </header>
        <ul className="v2ev__list">
          {rows.map((r, n) => (
            <li className="v2ev__row" key={`${r.title}-${n}`} style={i(n)} data-reveal>
              <span className="v2ev__shot">{r.img ? <Image src={r.img} alt="" width={320} height={200} sizes="180px" /> : null}</span>
              <div className="v2ev__meta">
                <span className="v2ev__when">{r.when || r.badge}</span>
                <h3>{r.title}</h3>
                <A href={b.ctaHref} contact={contact} className="v2ev__btn">Register now</A>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {b.moreHref ? <p className="v2ev__more"><A href={b.moreHref} contact={contact} className="v2cell__link">{b.moreLabel ?? "See all"} <i className="fas fa-chevron-right" /></A></p> : null}
    </section>
  );
}

/* ============================================================================================
   8 · THE MARQUEE — two rows of chevrons travelling against each other. No text, no JS. */
export function V2Marquee() {
  const row = ["a", "b", "c", "d", "e", "f"];
  return (
    <div className="v2mq" data-v2="marquee" aria-hidden="true">
      {[1, 2].map((r) => (
        <div className={`v2mq__row v2mq__row--${r}`} key={r}>
          {[...row, ...row, ...row].map((c, n) => <span className={`v2mq__ch v2mq__ch--${c}`} key={n} />)}
        </div>
      ))}
    </div>
  );
}

/* ============================================================================================
   9 · CENTRES */
export function V2Centres({ b, contact }: { b: CampusBlock; contact: ContactSettings }) {
  const o = b.options[0];
  return (
    <section className="v2ctr" data-v2="centres">
      <div className="shell v2ctr__grid">
        <header className="v2ctr__head" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="v2ctr__title" />
          <p className="v2ctr__lead">{b.lead}</p>
          {o ? <A href={o.href} contact={contact} className="v2btn">{o.linkLabel} <i className="fas fa-arrow-right" /></A> : null}
        </header>
        <div className="v2ctr__media" data-reveal>
          {o?.img ? <Image src={o.img} alt={o.imgAlt} width={900} height={620} sizes="(max-width:860px) 100vw, 520px" /> : null}
          <span className="v2ctr__find"><i className="fas fa-search" aria-hidden="true" />Find your nearest branch</span>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================================
   10 · THE BOARDING PASS
   The reference's best idea in its lower half, and the one Trinity has the strongest claim to —
   the company has been a travel agency since 1982. */
export function V2Boarding({ b, contact }: { b: CtaBlock; contact: ContactSettings }) {
  return (
    <section className="v2board" data-v2="boarding">
      <div className="shell">
        <Title text={b.title} as="h2" className="v2board__title" />
        <div className="v2board__grid">
          <div className="v2board__ask" data-reveal>
            <p className="v2board__badge"><i className={b.badgeIcon} aria-hidden="true" /> {b.badge}</p>
            <p className="v2board__txt">{b.text}</p>
            <ul className="v2board__checks">
              {b.checks.map((c) => <li key={c}><i className="fas fa-check" aria-hidden="true" />{c}</li>)}
            </ul>
            <A href={b.primary.href} contact={contact} className="v2btn v2btn--lg">{b.primary.label} <i className="fas fa-arrow-right" /></A>
          </div>

          <div className="v2board__pass" data-reveal>
            <div className="v2board__main">
              <p className="v2board__brand"><i className="fas fa-plane-departure" aria-hidden="true" /> Trinity Study Abroad</p>
              <dl className="v2board__route">
                <div><dt>From</dt><dd>India</dd></div>
                <div className="v2board__arrow" aria-hidden="true"><i className="fas fa-arrow-right" /></div>
                <div><dt>To</dt><dd>Your university</dd></div>
              </dl>
              <dl className="v2board__strip">
                <div><dt>Status</dt><dd>Now boarding</dd></div>
                <div><dt>Intake</dt><dd>Next</dd></div>
                <div><dt>Class</dt><dd>Guided</dd></div>
              </dl>
              <p className="v2board__fine">{b.chipA.strong} · {b.chipB.strong}</p>
            </div>
            <span className="v2board__stub" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
