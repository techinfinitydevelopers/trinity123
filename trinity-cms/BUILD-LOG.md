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

## 2026-10-26 (later) — V4: header clearance everywhere, and the demo content removed

**Header clearance.** The earlier fix only cleared the hero. Walking the page and measuring
every held panel against the 133px header found three more being cut:

| scroll | held under the header |
|---|---|
| 7,000 | `#unis` / `.hs` — the GSAP-pinned universities rail, 133px |
| 8,200–10,200 | `#ielts` / `.ie` / `.mods` — the sticky IELTS panel, 133px |
| 11,500 | `#process` / `.tl` — 133px |

The distinction that matters: a section that merely *scrolls past* the header is fine — that
is how a fixed header behaves on every page of this site, and those were left alone. The two
fixed were the ones that **stop** under it and never come out:
- `.ie` is `position:sticky` at `top:0` for 360vh. Offset to `var(--v4-top)` above 861px only
  — below that the generated sheet already forces it to `position:relative; height:auto`.
- `.hs` is pinned by GSAP with `start:'top top'`, which fixes it flush with the viewport. The
  pin start now reads `--v4-top`, through a function so `invalidateOnRefresh` re-evaluates it
  on resize, and `.v4 .hs` is sized from the same variable so the two agree.
- `section.page` gained `scroll-margin-top` so anchor jumps do not land behind the header.

Re-measured after: no held panel sits under the header at any of the five stops.

