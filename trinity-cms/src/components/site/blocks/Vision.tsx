"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { VisionBlock } from "@/lib/blocks";
import { Title } from "../ui";

/* A YouTube watch, shorts or youtu.be URL down to its eleven-character id. */
function videoId(url: string) {
  const m = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m?.[1] ?? "";
}

/* Section 8 — "Our Vision to their Journey". The players are facades: the poster is a plain
   image until someone clicks, and only then is the iframe created. Three embeds loading on page
   view would pull in YouTube's player for every visitor, almost none of whom press play. */
export default function Vision({ b }: { b: VisionBlock }) {
  const [playing, setPlaying] = useState<number | null>(null);
  const frames = useRef<(HTMLDivElement | null)[]>([]);

  /* Clicking play unmounts the button and mounts the iframe, which left focus on <body> and
     sent a keyboard user back to the top of the tab order. */
  useEffect(() => {
    if (playing === null) return;
    frames.current[playing]?.focus();
  }, [playing]);

  return (
    <section className="section vision" id="vision">
      <div className="container">
        <div className="section-head section-head--center" data-reveal>
          <p className="kicker">{b.kicker}</p>
          <Title text={b.title} className="h2" />
          <p className="lead">{b.lead}</p>
        </div>

        <div className="vision__grid">
          {b.videos.map((v, i) => {
            const id = videoId(v.youtube);
            return (
              <div key={v.title} className="vision__card" data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <div className="vision__media" tabIndex={playing === i ? -1 : undefined} ref={(el) => { frames.current[i] = el; }}>
                  {playing === i && id ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                      title={`${v.title} — ${v.name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img src={v.poster} alt="" loading="lazy" />
                      {id ? (
                        <button type="button" className="vision__play" onClick={() => setPlaying(i)} aria-label={`Play ${v.title} — ${v.name}`}>
                          <i className="fas fa-play" aria-hidden="true" />
                        </button>
                      ) : (
                        /* No URL yet: say so rather than showing a play button that does nothing. */
                        <span className="vision__soon">{v.note}</span>
                      )}
                    </>
                  )}
                </div>
                <div className="vision__txt">
                  <strong>{v.title}</strong>
                  <small>{v.name}</small>
                </div>
              </div>
            );
          })}
        </div>

        {b.href ? (
          <div className="vision__foot" data-reveal>
            <Link className="btn btn--primary" href={b.href}>{b.linkLabel} <i className="fas fa-arrow-right" /></Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
