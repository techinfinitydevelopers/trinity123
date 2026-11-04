"use client";
/* The site's first-visit preloader.

   It shows once per visitor, on whichever page they land on, and never again — not on the next
   page, not on the next visit. That is the whole point: a loader is a one-time introduction, and
   a site that replays it on every navigation is just a site that feels slow.

   "Once" is remembered in localStorage. Clearing site data or a private window brings it back,
   which is the right trade: there is no way to know a returning visitor without storing
   something, and this is not worth a cookie banner.

   Three things it must never do, in order of how badly they would hurt:

   1. Flash for a returning visitor. The overlay is in the server HTML — it has to be, or a first
      visit would show the page first and the loader second — so the decision has to be made
      before the first paint. A tiny blocking script in the layout reads the flag and sets
      `data-preloaded` on <html>; the CSS hides the overlay on that attribute. No React involved,
      so no hydration gap to flash through.
   2. Trap anyone. If this component never mounts — a JS error, a chunk that fails to load — the
      overlay would cover the site forever. So the fade is driven by a CSS animation that runs
      regardless of React, and the markup is inert: no focus trap, no scroll lock that outlives
      it. The class this adds only ever makes it leave sooner.
   3. Hold back the home page's own intro. The globe assembles itself from particles and that is
      the real entrance; this just covers the gap before the engine chunk is running, then gets
      out of the way. */

import { useEffect } from "react";
import { layout, ASCENDER, DESCENDER } from "./handwriting";

/* The flag, and the two timings. MIN exists because a loader that appears for 120ms reads as a
   glitch rather than a loader — below about a third of a second the eye registers a flicker, not
   a transition. MAX is the fail-safe: if `load` never fires because one image is wedged, the
   overlay leaves anyway. */
const KEY = "tw:preloaded";
/* Raised with the writing: the hand takes about four seconds over twenty letters, and a
   fail-safe that fires before the name is finished is not a safety net, it is a glitch. */
const MAX_MS = 5800;

export default function Preloader({ logo, name }: { logo: string; name: string }) {
  /* The name is not set in a typeface here. `handwriting.ts` holds the route a pen takes
     through every letter, and each of those strokes is drawn by growing the line from nothing,
     so the graphite appears at the tip and nowhere else. Three cheaper versions of this are
     described at the top of that file, along with why each one gave itself away.

     Laid out during the render rather than in an effect: the overlay is in the server HTML and
     starts animating before anything hydrates, so the timings have to be in that HTML too. */
  /* About five letters a second — an unhurried hand, not a signature being dashed off. Faster
   than this and it stops reading as writing however right the strokes are, which is what the
   first version of this got wrong even after the strokes themselves were real. */
  const writeMs = Math.min(4200, Math.max(2000, name.length * 200));
  const { marks, width, total } = layout(name, writeMs);
  const PAD = 18;
  /* The underline is the flourish at the end of a signature, so it waits for the last letter.
     MIN then waits for the underline: the loader leaves when the writing is finished, because
     half a written word on screen looks like a fault rather than a flourish. This is the one
     cost — a first visit on a fast connection waits about two seconds longer, once per
     visitor and never again. */
  const ruleAt = total + 80;
  const MIN_MS = Math.min(ruleAt + 520, 5200);
  useEffect(() => {
    const root = document.documentElement;
    /* Already seen: the blocking script in the layout has hidden it, there is nothing to do and
       nothing to animate. */
    if (root.hasAttribute("data-preloaded")) return;

    const started = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      /* The flag is written as the loader leaves, not when it arrives: if the first visit is
         abandoned mid-load, the next one should still get the introduction. */
      try { localStorage.setItem(KEY, "1"); } catch { /* private mode — it simply shows again */ }
      root.setAttribute("data-preloading", "out");
      /* Removed from the DOM after the fade so it cannot sit on top of anything, keyboard or
         pointer. 600ms matches the CSS transition. */
      window.setTimeout(() => {
        root.removeAttribute("data-preloading");
        root.setAttribute("data-preloaded", "1");
      }, 600);
    };

    /* Wait for the window `load` event — every stylesheet, font and above-the-fold image — but
       never for less than MIN or more than MAX. */
    const onReady = () => {
      const waited = performance.now() - started;
      window.setTimeout(finish, Math.max(0, MIN_MS - waited));
    };

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });

    const cap = window.setTimeout(finish, MAX_MS);
    return () => {
      window.removeEventListener("load", onReady);
      window.clearTimeout(cap);
    };
  }, []);

  /* aria-hidden and inert: it is decoration over content that is already in the DOM, so a screen
     reader should read straight past it rather than announce a loading screen it cannot dismiss. */
  return (
    <div className="tw-pre" aria-hidden="true">
      <div className="tw-pre__paper">
        {/* eslint-disable-next-line @next/next/no-img-element -- the overlay is in the server
            HTML before anything hydrates, and next/image would resolve its src too late. */}
        <img className="tw-pre__logo" src={logo} alt="" width={160} height={54} />
        <svg
          className="tw-pre__sign"
          viewBox={`${-PAD} ${-ASCENDER - PAD} ${width + PAD * 2} ${ASCENDER + DESCENDER + PAD * 2}`}
        >
          {/* A slight slant, because nobody writes dead upright, applied to the whole hand so
              the pencil leans with it. */}
          <g transform="skewX(-7)">
            {marks.map((m, i) => (
              <g key={i} transform={`translate(${m.x} 0)`}>
                {/* `pathLength` is 1 so the dash that draws the stroke is a fraction rather
                    than a measurement — nothing here has to know how long the curve is. */}
                <path
                  className="tw-pre__stroke"
                  d={m.d}
                  pathLength={1}
                  style={{ animationDelay: `${Math.round(m.at)}ms`, animationDuration: `${Math.round(m.dur)}ms` }}
                />
                {/* One pencil per stroke, each riding its own stroke and visible only while
                    that stroke is being drawn. A single pencil cannot do this: CSS gives an
                    element one motion path, and the whole point is that the pen lifts and
                    starts somewhere else — which is what a mask could never show. */}
                <g
                  className="tw-pre__pencil"
                  style={{
                    offsetPath: `path("${m.d}")`,
                    animationDelay: `${Math.round(m.at)}ms`,
                    animationDuration: `${Math.round(m.dur)}ms`,
                  }}
                >
                  <path className="tw-pre__body" d="M11 -8 44 -41a5.5 5.5 0 0 1 7.8 0l.6.6a5.5 5.5 0 0 1 0 7.8L19.4 0z" />
                  <path className="tw-pre__tip" d="M11 -8 19.4 0 4 4z" />
                </g>
              </g>
            ))}
          </g>
        </svg>
        <svg className="tw-pre__rule" viewBox="0 0 300 12" preserveAspectRatio="none">
          <path d="M4 7C60 2 120 10 170 5S260 2 296 6" style={{ animationDelay: `${ruleAt}ms` }} />
        </svg>
      </div>
      <div className="tw-pre__bar"><i /></div>
    </div>
  );
}
