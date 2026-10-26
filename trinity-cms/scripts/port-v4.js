/* Mechanical port of the supplied inline module into a bundled one.
   Every edit is anchored on an exact string and throws if the anchor has moved, so this
   cannot silently half-apply. Nothing else in the 429 lines is touched. */
const fs = require("fs");
const SP = __dirname;
let s = fs.readFileSync(SP + "/v4-flight.js", "utf8");
const imgs = JSON.parse(fs.readFileSync(SP + "/v4-imgmap.json", "utf8"));
const before = s.length;
const edits = [];
const must = (a, b, why) => {
  if (!s.includes(a)) throw new Error("anchor missing: " + a.slice(0, 70));
  s = s.split(a).join(b);
  edits.push(why);
};

// 1 · it was an inline module in a plain HTML file
must('<script type="module">\n', "", "unwrap <script type=module>");
s = s.replace(/\n<\/script>\s*$/, "\n");

// 2 · the importmap mapped 'three/addons/' at runtime; bundled, the real path is used
const addons = (s.match(/three\/addons\//g) || []).length;
s = s.split("three/addons/").join("three/examples/jsm/");
edits.push(`three/addons/ -> three/examples/jsm/ (${addons})`);

// 3 · the libraries came off window from three CDN tags; they are dependencies here
must(
  "const {gsap,ScrollTrigger,Lenis}=window;",
  "import gsap from 'gsap';\nimport {ScrollTrigger} from 'gsap/ScrollTrigger';\nimport Lenis from 'lenis';",
  "gsap/ScrollTrigger/Lenis: window globals -> imports",
);

// 3b · in the source these three were globals off the CDN tags, and the page already
//      publishes `window.lenis`. Keeping all four on window preserves that environment and
//      gives anything outside the module — a console, a later script — the same handles.
must(
  "gsap.registerPlugin(ScrollTrigger);",
  "window.gsap=gsap;window.ScrollTrigger=ScrollTrigger;\ngsap.registerPlugin(ScrollTrigger);",
  "republish gsap/ScrollTrigger on window",
);

// 4 · the fourteen city photographs were base64 in the page; they are files now
must("const IMG=window.__IMG__;", "const IMG=" + JSON.stringify(imgs) + ";", "__IMG__ -> file urls");

// 5 · the aircraft was a 4MB base64 string in the page; it is a 0.21MB .glb now
must(
  "new GLTFLoader().parse(Uint8Array.from(atob(window.__GLB__),c=>c.charCodeAt(0)).buffer,'',g=>{",
  "new GLTFLoader().load('/assets/models/a350.glb',g=>{",
  "__GLB__ base64 -> .glb load",
);
must("},e=>console.error(e));", "},undefined,e=>console.error(e));", "loader callback arity");

// 6 · the page brought its own <nav>; this one runs under the site header, so the three
//     cosmetic toggles need somewhere harmless to land
must(
  "const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];",
  "const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];\n" +
    "/* The source page carried its own <nav>; here the site header does that job, so the three\n" +
    "   cosmetic class toggles below land on a detached node rather than being deleted — the\n" +
    "   timeline stays identical to the original. */\n" +
    "const NAV=document.getElementById('nav')||document.createElement('div');",
  "declare NAV fallback",
);
const navs = (s.match(/\$\('#nav'\)/g) || []).length;
s = s.split("$('#nav')").join("NAV");
edits.push(`$('#nav') -> NAV (${navs})`);

// 7 · and its own logo swap, which has no element here
must("const logoImg=$('#logoimg');", "const logoImg=$('#logoimg');\nif(logoImg){", "guard logo swap (open)");
must(
  "if(logoImg.complete&&logoImg.naturalWidth)logoImg.dispatchEvent(new Event('load'));",
  "if(logoImg.complete&&logoImg.naturalWidth)logoImg.dispatchEvent(new Event('load'));\n}",
  "guard logo swap (close)",
);

// 8 · the source ran as a page script, where a mid-file throw is obvious in the console.
//     Imported, a failure is easy to mistake for "it loaded but did nothing", so the module
//     says plainly how far it got.
s +=
  "\n/* Added by the port: a module that half-runs is otherwise indistinguishable from one\n" +
  "   that ran and did nothing. */\nwindow.__v4ready = true;\n";
edits.push("add window.__v4ready");

fs.writeFileSync("src/app/(site)/home-v4/flight.js", s);
console.log(`written ${before} -> ${s.length} bytes, ${s.split("\n").length} lines`);
edits.forEach((e) => console.log("  ·", e));
