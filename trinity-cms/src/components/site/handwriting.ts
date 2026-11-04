/* A single-stroke hand, for the preloader to write the company name with.

   The three cheaper ways of faking this were all tried first and all failed in the same place.
   A left-to-right wipe reads as a reveal. One letter at a time reads as typing. A thick mask
   dragged along a wave reads better but still cannot do the three things a hand actually does:
   draw a letter in more than one go, go back for the dot on an i or the bar on a t, and lift
   between strokes. All three are the same limitation — a mask only ever moves forward.

   So the letters are not type at all here. Each one is the route a pen takes, and the line is
   drawn by growing it from nothing, which is why it looks like it is being written: the ink
   appears at the tip and nowhere else.

   The forms are a neat monoline hand rather than a formal copperplate: the capitals are drawn
   the way most people actually draw them, in separate strokes, which is part of why it reads
   as handwriting. Lowercase letters that are one movement are one stroke; the ones that are
   not — i, j, t, f, x, and the two-part bowls — are as many strokes as the hand makes.

   Coordinates: the origin of every glyph is its own left edge on the baseline, y negative is
   up. x-height 54, ascender and cap 78, descender 22. Nothing outside this file needs those
   numbers; `layout` hands back finished paths. */

type Stroke = {
  d: string;
  /* A multiplier on the time the stroke's length would otherwise earn it. A dot or a crossbar
     is a flick — the hand is already moving when it lands. */
  t?: number;
};
type Glyph = { w: number; s: Stroke[] };

