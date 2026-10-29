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
