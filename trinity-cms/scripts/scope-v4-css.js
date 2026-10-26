/* Scope the supplied stylesheet under `.v4`.
   The source is a standalone page: it styles `body`, `nav`, `h1,h2,h3`, `section.page`,
   `input,select`, `form` and `footer.f` bare. Dropped into the app as-is it would restyle
   every page on the site, so every selector is prefixed. Declarations are never touched. */
const fs = require("fs");
const SRC = "C:/Users/prasa/Downloads/globebound-world-flight_1.html";
const html = fs.readFileSync(SRC, "utf8");
/* Lines 7..215 (0-based 6..215). Line 6 is the literal `<style>` tag and line 216 is
   `</style>`; including either feeds a non-selector into the walker, which then swallows it
   into the prelude of the next rule. That is what killed the `:root` token block on the first
   pass — it became `.v4 <style> :root{…}`, a selector that can never match, leaving every one
   of the page's eight colour tokens undefined. */
const lines = html.split(/\r?\n/);
if (!/^\s*<style>\s*$/.test(lines[5])) throw new Error("line 6 is not <style>: " + lines[5].slice(0, 40));
if (!/^\s*<\/style>\s*$/.test(lines[215])) throw new Error("line 216 is not </style>: " + lines[215].slice(0, 40));
const css = lines.slice(6, 215).join("\n");

const ROOT = ".v4";
const stats = {};
const bump = (k) => (stats[k] = (stats[k] || 0) + 1);

/* One selector of a comma-separated list. */
function scopeOne(sel) {
  const s = sel.trim();
  if (!s) return s;
  if (s.startsWith("@") || s.startsWith("%") || /^\d/.test(s)) return s; // keyframe stops
  if (s === ":root") { bump(":root -> .v4"); return ROOT; }
  if (s === "html" || s === "body") { bump("html|body -> .v4"); return ROOT; }
  /* The script puts `picked` on <html>, and Lenis puts `lenis-stopped` there, so those stay
     anchored to the document element with the page scope inserted after them. */
  const m = s.match(/^html((?:[.:][A-Za-z0-9_()-]+)+)\s*(.*)$/);
  if (m) {
    /* `html.lenis-stopped{overflow:hidden}` has no descendant: it locks the *document*.
       Appending the page scope would move the lock onto an auto-height div, where it clips
       nothing and the scroll lock silently stops working. Only insert the scope when the
       rule actually targets something inside the page. */
    if (!m[2]) { bump("html<state> left on the document"); return `html${m[1]}`; }
    bump("html<state> scoped");
    return `html${m[1]} ${ROOT} ${m[2]}`;
  }
  if (s.startsWith(ROOT)) return s;
  bump("prefixed");
  return `${ROOT} ${s}`;
}

const scopeList = (list) => list.split(",").map(scopeOne).join(",");

/* Walk the sheet keeping at-rule nesting, and leave @keyframes bodies alone. */
function walk(src, inKeyframes) {
  let out = "", buf = "", i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "{") {
      /* A `/* ... *​/` sitting above a rule belongs to the text between the last `}` and this
         `{`, so it would otherwise be scoped as part of the selector — which silently breaks
         every rule that has a comment above it. Split them apart and re-emit the comments. */
      let lead = "";
      let head = buf.replace(/\/\*[\s\S]*?\*\//g, (c) => { lead += c; return ""; }).trim();
      out += lead;
      buf = "";
      // find the matching close
      let depth = 1, j = i + 1;
      while (j < src.length && depth) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
      const body = src.slice(i + 1, j - 1);
      if (head.startsWith("@keyframes") || head.startsWith("@-webkit-keyframes")) {
        out += head + "{" + body + "}";
      } else if (head.startsWith("@")) {
        out += head + "{" + walk(body, false) + "}";          // @media, @supports
      } else {
        out += (inKeyframes ? head : scopeList(head)) + "{" + body + "}";
      }
      i = j;
      continue;
    }
    buf += ch;
    i++;
  }
  return out + buf;
}

