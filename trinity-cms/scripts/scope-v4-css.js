/* Scope the supplied stylesheet under `.v4`.
   The source is a standalone page: it styles `body`, `nav`, `h1,h2,h3`, `section.page`,
   `input,select`, `form` and `footer.f` bare. Dropped into the app as-is it would restyle
   every page on the site, so every selector is prefixed. Declarations are never touched. */
const fs = require("fs");
const SRC = "C:/Users/prasa/Downloads/globebound-world-flight_1.html";
const html = fs.readFileSync(SRC, "utf8");
const css = html.split(/\r?\n/).slice(5, 215).join("\n"); // the <style> body: lines 6..215, 216 is </style>

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
  if (m) { bump("html<state> kept"); return `html${m[1]} ${ROOT}${m[2] ? " " + m[2] : ""}`.trim(); }
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
  out + "\n";

fs.writeFileSync("src/styles/home-v4.css", out);
console.log("src/styles/home-v4.css:", out.length, "bytes,", out.split("\n").length, "lines");
Object.entries(stats).forEach(([k, v]) => console.log("  ·", k, v));
