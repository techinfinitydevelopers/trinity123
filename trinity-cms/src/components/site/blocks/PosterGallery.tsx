"use client";
import { useCallback, useEffect, useState } from "react";

/* The recap posters on the Webinars page: a compact grid (five across on a desktop), each opening full size in a lightbox so the small print stays readable
   — the posters are portrait with a lot of text on them, which is why they used to run three to a row at ~520px wide. Arrow keys / Escape work; the page
   behind does not scroll while it is open. A poster that has a link keeps being a link. */
type Snip = { img: string; title?: string; when?: string; href?: string };

export default function PosterGallery({ items }: { items: Snip[] }) {
  const [at, setAt] = useState<number | null>(null);
  const close = useCallback(() => setAt(null), []);
  const step = useCallback((d: number) => setAt((v) => (v === null ? v : (v + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [at, close, step]);

  return (
    <>
      <div className="webinar__snips webinar__snips--wide">
        {items.map((w, i) => {
          const caption = w.title || w.when ? <span><strong>{w.title}</strong>{w.when ? <small>{w.when}</small> : null}</span> : null;
          const inner = <><img src={w.img} alt={w.title || `Webinar recap ${i + 1}`} loading="lazy" />{caption}<i className="webinar__zoom fas fa-expand-alt" aria-hidden="true" /></>;
          return w.href
            ? <a key={i} className="webinar__snip" href={w.href} target="_blank" rel="noopener">{inner}</a>
            : <button key={i} type="button" className="webinar__snip webinar__snip--btn" onClick={() => setAt(i)} aria-label={`View ${w.title || `recap ${i + 1}`} full size`}>{inner}</button>;
        })}
      </div>
      {at !== null ? (
        <div className="pgbox" role="dialog" aria-modal="true" aria-label="Webinar recap" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <button type="button" className="pgbox__x" onClick={close} aria-label="Close"><i className="fas fa-times" aria-hidden="true" /></button>
          {items.length > 1 ? <button type="button" className="pgbox__nav pgbox__nav--prev" onClick={() => step(-1)} aria-label="Previous"><i className="fas fa-chevron-left" aria-hidden="true" /></button> : null}
          <img className="pgbox__img" src={items[at].img} alt={items[at].title || `Webinar recap ${at + 1}`} />
          {items.length > 1 ? <button type="button" className="pgbox__nav pgbox__nav--next" onClick={() => step(1)} aria-label="Next"><i className="fas fa-chevron-right" aria-hidden="true" /></button> : null}
          <span className="pgbox__count" aria-hidden="true">{at + 1} / {items.length}</span>
        </div>
      ) : null}
    </>
  );
}
