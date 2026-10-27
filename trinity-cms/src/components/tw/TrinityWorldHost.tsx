"use client";
/* Site wiring for the supplied Trinity World drop-in.

   The drop-in takes `destHref` and `onLead` as functions, and a server component cannot hand
   a function to a client one — so this sits between them. It is also the single place where
   the drop-in's own vocabulary is mapped onto this site's: its country keys onto our
   destination slugs, and its lead payload onto the shape /api/leads actually accepts. */
import { useEffect } from "react";
import TrinityWorld from "./TrinityWorld";

/* The drop-in's default is `/destinations/<key>`, which is right for ten of the fourteen.
   Two of ours are spelled differently and the rest have no page yet. */
const SLUG: Record<string, string> = {
  nz: "new-zealand",   // ours is the full word
  uae: "dubai",        // the page is named after the city, deliberately
};
/* No destination page on this site — the link goes to the enquiry form instead of 404ing. */
const NO_PAGE = new Set(["europe", "korea", "japan", "malaysia"]);

export default function TrinityWorldHost({ initialCountry }: { initialCountry?: string }) {
  /* The site header is fixed and sits over the top of the screen. The drop-in was built to
     own the viewport, so its sky, canvas and sticky stage all start at 0 and the header cuts
     the globe in half. Its measured height is published as --tw-top and kept current — the
     header is shorter on a phone and changes again when it goes solid on scroll.

     It goes on the document element rather than on a wrapper because `tw.css` would shadow
     any value set on an ancestor: the stylesheet reads `var(--tw-top, 133px)` and the
     fallback covers the moment before this effect runs. */
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
    <TrinityWorld
      initialCountry={initialCountry}
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
  );
}
