"use client";
import { useEffect } from "react";

export type V2Variant = "css" | "sticky" | "full";

/* Home V2's motion layer.
   The markup in `sections.tsx` is identical for all three variants; everything that differs is
   here. Each variant writes the same two custom properties — `--hero-p` and `--stack-p`, both
   0 → 1 — so the stylesheet only ever has to read a progress value and never has to know which
   engine produced it.

     css     nothing. The sections rest in their finished state and the site-wide
             `data-reveal` observer fades them in. No progress is written, so the CSS
             falls back to its static defaults.
     sticky  a ~40-line rAF loop writes both progress values from `getBoundingClientRect`.
             No library, no pinning — `position: sticky` in the stylesheet does the holding.
     full    Lenis for the scroll itself, GSAP ScrollTrigger for the two pins and the scrub,
             and Framer Motion's imperative DOM API for the entrance springs.

   The counters run in every variant: they are content, not decoration. */
export default function V2Motion({ variant }: { variant: V2Variant }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    /* ---- counters, all variants ------------------------------------------------------- */
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    if (counters.length) {
      const land = (el: HTMLElement) => {
        el.textContent = Number(el.dataset.count ?? 0).toLocaleString("en-IN");
      };
      if (reduce) counters.forEach(land);
      else {
        const run = (el: HTMLElement) => {
          const to = Number(el.dataset.count ?? 0);
          const D = 1400;
          let t0 = 0, raf = 0;
          /* The last frame writes the target outright. An eased loop that is throttled — a
             background tab, a slow frame — otherwise stops a few short and leaves "99,996"
             on screen, which is exactly the bug this page's predecessor shipped. */
          const tick = (t: number) => {
            if (!t0) t0 = t;
            const k = Math.min(1, (t - t0) / D);
            if (k >= 1) return land(el);
            const e = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(to * e).toLocaleString("en-IN");
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          const safety = window.setTimeout(() => land(el), D + 400);
          cleanups.push(() => { cancelAnimationFrame(raf); clearTimeout(safety); });
        };
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => { if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); } });
        }, { threshold: 0 });
        counters.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
        /* If the observer never fires — a very short window, a hidden tab — land them anyway
           rather than leaving zeroes on the page. */
        const net = window.setTimeout(() => counters.forEach(land), 4000);
        cleanups.push(() => clearTimeout(net));
      }
    }

    if (variant === "css" || reduce) return () => cleanups.forEach((f) => f());

    const hero = document.querySelector<HTMLElement>('[data-v2="hero"]');
    const stack = document.querySelector<HTMLElement>('[data-v2="stack"]');

    /* ---- sticky: progress from geometry, nothing else ---------------------------------- */
    if (variant === "sticky") {
      let raf = 0;
      const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
      const read = () => {
        if (hero) {
          const r = hero.getBoundingClientRect();
          /* The open runs over the first viewport of the section and no further — the
             reference's finishes in 310px, and a long pin here would only make the enquiry
             card harder to reach. */
          hero.style.setProperty("--hero-p", clamp(-r.top / window.innerHeight).toFixed(4));
        }
        if (stack) {
          const r = stack.getBoundingClientRect();
          const run = r.height - window.innerHeight;
          stack.style.setProperty("--stack-p", clamp(run > 0 ? -r.top / run : 0).toFixed(4));
        }
      };
      /* Read on every frame while either section is on screen, rather than on the scroll
         event. A scroll listener misses programmatic jumps in some embedders — and more to
         the point it also misses the frames a smooth-scrolling page produces between
         events, which is exactly where a progress-driven animation shows its seams. The
         observer means nothing runs at all once both sections are past. */
      const watched = [hero, stack].filter(Boolean) as HTMLElement[];
      const onScreen = new Set<Element>();
      const loop = () => { read(); raf = onScreen.size ? requestAnimationFrame(loop) : 0; };
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
        if (onScreen.size && !raf) raf = requestAnimationFrame(loop);
      }, { threshold: 0 });
      watched.forEach((t) => io.observe(t));
      read();
      cleanups.push(() => { io.disconnect(); if (raf) cancelAnimationFrame(raf); });
      return () => cleanups.forEach((f) => f());
    }

    /* ---- full: Lenis + GSAP ScrollTrigger + Framer Motion ------------------------------ */
    let disposed = false;
    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }, { animate, inView, stagger }] = await Promise.all([
        import("lenis"), import("gsap"), import("gsap/ScrollTrigger"), import("motion"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      /* Lenis owns the scroll position, so ScrollTrigger has to be told to read from its
         ticker rather than from the native scroll event, or the pins judder. */
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      /* Lenis owns the scroll offset outright: `window.scrollTo` is swallowed while it is
         running, so anything that needs to move the page — an anchor link, a test harness,
         a "back to top" — has to go through the instance. Published here for that reason. */
      (window as unknown as { v2lenis?: unknown }).v2lenis = lenis;
      cleanups.push(() => { delete (window as unknown as { v2lenis?: unknown }).v2lenis; });
      lenis.on("scroll", ScrollTrigger.update);
      const ticker = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => { gsap.ticker.remove(ticker); lenis.destroy(); });

      /* Nothing pins on a phone. The stylesheet already lays both sections out as ordinary
         flow below 861px, and a pin here would hold a viewport the visitor cannot spare —
         the reference switches its own pin off below its breakpoint for the same reason.
         gsap.matchMedia also tears the triggers down and rebuilds them across a resize,
         which a bare `if (innerWidth > 860)` would not. */
      const mm = gsap.matchMedia();
      cleanups.push(() => mm.revert());

      mm.add("(min-width: 861px)", () => {
        /* The hero pins for one viewport and scrubs `--hero-p` across it. One viewport, not
           four: the reference's own open finishes in about 310px, and the enquiry card below
           it is the thing visitors are here for. */
        if (hero) {
          ScrollTrigger.create({
            trigger: hero, start: "top top", end: "+=100%", pin: ".v2hero__sticky", pinSpacing: true, scrub: true,
            onUpdate: (self) => hero.style.setProperty("--hero-p", self.progress.toFixed(4)),
          });
        }

        /* The deck pins for as many viewports as there are panels. */
        if (stack) {
          const panels = Number(getComputedStyle(stack).getPropertyValue("--panels")) || 3;
          ScrollTrigger.create({
            trigger: stack, start: "top top", end: `+=${panels * 100}%`, pin: ".v2stack__pin", pinSpacing: true, scrub: true,
            onUpdate: (self) => stack.style.setProperty("--stack-p", self.progress.toFixed(4)),
          });

          /* The three university rows drift at different rates — the parallax that sells the
             depth in the reference. Tied to scroll, not to time. */
          stack.querySelectorAll<HTMLElement>(".v2unis__row").forEach((row, n) => {
            gsap.to(row, {
              xPercent: n % 2 ? 12 : -12, ease: "none",
              scrollTrigger: { trigger: stack, start: "top top", end: `+=${panels * 100}%`, scrub: 0.6 },
            });
          });
        }
        /* matchMedia reverts every tween and trigger created in here when the query stops
           matching, so the phone layout gets its inline styles cleaned off for free. */
        return () => {
          hero?.style.removeProperty("--hero-p");
          stack?.style.removeProperty("--stack-p");
        };
      });

      /* Framer Motion handles the entrances. It animates scale and blur, which the shared
         `data-reveal` rule does not touch, so the two layers compose instead of fighting. */
      const spring = { type: "spring" as const, stiffness: 180, damping: 26 };
      document.querySelectorAll<HTMLElement>(".v2bento__grid, .v2voice__rail, .v2ev__list").forEach((group) => {
        const kids = group.children as unknown as HTMLElement[];
        const stop = inView(group, () => {
          animate(kids, { scale: [0.96, 1], filter: ["blur(6px)", "blur(0px)"] },
            { ...spring, delay: stagger(0.06) });
        }, { amount: 0.15 });
        cleanups.push(stop);
      });

      /* The hero's figures arrive one after another once the headline has landed. */
      const nodes = hero?.querySelectorAll<HTMLElement>(".v2hero__node");
      if (nodes?.length) animate(nodes as unknown as HTMLElement[], { opacity: [0, 1], x: [-14, 0] }, { ...spring, delay: stagger(0.08, { startDelay: 0.5 }) });

      ScrollTrigger.refresh();
    })();

    return () => { disposed = true; cleanups.forEach((f) => f()); };
  }, [variant]);

  return null;
}
