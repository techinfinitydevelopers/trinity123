"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EventsBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* Events page: where Trinity has set up a stand or held a session. One card per event (cover photo, name, place and date, photo count);
   a card opens a full-screen viewer for that event only — big photo, previous / next, a strip of thumbnails, keyboard (← → Esc) and
   swipe. The first photo of each event is its cover, so the owner reorders photos in /admin to change it. A photo may carry a small
   `thumb` (used on the strip); without one the photo itself is used. */

type Ev = EventsBlock["events"][number];

export function EventsGallery({ b }: { b: EventsBlock }) {
  const events = (b.events ?? []).filter((e) => e && Array.isArray(e.photos) && e.photos.length > 0);
  const [open, setOpen] = useState<{ e: number; p: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => { setOpen(null); opener.current?.focus(); }, []);
  const step = useCallback((d: number) => {
    setOpen((o) => {
      if (!o) return o;
      const n = events[o.e].photos.length;
      return { e: o.e, p: (o.p + d + n) % n };
    });
  }, [events]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
      else if (ev.key === "ArrowRight") step(1);
      else if (ev.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, close, step]);

  /* Keep the current thumbnail in view on the strip as the photo changes. */
  useEffect(() => {
    if (!open) return;
    document.querySelector<HTMLElement>(".evg__strip .is-on")?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [open]);

  if (!events.length) return null;
  const cur = open ? events[open.e] : null;
  const photo = cur && open ? cur.photos[open.p] : null;

  return (
    <section className="section evg" id="events-gallery">
      <div className="evg__wrap">
        <div className="evg__head" data-reveal>
          {b.kicker ? <p className="evg__kicker">{b.kicker}</p> : null}
          <Title text={b.title} className="evg__h2" />
          {b.lead ? <p className="evg__lead">{b.lead}</p> : null}
        </div>

        <div className="evg__grid">
          {events.map((ev: Ev, i: number) => (
            <button
              key={i}
              type="button"
              className={`evg__card${i === 0 ? " evg__card--lead" : ""}`}
              onClick={(e) => { opener.current = e.currentTarget; setOpen({ e: i, p: 0 }); }}
              aria-label={`Open ${ev.name} photos`}
              data-reveal
              style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }}
            >
              <span className="evg__shot"><img src={ev.photos[0].img} alt="" loading={i < 2 ? "eager" : "lazy"} /></span>
              <span className="evg__count"><i className="fas fa-camera" aria-hidden="true" />{ev.photos.length} photos</span>
              <span className="evg__info">
                <strong>{ev.name}</strong>
                <span className="evg__meta">
                  {ev.place ? <span><i className="fas fa-map-marker-alt" aria-hidden="true" />{ev.place}</span> : null}
                  {ev.date ? <span><i className="far fa-calendar-alt" aria-hidden="true" />{ev.date}</span> : null}
                </span>
                {ev.text ? <span className="evg__text">{ev.text}</span> : null}
                <span className="evg__go">View photos <i className="fas fa-arrow-right" aria-hidden="true" /></span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {cur && photo && open ? (
        <div className="evg__lb" role="dialog" aria-modal="true" aria-label={`${cur.name} photos`} onClick={close}>
          <div className="evg__bar" onClick={(e) => e.stopPropagation()}>
            <div className="evg__title">
              <strong>{cur.name}</strong>
              <span>{[cur.place, cur.date].filter(Boolean).join(" · ")}</span>
            </div>
            <span className="evg__n">{open.p + 1} / {cur.photos.length}</span>
            <button type="button" className="evg__x" onClick={close} aria-label="Close gallery" autoFocus><i className="fas fa-times" aria-hidden="true" /></button>
          </div>

          <div
            className="evg__stage"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { (e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX); }}
            onTouchEnd={(e) => {
              const x0 = Number((e.currentTarget as HTMLElement).dataset.x);
              const dx = e.changedTouches[0].clientX - x0;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            {cur.photos.length > 1 ? <button type="button" className="evg__nav evg__nav--prev" onClick={() => step(-1)} aria-label="Previous photo"><i className="fas fa-chevron-left" aria-hidden="true" /></button> : null}
            <img key={photo.img} src={photo.img} alt={photo.alt || `${cur.name}, photo ${open.p + 1}`} />
            {cur.photos.length > 1 ? <button type="button" className="evg__nav evg__nav--next" onClick={() => step(1)} aria-label="Next photo"><i className="fas fa-chevron-right" aria-hidden="true" /></button> : null}
          </div>

          {cur.photos.length > 1 ? (
            <div className="evg__strip" onClick={(e) => e.stopPropagation()}>
              {cur.photos.map((p, k) => (
                <button key={k} type="button" className={k === open.p ? "is-on" : ""} onClick={() => setOpen({ e: open.e, p: k })} aria-label={`Photo ${k + 1}`} aria-current={k === open.p}>
                  <img src={p.thumb || p.img} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
