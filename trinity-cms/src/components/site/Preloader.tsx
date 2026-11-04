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
/* MIN was 700ms, which is the floor for a loader to register as a loader at all. It is now
   long enough for the name to finish being written, because that writing is the loader —
   leaving half a word on the screen would look like a fault, not a flourish. This is the
   one cost of the change: a first visit on a fast connection waits about two seconds longer.
   It is paid once per visitor, never again, which is what makes it affordable. */
const MIN_MS = 2300;
const MAX_MS = 3500;

export default function Preloader({ logo, name }: { logo: string; name: string }) {
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
          <span className="tw-pre__ink">{name}</span>
          {/* A pencil, not a dot or a caret: the point sits on the last letter written and
              the body trails up to the right, which is what says "pencil" before it moves. */}
          <svg className="tw-pre__pencil" viewBox="0 0 24 24">
            <path className="tw-pre__body" d="M7.5 16.5 18.6 5.4a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L10.5 19.5z" />
            <path className="tw-pre__tip" d="M7.5 16.5 10.5 19.5 6 21z" />
          </svg>
        </span>
        <svg className="tw-pre__rule" viewBox="0 0 300 12" preserveAspectRatio="none">
          <path d="M4 7C60 2 120 10 170 5S260 2 296 6" />
        </svg>
      </div>
      <div className="tw-pre__bar"><i /></div>
    </div>
  );
}
