"use client";
import { useRef, useState, type UIEvent } from "react";
import type { VideosBlock } from "@/lib/blocks";

/* Tap-to-play vertical clips beside a short text column. Nothing downloads until a card is
   played (preload="none"); only one plays at a time; native controls appear after the first
   play, and a finished clip goes back to its poster. */
export default function Videos({ b }: { b: VideosBlock }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [started, setStarted] = useState<Record<number, boolean>>({});
  const [dot, setDot] = useState(0);
  const items = Array.isArray(b.items) ? b.items.filter((v) => v && (v.src || v.poster)) : [];
  if (!items.length) return null;

  const play = (i: number) => {
    setStarted((s) => ({ ...s, [i]: true }));
    refs.current.forEach((v, j) => { if (v && j !== i) v.pause(); });
    refs.current[i]?.play().catch(() => {});
  };

  /* Phone row: which card is nearest the centre, for the dots under it. */
  const onRow = (e: UIEvent<HTMLDivElement>) => {
    const row = e.currentTarget;
    const mid = row.scrollLeft + row.clientWidth / 2;
    let best = 0, bd = Infinity;
    Array.from(row.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    setDot((p) => (p === best ? p : best));
  };

  return (
    <section className={`vbk${items.length === 1 ? " vbk--single" : ""}`}>
      <div className="container vbk__wrap">
        <div className="vbk__txt">
          <p className="vbk__kicker">{b.kicker}</p>
          <h2 className="vbk__title">{b.title}</h2>
          {b.lead ? <p className="vbk__lead">{b.lead}</p> : null}
          {b.ctaLabel ? <a className="vbk__btn" href={b.ctaHref || "/contact-us"}>{b.ctaLabel}<i className="fas fa-arrow-right" aria-hidden="true" /></a> : null}
        </div>
        <div className="vbk__stage">
        <div className={`vbk__grid vbk__grid--${Math.min(items.length, 3)}${playing !== null ? " has-playing" : ""}`} onScroll={onRow}>
          {items.map((v, i) => (
            v.src ? (
              <div key={`${v.src}-${i}`} className="vbk__item">
              <figure className={`vbk__card${playing === i ? " is-on" : ""}`}>
                <video
                  ref={(el) => { refs.current[i] = el; }}
                  src={v.src}
                  poster={v.poster || undefined}
                  preload="none"
                  playsInline
                  controls={!!started[i]}
                  onPlay={() => setPlaying(i)}
                  onPause={() => setPlaying((p) => (p === i ? null : p))}
                  onEnded={(e) => { const el = e.currentTarget; el.currentTime = 0; el.load(); setStarted((s) => ({ ...s, [i]: false })); setPlaying(null); }}
                />
                {v.caption ? <span className="vbk__cap">{v.caption}</span> : null}
                <button type="button" className="vbk__play" aria-label={`Play video ${i + 1}`} onClick={() => play(i)}><i /></button>
              </figure>
              </div>
            ) : (
              /* A thumbnail with no video yet: shown as is, with a "coming soon" chip and no play button. */
              <div key={`${v.poster}-${i}`} className="vbk__item">
              <figure className="vbk__card vbk__card--soon">
                <img src={v.poster} alt="" loading="lazy" />
                <span className="vbk__cap"><i className="far fa-clock" aria-hidden="true" />{v.caption || "Video coming soon"}</span>
              </figure>
              </div>
            )
          ))}
        </div>
        {items.length > 1 ? (
          <div className="vbk__dots" aria-hidden="true">{items.map((_, i) => <i key={i} className={i === dot ? "on" : ""} />)}</div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
