## 2026-10-21 — Hero honeycomb containment

**Task:** "yeh honey comb hay voh form and yeh image ke baju me rehna chaiye" — the honeycomb
must sit between the student photograph and the enquiry card, not on top of her.

**Root cause:** `.hive__item{position:absolute}` with `.hive{position:static}` in four rules
(site.css 696, 1031, 1876, 1994). A static parent is not a containing block, so the cells
anchored to `.hero-visual__frame` and rendered across the photograph.

**Change:** all four `.hive` rules `position:static` → `position:relative`, plus a comment at
the ≥1200 flex rule explaining why it can never go back to `static`.

**Verified:** screenshots and child-level geometry at 1536×760, 1100×900, 390×844.
- 1536: cells 471→885, photo ends 478 (7px tuck), card starts 1024 (139px gap)
- 390: cells 24px below the photo, centred 60→330

**Commits:** `c176b13`, `1cd4eb7` — pushed to `origin/main`.

## 2026-10-22 — leapscholar.com homepage recording

**Task:** record the home page scroll by scroll — every animation, every section.

**Method:** Chrome, 1536x639. MutationObserver on class/style + animationstart/transitionstart
listeners, then stepped the scroll position (100px frames through the hero, 150px through the
pinned card-stack, 300-500px elsewhere) capturing a screenshot and the mutation log at each stop.

**Output:** `research/leapscholar-homepage-teardown.md` — stack, 11-section map with pixel ranges,
frame-by-frame breakdown of both pinned sequences, the reusable button-reveal timing table, and a
what-to-take / what-to-avoid list for Trinity.

**Not done:** mobile viewport, and the nav dropdowns were not opened.

## 2026-10-22 — leapscholar.com mobile recording

**Task:** record the mobile view as well, hero frame by frame.

**Method:** built-in browser pane at 375x812 with Android UA (Chrome extension cannot emulate a
phone viewport). Hero stepped at 100px; rest of the page at 700-1600px.

**Appended to** `research/leapscholar-homepage-teardown.md`: mobile section map against desktop,
hero frame table, and the desktop/mobile differences.

**Checked and rejected:** apparent right-edge clipping in the screenshots is a capture artifact —
measured, scrollWidth == clientWidth == 375, zero horizontal scroll.

**Not done:** nav dropdowns, tablet widths.

## 2026-10-22 — Home V2 (three motion builds)

**Task:** "muje sab chaiye" — all three animation levels, Framer allowed.

**Added:** `gsap@3.13`, `lenis@1.3.11`, `motion@12.23.12`.

**New files:**
- `src/app/(site)/home-v2/page.tsx` — chooser
- `src/app/(site)/home-v2/[variant]/page.tsx` — the three builds
- `src/components/site/v2/V2Home.tsx` — picks blocks by type
- `src/components/site/v2/sections.tsx` — 10 sections
- `src/components/site/v2/motion.tsx` — the three drivers
- `src/styles/v2.css`

**Sections:** pinned hero, numbers, 3-panel pinned stack (ticker / university pills / globe),
chevron pipeline with stage numbers, bento, voices, events, chevron marquee, centres,
boarding-pass CTA.

**Verified at 1440x900 and 375x812:**
- css: 8,951px, 10 sections, 0 horizontal scroll
- sticky: --hero-p 0 to 1 over 900px; --stack-p 0 to 1; panel opacity crosses 1/0.3/0
- full: 2 pin-spacers on desktop, 0 on mobile; Lenis active; same progress curve
- phone: panels stacked relative, 0 horizontal scroll, dialling-code flag 22x15
- tsc clean, production build passes

**Fixed during the build:** nested h2 in the boarding CTA (hydration failure); the hero card lost
all its styling because site.css scopes it under `.hero__form`; GSAP pinned on mobile.

**Not done:** V2 sections are not CMS-editable as V2 (they re-use home blocks); no tablet pass.

## 2026-10-22 — Home V2 UI pass

**Fixed:** chooser full-bleed (.shell scoped under .v2 only); bento art 470px tall;
offer icons rendered as Font Awesome classes when they are SVG paths; inconsistent icon
colours; third bento card orphaned in a 2-of-6 slot.

**Screenshots:** `research/home-v2-ui/` — ten, 1536px, desktop.

## 2026-10-23 — /hero-light scroll sequence rebuilt

**Task:** better scroll animation for the hero-light section. Client supplied the original
reference (Downloads/hero/hero — a dark "Orynthiq" hero: Lenis, a dune ridge parallaxing at
0.2x, and the fill-up button).