const G: Record<string, Glyph> = {
  a: { w: 46, s: [{ d: "M36,-38 C36,-54 10,-56 8,-32 C6,-12 30,-6 36,-18" }, { d: "M36,-50 L38,-2" }] },
  b: { w: 46, s: [{ d: "M8,-78 L10,-2" }, { d: "M10,-30 C14,-46 40,-44 40,-26 C40,-8 16,-4 10,-14" }] },
  c: { w: 44, s: [{ d: "M38,-44 C30,-56 8,-52 8,-28 C8,-6 30,-4 38,-14" }] },
  d: { w: 46, s: [{ d: "M36,-40 C32,-54 8,-54 8,-30 C8,-8 30,-4 36,-16" }, { d: "M38,-78 L40,-2" }] },
  e: { w: 44, s: [{ d: "M8,-26 L36,-30 C38,-46 14,-56 8,-34 C2,-12 24,-2 38,-12" }] },
  f: { w: 38, s: [{ d: "M34,-76 C22,-80 16,-70 16,-54 L14,8" }, { d: "M4,-52 L34,-56", t: 0.35 }] },
  g: { w: 46, s: [{ d: "M36,-40 C32,-54 8,-54 8,-30 C8,-8 30,-4 36,-16" }, { d: "M38,-52 L36,-4 C34,14 16,22 6,14" }] },
  h: { w: 46, s: [{ d: "M8,-78 L10,-2" }, { d: "M10,-28 C16,-44 38,-48 38,-28 L38,-2" }] },
  i: { w: 26, s: [{ d: "M14,-52 L16,-2" }, { d: "M14,-68 L16,-65", t: 0.22 }] },
  j: { w: 28, s: [{ d: "M18,-52 L16,-6 C14,10 4,16 -2,10" }, { d: "M18,-68 L20,-65", t: 0.22 }] },
  k: { w: 44, s: [{ d: "M8,-78 L10,-2" }, { d: "M34,-50 L10,-22 L34,-2" }] },
  l: { w: 26, s: [{ d: "M14,-78 C12,-40 10,-18 14,-6" }] },
  m: { w: 62, s: [{ d: "M6,-52 L8,-2" }, { d: "M8,-34 C12,-50 28,-52 28,-32 L28,-2 M28,-34 C32,-50 48,-52 48,-32 L48,-2" }] },
  n: { w: 46, s: [{ d: "M8,-52 L10,-2" }, { d: "M10,-32 C14,-50 36,-52 36,-30 L36,-2" }] },
  o: { w: 46, s: [{ d: "M22,-54 C8,-54 4,-38 6,-26 C8,-10 24,-2 34,-12 C44,-22 40,-54 22,-54" }] },
  p: { w: 46, s: [{ d: "M8,-52 L4,20" }, { d: "M8,-36 C14,-54 40,-50 40,-28 C40,-8 16,-4 8,-14" }] },
  q: { w: 46, s: [{ d: "M36,-40 C32,-54 8,-54 8,-30 C8,-8 30,-4 36,-16" }, { d: "M38,-52 L36,20" }] },
  r: { w: 38, s: [{ d: "M8,-52 L10,-2" }, { d: "M10,-34 C16,-50 28,-54 36,-48" }] },
  s: { w: 40, s: [{ d: "M34,-46 C26,-56 8,-52 10,-40 C12,-28 32,-28 32,-16 C32,-4 12,-4 6,-12" }] },
  t: { w: 36, s: [{ d: "M18,-72 L16,-14 C16,-4 24,-2 32,-8" }, { d: "M6,-52 L32,-54", t: 0.3 }] },
  u: { w: 46, s: [{ d: "M8,-52 C6,-30 6,-14 12,-8 C20,-2 32,-12 34,-28 L36,-52" }, { d: "M36,-30 L34,-2" }] },
  v: { w: 44, s: [{ d: "M8,-52 L22,-4 L38,-52" }] },
  w: { w: 60, s: [{ d: "M6,-52 L16,-4 L26,-40 L36,-4 L46,-52" }] },
  x: { w: 44, s: [{ d: "M8,-52 L36,-2" }, { d: "M36,-52 L8,-2" }] },
  y: { w: 46, s: [{ d: "M8,-52 C6,-28 8,-12 16,-8 C26,-4 34,-18 36,-34 L38,-52" }, { d: "M38,-36 L34,6 C32,20 18,24 10,18" }] },
  z: { w: 44, s: [{ d: "M8,-50 L36,-50 L8,-4 L38,-6" }] },

  A: { w: 58, s: [{ d: "M6,-2 L28,-78" }, { d: "M28,-78 L50,-2" }, { d: "M14,-26 L44,-28", t: 0.4 }] },
  B: { w: 56, s: [{ d: "M10,-78 L12,-2" }, { d: "M12,-78 C40,-78 44,-46 12,-42" }, { d: "M12,-42 C46,-42 46,-2 12,-2" }] },
  C: { w: 56, s: [{ d: "M50,-66 C40,-80 10,-74 8,-40 C6,-8 38,-2 50,-14" }] },
  D: { w: 58, s: [{ d: "M10,-78 L12,-2" }, { d: "M12,-78 C48,-76 50,-4 12,-2" }] },
  E: { w: 54, s: [{ d: "M48,-78 L10,-76 L12,-2 L48,-4" }, { d: "M12,-42 L38,-42", t: 0.4 }] },
  F: { w: 52, s: [{ d: "M48,-78 L10,-76 L12,-2" }, { d: "M12,-44 L38,-44", t: 0.4 }] },
  G: { w: 60, s: [{ d: "M50,-66 C40,-80 10,-74 8,-40 C6,-8 40,-2 50,-20 L50,-36" }, { d: "M34,-36 L52,-36", t: 0.3 }] },
  H: { w: 60, s: [{ d: "M10,-78 L12,-2" }, { d: "M48,-78 L50,-2" }, { d: "M12,-40 L48,-40", t: 0.4 }] },
  I: { w: 36, s: [{ d: "M20,-78 L18,-2" }] },
  J: { w: 48, s: [{ d: "M40,-78 L38,-18 C36,-2 14,0 8,-14" }] },
  K: { w: 56, s: [{ d: "M10,-78 L12,-2" }, { d: "M48,-78 L14,-40" }, { d: "M20,-46 L50,-2" }] },
  L: { w: 50, s: [{ d: "M12,-78 L14,-4 L48,-6" }] },
  M: { w: 66, s: [{ d: "M8,-2 L12,-78 L32,-26 L52,-78 L56,-2" }] },
  N: { w: 60, s: [{ d: "M10,-2 L12,-78 L48,-10 L50,-78" }] },
  O: { w: 62, s: [{ d: "M32,-78 C12,-78 8,-50 10,-36 C12,-12 34,-2 46,-16 C60,-32 54,-78 32,-78" }] },
  P: { w: 54, s: [{ d: "M10,-78 L12,-2" }, { d: "M12,-78 C48,-76 48,-36 12,-36" }] },
  Q: { w: 62, s: [{ d: "M32,-78 C12,-78 8,-50 10,-36 C12,-12 34,-2 46,-16 C60,-32 54,-78 32,-78" }, { d: "M38,-20 L56,2", t: 0.3 }] },
  R: { w: 56, s: [{ d: "M10,-78 L12,-2" }, { d: "M12,-78 C46,-76 46,-38 12,-38" }, { d: "M24,-38 L50,-2" }] },
  S: { w: 54, s: [{ d: "M48,-66 C38,-80 12,-76 12,-58 C12,-40 46,-40 46,-22 C46,-4 16,-2 8,-14" }] },
  T: { w: 56, s: [{ d: "M6,-76 L54,-78", t: 0.4 }, { d: "M30,-76 L28,-2" }] },
  U: { w: 60, s: [{ d: "M10,-78 C8,-30 10,-10 28,-6 C46,-2 50,-26 50,-78" }] },
  V: { w: 58, s: [{ d: "M8,-78 L30,-4 L52,-78" }] },
  W: { w: 72, s: [{ d: "M6,-78 L18,-4 L32,-56 L46,-4 L58,-78" }] },
  X: { w: 58, s: [{ d: "M10,-78 L50,-2" }, { d: "M50,-78 L10,-2" }] },
  Y: { w: 56, s: [{ d: "M10,-78 L30,-38 L50,-78" }, { d: "M30,-38 L28,-2" }] },
  Z: { w: 56, s: [{ d: "M10,-76 L50,-78 L10,-4 L52,-6" }] },
};

