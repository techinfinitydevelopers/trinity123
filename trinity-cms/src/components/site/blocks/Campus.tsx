"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import type { CampusBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* "Find your Campus" — the visitor picks public or private, and the panel below changes.
   A radio group rather than tabs: the two options are a choice about the visitor's own profile,
   and arrow-key selection is what screen-reader users expect from that. */
export default function Campus({ b }: { b: CampusBlock }) {
  const [at, setAt] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = b.options[at];
  if (!cur) return null;

  /* `role="radio"` promises arrow-key selection, so it has to be provided: the arrows move the
     choice and the focus together, and Tab enters the group once (roving tabindex below). */
  const onKey = (e: React.KeyboardEvent) => {
    const n = b.options.length;
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (at + step + n) % n;
    setAt(next);
    refs.current[next]?.focus();
  };

  return (
    <section className="section campus" id="campus">
      <div className="container">
        <div className="section-head section-head--center" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="h2" />
          <p className="lead">{b.lead}</p>
        </div>

        <p className="campus__prompt" data-reveal>{b.prompt}</p>

        <div className="campus__picks" role="radiogroup" aria-label={b.prompt} onKeyDown={onKey}>
          {b.options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              id={`campus-opt-${o.id}`}
              ref={(el) => { refs.current[i] = el; }}
              aria-checked={i === at}
              aria-controls="campus-panel"
              tabIndex={i === at ? 0 : -1}
              className={i === at ? "campus__pick is-at" : "campus__pick"}
              onClick={() => setAt(i)}
              data-reveal
              style={{ ["--d" as string]: `${i * 0.08}s` }}
            >
              <span className="campus__pick-img"><img src={o.img} alt={o.imgAlt} loading="lazy" /></span>
              <span className="campus__pick-txt">
                <strong>{o.label}</strong>
                <small>{o.sub}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="campus__panel" id="campus-panel" aria-live="polite" aria-labelledby={`campus-opt-${cur.id}`} data-reveal key={cur.id}>
          {cur.criteria.length ? (
            <div className="campus__criteria">
              <h3>{cur.criteriaTitle}</h3>
              <ul>
                {cur.criteria.map((t) => (
                  <li key={t}><i className="fas fa-check" aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="campus__logos">
            <h3>{cur.logosTitle}</h3>
            {cur.logos.length ? (
              <div className="campus__logo-grid">
                {cur.logos.map((l) =>
                  l.href
                    ? <Link key={l.name} href={l.href} className="campus__logo"><img src={l.img} alt={l.name} loading="lazy" /></Link>
                    : <span key={l.name} className="campus__logo"><img src={l.img} alt={l.name} loading="lazy" /></span>,
                )}
              </div>
            ) : (
              /* Deliberately empty until the logo files arrive — an honest gap beats inventing a
                 list of universities we have not been given. */
              <p className="campus__logos-empty">{cur.logosNote}</p>
            )}
            {cur.href ? (
              <Link className="btn btn--primary campus__cta" href={cur.href}>
                {cur.linkLabel} <i className="fas fa-arrow-right" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
