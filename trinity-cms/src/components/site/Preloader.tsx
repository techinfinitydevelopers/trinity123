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

/* The flag, and the two timings. MIN exists because a loader that appears for 120ms reads as a
   glitch rather than a loader — below about a third of a second the eye registers a flicker, not
   a transition. MAX is the fail-safe: if `load` never fires because one image is wedged, the
   overlay leaves anyway. */
const KEY = "tw:preloaded";
const MAX_MS = 3500;

/* ---- the hand ------------------------------------------------------------------------------
   The name used to be uncovered by one left-to-right wipe. A wipe moves at a constant speed
   across a whole word, and nothing a hand does is constant — which is why it read as a reveal
   rather than as writing.

   So each letter is drawn on its own, at its own moment, and the pen takes a different amount
   of time over each. A capital is a long stroke with a lift in it. A space is the pen leaving
   the paper and coming down again, which is the longest pause of all — it is also the pause
   that makes the whole thing look human, because that is where a real hand actually stops.
   The last-digit jitter is deliberate unevenness: three different letter speeds rather than
   one, so no two neighbours take exactly as long.

   Computed from the name rather than written down, so it stays right when the dashboard
   changes the words, and computed during the render rather than in an effect: the overlay is
   in the server HTML and starts animating before anything hydrates, so the timings have to be
   in that HTML too. */
const LETTER_MS = 58;
const CAPITAL_MS = 104;
const SPACE_MS = 125;
const START_MS = 140;

function hand(name: string) {
  const marks: Array<{ ch: string; at: number }> = [];
  let t = START_MS;
  for (const ch of name) {
    marks.push({ ch, at: t });
    if (ch === " ") t += SPACE_MS;
    else t += (ch === ch.toUpperCase() ? CAPITAL_MS : LETTER_MS) + (ch.charCodeAt(0) % 3) * 9;
  }
  return { marks, total: t };
}

export default function Preloader({ logo, name }: { logo: string; name: string }) {
  const { marks, total } = hand(name);
  /* The underline is the flourish at the end of a signature, so it waits for the last letter.
     MIN then waits for the underline: the loader leaves when the writing is finished, because
     half a written word on screen looks like a fault rather than a flourish. This is the one
     cost — a first visit on a fast connection waits about two seconds longer, once per
     visitor and never again. */
  const ruleAt = total + 90;
  const MIN_MS = Math.min(ruleAt + 620, 2800);
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
        <span className="tw-pre__line">
          <span className="tw-pre__ink">
            {marks.map((m, i) => (
              /* A space has nothing to draw, so it is marked and left alone — the pause it
                 buys is in the next letter's delay, not in an animation of its own. */
              <span
                key={i}
                className={m.ch === " " ? "tw-pre__gap" : "tw-pre__ch"}
                style={m.ch === " " ? undefined : { animationDelay: `${m.at}ms` }}
              >
                {m.ch === " " ? " " : m.ch}
              </span>
            ))}
          </span>
          {/* A pencil, not a dot or a caret: the point sits on the last letter written and
              the body trails up to the right, which is what says "pencil" before it moves.
              It crosses the line in the same time the hand takes, and `steps` is deliberate:
              a pen does not glide, it arrives at the next letter and stops there. */}
          <svg
            className="tw-pre__pencil"
            viewBox="0 0 24 24"
            style={{ animationDuration: `${total}ms`, animationTimingFunction: `steps(${marks.length}, end)` }}
          >
            <path className="tw-pre__body" d="M7.5 16.5 18.6 5.4a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L10.5 19.5z" />
            <path className="tw-pre__tip" d="M7.5 16.5 10.5 19.5 6 21z" />
          </svg>
        </span>
        <svg className="tw-pre__rule" viewBox="0 0 300 12" preserveAspectRatio="none">
          <path d="M4 7C60 2 120 10 170 5S260 2 296 6" style={{ animationDelay: `${ruleAt}ms` }} />
        </svg>
      </div>
      <div className="tw-pre__bar"><i /></div>
    </div>
  );
}