**Three things the first pass got wrong, all performance:**
1. The photograph grew by writing `width`/`height` every frame — a layout on every frame.
   Now it opens with `clip-path`, which is paint-only; the picture is always full bleed and
   the card is cut out of it.
2. It read `offsetTop` straight after writing styles — a synchronous reflow on top. Gone.
3. It listened for `scroll`, which misses the frames a smooth-scrolling page produces between
   events and never fires for a programmatic jump. Now a rAF loop gated by an
   IntersectionObserver, running only while the hero is on screen.

**Structure:** JS writes six custom properties and nothing else (`--copy --open --ridge --dim
--hint --y`, plus `--s` per card); the composition lives in the stylesheet.

**Sequence:** copy leaves line by line -> photo opens card to full bleed -> dune ridge rises and
keeps creeping up -> cards rise outward from the centre, tilting flat -> photo dims back.

**The ridge:** the reference's black silhouette over flat dark ground did not read over a
photograph. The PNG is now a *mask* on a navy gradient, standing in the 24% band the photo
leaves at the bottom, so the cards have a horizon to stand on. Its drift had to be inverted —
the reference pushes its mountain down because its hero scrolls away, but this stage is pinned,
so the same sign pushed it straight out of frame.

**Fixed while testing:** at rest the clipped card sat over the headline (inset was centred, not
below the copy); and on a phone the script wrote the end of the sequence, which hid the
headline — it now leaves the element alone entirely below 810px.

**Verified:** 1440x900 progress curve measured across six positions; 375x812 un-armed, no pin,
no inline style, zero horizontal scroll; tsc clean; production build green.

## 2026-10-26 — Home V4 (world flight) ported

**Task:** turn the supplied `globebound-world-flight_1.html` into a page on the site, keeping
the site's own header and footer and keeping the supplied code as it is.

**Source:** 4.1MB single file. Three.js + GSAP/ScrollTrigger + Lenis; a 3D globe you pick a
country on, then a scrubbed flight from Mumbai with a cabin window, an arrival, and sections
for universities, IELTS, process, stats, voices and a CTA.

**Assets lifted out of the HTML** (they were base64, which inflated them ~4x):
- `window.__GLB__` -> `public/assets/models/a350.glb` (4.0MB base64 -> 0.21MB file)
- `window.__IMG__` -> 14 city photographs in `public/assets/img/home-v4/`

**Ported mechanically, by three scripts kept in `scripts/`** so the port can be re-run against
a new drop of the source rather than hand-maintained:
- `port-v4.js` — the module. Nine anchored edits, each of which throws if its anchor moved.
- `scope-v4-css.js` — prefixes all 238 selectors with `.v4`. The source styles `body`, `nav`,
  `h1,h2,h3`, `section.page`, `input,select`, `form` and `footer.f` bare; dropped in as-is it
  would have restyled every page on the site.
- `build-v4-component.js` — the markup, kept byte-for-byte and injected once.

**Why dangerouslySetInnerHTML and not JSX:** flight.js owns this DOM. It writes innerHTML into
the university track, toggles classes and lets GSAP write transforms across nearly every node.
React re-rendering any of it would fight the script.

**Four defects found and fixed while testing:**
1. The CSS slice included the closing `</style>`, so PostCSS refused the file and the route 500'd.
2. CSS comments above a rule were being swallowed into the selector, which broke every rule
   that had one — `nav{position:fixed}` escaped scoping and would have moved the site header.
3. The site CSP has `connect-src 'self'`; GLTFLoader turns a model's embedded textures into
   blob URLs and fetches them, so the aircraft loaded untextured. `blob:` added.
4. `#change` and `#logoimg` lived in the page's own `<nav>`, which this port drops. The script
   binds to `#change` unguarded, so the module threw on evaluation and never reached its
   ScrollTriggers — the page rendered and did nothing. `#logoimg` is guarded; `#change` was
   moved into the hero panel instead of guarded, because the hero locks scrolling until a
   country is picked and that button is the only way back.

**Also:** my own `.catch` on the dynamic import was gated on a "cancelled" flag set by the
effect cleanup, which hid the error above completely — React runs effects twice in development
and the first pass is always torn down. Now logged unconditionally.

**Verified at 1440x900:** module runs to completion (`window.__v4ready`), 39 ScrollTriggers,
1 pin-spacer, pick -> MUMBAI → LONDON, altitude reaches 36,000 at the cabin beat, arrival
fades in, university cards follow. tsc clean, production build green.

**Not done:** the CTA form is the source's own and is not wired to `/api/leads` — it now says
so rather than claiming it will call. No mobile pass yet.

## 2026-10-26 — Home V4 fixed after a ten-agent audit

