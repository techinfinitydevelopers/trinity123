import Link from "next/link";
import type { SegmentsBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* About Us, from the client's brief: what Trinity is for (mission, vision) and the rest of the
   group it belongs to. The logos link out to the sister companies' own sites. */
export function Segments({ b }: { b: SegmentsBlock }) {
  return (
    <section className="section segsec" id="segments">
      <div className="container">
        <div className="section-head section-head--center" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="h2" />
          {b.lead ? <p className="lead">{b.lead}</p> : null}
        </div>

        {b.pillars.length ? (
          <div className="seg__pillars">
            {b.pillars.map((p, i) => (
              <article key={i} className="seg__pillar" data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
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
