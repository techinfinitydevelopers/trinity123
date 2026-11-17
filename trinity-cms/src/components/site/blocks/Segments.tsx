import Link from "next/link";
import type { SegmentsBlock, RoadmapBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* About Us, from the client's brief: what Trinity is for (mission, vision) and the rest of the
   group it belongs to. The logos link out to the sister companies' own sites. */
export function Segments({ b }: { b: SegmentsBlock }) {
  return (
    <section className="section segsec" id="segments">
      <div className="container">
        {b.kicker || b.title || b.lead ? (
          <div className="section-head section-head--center" data-reveal>
            {b.kicker ? <p className="kicker">{b.kicker}</p> : null}
            {b.title ? <Title text={b.title} className="h2" /> : null}
            {b.lead ? <p className="lead">{b.lead}</p> : null}
          </div>
        ) : null}

        {b.pillars.length ? (
          <div className="seg__pillars">
            {b.pillars.map((p, i) => (
              <article key={i} className="seg__pillar" data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
                {p.icon ? <i className={`${p.icon} seg__wm`} aria-hidden="true" /> : null}
                {p.icon ? <span className="seg__ico"><i className={p.icon} aria-hidden="true" /></span> : null}
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        ) : null}

        {b.logos.length ? (
          <div className="seg__group" data-reveal>
            {b.logosTitle ? <h3 className="seg__group-title">{b.logosTitle}</h3> : null}
            <div className="seg__logos">
              {b.logos.map((l) => {
                const card = (
                  <>
                    <span className="seg__logo-img"><img src={l.img} alt={l.name} loading="lazy" /></span>
                    <span className="seg__logo-name">{l.name}</span>
                    {/* Only a card that actually goes somewhere says so. */}
                    {/* FA 5.15 here — `fa-external-link-alt`, not the FA6 name, which draws nothing. */}
                    {l.href ? <span className="seg__logo-go">Visit site <i className="fas fa-external-link-alt" aria-hidden="true" /></span> : null}
                  </>
                );
                /* An outside site opens in its own tab; `noopener` because `target="_blank"`
                   otherwise hands the new page a reference back to this one. */
                return l.href
                  ? <a key={l.name} className="seg__logo" href={l.href} target="_blank" rel="noopener noreferrer">{card}</a>
                  : <span key={l.name} className="seg__logo">{card}</span>;
              })}
            </div>
          </div>
        ) : null}

        {b.ctaHref ? (
          <div className="btn-row btn-row--center" style={{ marginTop: 34 }}>
            <Link className="btn btn--primary" href={b.ctaHref}>{b.ctaLabel} <span className="btn__circle"><i className="fas fa-arrow-right" /></span></Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* About Us: the process from first counselling to pre-departure.
   With an icon on every step it is drawn as the icon process: a single row of illustrated circles joined by a yellow line, the step name under each
   (a vertical rail on a phone). Without icons it is the original numbered path, five to a row. */
export function Roadmap({ b }: { b: RoadmapBlock }) {
  const steps = Array.isArray(b.steps) ? b.steps : [];
  if (!steps.length) return null;
  const withIcons = steps.every((s) => s.icon);
  return (
    <section className="section roadsec" id="roadmap">
      <div className="container">
        <div className="section-head section-head--center" data-reveal>
          {b.kicker ? <p className="kicker">{b.kicker}</p> : null}
          <Title text={b.title} className="h2" />
          {b.lead ? <p className="lead">{b.lead}</p> : null}
        </div>
        <ol className={withIcons ? "road road--icons" : "road"} style={withIcons ? { ["--n" as string]: steps.length } : undefined}>
          {steps.map((s, i) => (
            <li key={i} className="road__step" data-reveal style={{ ["--d" as string]: `${(withIcons ? i : i % 5) * 0.08}s` }}>
              {withIcons ? (
                <span className="road__ico"><img src={s.icon} alt="" width={42} height={42} loading="lazy" /></span>
              ) : (
                <span className="road__num">{i + 1}</span>
              )}
              <span className="road__label">{s.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