Ten parallel audits (CSS scoping, accessibility, mobile, performance, site integration, port
fidelity, country data, images, content, security/links). What they found and what was fixed.

**Root cause of "colours all over the place", and it was mine.** `scripts/scope-v4-css.js`
sliced the stylesheet from line 6, which is the literal `<style>` tag. The walker swept it
into the prelude of the first rule, so the source's token block shipped as
`.v4 <style> :root{...}` — a selector that can never match. All eight colour tokens were
undefined: `--navy`, `--gold` and `--sky` silently fell through to the site's own (different)
values, and `--blue`, `--ink`, `--mute`, `--bg`, `--card` resolved to nothing. Every section
below the hero lost its background, so the fixed near-black `#sky` showed through behind
charcoal text; the IELTS band, the white cards, the timeline line and the stat gradients all
went with it. The generator now asserts that line 6 is `<style>` and line 216 is `</style>`
before slicing.

**Second cause of the overlap, not mine.** `site.css` gives `.chip` `position:absolute` plus a
float animation for the home hero's decorative pills. `flight.js` builds the fourteen country
buttons with the same class name inside a flex row, so all fourteen resolved to one position —
a single stack with only the top one clickable, `#chips` collapsed to zero height, and the
picked-country block riding up over the search field. The port prefixes V4's selectors so V4
cannot reach the site; nothing stopped the site reaching V4. Added explicit overrides for
`.chip`, `.band`, `.btn` and `.ucard`.

**Also fixed**
- The globe was cut by the 133px fixed header. `--v4-top` is measured from the header and kept
  current with a ResizeObserver; the sky, canvas and stage start below it, and the scene now
  sizes from the canvas rather than the window so the aspect and the pin projection agree.
- Sora was never loaded, so every heading fell back to Inter wearing Sora's tracking and the
  "Boarding…" overlay — whose only family is Sora with no fallback — landed on serif.
- `#loading` sat at z-index 100, above the site header, and was dismissed only from the
  model's *success* callback: a failed GLB left an opaque navy screen over the whole site with
  no way out. Now z-40, cleared on error and on an 8s watchdog.
- Lenis was never destroyed and is created *stopped* — a stopped instance calls
  preventDefault() on every wheel and touch event, so leaving this page without picking a
  country left the rest of the site unscrollable until a full reload. `window.__v4teardown`
  now kills the ScrollTriggers, the matchMedia, the ticker callback, Lenis, the resize
  listener, the renderer and the rAF loop, and the component calls it on unmount.
- Eight destination links hard-coded the Railway production host and opened in a new tab; now
  relative and same-tab. Dubai and Singapore were empty in the source but have had pages for
  weeks — linked.
- The anchor interceptor ran `querySelector` on whatever `#explore`'s href had become, which
  throws once it is a path. It now only handles real in-page ids.
- `html.lenis-stopped{overflow:hidden}` had been scoped to `html.lenis-stopped .v4`, moving a
  document scroll lock onto an auto-height div where it clips nothing.
- `body{overflow-x:hidden}` scoped onto a div makes it a *scroll container* (hidden forces
  overflow-y up to auto), and `position:sticky` then sticks to it instead of the viewport.
  `overflow-x:clip` leaves overflow-y visible.
- The three generators were not re-runnable — they read intermediates from a scratchpad that
  is not in the repo. All three now derive everything from the one source HTML.

**Verified at 1440x900:** tokens resolve to the source values (`--navy:#07142e`,
`--bg:#f6f8fc`, `--card:#fff`), 14 chips across 4 rows, stage top = header height = 133px,
`#loading` z-40, Sora loaded, teardown published, IELTS/process/stats backgrounds restored.
tsc clean, production build green.

**Known and NOT fixed — needs a decision**
- Nine imagery slots hotlink `images.unsplash.com` (six of them the university cards) and four
  globe textures hotlink a third-party GitHub repo pinned to a mutable `@master`. This is the
  "images break" report. Localising them means downloading 13 remote files.
- USA, Canada, Australia and New Zealand sit on the far side of the globe at the default
  rotation and there is no drag handler, so those four pins are unreachable — the four biggest
  destinations for an Indian audience. The chips still work.
- Fabricated testimonials attributed to named students, invented statistics including a "96%
  visa success rate", and "sample figures"/"samples" labels left visible. Must not ship.
- The CC BY / CC BY-SA attribution for all fourteen city photographs and the A350 model went
  with the source's footer. The assets are still served.
- No `prefers-reduced-motion` branch anywhere on the page.
- `.stage` is a ~6,000px sticky pin at every width, including phones.
