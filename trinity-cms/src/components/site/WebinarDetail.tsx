"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { WebinarBlock } from "@/lib/blocks";
import { isPastWebinar, parseTime, webinarSlug } from "@/lib/webinar";

type Item = WebinarBlock["current"][number];

/* The More Info page of a home-page webinar: the poster and the story on the left, a sticky card with the countdown, the facts and the
   Register button on the right. Everything the CMS does not hold (time, host, long description) is simply left out rather than invented. */

function target(w: Item) {
  const [y, m, d] = (w.date ?? "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const t = parseTime(w.time);
  return new Date(y, m - 1, d, t ? t[0] : 0, t ? t[1] : 0);
}

/* A webinar with no clock time runs "all day": it only counts as over once its whole day has passed. */
const lengthMs = (w: Item) => (parseTime(w.time) ? 0 : 86400000);

/* The clock: null on the server and during hydration (the page can sit in a cache, so no time is baked in), then the current time
   rounded to 30 s so the snapshot is stable between renders. */
const tick = (cb: () => void) => { const id = window.setInterval(cb, 30000); return () => window.clearInterval(id); };
const useNow = () => useSyncExternalStore(tick, () => Math.floor(Date.now() / 30000) * 30000, () => null);

function Countdown({ w, now }: { w: Item; now: number | null }) {
  const at = target(w);
  if (!at) return <div className="wbd__count wbd__count--note"><span className="wbd__lbl">Date</span><strong>To be announced</strong></div>;
  if (now === null) return <div className="wbd__count" aria-hidden="true"><span className="wbd__lbl">Starts in</span></div>;
  const left = at.getTime() - now;
  if (left < -lengthMs(w)) return <div className="wbd__count wbd__count--done"><i className="fas fa-check-circle" aria-hidden="true" /><strong>This webinar is completed</strong></div>;
  if (left < 0) return <div className="wbd__count wbd__count--live"><i className="fas fa-circle" aria-hidden="true" /><strong>Happening today</strong></div>;
  const mins = Math.floor(left / 60000), d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
  const cell = (v: number, u: string) => <span className="wbd__cell"><b>{String(v).padStart(2, "0")}</b>{u}</span>;
  return (
    <div className="wbd__count" role="timer" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`}>
      <span className="wbd__lbl">Starts in</span>
      <span className="wbd__cells">{cell(d, "d")}<i>:</i>{cell(h, "h")}<i>:</i>{cell(m, "m")}</span>
    </div>
  );
}

function About({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 380 || text.split("\n").length > 4;
  return (
    <div className="wbd__about">
      <h2>About the Event</h2>
      <div className={`wbd__prose${long && !open ? " is-cut" : ""}`} id="wbd-about">{text.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
      {long ? <button type="button" className="wbd__more" aria-expanded={open} aria-controls="wbd-about" onClick={() => setOpen((v) => !v)}>{open ? "Show less" : "Show more"}</button> : null}
    </div>
  );
}

export default function WebinarDetail({ b, w }: { b: WebinarBlock; w: Item }) {
  const now = useNow();
  const at = target(w);
  const done = now !== null && !!at && now > at.getTime() + lengthMs(w);
  const register = w.href || b.ctaHref || "/contact-us";
  const about = (w.about || w.text || "").trim();
  const others = b.current.filter((x) => webinarSlug(x) !== webinarSlug(w) && !isPastWebinar(x));
  return (
    <>
      <section className="section wbd" aria-labelledby="wbd-title">
        <div className="wbd__wrap">
          <nav className="wbd__crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i className="fas fa-chevron-right" aria-hidden="true" /><Link href="/#webinars">Free webinars</Link><i className="fas fa-chevron-right" aria-hidden="true" /><span aria-current="page">Webinar details</span></nav>
          <div className="wbd__grid">
            <div className="wbd__main">
              <div className="wbd__poster">
                {w.img ? <img src={w.img} alt={w.title} /> : (
                  <div className="wbd__ph" aria-hidden="true"><span className="wbd__ph-date">{w.when}</span><span className="wbd__ph-title">{w.title}</span><span className="wbd__ph-tag">Trinity Study Abroad</span></div>
                )}
              </div>
              <div className="wbd__tags"><span>Free webinar</span><span>All countries</span></div>
              {about ? <About text={about} /> : (
                <div className="wbd__about"><h2>About the Event</h2><p className="wbd__soon">{done ? "This webinar has been held. Browse our other webinars and events for what is coming next." : "The full details of this webinar will be announced soon. Register your interest and we will let you know as soon as the topic and time are confirmed."}</p></div>
              )}
            </div>

            <aside className="wbd__card" aria-label="Webinar details">
              <Countdown w={w} now={now} />
              <h1 className="wbd__title" id="wbd-title">{w.title}</h1>
              <ul className="wbd__facts">
                <li><i className="far fa-calendar-alt" aria-hidden="true" /><span>{w.when}</span></li>
                {w.time ? <li><i className="far fa-clock" aria-hidden="true" /><span>{w.time}</span></li> : null}
                <li><i className="fas fa-video" aria-hidden="true" /><span>{w.mode || "Online webinar"}</span></li>
              </ul>
              {w.host ? (
                <div className="wbd__host">
                  <p className="wbd__lbl">Hosted by</p>
                  <div className="wbd__host-row">
                    {w.hostImg ? <img src={w.hostImg} alt="" /> : <span className="wbd__host-ph" aria-hidden="true">{w.host.slice(0, 1)}</span>}
                    <div><strong>{w.host}</strong>{w.hostRole ? <span>{w.hostRole}</span> : null}</div>
                  </div>
                </div>
              ) : null}
              {done ? (
                <Link className="wbd__cta wbd__cta--ghost" href={b.moreHref || "/webinars-events"}>See all webinars &amp; events <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              ) : (
                <Link className="wbd__cta" href={register}>Register for event <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              )}
              <p className="wbd__free"><i className="fas fa-shield-alt" aria-hidden="true" /> Free to attend · Open to students and parents</p>
            </aside>
          </div>
        </div>
      </section>

      {others.length ? (
        <section className="section wbd-more" aria-labelledby="wbd-more-h">
          <div className="wbd__wrap">
            <h2 id="wbd-more-h">More webinars</h2>
            <div className="wbd-more__row">
              {others.map((o) => (
                <Link key={webinarSlug(o)} href={`/webinars/${webinarSlug(o)}`} className="wbd-more__item">
                  <span className="wbd-more__when"><i className="far fa-calendar-alt" aria-hidden="true" />{o.when}</span>
                  <strong>{o.title}</strong>
                  <span className="wbd-more__go">View details <i className="fas fa-arrow-right" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
