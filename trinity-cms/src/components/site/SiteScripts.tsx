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
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    /* counters */
    const stats = document.getElementById("stats");
    let sio: IntersectionObserver | undefined;
    if (stats) {
      let counted = false;
      sio = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting || counted) return;
        counted = true;
        const els = stats.querySelectorAll<HTMLElement>(".counter");
        const t0 = performance.now(), D = 2000;
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 4);
          els.forEach((el) => { el.textContent = Math.round(parseInt(el.dataset.count ?? "0", 10) * e).toLocaleString("en-IN"); });
          if (k < 1) requestAnimationFrame(tick);
        };
        tick(t0);
      }, { threshold: 0.3 });
      sio.observe(stats);
    }

    const onTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    toTop?.addEventListener("click", onTop);

    /* scroll-driven */
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
      header?.classList.toggle("is-scrolled", y > 40);
      toTop?.classList.toggle("is-visible", y > 40);
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
          if (img) img.style.transform = `translateX(${dn * 40}px) scale(1.04)`;
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
      toTop?.removeEventListener("click", onTop);
      window.removeEventListener("scroll", onScrollRaf);
      window.removeEventListener("resize", onScroll);
    };
  }, [path]);

  return null;
}
