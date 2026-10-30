"use client";
/* Site wiring for the supplied Trinity World drop-in.

   The drop-in takes `destHref` and `onLead` as functions, and a server component cannot hand
   a function to a client one — so this sits between them. It is also the single place where
   the drop-in's own vocabulary is mapped onto this site's: its country keys onto our
   destination slugs, and its lead payload onto the shape /api/leads actually accepts. */
import { useEffect, useRef } from "react";
import type { WorldSettings } from "@/lib/settings";
import type { ChromeData } from "./chrome";
import TrinityWorld from "./TrinityWorld";

/* The drop-in's default is `/destinations/<key>`, which is right for ten of the fourteen.
   Two of ours are spelled differently and the rest have no page yet. */
const SLUG: Record<string, string> = {
  nz: "new-zealand",   // ours is the full word
  uae: "dubai",        // the page is named after the city, deliberately
};
/* No destination page on this site — the link goes to the enquiry form instead of 404ing. */
const NO_PAGE = new Set(["europe", "korea", "japan", "malaysia"]);

/* Which element each editable string belongs to. Only headings and copy the engine never
   rewrites itself are listed — the per-country ones are filled from `countries`. Every one of
   these was checked against the live DOM before being written down. */
const TEXT_AT: Record<keyof WorldSettings["text"], string> = {
  heroTag: "#panel .tag", heroTitle: "#panel h1", heroSub: "#panel p.s",
  unisTitle: "#unis .h2", unisOutro: "#out-t",
  ieltsTitle: "#ielts .h2", ieltsLead: "#ielts .lead",
  processTitle: "#process .h2", pathTitle: "#path .h2", lifeTitle: "#life .h2", kitTitle: "#kit .h2",
  statsTitle: "#stats .h2", voicesTitle: "#voices .h2", ctaTitle: "#cta .h2", ctaLead: "#cta .lead",
};

export default function TrinityWorldHost({
  initialCountry,
  world,
  chrome,
}: {
  initialCountry?: string;
  world?: WorldSettings;
  /* Present on the home page, where the drop-in renders its own nav and footer and the
     site's are hidden. Absent on the /trinity-world preview, which keeps the site chrome. */
  chrome?: ChromeData;
}) {
  /* Written during render, not in an effect: the engine is imported by the child's effect,
     and importing it is what evaluates data.ts, which reads this. Parent render always
     precedes child effect, so the content is in place in time. */
  if (world?.countries?.length) {
    (globalThis as unknown as { __TW_CONTENT__?: Record<string, unknown> }).__TW_CONTENT__ =
      Object.fromEntries(world.countries.map((c) => [c.k, c]));
  }

  const box = useRef<HTMLDivElement>(null);

  /* The copy is applied to the DOM after the engine has injected its markup, rather than by
     templating that markup: markup.ts is a generated blob the drop-in owns, and rewriting it
     would have to be redone every time the drop-in is updated. The engine sets innerHTML in
     one go, so a MutationObserver on the wrapper fires exactly once and then stops.
     `innerHTML` because several of these carry a <br> the design depends on; the values are
     the site owner's own, from the dashboard, not visitor input. */
  useEffect(() => {
    const el = box.current;
    const text = world?.text;
    if (!el || !text) return;
    const apply = () => {
      const tw = el.querySelector(".tw");
      if (!tw || !tw.children.length) return false;
      for (const [key, sel] of Object.entries(TEXT_AT)) {
        const v = text[key as keyof typeof text];
        const node = tw.querySelector(sel);
        if (node && typeof v === "string" && v.trim()) node.innerHTML = v;
      }
      return true;
    };
    if (apply()) return;
    const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [world]);

  /* The site header is fixed and sits over the top of the screen. The drop-in was built to
     own the viewport, so its sky, canvas and sticky stage all start at 0 and the header cuts
     the globe in half. Its measured height is published as --tw-top and kept current — the
     header is shorter on a phone and changes again when it goes solid on scroll.

     It goes on the document element rather than on a wrapper because `tw.css` would shadow
     any value set on an ancestor: the stylesheet reads `var(--tw-top, 133px)` and the
     fallback covers the moment before this effect runs.

     With the drop-in's own nav there is no site header above it — the page owns the viewport
     again, exactly as the design was drawn — so the whole measurement is skipped and the
     clearance rules stand down on `.tw-chrome`. */
  useEffect(() => {
    if (chrome) return;
    const header = document.querySelector<HTMLElement>("header, .cv-nav, .nav");
    if (!header) return;
    const root = document.documentElement;
    const publish = () => {
      const h = Math.round(header.getBoundingClientRect().height);
      if (h > 0) root.style.setProperty("--tw-top", h + "px");
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(header);
    addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      removeEventListener("resize", publish);
      root.style.removeProperty("--tw-top");
    };
  }, [chrome]);

  return (
    <div ref={box} style={{ display: "contents" }}>
      {/* The four globe textures and the aircraft are what the first screen is made of, and
          nothing asks for them until the engine chunk has downloaded, parsed and run — three
          serialised steps before the first byte of a 450 KB payload is requested. React hoists
          these into <head> during the server render, so the browser starts fetching them while
          it is still downloading the chunk. Same URLs the engine composes from assetBase; the
          preload is a hint, so if a URL ever drifts the only cost is a wasted fetch.
          Every one carries crossOrigin: three's ImageLoader sets `crossOrigin = "anonymous"`
          on the Image it creates, and a preload in a different CORS mode is a different cache
          entry — without it each texture was fetched twice, once by the hint and once for real.
          The GLB is as:fetch rather than as:image, to match how GLTFLoader requests it. */}
      <link rel="preload" as="image" href="/tw/earth/2_no_clouds_4k.jpg" crossOrigin="anonymous" fetchPriority="high" />
      <link rel="preload" as="image" href="/tw/earth/elev_bump_4k.jpg" crossOrigin="anonymous" />
      <link rel="preload" as="image" href="/tw/earth/water_4k.png" crossOrigin="anonymous" />
      <link rel="preload" as="image" href="/tw/earth/earth_clouds_1024.png" crossOrigin="anonymous" />
      <link rel="preload" as="fetch" href="/tw/a350.glb" crossOrigin="anonymous" />
    <TrinityWorld
      initialCountry={initialCountry}
      chrome={chrome}
      destHref={(c) => (NO_PAGE.has(c.k) ? "/contact-us" : `/destinations/${SLUG[c.k] ?? c.k}`)}
      /* /api/leads takes {name,email,phone,subject,message,website,source}. The drop-in
         offers {name,phone,email,intake,country} — country becomes the subject so it lands
         in the admin inbox the same way the site's own enquiry card does. */
      onLead={async (p) => {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name ?? "",
            email: p.email ?? "",
            phone: p.phone ?? "",
            subject: p.country ?? "",
            message: `Preferred intake: ${p.intake || "—"}`,
            website: "",
            source: "trinity-world",
          }),
        });
        if (!res.ok) throw new Error(`lead POST failed: ${res.status}`);
      }}
    />
    </div>
  );
}
