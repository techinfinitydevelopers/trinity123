/* Mechanical port of the supplied inline module into a bundled one.
   Every edit is anchored on an exact string and throws if the anchor has moved, so this
   cannot silently half-apply. Nothing else in the 429 lines is touched. */
const fs = require("fs");

/* Everything is derived from the one source file, so a new drop of it can be re-ported by
   running this script again. Pass a path as argv[2] if it lives somewhere else. */
const SRC = process.argv[2] || "C:/Users/prasa/Downloads/globebound-world-flight_1.html";
if (!fs.existsSync(SRC)) throw new Error("source not found: " + SRC + "\nPass the path as the first argument.");
const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/);

/* The module is lines 350..778; line 350 is the opening `<script type="module">`. */
if (!/^<script type="module">/.test(lines[349])) throw new Error("line 350 is not the module tag");
let s = lines.slice(349, 778).join("\n") + "\n";

/* The fourteen city photographs were base64 on line 349, beside the aircraft. Only their
   keys are needed here — `scripts/extract-v4-assets.js` writes the files themselves. */
const blob = lines[348];
const at = blob.indexOf("window.__IMG__=");
if (at < 0) throw new Error("window.__IMG__ not found on line 349");
let depth = 0, end = at;
for (let i = at + "window.__IMG__=".length; i < blob.length; i++) {
  if (blob[i] === "{") depth++;
  else if (blob[i] === "}" && !--depth) { end = i + 1; break; }
}
const imgs = {};
for (const k of Object.keys(JSON.parse(blob.slice(at + "window.__IMG__=".length, end)))) {
  imgs[k] = `/assets/img/home-v4/${k}.jpg`;
}
if (Object.keys(imgs).length !== 14) throw new Error("expected 14 city photographs, found " + Object.keys(imgs).length);
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

// 7b · the source page owned the whole viewport, so the scene sized itself to the window.
//      Here a 133px fixed site header sits over the top of it and cut the globe in half.
//      The stylesheet moves the sky, the canvas and the stage below that header, and the
//      scene now measures the canvas instead of the window so the projection, the aspect
//      ratio and the pin positions all agree with the box actually being drawn into.
must(
  "const asp=()=>innerWidth/innerHeight;const mobile=()=>innerWidth<760||asp()<1.25;",
  "/* The drawing box is the canvas, not the window: the site header takes the top of the\n" +
    "   screen, so window height would stretch the globe and misplace every pin. */\n" +
    "const VW=()=>canvas.clientWidth||innerWidth,VH=()=>canvas.clientHeight||innerHeight;\n" +
    "const asp=()=>VW()/VH();const mobile=()=>innerWidth<760||asp()<1.25;",
  "measure the canvas, not the window",
);
must(
  "function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}\naddEventListener('resize',resize);resize();",
  "function resize(){renderer.setSize(VW(),VH(),false);camera.aspect=VW()/VH();camera.updateProjectionMatrix()}\n" +
    "addEventListener('resize',resize);\n" +
    "/* The canvas can change height without the window doing so — the header is shorter on a\n" +
    "   phone, and its height is published as --v4-top after mount. */\n" +
    "new ResizeObserver(resize).observe(canvas);\nresize();",
  "resize from the canvas box",
);
must(
  "o.b.style.transform=`translate(${(W1.x*.5+.5)*innerWidth}px,${(-W1.y*.5+.5)*innerHeight}px)`;",
  "o.b.style.transform=`translate(${(W1.x*.5+.5)*VW()}px,${(-W1.y*.5+.5)*VH()}px)`;",
  "project pins into the canvas box",
);