let out = walk(css, false);

/* site.css sets `html{scroll-behavior:smooth}`, which fights Lenis on this page only. */
out =
  "/* Generated from the supplied globebound-world-flight page by scope-v4-css.js.\n" +
  "   Every selector is prefixed with `.v4` so the standalone page's bare `body`, `nav`,\n" +
  "   `h1,h2,h3`, `section.page`, `input,select`, `form` and `footer.f` rules cannot reach\n" +
  "   the rest of the site. Declarations are untouched. Edit the source, not this file. */\n" +
  "html:has(.v4){scroll-behavior:auto}\n" +
  out +
  `
/* ---- port overrides -------------------------------------------------------------------
   The source page owned the whole viewport. Here the site's fixed header sits over the top
   of it, and was cutting the globe and the hero panel in half. Everything that fills the
   screen starts below the header instead. --v4-top is the header's real measured height,
   published by FlightPage after mount; the value here is only the pre-hydration fallback. */
.v4{--v4-top:133px}
.v4 #sky,.v4 #c{top:var(--v4-top);bottom:auto;height:calc(100dvh - var(--v4-top))}
.v4 .stage{top:var(--v4-top);height:calc(100dvh - var(--v4-top))}

/* site.css has \`h1,h2,h3,h4{color:var(--navy)}\` at (0,0,1). The source page never set a
   colour on its headings — they inherited white from .cap, #unis, .arrive and #stats — but an
   inherited value loses to any matching declaration, so every heading here came out Trinity
   navy on navy. Re-inheriting restores the source's intent. */
.v4 h1,.v4 h2,.v4 h3{color:inherit}

/* The source wrote \`body{overflow-x:hidden}\`; scoped onto a div that becomes a *scroll
   container*, because overflow-x:hidden forces overflow-y up to auto — and position:sticky
   then sticks to .v4, which never scrolls, so the pinned stage stops pinning. \`clip\` leaves
   overflow-y visible and no scroll container. Must stay after the generated rule. */
.v4{overflow-x:clip}

/* The port prefixes V4's own selectors, which stops V4 reaching the site — but not the site
   reaching V4. These are the collisions on shared class names, each one a rule site.css sets
   that the source page never had to think about.

   .chip is the bad one: site.css gives it position:absolute and a float animation for the
   hero's decorative pills. flight.js builds the fourteen country buttons with the same class
   name, inside a flex row, so all fourteen resolved to the same static position — one stack
   of overlapping buttons with only the top one clickable, and #chips collapsed to zero
   height so the picked-country block rode up over the search field. */
.v4 #chips .chip{position:static;animation:none;box-shadow:none;line-height:normal}
/* site.css .band is a full-width navy slab for the marquee; here .band is the IELTS score. */
.v4 .band{position:static;background:none;width:auto;overflow:visible;z-index:auto}
/* site.css .btn sets the heading face; the source page's buttons are Inter. */
.v4 .btn{font-family:Inter,system-ui,sans-serif}
/* site.css .ucard carries a light border and white text for a different card. */
.v4 .ucard.intro{border:0}

/* The loading overlay sat at z-index 100 — above the site header (50), the WhatsApp button
   and the chat widget — and was only ever dismissed from the GLB's *success* callback, so a
   failed model left an opaque navy screen over the whole site with no way out. It now sits
   below the header, and the script clears it on failure and on a watchdog as well. */
.v4 #loading{z-index:40}
.v4 #loading.done{pointer-events:none}
/* Deliberately NOT touched here: .hs is pinned by GSAP, which measures its height to work
   out the pin distance, and .ie is sticky at 100vh. Changing either from this side would
   move the scroll maths without the script knowing. Fix those where the pin is created. */
`;

fs.writeFileSync("src/styles/home-v4.css", out);
console.log("src/styles/home-v4.css:", out.length, "bytes,", out.split("\n").length, "lines");
Object.entries(stats).forEach(([k, v]) => console.log("  ·", k, v));
