"use client";
/* Site wiring for the supplied Trinity World drop-in.

   The drop-in takes `destHref` and `onLead` as functions, and a server component cannot hand
   a function to a client one — so this sits between them. It is also the single place where
   the drop-in's own vocabulary is mapped onto this site's: its country keys onto our
   destination slugs, and its lead payload onto the shape /api/leads actually accepts. */
import { useEffect, useRef } from "react";
import type { WorldSettings } from "@/lib/settings";
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

/* The globe's four textures, in the order the first screen needs them: the colour map is what
   the eye reads first, so it alone is marked high priority. Paired with the shipped file so a
   dashboard that has overridden none of them still preloads the right thing. */
const EARTH_PRELOAD = [
  ["map", "/tw/earth/2_no_clouds_4k.jpg", true],
  ["bump", "/tw/earth/elev_bump_4k.jpg", false],
  ["spec", "/tw/earth/water_4k.png", false],
  ["clouds", "/tw/earth/earth_clouds_1024.png", false],
] as const;

export default function TrinityWorldHost({ initialCountry, world }: { initialCountry?: string; world?: WorldSettings }) {
  /* Written during render, not in an effect: the engine is imported by the child's effect,
     and importing it is what evaluates data.ts, which reads this. Parent render always
     precedes child effect, so the content is in place in time. */
  if (world?.countries?.length) {
    (globalThis as unknown as { __TW_CONTENT__?: Record<string, unknown> }).__TW_CONTENT__ =
      Object.fromEntries(world.countries.map((c) => [c.k, c]));
  }

  const box = useRef<HTMLDivElement>(null);

  /* Where the visitor had got to, remembered for the length of the tab.

     The home page is a client route like any other: clicking About unmounts the engine, and
     clicking Home builds a new one. Measured on a return trip, the document never reloads —
     but the canvas is gone and rebuilt, and the particle intro plays again from zero: 3.5s
     before the canvas even reappears and still assembling at 6s. That is what "the home page
     reloads every time" is.

     sessionStorage, not localStorage: the entrance is worth seeing once per visit, not once
     per lifetime. A new tab or a new day gets it again. Read with refs rather than state so
     the first render already has them — the engine mounts from the child's effect, and a
     state update would arrive after it had started without them. */
  const resume = useRef<{ seen: boolean; country: string } | null>(null);
  if (resume.current === null) {
    let seen = false, country = "";
    try {
      seen = sessionStorage.getItem("tw:seen") === "1";
      country = sessionStorage.getItem("tw:country") || "";
    } catch { /* private mode — the intro simply plays again */ }
    resume.current = { seen, country };
  }

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

  /* "Change country" sits at the end of the header's link pill rather than floating under the
     bar. The engine builds the button inside the drop-in and has already bound its click handler
     by the time this runs, so the node is simply re-parented into a list item; the item goes
     away on unmount so no other page inherits it. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let item: HTMLLIElement | null = null;
    const place = () => {
      const b = el.querySelector<HTMLElement>("#change");
      const slot = document.querySelector(".nav__links");
      if (!b || !slot) return false;
      item = document.createElement("li");
      item.className = "nav__change";
      item.appendChild(b);
      slot.appendChild(item);
      return true;
    };
    let mo: MutationObserver | undefined;
    if (!place()) {
      mo = new MutationObserver(() => { if (place()) mo?.disconnect(); });
      mo.observe(el, { childList: true, subtree: true });
    }
    return () => { mo?.disconnect(); item?.remove(); };
  }, []);

  /* The site header is fixed and sits over the top of the screen. The drop-in was built to
     own the viewport, so its sky, canvas and sticky stage all start at 0 and the header cuts
     the globe in half. Its measured height is published as --tw-top and kept current — the
     header is shorter on a phone and changes again when it goes solid on scroll.

     It goes on the document element rather than on a wrapper because `tw.css` would shadow
     any value set on an ancestor: the stylesheet reads `var(--tw-top, 133px)` and the
     fallback covers the moment before this effect runs.
 */
  useEffect(() => {
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
  }, []);

  return (
    <div ref={box} style={{ display: "contents" }}>
      {/* The four globe textures and the aircraft are what the first screen is made of, and
          nothing asks for them until the engine chunk has downloaded, parsed and run — three
          serialised steps before the first byte of a 450 KB payload is requested. React hoists
          these into <head> during the server render, so the browser starts fetching them while
          it is still downloading the chunk.
          The urls are built from the same overrides the engine resolves, so replacing a texture
          in the dashboard moves the hint with it instead of warming a file nobody asks for.
          Every one carries crossOrigin: three's ImageLoader sets `crossOrigin = "anonymous"`
          on the Image it creates, and a preload in a different CORS mode is a different cache
          entry — without it each texture was fetched twice, once by the hint and once for real.
          The GLB is as:fetch rather than as:image, to match how GLTFLoader requests it. */}
      {EARTH_PRELOAD.map(([key, fallback, priority]) => (
        <link
          key={key}
          rel="preload"
          as="image"
          href={world?.images?.earth?.[key] || fallback}
          crossOrigin="anonymous"
          {...(priority ? { fetchPriority: "high" as const } : {})}
        />
      ))}
      <link rel="preload" as="fetch" href={world?.images?.plane || "/tw/a350.glb"} crossOrigin="anonymous" />
    <TrinityWorld
      /* An explicit country from the route wins; otherwise pick up whichever one the visitor
         had chosen before they wandered off. */
      initialCountry={initialCountry || resume.current.country || undefined}
      /* Only on a return. The first visit in a tab still gets the full entrance. */
      skipIntro={resume.current.seen}
      onReady={() => { try { sessionStorage.setItem("tw:seen", "1"); } catch {} }}
      onPick={(k) => { try { sessionStorage.setItem("tw:country", k); } catch {} }}
      images={world?.images}
      /* The site header floats over this page. It flips itself to white glass after 40px of
         scroll, which is right everywhere else and wrong here: the first screens are night sky,
         so a white pill with dark ink lands on a black globe and the navigation disappears into
         it. The engine knows when the backdrop actually turns pale — most of the way through the
         flight, not at 40px — so it marks the header and tw-chrome.css holds the dark pill until
         then. */
      onDark={(pale) => document.querySelector(".site-header")?.classList.toggle("is-pale", pale)}
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
