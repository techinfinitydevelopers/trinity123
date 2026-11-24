"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WebinarBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* The home page's webinar slider: one card at a time — a status pill, the date, the title and a short line on the left, the poster on
   the right — with dots underneath. Slides come from `b.current`; an item with `date` (YYYY-MM-DD) shows "Upcoming · In 3 days" until
   that day passes and "Completed" afterwards. An item with no poster gets a branded placeholder (date + title) instead of a blank box.

   The state is worked out in the browser, after mount: this page can sit in a cache for days, so a label baked in at build time would
   go stale. Until then the slider shows the first slide with no status. It opens on the next upcoming webinar and advances itself every
   few seconds, stopping while the pointer or keyboard focus is on it and for anyone who prefers reduced motion. */

/* How long each webinar stays on screen before the slider moves on by itself (client sheet, 24/11: 7–8 seconds). */
const AUTO_MS = 7500;

type Item = WebinarBlock["current"][number];

function dayStart(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function parse(date?: string) { if (!date) return null; const [y, m, d] = date.split("-").map(Number); return y && m && d ? new Date(y, m - 1, d) : null; }

/* null = no date, otherwise whole days from today (negative = already held). */
function daysTo(item: Item, today: Date) { const d = parse(item.date); return d ? Math.round((d.getTime() - today.getTime()) / 86400000) : null; }

function status(n: number | null) {
  if (n === null) return null;
  if (n < 0) return { cls: "done", label: "Completed" };
  return { cls: "soon", label: n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days` };
}

export function WebinarCarousel({ b }: { b: WebinarBlock }) {
  const items = b.current;
  const [today, setToday] = useState<Date | null>(null);
  const [i, setI] = useState(0);
  const hold = useRef(false);

  useEffect(() => {
    const t = dayStart(new Date());
    setToday(t);
    const next = items.findIndex((w) => { const n = daysTo(w, t); return n !== null && n >= 0; });
    if (next > 0) setI(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  /* Each slide stays for AUTO_MS, counted from the moment it appears — so a slide picked by hand or by a swipe also gets its full time
     instead of inheriting what was left of the last tick. Held while the pointer or keyboard focus is on the card. */
  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    const arm = () => { id = window.setTimeout(() => { if (hold.current) arm(); else setI((v) => (v + 1) % items.length); }, AUTO_MS); };
    arm();
    return () => window.clearTimeout(id);
  }, [i, items.length]);

  const go = (d: number) => setI((v) => (v + d + items.length) % items.length);
  const touch = useRef<{ x: number; y: number } | null>(null);

  if (!items.length) return null;
  const w = items[i];
  const n = today ? daysTo(w, today) : null;
  const st = status(n);
  const upcoming = n !== null && n >= 0;
  const registerHref = w.href || b.ctaHref || "/contact-us";

  return (
    <section className="section wbc" id="webinars" aria-roledescription="carousel" aria-label="Webinars">
      <div className="wbc__wrap">
        <div className="wbc__head" data-reveal>
          <p className="wbc__kicker">{b.kicker}</p>
          <Title text={b.title} className="wbc__h2" />
          {b.lead ? <p className="wbc__lead">{b.lead}</p> : null}
        </div>

        <div
          className="wbc__card"
          onMouseEnter={() => { hold.current = true; }}
          onMouseLeave={() => { hold.current = false; }}
          onFocus={() => { hold.current = true; }}
          onBlur={() => { hold.current = false; }}
          onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => { const s = touch.current; touch.current = null; if (!s) return; const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1); }}
          data-reveal
        >
          <div className="wbc__body" key={i}>
            <div className="wbc__top">
              {st ? <span className={`wbc__pill wbc__pill--${st.cls}`}><i className={st.cls === "done" ? "fas fa-check-circle" : "fas fa-clock"} aria-hidden="true" />{st.cls === "done" ? st.label : `Upcoming · ${st.label}`}</span> : null}
              <span className="wbc__count" aria-hidden="true">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>
            <p className="wbc__when"><i className="far fa-calendar-alt" aria-hidden="true" />{w.when}</p>
            <h3 className="wbc__title">{w.title}</h3>
            <div className="wbc__btns">
              {b.moreHref ? <Link className="wbc__btn wbc__btn--ghost" href={b.moreHref}>More Info</Link> : null}
              {upcoming ? <Link className="wbc__btn wbc__btn--solid" href={registerHref}>Register Now <i className="fas fa-arrow-right" aria-hidden="true" /></Link> : null}
            </div>
          </div>

          <div className="wbc__media" key={`m${i}`}>
            {w.img ? (
              <img src={w.img} alt={w.title} loading="lazy" />
            ) : (
              <div className="wbc__ph" aria-hidden="true">
                <span className="wbc__ph-date">{w.when}</span>
                <span className="wbc__ph-title">{w.title}</span>
                <span className="wbc__ph-tag">Trinity Study Abroad</span>
              </div>
            )}
          </div>
        </div>

        {items.length > 1 ? (
          <div className="wbc__nav">
            <button type="button" className="wbc__arrow" aria-label="Previous webinar" onClick={() => go(-1)}><i className="fas fa-chevron-left" aria-hidden="true" /></button>
            <div className="wbc__dots" role="tablist" aria-label="Choose a webinar">
              {items.map((it, k) => (
                <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`${it.title}, ${it.when}`} className={k === i ? "is-on" : ""} onClick={() => setI(k)} />
              ))}
            </div>
            <button type="button" className="wbc__arrow" aria-label="Next webinar" onClick={() => go(1)}><i className="fas fa-chevron-right" aria-hidden="true" /></button>
          </div>
        ) : null}
        {items.length > 1 ? <p className="wbc__hint"><i className="fas fa-arrow-left" aria-hidden="true" /><span>Swipe left or right to see more webinars</span><i className="fas fa-arrow-right" aria-hidden="true" /></p> : null}
      </div>
    </section>
  );
}