**Demo content removed.** The source was a sample page for a fictional brand and the port
carried its content over wholesale:
- Four invented statistics, two of which contradicted the rest of the site by 30x ("40
  University partners" against "1200+ Universities" everywhere else), and one — "96% visa
  success rate" — a quantified outcome claim with nothing behind it. Replaced with the
  `stats` block from `seed-content.ts`: 42+ years, 39+ countries, 1200+ universities,
  100,000+ courses.
- Five invented students with invented quotes, each shown twice. `flight.js` rewrites every
  `.cdest` to whichever country the visitor just clicked, so the same fictional person was
  relabelled as having studied in Japan or the UAE on demand. Replaced with the only two
  genuine quotes the client has supplied, repeated to fill the marquee rather than padded out
  with new inventions; the `.cdest` spans went with them.
- "(sample figures)" and "(samples)" — the page was telling visitors its own content was fake.
- The CC BY / CC BY-SA attribution for the fourteen city photographs and the CC BY 4.0 credit
  for the A350 went out with the source's `<footer>` while the assets stayed. Restored as a
  credits section. Dubai and Seoul are listed as outstanding: the source gave neither a named
  author nor a licence version for those two, so their requirement cannot be met from what is
  in hand and they need re-sourcing or replacing.

**The generators can no longer be run.** `globebound-world-flight_1.html` is gone from
Downloads. Two newer files are there — `globebound-world-flight.html` (730 lines) and
`_2.html` (732) — but they are a different revision, not the same page: the original was 778
lines and the line structure does not match any of the scripts' anchors. The three scripts in
`scripts/` therefore fail at their source check, and the generated files are now the source of
truth; today's edits were made to them directly. `scripts/fix-v4-content.js` holds the content
patch and is idempotent.

**Verified at 1440x900:** stats read 42+/39+/1,200+/100,000+, the rail shows Rohan Nair and
Sharanya Santosh only, credits render, universities rail and IELTS panel both clear the
header. Build green.

## 2026-10-26 (later still) — globe reachable, arrival holds

**Testing note worth keeping.** The browser pane this session uses runs **no animation frames**
— a probe measured 0 rAF callbacks in 1.5s while `document.visibilityState` said "visible".
Anything idle-animated is invisible to it, and an earlier "the auto-spin does not work" was
that, not a bug. Chrome in the foreground gives ~22fps and is the place to verify motion.

**The globe.** Centred on Mumbai with no way to turn it: USA, Canada, Australia and New
Zealand were on the far side, and the only rotation input was scroll velocity, which is zero
while scroll is locked. It now drifts at 0.075 rad/s (~84s a revolution) until a country is
picked, and can be dragged with a pointer; dragging pauses the drift for 4s.
Measured in Chrome: **14 of 14 pins** come into view over one revolution, previously 10.

The drift needed a separate accumulator. `spinX` is multiplied by `pow(.94, dt*60)` every
frame — the spring-back that gives scrolling its nudge-and-settle feel — so adding to it
reached an equilibrium around 0.02 rad and never moved. `autoRot` accumulates and is added on
top; the original scroll behaviour is untouched.

**The arrival.** Fully visible for about 44vh: it finished arriving at timeline 14.1 of 15 and
started leaving as soon as `#unis` touched the viewport bottom. Moved to 12.2/12.7 and the
exit now starts at `top 30%`. Measured: **900px / 1.41 screens** fully opaque.

That retiming needed `immediateRender:false` on the exit tween. A scrubbed `.to()` captures
its start value at creation — page load, when the arrival's opacity is still 0 — so the exit
animated 0→0 and held it there, and the arrival stopped appearing at all. The file's own
`enterExit()` helper already does this for the same reason.

## 2026-10-26 — V4 process timeline reworked

As ported it was five identical full-width white slabs down a 1,120px column, each holding one
short line, with a thin rail pinned to the far left. Two thirds of every card was empty and
the five read as a list, not a journey — the one thing the section is for on a page whose
whole metaphor is a flight.

The useful detail: `flight.js` already alternates each card's entry direction
(`x: i%2 ? -90 : 90`), but with every card in a single column that alternation had nothing to
land against. Moving the rail to the centre and putting the cards either side of it is what
makes the existing motion mean something, and it uses the space the long cards were wasting.

- Rail centred above 900px; cards alternate left/right, one per row. The rows are explicit:
  with auto-placement the browser packs two cards onto each row instead of stepping down.
- The dot sits on the rail — half the 96px gutter from whichever card edge faces it, less half
  its own 18px.
- Left-hand cards mirror so both columns read toward the rail. Their children are placed
  explicitly because the source order is number, heading, paragraph.
- Card width drops from ~1,120px to 512px.
- Each step gained a Font Awesome 5 icon (clipboard-check, tasks, file-signature, passport,
  plane-departure) so the five are scannable without reading.
- The number was a small gold digit competing with the title; it is now a quiet stage marker
  beside the icon. The last step — the one the page has been flying towards — takes a gold
  border and a gold icon chip.
- Below 900px nothing changes: rail on the left, cards stacked. There is no room for anything
  either side of it.

Verified: 1536 wide — cards at x=200 and x=808, 512px each, rail at 757, 5 icons present.
375 wide — all five at x=64, 291px, rail at 38, no horizontal scroll. Build green.

## 2026-10-26 — V4 credits band styled

The attribution block was added and left unstyled. Measured: `padding: 0` top and bottom, so
it was crammed against the CTA box above and sat on the join with the site footer; the two
paragraphs started at different x (148 and 270) because one filled `.wrap` while the other
centred itself in a 900px cap; and both used `opacity` (.7 and .55) for tone, which on a light
ground left the longer one barely legible.

That last one matters beyond looks: the licences require the credit to be *given*, so it has
to be readable. Colour (`--mute`, 5.07:1 on `--bg`) instead of opacity, one alignment, a
hairline rule to separate it from the CTA, and 44/52px of padding. Both paragraphs now start
at x=278, opacity 1, band height 214px.

## 2026-10-27 — Trinity World drop-in brought in (stage 1 of 2)

Client supplied `trinity-world-nextjs` — a proper drop-in, and better built than my own
hand-port at /home-v4: scoped under `.tw`, every asset self-hosted (so none of the hotlinked
Unsplash/jsDelivr problem), full teardown on unmount, and real props (`destHref`, `onLead`,
`onDark`, `initialCountry`, `lenis`, `assetBase`). Its README even anticipates the CMS block.

**Copied in:** `public/tw/` (37 MB — 110 university photos, 14 city photos, 4 Earth textures,
the A350) and `src/components/tw/` (engine 650 lines, tw.css 276, data/uni/markup).
`three`, `gsap` and `lenis` were already dependencies.

**Added:** `/trinity-world` preview route (unlinked, noindex) and `TrinityWorldHost` — a
client wrapper, because a server component cannot pass `destHref`/`onLead` functions. It is
the one place the drop-in's vocabulary is mapped onto this site's: country keys to our
destination slugs (`nz`→`new-zealand`, `uae`→`dubai`, four with no page go to `/contact-us`)
and its lead payload to the shape `/api/leads` accepts.

**The site reaching into the drop-in — the same class of bug as /home-v4's `.chip`.** The
drop-in scopes everything under `.tw` so it cannot touch the site; nothing stopped the
traffic the other way. `site.css` styles six of the same class names at (0,1,0) and every
property the drop-in does not itself declare leaked through:

- **`.live` — fatal.** `engine.ts` adds `live` to the root element. On this site `.live` is
  the pulsing green dot in the "how it works" cards: `width:8px;height:8px;border-radius:50%;
  display:inline-block;animation:pulse`. Applied to the root wrapping the whole experience it
  collapsed it to an 8px circle — **the page rendered blank** with 22,976px of document behind
  it. The drop-in has no `.live` rule, so all six declarations landed.
- **`.chip`** — `position:absolute` + a `floaty` animation, so all fourteen country buttons
  stacked on one spot. Exactly the /home-v4 bug, on a different page.
- **`.band`** — position, navy background, full width and a clip, onto the IELTS score.
- **`.btn`/`.lead`/`.h2`** — one or two properties each (heading face, line-height, tracking).
- `h1..h4{color:var(--navy)}` — the drop-in's headings inherit white from their dark sections,
  and an inherited value loses to any matching declaration, so they came out navy on navy.
- `.pin` is **safe**: the drop-in declares position/width/height/background itself, so
  `site.css .pin{height:190vh}` never lands on the fourteen globe pins.

All of it is neutralised in `src/styles/tw-site.css`, which lists only the gaps — nothing in
`src/components/tw/` is edited, so the drop-in stays replaceable.

**Header clearance:** same treatment as V4. `--tw-top` is the header's measured height,
published on the document element by the host and kept current with a ResizeObserver. The
fallback lives in each `var(--tw-top,133px)` rather than a `.tw{--tw-top:…}` line, because
that line would sit closer than the document element and shadow the measured value.

**Verified at 1536:** stage top = header height = 133px, h1 white, 14 chips, `.tw` 20,950px,
build green.

**Still to do (stage 2):** the `worldFlight` CMS block, the dashboard toggle that puts this on
the home page, and lifting the content out of `data.ts`/`markup.ts` so it is editable.

**Flag:** 37 MB of assets is a large repo addition. ~35 MB of it is 110 university photographs
at 300–630 KB each; they could be halved without visible loss.

## 2026-10-27 — Trinity World: dashboard toggle + editable content (stage 2)

**Toggle.** New `world` settings key. `enabled` on → `/` renders Trinity World instead of the
home page's blocks; the header and footer stay, because they come from the (site) layout above
it. Off → nothing about it is loaded and the blocks come back untouched. Settings → **Home
page** carries the toggle, a Preview button, the wording and the countries.

**Editable, and deliberately not editable.** The settings key holds each country's name, short
name, city, tests and university list — but *not* its lat/lon. Those are geometry: they place
the pin on the globe and define the flight arc. They stay in the drop-in's `data.ts` and are
merged under whatever the dashboard supplies, so an editor can rewrite every word on the page
without being able to move a pin or break the flight. Verified in the browser: the injected
payload has 14 keys and `'lat' in uk === false`.

**How the content gets in, without forking the drop-in.**
- *Countries*: `data.ts` gained one block that merges `globalThis.__TW_CONTENT__` over the
  base list by key. The host writes that global **during render**, not in an effect, because
  the engine is imported by the child's effect and importing it is what evaluates `data.ts` —
  parent render always precedes child effect.
- *Copy*: applied to the DOM after the engine injects its markup, via a selector table in the
  host and a MutationObserver that fires once and disconnects. `markup.ts` is a generated blob
  the drop-in owns; templating it would have to be redone on every drop-in update. All fifteen
  selectors were checked against the live DOM before being written down.

**Verified:** the three journey headings render the settings values ("12 months to study
abroad.") rather than the markup's ("12 months to study *in* abroad.") — which also quietly
fixes the drop-in's English. 14 chips, `--tw-top` 133px, tsc clean, build green.

**Not verified:** flipping the toggle end to end. Writing the setting straight to the database
was refused as a shared-resource change, and `getSetting` is wrapped in `unstable_cache`, so
only the save action's `revalidateTag` makes a change visible. Flip it in Settings → Home page
and it takes effect immediately.

---

## Trinity World — local visual pass (27/10)

Walked `/trinity-world` end to end in foreground Chrome (not the browser pane, which runs no
animation frames). Globe, country pick, flight, arrival, universities rail, IELTS, the three
journey sections, stats, stories and the lead form all render; `--tw-top` resolves to 133px,
`#sky` sits at 133px, 14 chips. At a 639px-tall window the last chip row ends 2px below the
fold — the shortest realistic desktop, so left alone.

**Two defects found and fixed.**

1. *The altitude meter sat under the site's floating buttons.* My first reading — that the
   viewport was clipping it — was wrong; measuring showed 71px of margin on the right. The
   real cause is this site's WhatsApp/back-to-top/chat column at `right:22px`, z-index 60,
   against the meter's 9. Measured at 1536: meter 1332–1465, chat 1415–1499, a 50px overlap.
   The meter moves inboard (`right:108px`, 76px under 760px) rather than the buttons moving,
   because the buttons are in the same place on every other page. Re-measured after: meter
   1280–1413 against chat 1415, **overlap 0**.

2. *Every GLTF progress tick was logged as an error.* `GLTFLoader.load` is
   `(url,onLoad,onProgress,onError)` and the drop-in's handler sat in the onProgress slot, so
   a 4 MB model produced a stream of `[object ProgressEvent]` errors and a standing "1 Issue"
   badge on the dev overlay. The model always loaded; only the console said otherwise. Moved
   to the fourth argument — the one edit made to `engine.ts`, and a plain positional bug
   rather than a change to how the drop-in behaves. Console is clean after a reload.

The 44 other console errors in the log were stale: mid-edit states of `tw-site.css` from
12:02–12:08, not the file on disk.

---

## 28/10/2026 — Client content pass: About, Services, admin editor, chat, header
- **About:** intro heading + two paragraphs replaced with the client's text (`seed-content.ts`). Mission/vision/segments were already in.
- **Services:** 8 old cards replaced with the client's 13 services in order, each with an image from `public/assets/img`. Cards get `id` anchors; text splits on blank lines into paragraphs. Nav "Services" is now a dropdown (`settings.ts`) linking to `/our-service#<id>`; menu is two columns, no scroll, and closes after a click (`Header.tsx`, `canvas.css`).
- **Admin editor:** fields respond to the editor's own width (container queries), title/text first and id/link/icon last, bigger text boxes, image picker stacks when narrow, list items collapsed by default.
- **Chat:** launcher 84→68px clear of the WhatsApp button; hover label and header read "TISA" (default name in `settings.ts`).
- **Footer:** on pages that close with their own CTA the footer banner is hidden, but the cream band still started 80px down and cut through the logo; it now starts at the top.
- **Header (scrolled):** pill max-width 1200→1320 and a compact row at 1121–1320px, so "Free Counselling" no longer spills past the pill/scrollbar.

**Production needs:** the page content, nav and chatbot name live in the database. Push deploys code only; paste the About/Services content in /admin, set Settings → nav Services children, and set Chatbot name to "TISA" (or run a targeted sync script).
**Verified:** `tsc` clean; layouts measured on localhost. **Not verified:** real scroll of the header (preview pane cannot scroll), mobile menu Services list.

---

## Trinity World — after the client content pass (29/10)

Re-checked the drop-in against Sanjeev's 28/10 header and chat changes, in foreground Chrome.

- **The meter fix holds.** The chat launcher moved to 68px wide starting at 1436 (it was 1415),
  so clearance grew rather than shrank. Measured at 1536, at rest and at scroll 1700: meter
  1280–1413 against WhatsApp 1441–1499 and chat 1436–1504 — **no overlap with either**.
- **The header is now 137px, not 133.** The pill's max-width went 1200→1320, so the
  pre-hydration fallbacks in `tw-site.css` were four pixels short; they now read 137px. The
  measured value `TrinityWorldHost` publishes was always right — only the first frame was off.
- **"Change country" was hidden behind the header** — a regression the wider pill exposed, not
  one Sanjeev introduced. `tw.css` parks it at `top:84px, z-index:45`, which is inside the
  header's band (0–137) and under its z-50, so only the last letters showed past "Free
  Counselling". It now sits at `calc(var(--tw-top) + 16px)`: measured top 153, 16px clear,
  and `elementFromPoint` on its centre returns the button itself, so it is clickable again.
  Hidden under 760px by `tw.css`, so no mobile rule is needed.

---

## Trinity World — load weight (29/10)

The home page was already merged: it renders inside the `(site)` layout, so the header, the
footer and the floating buttons are the site's own, the Settings toggle decides whether it
replaces the blocks, and its form posts to `/api/leads` like every other enquiry card. What
made it feel bolted on was the weight — `public/tw` was 37 MB, and the first screen alone
pulled 3.28 MB of globe textures.

**Assets re-encoded in place** — `scripts/optimise-tw-assets.mjs`, re-runnable after any drop-in
update. Same paths and same file names throughout, because `engine.ts` and `uni.ts` compose
their own URLs and `src/components/tw/` has to stay replaceable.

| | before | after |
|---|---|---|
| `earth/` (first screen) | 3,200 KB | 466 KB |
| `uni/` (78 campus photos) | 28 MB | 9.3 MB |
| `city/`, `stu/` | 5.4 MB | 2.1 MB |
| **`public/tw` total** | **37 MB** | **15 MB** |

The 4K maps went to 2048 (the globe is never wider than ~900 CSS px), the water mask to 1024
— it is a "is this pixel sea" mask, and at 4096 as a lossless PNG it was the single largest
file on the site. The campus photos went to 1100 wide; a `.ucard` tops out at 430×590 and
scales to 1.08 on hover. The cloud layer keeps its alpha channel: `AdditiveBlending`
multiplies colour by alpha, so dropping it would wash the globe in flat white.

**Preload hints** — `TrinityWorldHost` now emits `<link rel="preload">` for the four textures
and the aircraft. Nothing asked for them until the engine chunk had downloaded, parsed and
run; the hint starts those fetches during the chunk download instead. Measured locally: the
earth set finished at 165 ms instead of ~800 ms, and the engine no longer waits on it at all.

Each link carries `crossOrigin="anonymous"`. Three's `ImageLoader` sets that on the `Image` it
creates, and a preload in a different CORS mode is a *different cache entry* — the first
attempt without it fetched every texture twice, which was worse than not preloading. Verified
after: five `/tw/` requests, no duplicates, 625 KB.

**Cache headers** — `/tw/:path*` now returns `max-age=2592000, stale-while-revalidate=86400`.
Next serves `public/` with `max-age=0`, so every repeat visit was re-validating the lot. A
month is short enough that swapping a campus photo still reaches people without a rename.

Also fixed a type error in `scripts/toggle-world-home.ts` that `next build` did not catch but
`tsc --noEmit` did — the countries array needed Prisma's own JSON input type.

Verified in the browser at 1536 px: globe, clouds and specular highlight unchanged, intro
completes, UK pick loads seven campus cards at 1100 px and ~115 KB each (was ~350 KB).

### Mobile pass, same day

At 375x812 the hint "Pick a country to take off" was printed straight across the country
chips — a 188x90 overlap over the first two rows. The cause is a selector in `tw.css`:

    .tw html:not(.picked) .hint{display:none}

which asks for an `html` element inside `.tw`. The engine puts `picked` on its own root div,
so the rule has never matched and the hint has always been on screen. On a wide screen the
hint is centred and `#panel` is parked on the left, so the two never meet; on a phone the
panel goes full width and they collide. Guarded in `tw-site.css` at `max-width:760px` only,
with `:not(.picked)` so "Scroll to take off" still appears after a pick. Desktop unchanged.

Otherwise mobile measured clean: `--tw-top` 116px against a header bottom of 116, `#change`
correctly `display:none`, no horizontal overflow (scrollWidth 375 = clientWidth), 14 chips,
globe and textures as on desktop.

Still open, a design call rather than a bug fix: the site's three floating buttons (WhatsApp,
back-to-top, chat) sit at z-index 60 over the hero panel, and five chips — France, Germany,
USA, Canada — are partially under them, so part of each is unclickable. Fixing it means
either shrinking the chip area, moving the panel, or moving the buttons on this page only.

### Chips clear of the floating buttons (29/10)

`#chips` is inset 64px on the right under 760px, so the fourteen country chips stop short of
the column where the WhatsApp button and the chat avatar sit. Measured at 375x812 before:
France and USA were partly printed under them at z-index 60 against the panel's 6, so part of
each could not be tapped. After: no chip intersects either button.

Two things measured along the way turned out differently from the first estimate:

- The chips were never three rows — they are **five** with no inset, and seven with it. Only
  about three are in view either way; `#panel` scrolls its own overflow, so the difference is
  in how much is hidden, not in what is reachable.
- The back-to-top button appeared to cover two more chips, but it is `opacity:0` and
  `pointer-events:none` until you scroll. It was never covering anything. No fix needed.

Shrinking the chips would win one row back but they are already 36px tall, under a comfortable
tap target, so they were left alone. Desktop is untouched — `padding-right` computes to 0px
above 760px, chips stay at four rows.

## Trinity World — the drop-in's own nav and footer (30/10)

The supplied page was integrated without its chrome: the generated `markup.ts` runs from
`#loading` to `#cta`, and the site's own header and footer wrapped it. The design was drawn
with its own, so both are now the drop-in's and the site's two are hidden on that page.

The chrome is `src/components/tw/chrome.ts` + `chrome.css`, deliberately outside the vendored
files — `markup.ts` and `tw.css` are generated and the generator strips the chrome out of
every new drop-in, so anything written into them would not survive an update.

Content comes from the dashboard, not the prototype. The standalone ships `hello@example.com`,
`+91 00000 00000` and "Your office address, City, India"; the real phone, email, address,
socials, logo, copyright and build credit are passed in, with the prototype's text only as a
fallback. The nav lists the same eight pages as the site header; the footer's Explore column
keeps its on-page anchors.

Measured and fixed along the way:

| Problem | Measurement | Fix |
|---|---|---|
| `.soc` collapsed | site.css styles one button, the drop-in the row around them — row became a 42px pale square | reset width/height/border/background on `.tw .soc` |
| Footer bottom under the floating buttons | WhatsApp covered 39px of "Powered by", back-to-top 25px of the credits summary; chat avatar stands 172px tall | 96px padding under the last row + 64px right inset on `.fbot` |
| Eight page names in a pill built for five | "Study Destinations" wrapped to two lines, nav 68px → 89px, logo squeezed to 16px | `nowrap`, links tighten at 1360px, burger at 1260px |
| `#change` in the preview | the nav reset moved /trinity-world's floating button into the top of the page | scoped the reset to `.tw-chrome` |

Verified on both routes at 375, 1024 and 1300: home renders the drop-in's chrome with the
site's hidden, sky at 0, no header clearance, no horizontal overflow, no footer/button
collisions; `/trinity-world` is unchanged and keeps the site header.

`scripts/gen-tw-credits.mjs` lifts the CC BY / CC BY-SA attribution out of a drop-in verbatim —
re-run it when a new one changes the asset set.

## Chrome made common, and a section-by-section responsive audit (30/10)

**One header and one footer, site-wide.** The Trinity World design now dresses the site's own
`Header.tsx` and `Footer.tsx` via `src/styles/tw-chrome.css` — a re-skin, not a rewrite, so the
destinations mega-menu, the Services dropdown, the mobile accordion, site search, active-page
states and Next's client routing all survive. The engine-side chrome written two days earlier
(`chrome.ts`, `chrome.css`) is gone; `credits.ts` moved into the shared footer, because the CC BY
attribution has to travel with the work. The footer closes on a two-size wordmark instead of a
marquee.

**Ten read-only agents audited one section each** against the stylesheets at phone, tablet and
desktop widths. Every finding was re-measured in the browser before anything was written. 20+
were real. The pattern worth remembering:

| Class of bug | Instances |
|---|---|
| `tw.css` selectors that cannot match (`.tw html:not(.ready) …` — an `html` inside a div) | the hint, the panel + pins through the whole intro |
| `!important` top *and* bottom with `height:auto` | the altitude readout solved to a 705px invisible hit box over the chip rows |
| Shared class names between `site.css` and the drop-in | `.ucard` leaking `border` and `transform-origin` onto GSAP's pivot; `.soc`; earlier `.chip`, `.band`, `.live` |
| The floating-button column | the lead form (38px at 375), the university cards on short viewports, the footer's last rows |
| `margin:0 auto` on a grid item | the whole IELTS panel rendering 621px wide in a 753px page |
| Breakpoints that stop at 760px | the arrival screen in landscape, the visa checklist on short wide windows, the hint on a sideways phone |

My own skin contributed four, all in the mobile sheet: a `max-height` from `site.css` that `inset:0`
does not beat, a hard-coded top padding, floating buttons painting over an open menu, and no scroll
lock behind it. The burger then turned out to be under the sheet, because `Header.tsx` renders the
sheet *inside* `.navwrap`.

**Left for the drop-in itself:** `.ucard`'s "Apply" is a 55x16 span with no href and an empty
`wire()` stub — under a tap target and inert.

**Dashboard image overrides** are plumbed through `WorldSettings.images` → `WorldOpts.images` →
every asset URL the engine composes, including the preload hints. The admin UI for them is not
built yet.

## Six parallel agents, the nav pill, and a first-visit preloader (30/10)

Six writer agents ran at once with **strictly disjoint file ownership** — the only way more than
one of them can write to this repo without overwriting each other. What each shipped:

| Owned | Shipped |
|---|---|
| `Sidebar.tsx` | grouped into Content / Engagement / Setup, Dashboard on its own |
| `BlockEditor.tsx` | Tablet (834×1112 at 0.52) added to the preview device switch |
| `PostForm.tsx` | Content / SEO tabs + a live preview rail with Desktop/Tablet/Mobile |
| `SettingsForms.tsx` | dashboard pickers for every city and university photo, plus the globe textures and the aircraft behind an advanced card |
| `scripts/perf-budget.mjs` | six budgets, fails the build when any is exceeded |
| `scripts/backup-content.ts` | exports Page, Post, Setting, Country, KnowledgeItem to JSON |

Then, from the screenshots:

- **Three nav items were invisible.** `canvas.css` loads after the chrome skin and sets
  `.nav__links .cv-ddbtn{color:var(--text)}` — the three items that have dropdowns rendered #333
  on dark glass while every plain link beside them was white. The skin now loads last.
- **Two nested pills.** The bar and the link row each had one. The bar is a transparent row now;
  the pill belongs to the links alone, with the logo, call and counselling buttons outside it.
- **The nav sat on the globe.** The clearance had to go in `tw-site.css`, not `tw-chrome.css`:
  `tw.css` sets `.tw #c{inset:0}` at equal specificity and loads after the layout stylesheets, so
  the copy in the skin measured 0px and did nothing. `#sky` still fills from 0 so the band behind
  the bar stays night-coloured.
- **"Change country" could not go in the nav row.** Measured at 1400 the row already runs to
  x 1345; the button needs ~1403px even at tightened spacing, which would mean a hamburger on
  every 1366 laptop. It joins the header as a second row instead, same glass, right-aligned.

**The preloader** shows once per visitor, site-wide, then never again. The decision is made by a
blocking inline script before the first paint — a React effect runs too late and a returning
visitor would catch a frame of it. Three guards: a CSS keyframe fades it regardless of React, so
a failed chunk cannot leave the site covered; `aria-hidden` so a screen reader reads past it; and
`prefers-reduced-motion` stops the animation without removing the safety net. It hands off to the
globe's own particle intro rather than replacing it.

## Mobile + cost-card polish (30/10/2026)
- Floating buttons on phones (`chat.css`, ≤640px): WhatsApp 46px, chat avatar 50px, stacked tighter so less content is covered.
- About section: second paragraph now shares the first's line-height and `text-wrap` (`site.css`).
- Destination cost cards: "Total year one" no longer navy; all cards white (`CountryPage.tsx`, `total` hard-wired false).
- `<body suppressHydrationWarning>` in `layout.tsx` for extension-injected attributes.

## 02/11/2026 — Client edits on the Trinity World home page and nav
- **Flight:** removed the "Window seat" caption (`#c2`: markup + its three engine lines); the cabin caption now reads "Lift your window shade." / "Your study abroad destination awaits you."; removed the university names under "Landing in <city>." (`#c4 p`); arrival headline now ends "Let Trinity Study Abroad assist you."
- **Hero:** removed the "Study abroad · IELTS · Visa" tag; line under the headline is now "Type or pick a country." (the "Settings → Home page" field for the tag is gone).
- **Nav:** the Resources dropdown has no "Resources" heading row (desktop + mobile); Services keeps its row.
- **Sync script** (`scripts/sync-client-content-2026-10-28.ts`) also rewrites `world.text.heroSub` on a database that still holds the old default.
**Not verified:** the flight animation by scrolling (preview pane cannot scroll). The first ~3.5 units of the flight timeline are now caption-free where the window seat used to be; timings were left alone on purpose.
**Production:** the code changes deploy with the push; the hero line also needs the sync script (or Settings → Home page).

## 2026-11-02 — Chatbot answers from the client's workbook

**Task:** "yeh chat bot ke question hay jo ki agar koe student puch atoh yeh sab question and ans
rahega ya related question pucha toh question veerify karo or ans do" — load the client's
question/answer sheet into the assistant, and when a student asks a related question rather than
the exact one, verify which question it is before answering.

**Source:** `ChatBot questions for website.xlsx` — 209 counselling rows (Shreeja's sheet), 93
marketing rows, and a 12-row destination stats table. 30 questions appear on both sheets.

**Change:**
- `scripts/gen-chatbot-kb.mjs` → `src/lib/chatbot-kb.ts` (283 entries). Merges the duplicates
  (longer answer wins, the other phrasing is kept as a related question), derives a category from
  the question, adds synonym keywords, and turns the stats table into one entry per country.
- `KnowledgeItem.followUp` (new column). The sheet pairs 131 answers with a qualifying question —
  "What is your approximate budget?" — which the route appends, but only if it has not already
  been asked in that conversation.
- `scripts/import-chatbot-kb.ts` upserts by normalised question; without `--overwrite` it never
  touches an entry already in the database, so a counsellor's edit in the admin outlives a
  re-import. `prisma/seed.ts` seeds from the workbook too, with the handful of Trinity facts it
  does not cover (address, founder, phone) added after it.
- `src/lib/chat-match.ts` re-scored for a ~300-entry corpus: the candidate's own question and
  keywords carry 0.75 of the score and its answer 0.25 (equal weighting let any long answer
  collect stray hits on "work", "course", "budget"); `need/want/get/know` joined the stop list;
  ties break on the entry's own wording, then on how little it asks about that the student never
  said. A match is only served when the runner-up is ≥0.08 behind — otherwise it goes to Claude.
  The semantic pass now gets an 80-entry shortlist instead of all 283 (~5k tokens a message).
- Verification the student can see: the widget prints "Answering: <question>" above the reply
  when the match was not word for word (`tc-answering` in `chat.css`).
- Admin: Follow-up field in the knowledge editor, list capped at 50 with "Show more", and the
  bulk uploader now reads every sheet in a workbook and works the columns out from the data —
  the client's own file has a blank header over the question column, which the old reader needed.
- `scripts/check-chatbot-match.ts` (`npm run chatbot:check`) — offline matcher check, no DB, no
  API key.

**Verified:** `chatbot:check` 9/12 answered by the fast pass, 0 wrong, 3 deferred to the semantic
pass, no off-topic question matched. End to end against `/api/chat` on the dev server: exact
match, related match, destination stats, and the unmatched flow for a question nobody wrote an
answer to. Follow-up asked on the first ask and not on the second. In the browser: "how much
money do i need to study abroad" showed "Answering: How much does it cost to study abroad?",
"Do I need IELTS?" showed no caption. Build, tsc and perf budget clean.

**Not verified:** the admin screens — logging in needs a password, which I do not enter. Open
`/admin/chatbot` and check the Follow-up field and the "Show more" paging.

**Needs the owner:** `ANTHROPIC_API_KEY` is present but **empty** in `.env`, so the semantic pass
never runs locally — `chat-match.ts` bails on the empty value before the SDK could fall back to
the machine profile. Close calls ("my percentage is low can i still go") therefore reach the
student as "I couldn't find a suitable answer" instead of the right entry, which the keyword pass
had ranked first. Set a real key in the deployed environment or that half of the matcher is dead.

## 2026-11-03 — Schema reaches production on its own

**Task:** the `followUp` column added yesterday only existed locally. Railway had no deploy-time
schema step, so the first deploy would have served a Prisma client selecting a column the
database did not have — every chat request and the whole `/admin/chatbot` screen would have
thrown until somebody ran `prisma db push` by hand against production.

**Change:** `railway.json` sets the start command to `npm run start:prod`, and that script is
`prisma db push --skip-generate && next start`. The push is a no-op when the schema already
matches, so restarts cost nothing, and `db push` without `--accept-data-loss` refuses a
destructive change rather than performing one — a column rename stops the deploy instead of
dropping data. If the push fails the container does not start, which is the right failure: a
server answering with the wrong schema is worse than one that is down.

**Verified:** `npx prisma db push --skip-generate` against the local database → "The database is
already in sync with the Prisma schema." `railway.json` parses.

**Not verified:** the deploy itself — I have no Railway access.

**Note:** this carries the schema, not the content. The 283 answers reach production through
Admin → Chatbot → Bulk upload with the client's workbook; no database URL needed.

## 2026-11-03 — The counselling CTA is a boarding pass

**Task:** make the home page's closing form look like a boarding pass, and tear it the way a
real one is torn at the gate when the form is submitted. Then: a different ticket per country.

**Change:** two new files, both outside the vendored drop-in — `src/components/tw/boardingPass.ts`
and `src/styles/tw-boarding-pass.css`. The pass is assembled from the drop-in's own `#cta`
nodes at runtime rather than written into `markup.ts`, which the generator overwrites on every
drop-in update. The engine's `#leadForm` element is moved into the pass, never rebuilt, so the
submit handler it bound at mount still runs and the lead still reaches `/api/leads`.

The section stays navy and the card becomes paper, which is what makes it read as a ticket.
The stub carries passenger, flight, intake and gate, and fills in as the visitor types.

Per country: `TICKETS` maps each destination to its real airport code and city plus a fixed
flight number and gate — UK → LHR / TR 101 / B12, Canada → YYZ / TR 812 / E73. Fixed, not
random: a ticket that reshuffles on every visit looks like a toy. A country the dashboard adds
later falls back to the first three letters of its name, so a new row belongs here when one is
added. The destination is read from the engine's own `#route` meter, the only handle this file
has on which country is selected.

The tear fires on success only, which the engine reports solely by rewriting its button label —
so that label is what is watched. A failed send leaves the pass whole, which is honest: nothing
was torn because nothing was accepted. Nothing is clipped; each half grows a sawtooth strip in
the section's navy along the seam, then the two part and the stub flies off. On a phone the stub
sits below, so it tears downward instead.

**Verified** in the browser against the live engine on `/trinity-world`: the pass builds, the
stub mirrors what is typed, and the ticket changes with the country — Ireland DUB / TR 114 /
A04, USA JFK / TR 880 / T4-6, Japan HND / TR 442 / C14, Canada YYZ / TR 812 / E73. A real
submit tore it: stub gone, torn edge shown, BOARDED stamped, form reset, button "Thanks — we'll
call you!". The test lead was deleted from the dev database afterwards. Mobile at 375px: stub
stacks under the pass with the perforation and both notches across. `tsc` clean, `npm run build`
clean, perf budget within limits — CSS is now 297.5 KB of a 320 KB budget, 93%.

**Not verified:** the failure path (a lead POST that fails leaves the pass whole) was reasoned
from the engine's handler, not forced.

## 2026-11-04 — The preloader writes the company name

**Task:** show "Trinity Study Abroad" on the preloader, written as if by hand on paper, with
the logo, and nothing else of the site visible behind it.

**Change:** `src/components/site/Preloader.tsx` and the `.tw-pre` block in `tw-chrome.css`.
The plane-in-a-chip mark and bare progress bar are replaced by a sheet of cream paper with a
torn top edge, the owner's logo above, and the site name written across it in graphite by a
pencil that rides the edge of the writing and lifts off at the end. The bar stays underneath:
it is the only honest signal that something is still loading. The logo and the name come from
the dashboard's own settings, passed down from the layout, rather than being written twice.

`MIN_MS` went from 700 to 2300 so the sentence finishes before the overlay leaves — half a
word on screen would look like a fault. That is the cost of this change: a first visit on a
fast connection waits about two seconds longer. It is paid once per visitor, never again.

**A false start worth recording:** the writing was first put into the engine's own `#loading`
overlay. That is the wrong screen — it is inside the drop-in, sits at z-index 100, and the
site header, chat widget and floating buttons all paint over it. The site's real preloader is
`.tw-pre` at z-index 200, which already covers everything. The engine's loader was left as it
was and `src/components/tw/preloader.ts` was deleted.

**A second one:** the writing animation was gated on a class React adds once the handwriting
face has loaded, to stop a cold load writing in a font that had not arrived. The overlay is in
the server HTML and starts animating before anything hydrates, so the gate held the words
clipped — invisible — until hydration caught up. Removed; with `display=swap` the name is
written in the system cursive if Caveat is late, which is the right failure.

**Verified** in the browser: on a first visit the logo, the written name and the underline all
appear with no header, footer, chat widget or floating buttons anywhere on screen, and the
overlay leaves on its own. On the next page `.tw-pre` computes to `display:none` — it does not
return, which is what was asked. At 375px the sheet is capped to the viewport and the name
still fits on one line. `tsc` clean, `npm run build` clean, perf budget within limits.

**Worth knowing for the next session:** CSS animations do not advance while the Browser pane is
hidden. Several "the animation is frozen" readings during this work were that, not the code.

## 2026-11-04 — The preloader writes letter by letter

**Task:** the writing had to look like someone actually writing, not like a reveal.

**Change:** the single left-to-right wipe is gone. `Preloader.tsx` now splits the name and
gives every letter its own moment, computed from the name itself during the render — the
overlay is in the server HTML and starts animating before anything hydrates, so the timings
have to be in that HTML. A capital takes 104ms because it is a long stroke with a lift in it,
an ordinary letter 58ms, and a space 125ms: the pen leaving the paper and coming down again.
A nine-millisecond jitter keyed off the character code gives three different letter speeds, so
no two neighbours take exactly as long. That unevenness is the whole difference — a wipe moves
at a constant speed across a word and nothing a hand does is constant.

Each letter grows from the left with a small settle at the end, because a hand never stops
dead. The pencil crosses the line on the same clock, stepped rather than glided, and its tilt
rolls across the word.

**Verified** by pausing the animations at fixed times in the browser: at 380ms "Tr" is on the
paper with the pencil forming the r; at 820ms "Trinity S" with the S half-drawn and the pencil
on it; on a normal run all 18 letters land and the underline follows. `tsc` clean, `npm run
build` clean.

**One to remember:** a `String.indexOf` anchor matched the phone override's `.tw-pre__ink{`
before the base rule and the patch ate the media query's closing brace. `tsc` does not look at
CSS and `npm run build` had been run before the edit, so nothing caught it until the dev server
threw `CssSyntaxError: Unclosed block`. Any script that edits a stylesheet should count braces
before it writes — the repair script does.

## 2026-11-04 — The preloader's name is written, not revealed

**Task:** the writing had to stop looking like a reveal and start looking like a hand.

**Three attempts, and why the first two were never going to work.** A left-to-right wipe: the
uncovering edge is a straight vertical line at a constant speed. One letter at a time: fixes
the speed, keeps the edge, so each letter arrives whole and it reads as typing. A thick brush
dragged along a wave: better front, better motion, and still wrong — a mask only moves forward,
so the bar on a T arrives with its stem, the dot on an i never gets its own trip, and the pen
never lifts. Those three things are most of what makes writing look like writing.

**Change:** `src/components/site/handwriting.ts` is a single-stroke hand — a–z and A–Z as the
route a pen takes, lowercase in as many strokes as the movement really is and capitals drawn
the way most people draw them, in separate strokes. `Preloader.tsx` lays the name out and gives
each stroke its moment; the line is drawn by growing it from nothing, so graphite appears at
the tip and nowhere else. One pencil per stroke, each riding its own stroke with `offset-path`
and visible only during it — a single pencil cannot lift, because CSS gives an element one
motion path, and lifting is the point.

Two things that were still mechanical after the strokes were right: every stroke took the same
time regardless of length, and the whole name was written in two seconds. Stroke time now comes
from an estimate of how far the pen travels — the path's numbers walked in pairs and summed,
which overcounts curves by about the same amount every time, and only the ratio matters. The
pace is about seven letters a second, which puts twenty letters at just under three seconds.

That lengthens the first visit: the loader holds for about 4.6s where it held for 0.7s before
any of this work started, and that is the real price of it — paid once per visitor and never
again. `MAX_MS` went to 5800 and the CSS fail-safe fade to 7.2s so neither can fire while the
name is still being written.

**Verified** in the browser on an ordinary first visit, not a rigged one: at ~2s "Trinity Study"
is on the paper with the pencil on the y, at ~4s the full name with the underline, and by ~6s
the loader has gone. 35 strokes for this name. At 375px the sheet still fits.
`tsc` clean, `npm run build` clean.

**Not covered:** digits and punctuation have no strokes — they advance the pen and are not
drawn. The name this was built for has none, and dropping a character beats drawing the wrong
shape, but a site name with a "&" or a year in it would lose it.

## 2026-11-04 — One loader, not three

**Task:** only the new preloader should show. "Boarding…" and the second bar had to go.

**Found:** the home page ran three loading screens back to back. The site preloader that writes
the company name; then the drop-in's own navy "Boarding…" overlay; then "Assembling the world"
over a second progress bar while the globe builds itself out of particles. There was a fourth
word too — the `.tw-host::before` panel that holds the page's height before the engine mounts
also read "Boarding…". Three loaders in a row read as a stall, not as care.

**Change:** `tw-site.css` hides `#loading` and `#introUI`, and the holding panel's `content` is
now empty. Hidden rather than cut out of `markup.ts`, which the generator rewrites on every
drop-in update; the engine still creates both and still drives them on its own schedule, so no
timing is touched — they simply never show. What fills the gap is the sky and canvas underneath,
the same navy, with the globe pulling itself together out of particles. That is the entrance the
drop-in was built around, and it is better watched than described by a percentage.

**Verified** locally on a first visit to `/`: the name is written, then the globe, then the
hero. No "Boarding…" and no second bar at any point. `npm run build` clean.

## 2026-11-04 — The footer's call-to-action band is gone

**Task:** take the "Ready to start your study abroad journey?" band out of the footer, and put
the footer right afterwards.

**Change:** the band is out of `Footer.tsx`, its rules are out of `site.css`, and the admin's
"Call-to-action band" fields are gone with it — fields that edit nothing are worse than no
fields. The five settings keys stay: every stored settings row already carries them, and
dropping a key a stored row still has is a parse failure, not a tidy-up. They are marked unused
where they are declared.

Two rules existed only to get out of the band's way on a page that ended with its own call to
action (`main:has(> .cta-block:last-child) + .footer …`); both went with it.

**The footer itself:** it used to pull 80px up under the page and keep its own first 80px
transparent, so the band sat half over the section above. With no band those two offsets only
made the columns start flush against whatever the page ended with — which is what "the footer
is stuck to the content" was. Both offsets are gone and the column grid carries 72px of its own
space at the top instead.

**Verified** at 1280px on /about-us, which ends in testimonials, and on /destinations/uk, which
ends in its own country CTA: no band, and the footer starts with room above it in both. `tsc`
clean, `npm run build` clean.


## 2026-11-04 — Home, About, Services, Events, Brochure, form and footer pass

**Task:** a run of client changes, done and pushed in `ddf6dc4`, `6dc5f97` and `cb8f07a`.

**Home (Trinity World, `src/components/tw/`):** removed the "How it works" section and the Journey step
paragraphs; step 7 gets a "Get your profile shortlist" button; "Trinity Study Abroad" yellow in the arrival
line; the hero and arrival sub-lines removed; UK graduate-route wording; "Land & settle in UK"; IELTS moved to
just above the footer; the CTA paragraph removed; "See more" under the webinar snippets goes to `/webinars`.
The credits block was removed from the home page (CC licence attribution — a /credits page is the safe home
for it, not built yet). The preloader work is the TL's, not here.

**Pages without a hero:** About, Services, Events and Brochure now open on their content. Seed and database
both changed; the first section clears the fixed header with its own padding (`#about`, `.services-sec`,
`.featcards-sec`). About has one counsellor image (placeholder `services/guidance.webp`), solid navy/gold
Mission and Vision cards, "Talk to a trusted counsellor".

**Services cards:** distinct images (three generated graphics, `public/assets/img/services/`), buttons
"Talk to our Counsellor". Spelling is "counsellor" site-wide.

**Enquiry form (`LeadForm.tsx`):** nearest-city field removed; destination is a flag listbox in the home order
(UK, Ireland, France, Germany, New Zealand, UAE, Singapore, Australia, Japan, South Korea, USA, Canada,
Malaysia, Other Europe, then the block's extras), no "Not decided yet". Icon and flag styles now cover the
standalone card, not just `.hero__form`.

**Flags:** `ae-sq.png` (UAE keeps its red band in round icons) plus `jp`, `kr`, `my`, `eu`, drawn in PIL.
Footer destinations follow the home order; the four without a page link to `/#c=<key>`.

**Database:** nothing here reaches production by pushing code. Scripts, all dry-run by default with `--apply`
and a backup in `scripts/backups/`: `remove-about-hero`, `set-about-counsellor-image`, `rename-segments-cta`,
`remove-services-hero`, `remove-events-hero`, `remove-brochure-hero`, `sync-client-content-2026-10-28`,
`add-webinars-page-2026-10-19`. Applied to production on 04/11/2026 after the user's go-ahead.

**Verified:** localhost checks in the browser pane (HTML, computed styles, DOM). The pane does not tick
animations, so loader and scroll motion were not seen. After the production writes, the live site showed the
new code but old database content until the cache was cleared: a direct write never reaches
`revalidateSite()`, so a redeploy (or saving a page in /admin) is a required last step.
