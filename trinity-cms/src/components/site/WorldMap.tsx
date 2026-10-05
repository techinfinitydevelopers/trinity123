"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAP_W, MAP_H, MAP_LAND, MAP_MARKERS } from "./world-map";

/* World map of the destinations we place students in. The graduation cap flies from one marker to
   the next; the pins stay put so the map still reads if the animation never runs. */
export default function WorldMap({ note }: { note: string }) {
  const [at, setAt] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) setAt((i) => (i + 1) % MAP_MARKERS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  const cap = MAP_MARKERS[at];

  return (
    <div
      className="wmap"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="wmap__svg" role="img" aria-label={`Study destinations: ${MAP_MARKERS.map((m) => m.name).join(", ")}`}>
        <path className="wmap__land" d={MAP_LAND} />
        {MAP_MARKERS.map((m, i) => (
          <g key={m.name} className={i === at ? "wmap__pin is-at" : "wmap__pin"}>
            <circle className="wmap__halo" cx={m.x} cy={m.y} r={11} />
            <circle className="wmap__dot" cx={m.x} cy={m.y} r={4.5} />
          </g>
        ))}
        {/* One cap, moved by CSS transition so the flight between pins is smooth. */}
        <g className="wmap__cap" style={{ transform: `translate(${cap.x}px, ${cap.y}px)` }} aria-hidden="true">
          <path d="M0 -20 L13 -14 L0 -8 L-13 -14 Z" />
          <path d="M-7 -11.5 L-7 -5 Q0 -1 7 -5 L7 -11.5" />
          <path d="M13 -14 L13 -5" strokeWidth={1.6} fill="none" />
        </g>
      </svg>

      <ul className="wmap__legend">
        {MAP_MARKERS.map((m, i) => {
          const label = <>{m.name}</>;
          return (
            <li key={m.name} className={i === at ? "is-at" : undefined}>
              {m.slug
                ? <Link href={`/destinations/${m.slug}`} onMouseEnter={() => setAt(i)}>{label}</Link>
                : <span onMouseEnter={() => setAt(i)}>{label}</span>}
            </li>
          );
        })}
      </ul>
      {note ? <p className="wmap__note">{note}</p> : null}
    </div>
  );
}
