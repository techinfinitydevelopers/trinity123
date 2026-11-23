"use client";
/* The site's first-visit preloader.

   It shows once per visitor, on whichever page they land on, and never again — not on the next
   page, not on the next visit. That is the whole point: a loader is a one-time introduction, and
   a site that replays it on every navigation is just a site that feels slow.

   "Once" is remembered in localStorage. Clearing site data or a private window brings it back,
   which is the right trade: there is no way to know a returning visitor without storing
   something, and this is not worth a cookie banner.

   What it shows: the mark, the name set in the site's own heading face, the tagline and a thin
   gold rule — the brand as it appears everywhere else on the site. It replaced a sheet of paper
   with the name written across it by a pencil: handsome, but it read as craft rather than as a
   consultancy, and it held the first screen for five seconds to do it (client request).

   Two things it must never do:

   1. Flash for a returning visitor. The overlay is in the server HTML — it has to be, or a first
      visit would show the page first and the loader second — so the decision has to be made
      before the first paint. A tiny blocking script in the layout reads the flag and sets
      `data-preloaded` on <html>; the CSS hides the overlay on that attribute. No React involved,
      so no hydration gap to flash through.
   2. Trap anyone. If this component never mounts — a JS error, a chunk that fails to load — the
      overlay would cover the site forever. So the fade is driven by a CSS animation that runs
      regardless of React, and the markup is inert: no focus trap, no scroll lock that outlives
      it. The class this adds only ever makes it leave sooner. */

import { useEffect } from "react";

/* The flag, and the two timings. MIN exists because a loader that appears for 120ms reads as a
   glitch rather than a loader — below about a third of a second the eye registers a flicker, not
   a transition. MAX is the fail-safe: if `load` never fires because one image is wedged, the
   overlay leaves anyway. */
const KEY = "tw:preloaded";
/* Both are counted from the moment the browser started on the page, not from the moment React got
   here: the overlay is in the server HTML, so it has been on screen since the first paint. Counting
   from hydration made a slow page hold it for as long as hydration took and then start the 1.5s —
   fifteen seconds on a cold dev load. `performance.now()` is already time since navigation. */
const MIN_MS = 3200;
const MAX_MS = 4500;

export default function Preloader({ logo, name, tagline }: { logo: string; name: string; tagline?: string }) {
  useEffect(() => {
    const root = document.documentElement;
    /* Already seen: the blocking script in the layout has hidden it, there is nothing to do and
       nothing to animate. */
    if (root.hasAttribute("data-preloaded")) return;

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
      }, 450);
    };

    /* Wait for the window `load` event — every stylesheet, font and above-the-fold image — but
       never for less than MIN or more than MAX. */
    const onReady = () => window.setTimeout(finish, Math.max(0, MIN_MS - performance.now()));

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });

    const cap = window.setTimeout(finish, Math.max(0, MAX_MS - performance.now()));
    return () => {
      window.removeEventListener("load", onReady);
      window.clearTimeout(cap);
    };
  }, []);

  /* aria-hidden and inert: it is decoration over content that is already in the DOM, so a screen
     reader should read straight past it rather than announce a loading screen it cannot dismiss. */
  return (
    <div className="tw-pre" aria-hidden="true">
      <div className="tw-pre__mark">
        {/* eslint-disable-next-line @next/next/no-img-element -- the overlay is in the server
            HTML before anything hydrates, and next/image would resolve its src too late. */}
        <img className="tw-pre__logo" src={logo} alt="" width={160} height={54} />
      </div>
      <p className="tw-pre__name">{name}</p>
      <span className="tw-pre__rule" aria-hidden="true" />
      {tagline ? <p className="tw-pre__tag">{tagline}</p> : null}
      <div className="tw-pre__bar"><i /></div>
    </div>
  );
}
