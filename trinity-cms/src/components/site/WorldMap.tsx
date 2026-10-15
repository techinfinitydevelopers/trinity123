"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAP_W, MAP_H, MAP_REGIONS, MAP_MARKERS } from "./world-map";

/* Where each country's name sits on the map. Hand-placed, because five of the fourteen pins are
   inside a 54px-wide European cluster and nothing automatic separates them legibly. Geometry
   stays in the generated file; this is presentation, keyed by the marker's name.
   `anchor` is the SVG text-anchor, and a leader line is drawn whenever the label sits more than
   a few pixels from its pin. */
type Label = { x: number; y: number; anchor: "start" | "middle" | "end"; lines?: string[] };

const LABELS: Record<string, Label> = {
  Canada: { x: 290, y: 88, anchor: "middle" },
  USA: { x: 248, y: 141, anchor: "end" },
  Ireland: { x: 430, y: 58, anchor: "end" },
  UK: { x: 466, y: 40, anchor: "end" },
  "Other European countries": { x: 566, y: 26, anchor: "start", lines: ["All other", "European countries"] },
  Germany: { x: 590, y: 56, anchor: "start" },
  France: { x: 468, y: 122, anchor: "end" },
  UAE: { x: 654, y: 184, anchor: "middle" },
  "South Korea": { x: 820, y: 104, anchor: "end" },
  Japan: { x: 908, y: 112, anchor: "start" },
  Malaysia: { x: 736, y: 210, anchor: "end" },
  Singapore: { x: 740, y: 252, anchor: "end" },
  Australia: { x: 878, y: 356, anchor: "middle" },
  "New Zealand": { x: 992, y: 372, anchor: "end" },
};

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
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="wmap__svg" role="img" aria-label={`Study destinations: ${MAP_MARKERS.map((m) => m.name).join(", ")}`}>
        {/* One path per continent so each can take its own colour, as the client's
            reference map does. */}
        {MAP_REGIONS.map((reg) => (
          <path key={reg.id} className={`wmap__land wmap__land--${reg.id}`} d={reg.d} />
        ))}
        {MAP_MARKERS.map((m, i) => {
          const l = LABELS[m.name];
          /* Far enough from its pin that the eye needs help joining the two. */
          const leader = l && Math.hypot(l.x - m.x, l.y - m.y) > 16;
          return (
            <g key={m.name} className={i === at ? "wmap__pin is-at" : "wmap__pin"}>
              {leader ? <line className="wmap__leader" x1={m.x} y1={m.y} x2={l.x} y2={l.y + 3} /> : null}
              <circle className="wmap__halo" cx={m.x} cy={m.y} r={11} />
              <circle className="wmap__dot" cx={m.x} cy={m.y} r={4.5} />
              {l ? (
                <text className="wmap__label" x={l.x} y={l.y} textAnchor={l.anchor}>
                  {l.lines
                    ? l.lines.map((line, k) => <tspan key={line} x={l.x} dy={k ? 10 : 0}>{line}</tspan>)
                    : m.name}
                </text>
              ) : null}
            </g>
          );
        })}
        {/* One cap, moved by CSS transition so the flight between pins is smooth. */}
        <g className="wmap__cap" style={{ transform: `translate(${cap.x}px, ${cap.y}px)` }} aria-hidden="true">
          <path d="M0 -20 L13 -14 L0 -8 L-13 -14 Z" />
          <path d="M-7 -11.5 L-7 -5 Q0 -1 7 -5 L7 -11.5" />
          <path d="M13 -14 L13 -5" strokeWidth={1.6} fill="none" />
        </g>
      </svg>

      {note ? <p className="wmap__note">{note}</p> : null}
    </div>
  );
}