/* The pen leaving the paper. Between the strokes of one letter it is a flick; between letters
   it is a touch longer; between words it is the long one, which is the pause that makes the
   whole thing look like a person rather than a machine. */
const LIFT_IN = 0.1;
const LIFT_BETWEEN = 0.2;
const LIFT_WORD = 0.75;
const SPACE_W = 26;

export const ASCENDER = 84;
export const DESCENDER = 28;

export type Mark = { d: string; x: number; at: number; dur: number };

/* Roughly how far the pen travels along a stroke, so a long sweep takes longer than a short
   one — giving every stroke the same slice was the thing that still looked mechanical once
   the strokes themselves were right.

   The numbers in the path are walked in pairs and the distances between them summed, which
   counts a curve's control points as if they were corners. That overestimates curves, by about
   the same amount every time, and a ratio is all this is used for. Measuring the real length
   would mean a DOM, and these timings have to exist in the server HTML. */
function reach(d: string) {
  const n = d.match(/-?\d*\.?\d+/g);
  if (!n || n.length < 4) return 20;
  let total = 0;
  for (let i = 2; i + 1 < n.length; i += 2) {
    total += Math.hypot(+n[i] - +n[i - 2], +n[i + 1] - +n[i - 1]);
  }
  return Math.max(12, total);
}

/* Lays the name out and shares `ms` between the strokes in proportion to the time each one
   takes, so a longer name is written at the same hand speed in a longer time rather than the
   same time at a silly speed — up to the cap the caller sets.

   Unknown characters (a digit, a dash, anything not in the hand above) advance the pen and
   are not drawn. Dropping one is better than drawing the wrong shape, and the name this was
   built for has none. */
export function layout(name: string, ms: number) {
  const marks: Array<{ d: string; x: number; w: number; gap: number }> = [];
  let x = 0;
  let units = 0;

  const chars = [...name];
  chars.forEach((ch, i) => {
    if (ch === " ") { x += SPACE_W; return; }
    const g = G[ch];
    if (!g) { x += 44; return; }
    g.s.forEach((st, j) => {
      /* 70 units is about one ordinary letter stroke, so an ordinary stroke still weighs
         about 1 and the lift constants below keep their meaning. */
      const w = (reach(st.d) / 70) * (st.t ?? 1);
      const gap = j < g.s.length - 1 ? LIFT_IN : (chars[i + 1] === " " ? LIFT_WORD : LIFT_BETWEEN);
      marks.push({ d: st.d, x, w, gap });
      units += w + gap;
    });
    x += g.w;
  });

  /* The trailing lift after the last stroke is not time anybody waits for. */
  if (marks.length) units -= marks[marks.length - 1].gap;

  const per = units > 0 ? ms / units : 0;
  let at = 0;
  const out: Mark[] = marks.map((m) => {
    const dur = m.w * per;
    const mark = { d: m.d, x: m.x, at, dur };
    at += dur + m.gap * per;
    return mark;
  });

  return { marks: out, width: x, total: at };
}