// 7c · the source hard-coded the Railway production host into every destination link and
//      opened them in a new tab, so on localhost, on a preview build and on the real domain
//      they sent the visitor off this deployment. Relative, same tab. Dubai and Singapore
//      were left empty in the source but the site has had those pages for weeks.
const abs = /https:\/\/trinity123-production\.up\.railway\.app(\/destinations\/[a-z-]+)/g;
const absCount = (s.match(abs) || []).length;
if (absCount !== 8) throw new Error("expected 8 absolute destination URLs, found " + absCount);
s = s.replace(abs, "$1");
edits.push(`absolute Railway URLs -> relative (${absCount})`);
must("{k:'uae',n:'UAE',s:'UAE',lat:25.2,lon:55.27,city:'Dubai',url:''", "{k:'uae',n:'UAE',s:'UAE',lat:25.2,lon:55.27,city:'Dubai',url:'/destinations/dubai'", "link Dubai");
must("{k:'singapore',n:'Singapore',s:'Singapore',lat:1.29,lon:103.85,city:'Singapore',url:''", "{k:'singapore',n:'Singapore',s:'Singapore',lat:1.29,lon:103.85,city:'Singapore',url:'/destinations/singapore'", "link Singapore");
must(
  "ex.href=c.url||'#unis';ex.target=c.url?'_blank':'';ex.rel='noopener';",
  "ex.href=c.url||'#unis';ex.removeAttribute('target');ex.removeAttribute('rel');",
  "destination links stay in the tab",
);

// 7d · the anchor interceptor is bound once, before `#explore` has its real href. After the
//      rewrite that href is a path, and `querySelector('/destinations/uk')` throws on every
//      click. Only in-page anchors belong in this handler.
must(
  "$$('a[href^=\"#\"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));",
  "$$('a[href^=\"#\"]').forEach(a=>a.addEventListener('click',e=>{const h=a.getAttribute('href');if(!h||h.charAt(0)!=='#'||h.length<2)return;const t=document.getElementById(h.slice(1));",
  "anchor handler: only real in-page ids",
);

// 7e · the overlay was dismissed only from the model's success callback, so a failed or slow
//      GLB left an opaque full-screen panel with no way out. It now also clears on error and
//      on a watchdog.
must(
  "},undefined,e=>console.error(e));",
  "},undefined,e=>{console.error('[home-v4] aircraft model failed',e);done()});\n" +
    "/* Whatever happens to the model, the page must become usable. */\n" +
    "setTimeout(done,8000);",
  "clear the overlay on failure and on a watchdog",
);
must(
  "$('#loading').classList.add('done');ScrollTrigger.refresh();",
  "done();ScrollTrigger.refresh();",
  "route the overlay through one function",
);
must(
  "const IMG=",
  "const done=()=>$('#loading')?.classList.add('done');\nconst IMG=",
  "declare done()",
);

// 7f(i) · two things the teardown has to reach were anonymous in the source: the ticker
//         callback that drives Lenis, and the animation-frame id. `mm` is already named.
must(
  "gsap.ticker.add(t=>lenis.raf(t*1000));",
  "const tick=t=>lenis.raf(t*1000);gsap.ticker.add(tick);",
  "name the Lenis ticker callback",
);
must("  requestAnimationFrame(frame);", "  rafId=requestAnimationFrame(frame);", "keep the frame id");
must("const done=()=>", "let rafId=0;\nconst done=()=>", "declare rafId");

// 7f · the source was a whole page, so nothing ever had to be torn down. Here the visitor
//      can navigate away client-side. Lenis is the urgent one: it is created stopped, and a
//      stopped instance calls preventDefault() on every wheel and touch event — so leaving
//      this page without picking a country left the *rest of the site* unscrollable by wheel
//      and touch until a full reload.
s +=
  `
/* Added by the port. The source page never navigated away from itself; this one can, and
   everything below keeps running against a detached DOM if it is not stopped. Lenis matters
   most: created stopped, it swallows every wheel and touch event site-wide. */
window.__v4teardown = () => {
  try { ScrollTrigger.getAll().forEach(t => t.kill()); } catch {}
  try { mm.revert(); } catch {}
  try { gsap.ticker.remove(tick); } catch {}
  try { lenis.destroy(); } catch {}
  try { removeEventListener('resize', resize); } catch {}
  try { renderer.dispose(); renderer.forceContextLoss(); } catch {}
  try { cancelAnimationFrame(rafId); } catch {}
  document.documentElement.classList.remove('picked');
  delete window.lenis; delete window.gsap; delete window.ScrollTrigger; delete window.__v4ready;
  delete window.__v4teardown;
};
`;
edits.push("publish window.__v4teardown");

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
