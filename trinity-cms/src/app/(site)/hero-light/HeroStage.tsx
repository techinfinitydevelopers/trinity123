"use client";
/* The hero's scroll sequence.
   The page scrolls through a tall wrapper while a sticky stage stays put, and one scroll
   progress (0 → 1) drives five beats:

     1. .00 – .18  the headline leaves word by word, each line a beat behind the one above
     2. .06 – .46  the photograph opens from a centred card to full bleed
     3. .20 – .40  the dune ridge rises behind it, and keeps drifting at a fifth of the scroll
     4. .26 – .88  the university cards come up one after another, tilting flat as they land
     5. .62 – 1    the photograph settles back and darkens so the cards carry the frame

   Two rules this is built on, both of which the first pass broke:

   **Nothing here writes a layout property.** The photograph used to grow by writing `width`
   and `height` every frame, which forces a layout on every frame, and it read `offsetTop`
   straight after writing — a synchronous reflow on top. It now opens with `clip-path`, which
   is paint-only: the picture is always full-bleed and the frame is cut out of it.

   **Nothing here listens for `scroll`.** A scroll listener misses the frames a smooth-scrolling
   page produces between events, and never fires at all for a programmatic jump. A rAF loop
   gated by an IntersectionObserver runs only while the hero is on screen and sees every frame.

   JavaScript writes custom properties and nothing else; the composition lives in the
   stylesheet, where it can be read. */
import { useEffect, useRef } from "react";
import Link from "next/link";

export type Uni = { img: string; name: string; flag: string; city: string; rating: string; href: string };

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
/* Progress of one beat within the whole sequence, eased. */
const beat = (p: number, from: number, to: number) => ease(clamp((p - from) / (to - from)));

/* Below this the stage does not pin at all. A phone cannot spare three viewports for an
   animation, and the reference's own pin stops at its breakpoint for the same reason. */
const PIN_FROM = 810;

export default function HeroStage({ items }: { items: Uni[] }) {
  const wrap = useRef<HTMLElement>(null);

  useEffect(() => {
    const w = wrap.current;
    if (!w) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${PIN_FROM}px)`);

    let raf = 0, io: IntersectionObserver | null = null, on = false;
    const cards = Array.from(w.querySelectorAll<HTMLElement>(".hs__u"));
    const n = Math.max(cards.length, 1);

    const apply = (p: number) => {
      /* One write per value, all of them custom properties, all consumed by transforms and
         clip-paths in the stylesheet. */
      w.style.setProperty("--copy", (1 - beat(p, 0, 0.18)).toFixed(4));
      w.style.setProperty("--open", beat(p, 0.06, 0.46).toFixed(4));
      w.style.setProperty("--ridge", beat(p, 0.2, 0.4).toFixed(4));
      w.style.setProperty("--dim", beat(p, 0.62, 1).toFixed(4));
      w.style.setProperty("--hint", (1 - clamp(p / 0.05)).toFixed(4));
      /* The raw travel, for the ridge's continuing drift. Kept in pixels so the parallax
         reads the same whatever the wrapper's height works out to. */
      w.style.setProperty("--y", `${Math.round(p * (w.offsetHeight - window.innerHeight) * 0.2)}px`);
      cards.forEach((el, i) => {
        /* The cards closer to the middle land first, so the row settles outward rather than
           sweeping left to right. */
        const mid = (n - 1) / 2;
        const rank = Math.abs(i - mid) / (mid || 1);
        const from = 0.26 + rank * 0.3;
        el.style.setProperty("--s", beat(p, from, from + 0.26).toFixed(4));
      });
    };

    const read = () => {
      const r = w.getBoundingClientRect();
      apply(clamp(-r.top / Math.max(r.height - window.innerHeight, 1)));
      raf = on ? requestAnimationFrame(read) : 0;
    };

    const arm = () => {
      disarm();
      /* Reduced motion, or a phone: leave the element alone entirely. The stylesheet's
         un-armed defaults already are the finished composition, and writing the end of the
         sequence here instead would hide the headline — `--copy` ends at 0. */
      if (reduce.matches || !wide.matches) return;
      w.classList.add("is-armed");
      io = new IntersectionObserver((es) => {
        on = es[0].isIntersecting;
        if (on && !raf) raf = requestAnimationFrame(read);
      }, { threshold: 0 });
      io.observe(w);
      apply(0);
      read();
    };

    const disarm = () => {
      io?.disconnect(); io = null;
      on = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      w.classList.remove("is-armed");
      w.removeAttribute("style");
      cards.forEach((el) => el.style.removeProperty("--s"));
    };

    arm();
    reduce.addEventListener("change", arm);
    wide.addEventListener("change", arm);
    return () => {
      reduce.removeEventListener("change", arm);
      wide.removeEventListener("change", arm);
      disarm();
    };
  }, []);

  return (
    <section className="hs" ref={wrap} id="hero">
      <div className="hs__stage">
        {/* Each line leaves a beat after the one above it, so the headline lifts rather than
            fading as a block. */}
        <div className="hs__copy">
          <p className="hs__over" style={{ ["--l" as string]: 0 }}>Your plan, start to finish</p>
          <h1 style={{ ["--l" as string]: 1 }}>Less guesswork. More studying abroad.</h1>
          <p className="hs__sub" style={{ ["--l" as string]: 2 }}>A counsellor beside you from shortlist to visa — for every country, course and intake.</p>
          <Link className="hs__btn" href="/contact-us" style={{ ["--l" as string]: 3 }}>
            <span className="hs__fill" />
            <span className="hs__lbl"><span className="l1">Book a free session</span><span className="l2">Book a free session</span></span>
          </Link>
        </div>

        {/* The picture is always full bleed; `clip-path` cuts the card out of it and opens it. */}
        <div className="hs__photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- a single hero photograph */}
          <img src="/assets/img/hero-light/desk.jpg" alt="A student planning their study abroad application at a desk" width={1440} height={810} />
        </div>

        {/* The ridge from the reference, standing between the photograph and the cards.
            The dune PNG is used as a mask rather than as a picture, so the silhouette takes
            the brand navy instead of staying the reference's black. */}
        <div className="hs__ridge" aria-hidden="true" />

        <div className="hs__cards">
          <div className="hs__track">
            {items.map((u, i) => (
              <Link key={i} href={u.href || "/contact-us"} className="hs__u" style={{ ["--i" as string]: i }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- card art, sizes vary */}
                <img className="hs__u-img" src={u.img} alt={u.name} loading="lazy" />
                <span className="hs__u-city"><img src={`/assets/img/flags/${u.flag}.png`} alt="" />{u.city}</span>
                <span className="hs__u-body">
                  <small>★ {u.rating}</small>
                  <strong>{u.name}</strong>
                  <span className="hs__u-go">Enrol now <i className="fas fa-arrow-right" /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="hs__hint"><span /> Scroll</div>
      </div>
    </section>
  );
}
