"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { WebinarBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* The home page's webinar schedule: the whole year at a glance. A list of every webinar (date tile, title, status) sits beside one large
   featured card — poster, date, title, a line of detail and the register button — and clicking a row swaps the card. Nothing moves on its
   own: an auto-advancing slider hid five of the six sessions at any moment and took the card from under anyone reading it.

   Rows come from `b.current`. An item with `date` (YYYY-MM-DD) is "Upcoming · In 3 days" until that day passes and "Completed" after;
   the first upcoming one is pre-selected and marked "Next". The state is worked out in the browser after mount, since this page can sit
   in a cache for days and a label baked in at build time would go stale. An item with no poster gets a branded placeholder. */

type Item = WebinarBlock["current"][number];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayStart(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function parse(date?: string) { if (!date) return null; const [y, m, d] = date.split("-").map(Number); return y && m && d ? new Date(y, m - 1, d) : null; }

/* null = no date, otherwise whole days from today (negative = already held). */
function daysTo(item: Item, today: Date) { const d = parse(item.date); return d ? Math.round((d.getTime() - today.getTime()) / 86400000) : null; }

function label(n: number | null) {
  if (n === null) return "";
  if (n < 0) return "Completed";
  return n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`;
}

export function WebinarCarousel({ b }: { b: WebinarBlock }) {
  const items = b.current;
  const [today, setToday] = useState<Date | null>(null);
  const [i, setI] = useState(0);

  const nextUp = today ? items.findIndex((w) => { const n = daysTo(w, today); return n !== null && n >= 0; }) : -1;

  useEffect(() => {
    const t = dayStart(new Date());
    setToday(t);
    const next = items.findIndex((w) => { const n = daysTo(w, t); return n !== null && n >= 0; });
    if (next > 0) setI(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!items.length) return null;
  const w = items[i];
  const n = today ? daysTo(w, today) : null;
  const upcoming = n !== null && n >= 0;
  const registerHref = w.href || b.ctaHref || "/contact-us";

  return (
    <section className="section wbc" id="webinars" aria-label="Webinars">
      <div className="wbc__wrap">
        <div className="wbc__head" data-reveal>
          <p className="wbc__kicker">{b.kicker}</p>
          <Title text={b.title} className="wbc__h2" />
          {b.lead ? <p className="wbc__lead">{b.lead}</p> : null}
        </div>

        <div className="wbc__grid" data-reveal>
          <article className="wbc__feat" key={i} aria-live="polite">
            <div className="wbc__media">
              {w.img ? (
                <img src={w.img} alt={w.title} loading="lazy" />
              ) : (
                <div className="wbc__ph" aria-hidden="true">
                  <i className="fas fa-video" />
                  <span className="wbc__ph-title">Free live webinar</span>
                  <span className="wbc__ph-tag">Trinity Study Abroad</span>
                </div>
              )}
              {today && n !== null ? (
                <span className={upcoming ? "wbc__pill wbc__pill--soon" : "wbc__pill wbc__pill--done"}>
                  <i className={upcoming ? "fas fa-clock" : "fas fa-check-circle"} aria-hidden="true" />
                  {upcoming ? `Upcoming · ${label(n)}` : "Completed"}
                </span>
              ) : null}
            </div>
            <div className="wbc__info">
              <p className="wbc__when"><i className="far fa-calendar-alt" aria-hidden="true" />{w.when}<span>Free to attend</span></p>
              <h3 className="wbc__title">{w.title}</h3>
              {w.text ? <p className="wbc__text">{w.text}</p> : null}
              <div className="wbc__btns">
                {upcoming ? <Link className="wbc__btn wbc__btn--solid" href={registerHref}>Register now <i className="fas fa-arrow-right" aria-hidden="true" /></Link> : null}
                {b.moreHref ? <Link className="wbc__btn wbc__btn--ghost" href={b.moreHref}>{upcoming ? "More info" : "View webinar details"}</Link> : null}
              </div>
            </div>
          </article>

          <ol className="wbc__list" aria-label="All webinars">
            {items.map((it, k) => {
              const d = parse(it.date);
              const nn = today ? daysTo(it, today) : null;
              const done = nn !== null && nn < 0;
              return (
                <li key={k}>
                  <button type="button" className={`wbc__row${k === i ? " is-on" : ""}${done ? " is-done" : ""}`} aria-pressed={k === i} onClick={() => setI(k)}>
                    <span className="wbc__tile" aria-hidden="true">
                      <b>{d ? String(d.getDate()).padStart(2, "0") : "—"}</b>
                      <small>{d ? MONTHS[d.getMonth()] : ""}</small>
                    </span>
                    <span className="wbc__rt">
                      <strong>{it.title}</strong>
                      <em>
                        {k === nextUp ? <span className="wbc__next">Next</span> : null}
                        {nn === null ? it.when : done ? "Completed" : label(nn)}
                      </em>
                    </span>
                    <i className="fas fa-chevron-right" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {b.moreHref ? <p className="wbc__all"><Link href={b.moreHref}>{b.moreLabel || "All webinars"} <i className="fas fa-arrow-right" aria-hidden="true" /></Link></p> : null}
      </div>
    </section>
  );
}
