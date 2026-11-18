"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stars } from "../ui";

/* One story card. The open state is a data attribute, never part of `className`: the page's reveal script adds an `in` class to every
   `[data-reveal]` element, and React rewriting `className` on a re-render wipes it — the card goes back to its hidden pre-reveal state
   and vanishes (that was the "card disappears on Read more" bug). A long story shows its first few lines with a soft fade and a "Read more" link; the link opens the card to the full text
   and turns into "Show less". Short stories show whole, with no link. Whether the text is long is measured in the browser (it depends on
   the card's width), so the link appears only where it is needed and follows window resizes. */

const LINES = 6;

type Props = { name: string; course?: string; img?: string; text: string; initials: string; ratingLabel: string; index: number };

export function TestimonialCard({ name, course, img, text, initials, ratingLabel, index }: Props) {
  const p = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  const [full, setFull] = useState(0);
  const [cut, setCut] = useState(0);

  const measure = useCallback(() => {
    const el = p.current;
    if (!el) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 26;
    const collapsed = Math.round(lh * LINES);
    setCut(collapsed);
    setFull(el.scrollHeight);
    setLong(el.scrollHeight > collapsed + lh * 0.6);
  }, []);

  useEffect(() => {
    measure();
    const el = p.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, text]);

  const h = long ? (open ? full : cut) : undefined;

  return (
    <blockquote className="tcard" data-open={long && open ? "" : undefined} data-reveal style={{ ["--d" as string]: `${(index % 3) * 0.08}s` }}>
      <span className="tcard__blob" />
      <div className="tcard__head">
        <div className="tcard__who">
          {img ? <img src={img} alt={name} loading="lazy" /> : <span className="tcard__ini" aria-hidden="true">{initials}</span>}
          <div><strong>{name}</strong>{course ? <small>{course}</small> : null}</div>
        </div>
        <span className="tcard__q"><i className="fas fa-quote-right" /></span>
      </div>
      <Stars label={ratingLabel} />
      <div className={`tcard__body${long && !open ? " is-cut" : ""}`} style={h ? { maxHeight: h } : undefined}>
        <p ref={p} id={`tcard-${index}-${name.length}`}>{text}</p>
      </div>
      {long ? (
        <button type="button" className="tcard__more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Show less" : "Read more"}<i className="fas fa-chevron-down" aria-hidden="true" />
        </button>
      ) : null}
    </blockquote>
  );
}
