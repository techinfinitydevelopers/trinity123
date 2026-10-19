"use client";
/* Port of the original main.js: scroll reveal, counters, parallax, stacked cards,
   pinned horizontal scroller, header shrink, back-to-top. Re-runs on every route change. */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SiteScripts() {
  const path = usePathname();

  /* Theme editor live preview: receive CSS tokens from the admin iframe parent. */
  useEffect(() => {
    if (window.parent === window) return;
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== "trinity:theme") return;
      const st = document.getElementById("theme-tokens");
      if (st) st.textContent = e.data.css;
      const fonts: string[] = e.data.fonts ?? [];
      if (fonts.length) {
        const id = "theme-fonts-live";
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) { link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; document.head.appendChild(link); }
        link.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`).join("&")}&display=swap`;
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    // The CSS media query cannot stop these — they are the heaviest motion on the site.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.getElementById("siteHeader");
    const toTop = document.getElementById("toTop");
    const heroGlows = document.querySelector<HTMLElement>("[data-hero-parallax]");
    const pin = document.querySelector<HTMLElement>("[data-pin]");
    const pinTrack = document.querySelector<HTMLElement>("[data-pin-track]");
    const pinBar = document.querySelector<HTMLElement>("[data-pin-bar]");
    const pinGhost = document.querySelector<HTMLElement>("[data-pin-ghost]");
    const pinCount = document.querySelector<HTMLElement>("[data-pin-count]");
    const stackCards = Array.from(document.querySelectorAll<HTMLElement>("[data-stack]"));
    const plx = Array.from(document.querySelectorAll<HTMLElement>("[data-plx]"));

    /* reveal */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    if (reduce) document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
    else document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    /* The hero's plane moves with SMIL, which no media query can reach. Someone who has asked
       for less motion gets it parked at the start of its line instead. */
    if (reduce) {
      document.querySelectorAll<SVGSVGElement>(".hero__path svg").forEach((svg) => svg.pauseAnimations?.());
    }

    // Safety net: if the observer ever fails to fire for something already on screen
    // (a stalled layout, a missed frame), content must not stay invisible forever.
    const revealTimer = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => el.classList.add("in"));
    }, 4000);

    /* counters */
    const stats = document.getElementById("stats");
    let sio: IntersectionObserver | undefined;
    let countRaf = 0, countTimer = 0, countSafety = 0;
    if (stats) {
      const els = stats.querySelectorAll<HTMLElement>(".counter");
      const target = (el: HTMLElement) => parseInt(el.dataset.count ?? "0", 10);
      const land = () => els.forEach((el) => { el.textContent = target(el).toLocaleString("en-IN"); });

      let counted = false;
      const run = () => {
        if (counted) return;
        counted = true;
        /* Nobody wants to watch a number crawl when they have asked for less motion. */
        if (reduce) return land();
        const t0 = performance.now(), D = 2000;
        /* A background tab throttles requestAnimationFrame, so the loop can simply stop partway
           and leave the number short — this is where the 99,996 came from. The figures matter
           more than the animation, so they are written once the run should have finished
           whether or not the frames arrived. */
        countTimer = window.setTimeout(land, D + 400);
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / D);
          /* The last frame writes the target itself rather than an eased approximation of it. */
          if (k >= 1) return land();
          const e = 1 - Math.pow(1 - k, 4);
          els.forEach((el) => { el.textContent = Math.round(target(el) * e).toLocaleString("en-IN"); });
          countRaf = requestAnimationFrame(tick);
        };
        countRaf = requestAnimationFrame(tick);
      };

      /* A threshold of 0.3 asked for 30% of the section to be on screen at once. The section is
         828px tall on a laptop and taller once it stacks on a phone, so on a short window the
         ratio never got there and all four numbers sat at zero for the whole visit. Any part of
         it showing is enough. */
      sio = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) run(); }, { threshold: 0 });
      sio.observe(stats);
      /* The timer inside `run()` only rescues a stalled animation — it cannot help if the
         observer never fires at all, which is what a hidden or backgrounded tab does. The
         reveal code has the same safety net a few lines above; the figures get one too, so
         they are never left sitting at zero. */
      countSafety = window.setTimeout(run, 4000);
    }

    const onTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    toTop?.addEventListener("click", onTop);

    /* scroll-driven */
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
      header?.classList.toggle("is-scrolled", y > 40);
      toTop?.classList.toggle("is-visible", y > 40);
      // Everything past this point is decorative transform work.
      if (reduce) {
      /* Returning here used to skip the pinned scroller entirely, leaving six of the ten cards
         off-screen behind 320vh of dead scroll. Turn it into an ordinary scrollable row instead
         of freezing it — the motion goes, the content stays. */
      const pinSticky = pin?.querySelector<HTMLElement>(".pin__sticky");
      if (pin && pinSticky && pinTrack) {
        pin.style.height = "auto";
        pinSticky.style.position = "static";
        pinSticky.style.height = "auto";
        pinSticky.style.overflowX = "auto";
        pinTrack.style.transform = "none";
        pinTrack.style.width = "max-content";
        for (const card of Array.from(pinTrack.children) as HTMLElement[]) {
          card.style.transform = "none";
          card.style.opacity = "1";
          card.style.filter = "none";
        }
        const hint = document.querySelector<HTMLElement>(".pin__hint");
        const prog = document.querySelector<HTMLElement>(".pin__prog");
        if (hint) hint.style.display = "none";
        if (prog) prog.style.display = "none";
      }
      ticking = false;
      return;
    }
      if (heroGlows) heroGlows.style.transform = `translateY(${y * 0.3}px)`;

      plx.forEach((el) => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.plx ?? "0");
        el.style.transform = `translateY(${off}px)`;
      });

      stackCards.forEach((c, i) => {
        const next = stackCards[i + 1];
        if (!next) { c.style.transform = "none"; c.style.filter = "none"; return; }
        const nr = next.getBoundingClientRect(), cr = c.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, 1 - (nr.top - cr.top) / cr.height));
        c.style.transform = `scale(${1 - p * 0.06}) translateY(${-p * 18}px)`;
        c.style.filter = `brightness(${1 - p * 0.35})`;
      });

      if (pin && pinTrack) {
        const r = pin.getBoundingClientRect(), dist = pin.offsetHeight - vh;
        const p = Math.min(1, Math.max(0, -r.top / dist));
        const max = pinTrack.scrollWidth - vw;
        pinTrack.style.transform = `translateX(${-p * max}px)`;
        if (pinBar) pinBar.style.width = `${p * 100}%`;
        if (pinGhost) pinGhost.style.transform = `translate(${-p * 40}vw, -50%)`;
        const cards = Array.from(pinTrack.children) as HTMLElement[];
        let best = 0, bestD = Infinity;
        cards.forEach((card, i) => {
          const cr = card.getBoundingClientRect(), dn = (cr.left + cr.width / 2 - vw / 2) / vw;
          const ad = Math.min(1, Math.abs(dn) * 2.2);
          card.style.transform = `perspective(1200px) translateY(${ad * 26}px) scale(${1 - ad * 0.1}) rotateY(${-dn * 14}deg)`;
          card.style.opacity = String(1 - ad * 0.45);
          const img = card.querySelector<HTMLElement>(".ucard__img");
          /* scale(1.14) gives the photo 7% of overhang each side; the travel has to stay inside
             that or it slides off the card. dn runs past ±1 for cards far off-centre. */
          const px = Math.max(-1, Math.min(1, dn)) * card.clientWidth * 0.05;
          if (img) img.style.transform = `translateX(${px}px) scale(1.14)`;
          if (Math.abs(dn) < bestD) { bestD = Math.abs(dn); best = i; }
        });
        if (pinCount?.firstChild) pinCount.firstChild.nodeValue = `${String(best + 1).padStart(2, "0")} `;
      }
      ticking = false;
    };
    const onScrollRaf = () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } };
    window.addEventListener("scroll", onScrollRaf, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      io.disconnect(); sio?.disconnect();
      window.clearTimeout(revealTimer);
      cancelAnimationFrame(countRaf); window.clearTimeout(countTimer); window.clearTimeout(countSafety);
      toTop?.removeEventListener("click", onTop);
      window.removeEventListener("scroll", onScrollRaf);
      window.removeEventListener("resize", onScroll);
    };
  }, [path]);

  return null;
}
