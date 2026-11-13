"use client";
import { useRef, useState } from "react";
import type { VideosBlock } from "@/lib/blocks";

/* Tap-to-play vertical clips beside a short text column. Nothing downloads until a card is
   played (preload="none"); only one plays at a time; native controls appear after the first
   play, and a finished clip goes back to its poster. */
export default function Videos({ b }: { b: VideosBlock }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [started, setStarted] = useState<Record<number, boolean>>({});
  const items = Array.isArray(b.items) ? b.items.filter((v) => v && v.src) : [];
  if (!items.length) return null;

  const play = (i: number) => {
    setStarted((s) => ({ ...s, [i]: true }));
    refs.current.forEach((v, j) => { if (v && j !== i) v.pause(); });
    refs.current[i]?.play().catch(() => {});
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
        <div className={`vbk__grid vbk__grid--${Math.min(items.length, 3)}`}>
          {items.map((v, i) => (
            <figure key={v.src} className={`vbk__card${playing === i ? " is-on" : ""}`}>
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
              {v.caption ? <span className="vbk__cap"><i className="fas fa-quote-left" aria-hidden="true" />{v.caption}</span> : null}
              <button type="button" className="vbk__play" aria-label={`Play video ${i + 1}`} onClick={() => play(i)}><i /></button>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
