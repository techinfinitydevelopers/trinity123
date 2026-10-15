import Link from "next/link";
import type { WebinarBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* Section 7 — the Knowledge Hub. Both lists start empty, and each says so in its own words
   rather than showing a skeleton of a webinar that does not exist. */
export function Webinar({ b }: { b: WebinarBlock }) {
  return (
    <section className="section webinarsec" id="webinars">
      <div className="container">
        <div className="section-head section-head--center" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="h2" />
          <p className="lead">{b.lead}</p>
        </div>

        <div className="webinar__grid">
          <div className="webinar__now" data-reveal>
            <h3>{b.currentTitle}</h3>
            {b.current.length ? (
              <ul className="webinar__list">
                {b.current.map((w) => (
                  <li key={w.title} className="webinar__item">
                    {w.img ? <span className="webinar__thumb"><img src={w.img} alt="" loading="lazy" /></span> : null}
                    <span className="webinar__txt">
                      {w.badge ? <em className="webinar__badge">{w.badge}</em> : null}
                      <strong>{w.title}</strong>
                      {w.when ? <small>{w.when}</small> : null}
                      {w.text ? <p>{w.text}</p> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="webinar__empty">{b.currentNote}</p>
            )}
            {b.ctaHref ? (
              <Link className="btn btn--gold webinar__cta" href={b.ctaHref}>
                {b.ctaLabel} <i className="fas fa-arrow-right" />
              </Link>
            ) : null}
          </div>

          <div className="webinar__past" data-reveal="right">
            <h3>{b.pastTitle}</h3>
            {b.past.length ? (
              <div className="webinar__snips">
                {b.past.map((w, i) => {
                  /* The client sent photographs without captions, so a snippet renders as just
                     the picture unless a title or date has been filled in. */
                  const caption = w.title || w.when
                    ? <span><strong>{w.title}</strong>{w.when ? <small>{w.when}</small> : null}</span>
                    : null;
                  const inner = <><img src={w.img} alt={w.title || ""} loading="lazy" />{caption}</>;
                  return w.href
                    ? <a key={i} className="webinar__snip" href={w.href} target="_blank" rel="noopener">{inner}</a>
                    : <span key={i} className="webinar__snip">{inner}</span>;
                })}
              </div>
            ) : (
              <p className="webinar__empty">{b.pastNote}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
