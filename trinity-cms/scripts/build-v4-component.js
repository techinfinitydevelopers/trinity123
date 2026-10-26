/* Build the Home V4 client component from the supplied page's markup.

   The markup is kept byte-for-byte and rendered once through dangerouslySetInnerHTML rather
   than translated to JSX. That is deliberate: flight.js owns this DOM — it writes innerHTML
   into the university track, toggles classes, and lets GSAP write transforms on almost every
   node. React re-rendering any of it would fight the script. The string is a literal in our
   own source, not user input, so there is nothing to sanitise.

   Two things are changed: their <nav> and <footer> are dropped (the site's own header and
   footer wrap the page), and the form's inline onsubmit is replaced with a hook the component
   owns, because an inline handler cannot run from innerHTML anyway. */
const fs = require("fs");

/* Derived from the one source file, like the other two generators, so a new drop can be
   re-ported by re-running them. Pass a path as argv[2] if it lives somewhere else. */
const SRC = process.argv[2] || "C:/Users/prasa/Downloads/globebound-world-flight_1.html";
if (!fs.existsSync(SRC)) throw new Error("source not found: " + SRC + "\nPass the path as the first argument.");
const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/);

/* Lines 219..341: `<div id="loading">` down to the end of the `#cta` section. Lines 220..224
   are the source page's own <nav>, which the site header replaces; its <footer> (342..344)
   is dropped the same way. */
if (!/<div id="loading">/.test(lines[218])) throw new Error("line 219 is not the loading overlay");
if (!/^<nav id="nav">/.test(lines[219])) throw new Error("line 220 is not the source <nav>");
if (!/^<\/nav>/.test(lines[223])) throw new Error("line 224 is not </nav>");
let m = lines.slice(218, 341).filter((_, i) => i < 1 || i > 5).join("\n");

const onsubmit = / onsubmit="[^"]*"/;
if (!onsubmit.test(m)) throw new Error("onsubmit anchor missing");
m = m.replace(onsubmit, "");

/* `#change` — the "Change country" button — lived in the page's own <nav>, which this port
   drops in favour of the site header. The script binds to it unguarded, so without it the
   module throws on evaluation and never reaches its ScrollTriggers. Guarding the bind would
   stop the crash but silently cost the feature: the hero locks scrolling until a country is
   picked, and this is the only way back. It moves into the hero panel instead, inside the
   block that already appears on pick. Its existing CSS (hidden until `html.picked`) applies
   unchanged. */
const pickedBox = '<div id="pickedBox"><div id="pickedName"></div><div id="go"></div></div>';
if (!m.includes(pickedBox)) throw new Error("pickedBox anchor missing");
m = m.replace(
  pickedBox,
  '<div id="pickedBox"><div id="pickedName"></div><div id="go"></div>' +
    '<button id="change" type="button">Change country</button></div>',
);

// escape for a JS template literal
const esc = m.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const component = `"use client";
/* Home V4 — the supplied "world flight" page, running inside the site.

   The markup below is the source page's, unchanged, minus its own <nav> and <footer>: the
   site's header and footer come from the (site) layout instead. It is injected once and then
   left alone, because flight.js owns this DOM — it writes innerHTML into the university
   track, toggles classes on it and lets GSAP write transforms across almost every node.
   Re-rendering any of it from React would fight the script. The string is a literal in this
   file, not user input.

   flight.js is loaded after mount, from an effect, because it queries the DOM at import time.
   It is imported once per page load even in development, where React runs effects twice. */
import { useEffect, useRef } from "react";

const MARKUP = \`${esc}\`;

export default function FlightPage() {
  const host = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    /* The module runs its whole sequence at import time and expects the markup to be in the
       document already, which it is by the time an effect fires.
       The rejection is logged unconditionally: gating it on a "cancelled" flag set by the
       cleanup hides every failure, because React runs effects twice in development and the
       first pass is always torn down. */
    import("./flight.js").catch((e) => console.error("[home-v4] flight.js failed", e));
    /* The module publishes a teardown. Without it Lenis survives the route change — and it
       is created *stopped*, so it goes on calling preventDefault() on every wheel and touch
       event, leaving the rest of the site unscrollable until a full reload. */
    return () => {
      const w = window as unknown as { __v4teardown?: () => void };
      try { w.__v4teardown?.(); } catch (e) { console.error("[home-v4] teardown", e); }
      started.current = false;
    };
  }, []);

  /* The site header is fixed and sits over the top of the screen. The source page had the
     viewport to itself, so everything full-screen — the sky, the WebGL canvas, the pinned
     stage — started at 0 and the header cut the globe in half. Its real height is published
     as --v4-top and kept current, because the header is shorter on a phone and taller once
     it goes solid. The stylesheet carries 133px as the pre-hydration fallback. */
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header, .cv-nav, .nav");
    const el = host.current;
    if (!header || !el) return;
    const publish = () => {
      const h = Math.round(header.getBoundingClientRect().height);
      if (h > 0) el.style.setProperty("--v4-top", \`\${h}px\`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(header);
    addEventListener("resize", publish);
    return () => { ro.disconnect(); removeEventListener("resize", publish); };
  }, []);

  /* The source page's form only rewrote its own button text on submit. Left as it was it
     would tell a real visitor "we'll call you" while sending nothing, so it is held here
     until it is pointed at the site's own /api/leads. */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const b = e.currentTarget.querySelector("button");
    if (b) b.textContent = "Not connected yet — please use Contact";
  };

  return (
    <div
      className="v4"
      ref={host}
      onSubmit={onSubmit}
      dangerouslySetInnerHTML={{ __html: MARKUP }}
    />
  );
}
`;

fs.writeFileSync("src/app/(site)/home-v4/FlightPage.tsx", component);
console.log("FlightPage.tsx:", component.length, "bytes,", component.split("\n").length, "lines");
console.log("markup kept:", m.length, "bytes; onsubmit removed:", !/onsubmit/.test(m), "; nav present:", /<nav/.test(m));
