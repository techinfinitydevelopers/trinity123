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

/* ---- content the demo invented, which must not go out under Trinity's name --------------
   The source was a sample page for a fictional brand. Its numbers and its testimonials were
   written to look plausible, and the port carried them over wholesale. Both are replaced
   with the figures and quotes the site already publishes, from src/lib/seed-content.ts. */

/* The four statistics were invented — and two of them contradicted the rest of the site by a
   factor of thirty ("40 University partners" against "1200+ Universities" everywhere else).
   "96% visa success rate" is a quantified outcome claim with nothing behind it, in a sector
   where that specific claim is policed. These are the `stats` block from seed-content.ts. */
const fakeStats =
  '<div class="eyebrow" style="color:var(--gold)">Track record (sample figures)</div>\n' +
  '    <h2 class="h2">Numbers that landed.</h2>\n' +
  '    <div class="sg">\n' +
  '      <div><b data-n="3200" data-s="+">0</b><span>Students placed abroad</span></div>\n' +
  '      <div><b data-n="40" data-s="+">0</b><span>University partners</span></div>\n' +
  '      <div><b data-n="96" data-s="%">0</b><span>Visa success rate</span></div>\n' +
  '      <div><b data-n="7" data-s=".5">0</b><span>Average IELTS band</span></div>\n' +
  "    </div>";
if (!m.includes(fakeStats)) throw new Error("stats anchor missing");
m = m.replace(
  fakeStats,
  '<div class="eyebrow" style="color:var(--gold)">Track record</div>\n' +
    '    <h2 class="h2">Numbers that landed.</h2>\n' +
    '    <div class="sg">\n' +
    '      <div><b data-n="42" data-s="+">0</b><span>Years of experience</span></div>\n' +
    '      <div><b data-n="39" data-s="+">0</b><span>Countries</span></div>\n' +
    '      <div><b data-n="1200" data-s="+">0</b><span>Universities</span></div>\n' +
    '      <div><b data-n="100000" data-s="+">0</b><span>Courses</span></div>\n' +
    "    </div>",
);

/* Five invented students with invented quotes, each shown twice. Worse, `flight.js` rewrites
   every `.cdest` to whichever country the visitor just clicked, so the same fictional person
   was relabelled as having studied in Japan or the UAE on demand. Replaced with the only two
   genuine quotes the client has supplied; the `.cdest` spans go with them, because a real
   student's destination is a fact, not a variable. */
const voicesStart = m.indexOf('<div class="mq" id="mq">');
const voicesEnd = m.indexOf("</section>", voicesStart);
if (voicesStart < 0 || voicesEnd < 0) throw new Error("testimonial rail anchors missing");
const real = [
  { i: "R", n: "Rohan Nair", d: "Master's in IT · Arizona State University",
    q: "They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals." },
  { i: "S", n: "Sharanya Santosh", d: "Master's · Maynooth University, Ireland",
    q: "Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview." },
];
/* The rail is a continuous marquee, so the two are repeated to fill it rather than padded
   out with invented ones. */
const card = (t) =>
  `<div class="tc"><p>&ldquo;${t.q}&rdquo;</p><footer><i>${t.i}</i><div>${t.n}<small>${t.d}</small></div></footer></div>`;
m =
  m.slice(0, voicesStart) +
  '<div class="mq" id="mq">' +
  [...real, ...real, ...real, ...real].map(card).join("") +
  "\n  </div>\n" +
  m.slice(voicesEnd);

/* "(samples)" told the visitor the page's own content was fake. */
m = m.replace("Student stories (samples)", "Student stories");

/* The source's <footer> carried the CC BY / CC BY-SA credits for the fourteen city
   photographs and the CC BY 4.0 credit for the aircraft model. The port dropped that footer
   for the site's own, but the assets are still served, so the attribution has to travel with
   them. Thirteen of the fourteen photographs require it; malaysia.jpg is CC0.
   Two of them — uae.jpg and korea.jpg — came with neither a named author nor a licence
   version in the source credits, so their requirement cannot be met from what is in hand.
   They are named here as outstanding rather than quietly dropped. */
const creditsAnchor = "</section>";
const lastSection = m.lastIndexOf(creditsAnchor);
if (lastSection < 0) throw new Error("no section to append credits after");
m =
  m.slice(0, lastSection + creditsAnchor.length) +
  `
<section class="page" id="v4credits"><div class="wrap">
  <p class="credit">Aircraft: &ldquo;A350&rdquo; by amvlab/aircraft-models, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Earth textures: three.js examples (MIT).</p>
  <p class="credits">City photographs via Wikimedia Commons — London, Ilya Grigorik (CC BY-SA 3.0) &middot; Dublin, &#30143;&#20029;&#27743;&#30340;&#27827;&#27700; (CC BY-SA 4.0) &middot; Paris, Yann Caradec (CC BY-SA 2.0) &middot; Berlin, Museumsinsel Berlin Juli 2021 (CC BY-SA 4.0) &middot; Prague, Moyan Brenn (CC BY 2.0) &middot; New York City, Dllu (CC BY-SA 4.0) &middot; Toronto, Dillan Payne (CC BY-SA 4.0) &middot; Tokyo, Morio (CC BY-SA 3.0) &middot; Marina Bay Sands, Supanut Ar (CC BY 4.0) &middot; Kuala Lumpur, Renek78 (CC0) &middot; Sydney, Benh LIEU SONG (CC BY-SA 4.0) &middot; Auckland, elpinto007 (CC BY-SA 2.0). Dubai and Seoul: source and licence still to be confirmed.</p>
</div></section>` +
  m.slice(lastSection + creditsAnchor.length);

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
