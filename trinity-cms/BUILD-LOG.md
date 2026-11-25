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


## 2026-11-04 — Local run on a fresh clone
- Cloned, installed, seeded local DB, ran dev server. Home showed the old block hero because `world.enabled` is false after a fresh seed; ran `scripts/toggle-world-home.ts on` and restarted dev. Globe home verified at http://localhost:3000.

## 2026-11-04 — Local DB brought level with production
- Fresh seed lacked content that production got from one-off scripts. Ran against local DB: `db:reset`, `toggle-world-home on`, `apply-country-content content/client-brief` (adds Dubai/Singapore), `fix-country-content`, `sync-form-destinations`, `add-webinars-page` (/webinars + menu), `apply-about-content`, `apply-about-segments`, `apply-services-content`, `apply-service-images`, `fix-stats-suffix`, `sync-client-content`.
- Verified: nav/links match trinity123-production.up.railway.app; all main routes 200.
- Gotcha: `unstable_cache` lives in `.next`; after DB script writes, kill the dev server by PID on :3000 and `rm -rf .next` before restart. A leftover server makes new `npm run dev` exit with "already running".

## 2026-11-04 — Globe depth on wide screens
- `src/components/tw/engine.ts`: key light moved off-axis (38,22,56) and raised to 3.2, ambient 1.5→1.0, earth emissive .55→.22 → lit side + soft shadow side instead of a flat disc. `wideDist` now pulls the camera in up to 6 units when aspect > 1.8 so the globe fills ultra-wide screens.
- Checked at 2560×1080, 1920×1080, 1366×768, 375×812.

## 2026-11-05 — The chatbot was answering from a half-loaded knowledge base
Reported: a question taken straight from the client's workbook did not come back with the workbook's answer.

**What was wrong.** Production held 212 knowledge items against `src/lib/chatbot-kb.ts`'s 283, and 206 of the 212 were filed under "General". They had been loaded through the admin's Bulk Upload, which cannot carry a whole entry: `BulkRow` has no `relatedQuestions` field at all, and the client's workbook has no usable headers, so `BulkUploadKnowledge.tsx` falls back to sniffing columns and sets `keywords: -1, category: -1`. The 81 entries the generator builds from site content — the scholarship block, the Trinity-services FAQ, the eleven "key study details for <country>" rows — are not in the workbook, so that path could never have created them.

Measured by replaying the real matcher over the generated KB: an exact question resolves 283/283 either way, but alternate phrasings fall from **44/44 to 9/44** once keywords and phrasings are stripped. Of the 81 absent questions, 63 returned the unmatched message and 18 returned a different entry's answer ("Is studying abroad worth it?" → *worth the cost*; "What is the tuition fee in UK?" → *tuition fees vs living expenses*). `ANTHROPIC_API_KEY` is still unset, so no semantic pass recovers any of it.

**Why the earlier fix had never run.** `railway.json` set `startCommand: npm run start:prod`, but the service had a dashboard **Custom Start Command** — `npx prisma db push && npm start` — and that overrides the file. The schema push worked only because the dashboard line did it. Changed to `npm run start:prod`, so the repo governs the deploy again.

**The fix.** `scripts/kb-import-on-boot.mjs` (new) runs `scripts/import-chatbot-kb.ts` during a deploy when `KB_IMPORT` is `add` or `overwrite`, and does nothing otherwise — guarded because `--overwrite` on every restart would erase counsellors' admin edits. It always exits 0: a knowledge base that failed to import is a chatbot with yesterday's answers, a start command that exits non-zero is a website that is down. Wired into `start:prod`.

Ran once with `KB_IMPORT=overwrite`, then removed the variable:
```
283 in the workbook, 212 already in the database → create 81, update 200, leave 2
Done. The assistant now has 293 entries.
```
293 = 283 + ten entries that predate the workbook. Before overwriting, 200 of the 202 matched answers were already byte-identical to the workbook; the two that differed were older wording ("programs", "There isn't one best country") and now carry the workbook's.

**Verified on the live widget**, not just in the admin: *"What are the key study details for UK?"* (absent before) and *"Am I eligible for a scholarship…"* (absent before) both return their exact answer and follow-up; *"What is the tuition fee in UK?"* now reaches the UK entry instead of the tuition-vs-living one; *"Can I study in Germany after 12th?"* unchanged. Admin shows 293 and all fourteen workbook categories.

**Next time:** load the knowledge base with `KB_IMPORT`, never by re-uploading the workbook in the admin — Bulk Upload is for a counsellor adding a handful of rows, and it will silently drop keywords, categories and phrasings.

## 2026-11-05 — An admin can delete a conversation
There was no way to remove one: status could be changed and notes added, but a test run or a spam chat stayed in the list for good — which is how the knowledge-base test above became a permanent eleventh conversation. `deleteChatSessionAction` is admin-role only, the same bar as deleting a lead; the transcript and notes cascade with it, which the schema already arranged. Used it to remove the test conversation; the list is back to 9.

## 2026-11-05 — Chat matcher moved to Haiku 5.5
`claude-haiku-4-5` still serves, but it is the previous generation: 200K context at $1/$5 per MTok against `claude-haiku-5-5`'s 1M at $0.10/$0.50 — ten times the bill for a one-shot classification, for no gain.

The part that mattered more: **thinking is on by default on 5.5**, and leaving it alone would have broken the call rather than slowed it. Reasoning tokens come out of `max_tokens`, so the 60-token budget would be spent before the JSON was written, `JSON.parse` would fail, and the `catch` would return `null` — a semantic pass that matches nothing and logs nothing. It would only have surfaced once `ANTHROPIC_API_KEY` was finally set, which is the worst moment to find it. `thinking: { type: "disabled" }` is accepted at effort `high` or below, and `medium` is this model's default.

Still outstanding and not ours to do: `ANTHROPIC_API_KEY` is unset on Railway, so the semantic pass does not run at all yet.


## 2026-11-06 — High-resolution country photos on the home landing
- Replaced all 16 `public/tw/city/*.jpg` (were 1100–1200 px wide, ~100–200 KB) with 2560 px progressive JPEGs (370–840 KB), sourced from Wikimedia Commons originals of 4000–8000 px. One scenic skyline/landmark each, picked from contact sheets.
- `engine.ts`: city URL now `.jpg?v=2` because `/tw/*` is cached 30 days under the same filename; bump `v` when swapping a photo again.
- Verified on localhost: files serve at 2560 wide. Landing animation not viewed (pane does not tick GSAP).
- Photo credits (CC BY / BY-SA need attribution; no credits page exists yet):
  uk Benh LIEU SONG (BY-SA 4.0); ireland Robert Linsdell (BY 2.0); france Pierre Blaché (CC0); usa Superbass (BY-SA 4.0); australia DXR (BY-SA 4.0); canada Maksim Sokolov (BY-SA 4.0); sweden ArildV (BY-SA 4.0); uae Robert Bock (CC0); germany Nordenfan (BY-SA 4.0); nz lumoplank (CC0); singapore Marcin Konsek (BY-SA 4.0); japan David Kernan (BY 4.0); korea USAGI_POST (CC0); netherlands Basile Morin (BY-SA 4.0); malaysia James Kerwin (BY 2.0); europe (Prague) Mgimelfarb (BY-SA 4.0).
- Not committed or pushed yet.


## 2026-11-06 — Client round: Italy for Sweden, Denmark added, Dubai → UAE
- Home picker (`tw/data.ts`): Sweden replaced by Italy (same slot, after Canada); Denmark added after Other Europe. `engine.ts` STU: italy/denmark visa lines added (written from general knowledge — client to confirm), sweden removed. New photos `public/tw/city/{italy,denmark}.jpg` (2560 px; Italy Colosseum CC0, Denmark Nyhavn by-sa 4.0).
- Header Study Destinations, footer, lead form: same order (`destination-order.ts` NAV_ORDER, `LeadForm.tsx` HOME_DESTS). Sweden is hidden from those lists (its page still exists). `LABEL` shows Dubai as "UAE" in the menu/footer; the page itself is still titled Dubai.
- `seed-content.ts` country cards and `sync-client-content-2026-10-28.ts` updated the same way (Italy card, UAE name, Denmark last). The Study Destinations cards are DB content: they change on production only after the sync script is applied.
- Verified on localhost: chips, header, footer order; Denmark selection sets the new photo.

## 2026-11-06 — Client's final destination order, applied everywhere
- Order: UK, Ireland, France, Germany, New Zealand, UAE, Singapore, Australia, Japan, South Korea, USA, Canada, Netherlands, Italy, Malaysia, Other Europe, Denmark.
- Applied to: home picker (`tw/data.ts`), header + footer (`destination-order.ts`), lead form (`LeadForm.tsx`), `AGREED_ORDER` + new `inAgreedOrder()` in `content.ts` (also used by the admin Destinations list), seed cards/orders, and the `sync-client-content-2026-10-28.ts` order map + cards. Sweden is no longer in any list.
- Verified on localhost: picker chips, header menu and footer all match. Production: the Study Destinations cards and DB `order` column change only when the sync script is applied; code-driven lists change on deploy.

## 2026-11-06 — Arrival screen spacing and mobile headline
- Client: gap between "Welcome to <country>" and the headline (desktop + mobile), and ragged headline on mobile.
- `tw.css`: `.arrive .tag` margin-bottom `clamp(22px,4vh,40px)` (26px on mobile). `engine.ts`: the headline's hard `<br>` replaced by two `span.ln` blocks with `text-wrap:balance`, so each sentence wraps on its own. `tw-site.css` (this file overrides tw.css for the arrival headline): mobile size `clamp(1.55rem,7.2vw,2.6rem)`, `.inner` full width.
- Verified at 375×812 by forcing the arrival layer visible (GSAP does not run in the pane): tag-to-headline gap ~30px, text centred within the margins. Desktop gap not screenshotted.

## 2026-11-06 — 7-step path: font sizes swapped
- `tw.css` (end): `.ptxt .ptag` (e.g. "TELL US YOUR GOALS") now `800 clamp(1.3rem,2.3vw,1.9rem) Sora`; `.ptxt h3` (e.g. "Course, career, budget and destinations") now `600 clamp(1.05rem,1.45vw,1.25rem) Inter`. Applies to all 7 steps.
- Verified on localhost: 23.5px label, 16.8px detail line at the pane's width. Mobile not checked.

## 2026-11-06 — 7-step CTA wording
- `markup.ts`: `#pcta` text "Get your profile shortlist" → "Get your profile assessed". Other "shortlist" wording (step 3, outcome line) left as is.

## 2026-11-06 — Document checklist line
- `engine.ts` #kvisa: removed ". We prepare every document with you." Now "For <country> you will need: <visa>."

## 2026-11-06 — "Numbers that landed" removed from home; roadmap added to About Us
- Home: `#stats` section removed from `markup.ts`; its count-up code removed from `engine.ts`. This also removes the mobile "separate page" numbers the client flagged. Colour rhythm is now webinar BLUE, voices BLUE (two blues in a row — left as is; flip `#voices` in `tw.css` if the TL wants it alternating). The admin "Numbers — heading" setting is now dead.
- About Us: new `roadmap` block (`blocks.ts`, `Roadmap` in `blocks/Segments.tsx`, styles at the end of `site.css`), placed before the Mission / Business Segments block. Title "Personalized Guidance", 10 steps: Profile Evaluation → Test Preps → University Shortlisting → SOP & LOR Assistance → University Application Support → Scholarship Assistance → Education Loan Guidance → Student Visa Assistance → Accommodation Assistance → Pre-Departure Support. Desktop: two rows of five joined by a line; ≤1000px: one vertical rail.
- Production: `scripts/add-about-roadmap.ts` (dry run by default, `--apply`, backup to `scripts/backups/`) inserts the block into the About page DB blocks; it needs the user's go-ahead, then a redeploy.
- Verified: home DOM has no `#stats`, no console errors. Roadmap checked on a temporary static page (since removed) at 1280px and 375px. The real About page was NOT viewed: local Postgres had an orphan process and killing it was refused by the auto-mode classifier, so the local DB script was not run.

## 2026-11-12 — Full production data backup
- Added `scripts/dump-db.ts` (read-only; every table to one JSON file). Ran it on production: 11 tables, 301 KB, saved to `C:\Users\hp\Desktop\trinity-db-backups\trinity-production-2026-11-12_1120.json` (outside the repo — it holds leads and the admin user). Restore = read the JSON and write rows back; schema is `prisma/schema.prisma`.
- No `pg_dump` on this machine, hence the JSON dump. Railway-side Postgres backups not checked.

## 2026-11-12 - Footer e-mail on one line
- `tw-chrome.css`: the mailto link in `.footer__contact` is nowrap with `clamp(12px,.9vw,14.5px)` (14px under 700px). site.css lets contact lines break anywhere, which left ".com" alone. Measured 1280, 1024, 375: one line, no overflow.

## 2026-11-12 - Country name clipped on mobile (globe screen)
- Cause: `fitName()` in `engine.ts` set an inline font-size, but `tw.css` sets `#cname{font-size:...!important}`, so the shrink never applied, and it measured scrollWidth of a full-width box. Now it measures the text with a Range and sets the size with `important`. UNITED KINGDOM at 375px: 22..353 px (was 15..391).
- Checked UK only after the fix; other long names (New Zealand, Netherlands) use the same code path.

## 2026-11-12 - Dubai page renamed to UAE
- `/destinations/dubai` (URL unchanged): country name, "Study in UAE" hero, intro, visa, intakes, step title and FAQs now say UAE; real names ("Dubai airport", "Regent College Dubai") kept. Source `content/client-brief/country-dubai.json` edited the same way.
- `scripts/rename-dubai-to-uae.ts` (dry run by default, `--apply`, backup in scripts/backups/) does it on the database; applied to the LOCAL db only. Production still needs it, then a redeploy. Page title on localhost: "Study in UAE".
- The Study Destinations card still says Dubai on production until `sync-client-content-2026-10-28` is applied (seed already says UAE).

- Applied on PRODUCTION 2026-11-12 (user approved): `rename-dubai-to-uae` and `sync-client-content-2026-10-28` (9 countries re-ordered, 17 cards in the agreed order, Dubai card -> UAE). Re-runs report "already up to date". Backups: scripts/backups/dubai-to-uae-2026-11-12T06-37-41-065Z.json and before-client-content-2026-11-12T06-38-03-825Z.json (gitignored, this laptop only). A redeploy is still needed to clear the cache. `add-about-roadmap` has NOT been run on production yet.

## 2026-11-12 - UAE route and footer text
- Route: `/destinations/dubai` -> `/destinations/uae`. Code: slug `uae` in `content.ts` AGREED_ORDER, `destination-order.ts`, seed card href, sync-script order map, `country-dubai.json`; `TrinityWorldHost` SLUG override removed; `next.config.ts` 308-redirects the old URL. `scripts/rename-dubai-slug-to-uae.ts` (dry run by default, `--apply`, backup) renames the Country slug and rewrites "/destinations/dubai" links inside page blocks/settings; applied to the LOCAL db only (home + why-study-abroad links, site setting).
- Footer text: dash removed ("... countries counselling, admissions, visas and beyond."), in `settings.ts` default and by the same script for the saved `site` setting. Literal reading of the client request; an alternative is "countries. Counselling, ...".
- Checked on localhost: /destinations/uae 200, /destinations/dubai 308 -> uae, 4 links to /destinations/uae. PRODUCTION NOT UPDATED YET. Order: push code (deploy) -> run rename-dubai-to-uae (done) -> run rename-dubai-slug-to-uae --apply -> redeploy to clear the cache.

## 2026-11-12 - Footer e-mail back to full size
- My earlier fix shrank the e-mail to 12px; client wants it the same size as the other contact lines. `tw-chrome.css`: the mailto link keeps `nowrap` at the inherited 14.5px, and from 1000px up the footer grid is `1.15fr .85fr .85fr 1.5fr` so the contact column is wide enough (359px at 1280). 1000-1199px: e-mail 13.5px (column is 270px there). Under 1000px the columns are already wide enough.
- Measured: 1280 (14.5px), 1000 (13.5px), 768 and 375 (14.5px): one line, no overflow, no other footer link overflowing. Not yet pushed.

## 2026-11-12 - Destination cost cards: same three rows on every card
- `CountryPage.tsx`: `splitCost()` turns "£12,006 / year (UKVI minimum)" into the amount on one line and "per year · UKVI minimum" under it; the note line is always reserved. Works for every country (text-only, no DB change). Measured on /destinations/uk: label, amount and note sit at the same offsets (27 / 56 / 90 px) on all 5 cards, card height 135px.
- Not yet pushed.

- REVERTED the same day at the client request: `CountryPage.tsx` is back to the original cost card layout (value on one line, may wrap). The splitCost() idea is dropped.

## 2026-11-12 - Cost cards: bracketed note on its own line
- `CountryPage.tsx`: a trailing "(...)" in a cost value, e.g. "(UKVI minimum)", is rendered on a new line below the amount; everything else (fonts, card, layout) unchanged. Checked in the DOM on /destinations/uk: cards 2 and 3 read "£9,207 / year | (UKVI minimum)". Not yet pushed.

- Wording: "(UKVI minimum)" -> "(as per UKVI)" on the UK cost cards (`seed-countries.ts`; `scripts/uk-cost-note-as-per-ukvi.ts` for the database, applied locally only; production needs it plus a redeploy).

- Production check 2026-11-12: the live UK cost rows already read "(as per UKVI)" (with different figures than the local seed: £14,436 / £18,840), so `uk-cost-note-as-per-ukvi` had nothing to change there. Code deployed (e73fad6) plus a redeploy; live page shows "(as per UKVI)" on its own line.

## 2026-11-12 - Germany "Intakes & timeline" line break
- "Start 10-12 months ahead - APS and blocked account add lead time." now starts on its own line. `CountryPage.tsx`: intakes paragraph has `white-space: pre-line`; `seed-countries.ts` and `country-germany.json` hold a newline; `scripts/germany-intakes-line-break.ts` (dry run by default, `--apply`, backup) does the database. Applied locally and checked on /destinations/germany. Production: not yet.

- Same for "Work & settlement options": "After graduating you get an 18-month job-seeker residence permit, ..." starts on its own line. `CountryPage.tsx` work paragraph has `white-space: pre-line`; seed + client-brief JSON hold the newline; `scripts/germany-work-line-break.ts` for the database (applied locally and checked). Production: not yet.

- Adjusted at the client request: the break now sits right before "18-month" ("... a year. After graduating you get an" / "18-month job-seeker residence permit, ..."). Script, seed and JSON updated; local db applied and checked. Production: not yet.

- Production 2026-11-12: code e411e41/8d08d21 deployed, `germany-intakes-line-break` and `germany-work-line-break` applied (re-runs: nothing to change), redeployed to clear the cache. Live /destinations/germany shows both line breaks.

## 2026-11-12 - WhatsApp icon removed from the social rows
- `ui.tsx`: `visibleSocials()` / `isWhatsApp()` drop any WhatsApp entry from the social icons in the top bar, the header social menu and the footer (the floating WhatsApp button `.fab-wa` is on every page). Header trigger uses the same filter. No DB change: the entry stays in the dashboard list (Settings > Contact), it is just not shown here.
- Checked on localhost /about-us: top bar, header menu and footer each list Facebook, X, Instagram, LinkedIn, YouTube; `.fab-wa` still present. Contact page WhatsApp buttons are separate and unchanged. Not yet pushed.

## 2026-11-12 - Canada cost cards: smaller text, one line
- `CountryPage.tsx`, Canada only (`c.slug === "canada"`): the cost card is a size container and the value font is `min(17px, (100cqw - 6px) / 12.9)`, so it shrinks with the card and never wraps (other countries keep 19px). Measured on /destinations/canada at 1280, 1000 and 375 px: all five values on one line, no overflow (17px there; in a narrower 5-column card it scales down, about 13px at 226px).
- Code-only, no DB change. Not yet pushed.

## 2026-11-12 - Chat window (TISA) no longer slides under the header
- Cause: the panel was `100vh - 72px` tall with a 24px bottom offset, so its top edge was always 48px from the viewport top on short windows, under the fixed header (about 112-115px tall, z-index 70).
- `chat.css`: height is now `min(100dvh - 148px, 580px)` (phone: `100dvh - 140px`, 540px max) with a `vh` fallback, so the top edge stays below the header; same for the pre-chat gate card. Under 520px of window height (landscape phone) the chat takes the full height (top/bottom 8px, z-index 80) and overlays the header instead of being cut off.
- Verified with the `vh` form of the rule (the pane resolves `dvh` against its real window, not the emulated size): 1280x560 top 160 vs header bottom 110; 375x560 top 160 vs 115. Landscape 812x375 checked mid-animation only. Not yet pushed.

## 2026-11-12 — TISA launcher icon (study theme)
- Reference: Desktop/icon-AI-Assistant.svg (circular avatar, white ring, guide figure). Ours: same circular + white-ring format, study-themed.
- `AgentAvatar.tsx`: headset replaced by a graduation cap + gold tassel (viewBox 8 0 48 48 so the cap fits). `chat.css`: cap/tassel classes, removed unused headset rules.
- `ChatWidget.tsx`: gold open-book badge on the launcher (bottom-left); smaller on mobile.
- Verified on localhost (large + 54px preview). Not committed.

## 2026-11-12 — Search redirects to country page
- `search/page.tsx`: a query matching a destination (name, slug or alias like "united kingdom", "dubai", "america") redirects to its page (`/destinations/uk`; globe-only countries → `/#c=<key>`). Covers header and /search forms. Other queries show results as before.
- Verified locally: uk, United Kingdom, dubai, japan, germany redirect; "xyz" stays 200.

## 2026-11-12 — Dubai university card photos (reverted)
- Tried official/generic photos for Heriot-Watt Dubai and Middlesex Dubai; reverted at the user's request. They stay on the city fallback until the user supplies images (drop into `public/tw/uni/` + entries in `tw/uni.ts`).

## 2026-11-12 — Journey step 2 image
- 'Evaluate your profile' used an empty lecture hall. Now a CV clipboard + laptop photo (Unsplash 1586281380349-632531db7ed4, `public/tw/stu/`), via `SIMG.eval` in `tw/engine.ts`. Not committed.

- Journey step 5 ('Plan your finances and visa') had an airplane image; now documents + calculator (Unsplash 1554224155-6726b3ff858f) via `SIMG.fin`. Not committed.

## 2026-11-12 — Plane colour per country
- Cause: fixed sun + plane flying a different heading per country, so for some (Singapore) the cabin side was in shade and rendered blue/dim. Fix in `tw/engine.ts` frame(): once the camera is close (sm(.3,.55,t)), the sun is blended to a camera-relative position (upper-left, behind camera), so the plane is lit the same for every country. Checked Singapore (white now), UK/Japan/USA/Australia run without error, Australia close-up white/grey. Not committed.

## 2026-11-12 — Heriot-Watt Dubai card photo
- Used the user-supplied campus photo (new Dubai campus building) — the same shot at 1960px from hw.ac.uk, upscaled to 2560 + mild sharpen. `public/tw/uni/heriot-watt-university-dubai.jpg` + entry in `tw/uni.ts`. Middlesex Dubai still on the city fallback (awaiting image). Not committed.
- Renamed to `heriot-watt-dubai-campus.jpg` to bust browser cache (an earlier test photo had been served at the old filename).

## 2026-11-12 — Middlesex Dubai card photo
- User-supplied campus photo (447px source, upscaled to 1600 + mild sharpen — it will look soft on large cards; a bigger original would be better). `public/tw/uni/middlesex-dubai-campus.jpg` + entry in `tw/uni.ts`. Not committed.

## 2026-11-12 — Khalifa University card photo
- User-supplied campus photo (678px source, upscaled to 1920 + mild sharpen). `public/tw/uni/khalifa-university-campus.jpg` + entry in `tw/uni.ts`. Not committed.
- Khalifa card crop cut the logo: added optional `pos` (CSS object-position) per university in `tw/uni.ts`, applied in `engine.ts`; Khalifa = '6% 40%'. Verified: logo fully visible on the card. Not committed.

## 2026-11-12 — TISA avatar = supplied character image
- `public/tw/tisa.webp` (640px, head+shoulders crop of the supplied transparent PNG/WebP on a soft blue backdrop). `AgentAvatar.tsx` now renders it as an <img> (launcher + chat header); removed the vector avatar and the gold book badge (+ CSS). Verified on localhost launcher (large + 54px). Not committed.

## 2026-11-12 — IELTS section replaced by client videos
- Removed the home "Test prep · IELTS" band section (markup, engine scroll code, `#ie-also` line, tw.css rules). Added `#vids` ("Hear it straight from our team.") with 3 vertical videos (client files lv_0_*.mp4, 4K 60fps up to 845 MB) compressed to 720p30 H.264 (`public/tw/voices/voice-{1,2,3}.mp4` + poster jpgs, ~12 MB total). `preload="none"`, one plays at a time; mobile = scroll-snap row. Heading text is my guess — confirm with the client. Verified on localhost: 3 cards render, all play. Not committed.
- Settings keys `ieltsTitle/ieltsLead` and `tw-site.css` `.ie` rules are now dead.
- Video cards made smaller: max 250px wide each on desktop (was full column width), 54vw/220px on mobile scroll row. Not committed.
- Videos section redesigned (UI/UX): text column (eyebrow, heading, lead, 'Get free counselling' button) + 3 tap-to-play cards with a custom gold play button, duration chip, hover lift, centre card raised; controls only appear after first play; one plays at a time; finished clip returns to poster. <1000px: stacked, cards in a scroll-snap row. Checked at 1024 and 375 wide; play/pause logic tested. Not committed.
- Video cards shortened: aspect 9/16 -> 4/5 (240x300 on desktop, was 240x427), object-position 50% 78% so faces/sign stay in frame. Not committed.

## 2026-11-12 — Journey step 7 + life card images
- Step 7 ('Stay supported') showed the first university's campus photo (Khalifa for UAE, logo cut). Now a friendly-advisor portrait (Unsplash 1573497019940-1c28c88b4f3e, `SIMG.sup`) for every country.
- Life section first card ('Your campus · X') keeps the university photo but now applies that university's crop (`pos`), so the Khalifa logo is no longer cut. Not committed.
- Life section first card: replaced the university campus photo with a student-life photo (Unsplash 1531545514256-b1400bc00f31, `SIMG.cam`) for every country and renamed the label 'Your campus · X' -> 'Campus life · X'. Removed the crop hack added earlier for it. Verified on localhost (UAE). Not committed.
- Removed the duration chip (1:27 / 0:39 / 0:49) from the video cards (markup + CSS). Not committed.

## 2026-11-13 — Testimonials <-> videos swap (home / About)
- Home: removed the TW videos section (markup, engine, tw.css). \`page.tsx\` now renders, after the world, the home page's testimonials block ("Stories of Success", from the editor, seed as fallback) + a new \`videos\` block with the FIRST and LAST client video.
- About Us: testimonials block removed, \`videos\` block added with only the MIDDLE video.
- New block type \`videos\` (\`blocks.ts\`, \`blocks/Videos.tsx\`, \`index.tsx\`, \`.vbk*\` CSS in \`site.css\`); seed: \`aboutVideos\`/\`homeVideos\` in \`seed-content.ts\`.
- DB: \`scripts/about-swap-testimonials-for-video.ts\` (dry run default, \`--apply\`, backup). APPLIED to the LOCAL db only; production About page still has the testimonials until it is run there (then redeploy/save to clear the cache).
- Checked on localhost: home = testimonials + 2 videos, no old TW video section; About = 1 video card, no testimonials. Not committed.
- Follow-up (same day): the home page no longer shows the text testimonials (Rohan / Sharanya) — only the two STUDENT videos (first + last), headed "Hear it from our students." (kicker "Student stories"). The middle video is the FOUNDER: About page block now reads "A word from our founder." (kicker "From our founder"). Text in `seed-content.ts` (`homeVideos`, `aboutVideos`); the DB script refreshes an existing About videos block in place. Local DB re-applied; production not yet. Verified via the rendered HTML on localhost (home: 2 cards, no testimonials; About: 1 card). Not committed.
- Videos block restyled to match the site theme: it was inheriting a cream/peach look with a washed-out button. Now own classes (.vbk__*): navy gradient section like the other dark sections, white Poppins heading, gold kicker and solid gold pill button with arrow, gold-ring play button, gold border on hover, 300x375 cards (2 up) / 248px on phones. Home checked by screenshot (1x desktop), About/mobile by metrics only (no horizontal overflow, 1 card). Not committed.
- About (single founder video) layout improved: larger 380px card with a gold offset frame + glow, 'Founder's message' caption chip (hides while playing; optional `caption` per video item), bigger heading, gold rule beside the text, text/card balanced 1.05/.95; on phones the single card stacks centred (no side scroll). Local About block refreshed via the script (caption added). Checked at 1440 wide by screenshot. Not committed; production About DB not updated yet.
- About: the founder video block moved to position 2 (right after the 'About Trinity Study Abroad' intro, before the roadmap) in the seed; script `about-swap-testimonials-for-video.ts` now places it there (drops testimonials + older videos block, key-order-safe idempotent check). Local DB applied; rendered order verified (Our Story, founder, Personalized Guidance, Mission). Production not yet. Not committed.

## 2026-11-13 — Footer destinations tidy (reverted)
- Tried an even two-column pill grid and rebalanced footer columns; reverted at the user's request (`tw-chrome.css` back to the committed version). Footer destinations are as before.
- About founder block: removed the 'Tap the video to watch.' line from the lead (seed + local DB). Not committed.

- Production: `about-swap-testimonials-for-video.ts --apply` run on the production DB 2026-11-13 (testimonials removed from about-us, founder video block at position 2; backup in scripts/backups/). Deployed by the push of the same day.

## 2026-11-13 — Canada cost cards: '/ year' beside the label
- `CountryPage.tsx`: for Canada only, a trailing '/ year' or 'one-time' is moved up beside the label ('Tuition (master’s) / year', 'GIC (proof of funds) one-time'); the amount keeps the full 19px on one line (container-query cap kept as a safety net for narrow cards). 'Total year one' has no suffix. Other countries unchanged. Verified at 1440 (5 columns, all 19px, one line) and a narrower 2-column layout. Not committed.
- Same treatment for ALL destinations (not only Canada): the period ('/ year', '/ month', '/ semester', 'per month', 'one-time') sits beside the label; a trailing note like '(as per UKVI)' / '(visa minimum)' / '(permit minimum)' goes on its own line under the amount; amount stays 19px on one line and only shrinks if it would not fit (container-query cap, per amount length). Checked 13 country pages at 1440 wide in the pane: no clipping, all 19px except Sweden's total (18.3px). Netherlands and Malaysia have no cost cards in the data. Singapore health insurance still shows a euro amount (existing data). Not committed.
- Cost-card notes now sit to the RIGHT of the amount on the same line, smaller (11.5px, muted): '£9,207 (as per UKVI)'. They drop to the next line only when the card is too narrow. Card padding trimmed on the right (26 -> 22px) to give them room. At 1440 wide: UK (both), Australia fit on one line; New Zealand ('visa minimum') and Sweden ('permit minimum') still wrap to their own line. Not committed.
- Cost-card note ('(as per UKVI)' etc.) now matches the amount exactly: same 19px bold, same navy colour (it inherits the amount's style). UK: both cards fit on one line (right edge 215/251 and 224/251). Longer notes on other countries wrap to their own line when they cannot fit. Not committed.
- Fix: a cost-card note that wraps under the amount (Australia '(visa minimum)', NZ, Sweden) was indented 6px from the amount (inline margin). The value is now a flex-wrap row with column-gap 6px, so a wrapped note starts flush left with the amount (checked at 1280 wide: amount left = note left = 358px for Australia/NZ/Sweden); UK notes still sit to the right on the same line. Not committed.

## 2026-11-13 — About page (and every non-home page) had dead scroll after visiting the home page
- Symptom: open Home, then go to About Us from the menu (client-side navigation) and the mouse wheel does nothing until Ctrl+Shift+R.
- Cause: `tw/engine.ts` `suspend()` removed the gsap ticker that drives Lenis but left Lenis alive; Lenis still listens to wheel/touch and calls preventDefault on every wheel event, with nothing moving the page.
- Fix: `suspend()` now unhooks and `destroy()`s the Lenis it owns (native scrolling returns); `resume()` creates a new one (`let lenis`, shared `LENIS_OPTS`), re-attaches the ScrollTrigger sync and the ticker.
- Verified in the pane: Home -> About Us via the header link (client nav) -> wheel scrolled 0 -> 1000; browser Back to Home -> Lenis back (`lenis` class on html) -> wheel scrolled 1000 -> 1900. Not committed.

## 2026-11-13 — 'Chat with Hi, I am Tisa' on the chat launcher
- The label is 'Chat with {chatbot.name}'. Code default is 'TISA' and the LOCAL db has 'TISA', so the text 'Hi, I am Tisa' is saved in the PRODUCTION setting (chatbot.name). Added `scripts/fix-chatbot-name.ts` (dry run default, `--apply`, backup) which sets it to 'Tisa'. NOT run on production yet (needs the user's go-ahead; a production read was blocked by the safety check). Same fix is possible by hand in Admin > Settings > Chatbot > name.
- Applied on PRODUCTION 2026-11-13: chatbot.name 'Hi,  I am Tisa' -> 'Tisa' (backup in scripts/backups/). Redeploy via push of the same day so the cached setting refreshes.
- Redeploy alone did not refresh the name (Railway keeps .next/cache; the 'settings' data cache survived). Bumped the `getSetting` cache key to ['setting','v2'] in `settings-server.ts` to force a fresh read; pushed to redeploy.
- Found why production still showed 'Hi,  I am Tisa': the chatbot setting row was saved again from the admin at 08:35 UTC (2 min after my script), restoring the old name (a stale admin form). Re-applied the script at 08:46 UTC and redeployed (empty commit). The settings cache bump (v2) was not the cause but is harmless. Do not save the Chatbot settings from an admin tab that was opened before this fix.

## 2026-11-13 - Video thumbnails (client artwork)
- Posters are now the client's 9:16 thumbnails (public/tw/voices/thumb-{1,2,3}.jpg, 720x1280): thumb-1 (man) = home 1st video, thumb-3 (woman) = home 2nd, thumb-2 (founder) = About. Because the artwork has text baked in, the cards are 9:16 again (home 230x409, About 260x462; phones 225px / 250px) so nothing is cropped. The 'Founder's message' chip was removed (the thumbnail says it). Seed posters updated; local About DB refreshed; production About block still has the old posters until the script is run there. Checked at 1440 by screenshot. Not committed.
- Play button made smaller (46px circle with a 5px ring, was 70px with an 8px ring) so it covers less of the thumbnail.
- Home student section: added a third card with the new thumbnail only (`public/tw/voices/thumb-4.jpg`), shown with a 'Video coming soon' chip and no play button. When its video arrives: set `src: "/tw/voices/voice-4.mp4"` on that item in `homeVideos` (seed-content.ts) and drop the caption. The `videos` block now accepts items without `src`. Cards are max 230px wide (3 across). Not committed.
- Videos block UI/UX polish (home + About): a glass 'stage' panel groups the three cards (desktop); while one video plays the others dim (opacity .45) and the playing card gets a gold border; the play button pulses on hover; the 'coming soon' card has a bottom gradient and a centred chip with a clock icon; phone row shows position dots (active dot widens). Fixed a phone bug found while testing: the scrolling row stretched the single grid column to ~700px so the heading ran off screen (now `minmax(0,1fr)` + `min-width:0`). Checked at 1280 (stage 795px wide, cards 230x409, aligned) and 375 (heading wraps, dots, card peek). Not committed.
- Home videos: each card now has the gold offset frame (like the founder video; dashed on the coming-soon card) and the row is staggered on desktop (outer cards 16px lower, middle 16px higher). The glass panel was dropped so the frames are the only borders; cards are wrapped in `.vbk__item` for the frame. Phone: no stagger, frames offset 10px, row scrolls. Checked at 1280 and 375. Not committed.
- About founder thumbnail: the 'Founder's message' chip is back (quote icon, centred at the bottom of the card; caption chips are now centred on all video cards). Seed + local DB updated; production About block still without it until the script is run there. Checked on localhost (chip centred, 17px from the bottom). Not committed.
- Reverted at the user's request: the 'Founder's message' chip on the About thumbnail (seed, Videos.tsx quote icon, centred-caption CSS removed; local DB refreshed). Home/other changes untouched. Not committed.

## 2026-11-13 — About founder video section: UI/UX upgrade (reverted)
- Tried a gold heading word, a 'Watch the message' button and a facts row (1982 / 39+ / 1200+); reverted at the user's request (block fields, component, seed and CSS back to the previous state; local About data refreshed). The About founder section and the home student section are as before.
- Applied on PRODUCTION 2026-11-13 (about-us founder video block refreshed: poster thumb-2.jpg). Redeployed by the push of the same day (page data is cached).

## 2026-11-13 — About founder video invisible on phones
- Cause: on <=1000px the video grid has `grid-template-columns:none!important` + `justify-content:start` (made for the scrolling multi-card row). For the single About card the column was auto-sized from the card's content (an aspect-ratio box whose children are absolutely placed), so the card collapsed to 2px wide x 4px tall — nothing visible. (Measured on a 375px viewport: card 2x4.) It came in with the push of the single-video layout; the earlier phone fix had been reverted together with the 'upgrade' undo.
- Fix (CSS only, `site.css`): on <=1000px `.vbk--single .vbk__grid--1{grid-template-columns:minmax(0,1fr)!important;justify-content:stretch;width:min(76%,260px)}`. Now 249x442 on a 375px phone, no horizontal overflow. No DB change. Not committed.

## 2026-11-13 — Resources: Webinars + Events merged, Brochure removed
- New page `/webinars-events` ("Webinars & Events"): hero (crumb/ghost/sub reworded), the webinar gallery (the real past sessions kept), what the events are, the register-interest form and the call to action. Resources menu now has one item, "Webinars & Events" (Resources itself links to it); no Brochure.
- Removed pages: `webinars`, `events`, `resources`, `brochure`. `next.config.ts` 308-redirects /webinars, /events, /resources and /brochure to /webinars-events so old links keep working. The home webinar section's "See more" link points to the new page.
- Code: `seed-content.ts` (resources/brochure blocks removed, events blocks + hero + webinar gallery = `webinarsEventsBlocks`, seed page list), `settings.ts` default nav, `Header.tsx` comment, `tw/markup.ts` link, `next.config.ts`.
- DB: `scripts/merge-webinars-events.ts` (dry run default, `--apply`, backup; key-order-safe idempotent check). APPLIED to the LOCAL db; production still has the old pages/nav until it is run there (then redeploy).
- Checked on localhost: /webinars-events 200 with hero, Knowledge Hub, events, form and CTA sections; the 4 old URLs answer 308; the menu shows only "Webinars & Events". Not committed.
- Applied on PRODUCTION 2026-11-13 (merge-webinars-events.ts); deployed by the push of the same day.
- Resources dropdown with a single child ('Webinars & Events') was a big 240px panel; now it shrinks to its content (menu 189x50 instead of ~268x70: width max-content, panel padding 6px, item padding 7px 14px, radius 11, no wrap). Menus with several children are unchanged. `Header.tsx` only. Checked at 1280. Not committed.

## 2026-11-13 — MBBS sub-tab under Study Destinations > Other Europe
- Hovering (or keyboard-focusing) "Other Europe" in the Study Destinations menu opens a small gold-bordered panel beside the row with "MBBS" -> /mbbs. The row shows a › arrow. It sits inside the menu box over the next cell (so the menu's scroll container does not clip it); it covers part of the Denmark cell while open. On phones "MBBS" is listed indented under Other Europe in the Study Destinations panel.
- Code: `destination-order.ts` (optional `sub` per destination, `SUB.europe`), `Header.tsx` (desktop flyout + phone sub-link), `tw-chrome.css` (.cv-dsub*, .mm-sub). The footer ignores `sub` (unchanged).
- New page `/mbbs` ("Study MBBS Abroad"): hero, "MBBS Abroad, Step by Step" (5 cards), register-interest form, call-to-action. No fee/rule/recognition claims on purpose (they vary by country and change); editable in /admin. Seed: `mbbsBlocks` + `seedPages`; DB: `scripts/add-mbbs-page.ts` (dry run default, idempotent, never overwrites an existing page). APPLIED to the LOCAL db only.
- Checked on localhost: real hover on Other Europe shows the MBBS panel; /mbbs 200 with all four sections. Phone-menu rendering checked in the HTML only. Not committed; production still needs the script (then redeploy).
- MBBS sub-tab reworked at the user's request: instead of a flyout beside the row (it covered Denmark), "MBBS" now slides DOWN under "Other Europe" (the sub-row is part of the row's own cell: collapsed to 0, expands to ~40px on hover/focus with a gold left rule; the › arrow turns down). Grid cells align to the top so Denmark is not stretched. Menu grows ~48px at the bottom while open; no scrollbar. `tw-chrome.css` only. Measured with a real hover at 1280: Other Europe cell 55 -> 103px, Denmark stays 55px at the same top, sub-row 40px, opacity 1. Not committed.
- MBBS sub-row restyled ("ui not good"): it is now built like a country row — gold round badge (stethoscope/doctor icon), "MBBS" + one-line tag "Study medicine abroad", a → that nudges on hover — in a soft gold card, hanging off "Other Europe" with a small gold elbow connector. Slides down on hover/focus; `Header.tsx` (sub-row markup), `destination-order.ts` (`tag` on the sub-tab), `tw-chrome.css`. Measured with a real hover at 1280: Other Europe cell 55 -> 113px, Denmark unchanged (55px, same top), sub-row 51px, menu bottom 563 (viewport 800), no scrollbar (it would start to scroll on viewports shorter than ~600px). Not committed.
- MBBS sub-row: right side of the pill was cut (it ran 4px past the cell: the one-line tag is nowrap and the row was ~10px too wide for the cell, and the hover nudge pushed it further under overflow:hidden). Fixed: item margin 40/6px, smaller badge (24px) and tag (10.5px), flexible text with ellipsis as a safety net, removed the hover translate. Measured with a real hover at 1280: item right edge 7px inside the cell, no clipping, tag not truncated. `tw-chrome.css` only. Not committed.
- Applied on PRODUCTION 2026-11-13: `add-mbbs-page.ts --apply` (created /mbbs). Production kept serving a cached 404, so a redeploy (push of this note) was needed.

- Applied on PRODUCTION 2026-11-13: `hide-social-link.ts twitter --apply` (the TL's change f8222ba had only been applied to the local database): X (Twitter) is now hidden in the production contact setting; redeployed by the push of the same day so the cached setting refreshes.

## 2026-11-13 — About Us: "right direction" highlighted
- The About intro block now supports `[phrase]` in a paragraph (rendered as `<mark class="hl">`: bold navy over a gold marker stroke; `blocks/Home.tsx` `marked()`, `mark.hl` in `site.css`). The third paragraph reads "The [right direction] depends on…" (seed + local DB). `scripts/highlight-about-right-direction.ts` (dry run default, backup, idempotent) does the DB part. APPLIED to the LOCAL db only; production needs the script run there and a redeploy. Checked on localhost: bold navy with the gold stroke under "right direction". Not committed.
- Highlight restyled at the user's request: no yellow background any more, just bold navy (`mark.hl{background:none;color:var(--navy);font-weight:700}`). Verified on localhost (bgImage none, weight 700). Not committed.
- About founder block: 'Founder' capitalised in the kicker ("From our Founder"), heading ("A word from our Founder.") and lead ("…in the Founder's own words."). Seed + local DB. No new content added yet: the Founder's name/title/message have not been supplied and are not invented. Not committed.

## 2026-11-13 — About: Founder video moved under Mission & Vision
- Order is now: About intro, Personalized Guidance (roadmap), Our Mission & Vision (+ Business Segments, one `segments` block), **A word from our Founder**, What We Offer, Learning Journey. The video block sits right after the `segments` block (the block that holds Mission & Vision; it also contains Business Segments, so the Founder section comes under both). Seed order + `about-swap-testimonials-for-video.ts` (places it after `segments`, falls back to after the intro). LOCAL db applied and verified in the page; production still has it at position 2 until the script is run there and redeployed. Not committed.
- Refinement (same day): the Founder's video now sits between "Our Mission & Vision" and "Our Business Segments". To make that possible the single `segments` block was split in two: (1) heading + the two pillars, (2) no heading, the three Business Segments logos + the "Talk to a trusted counsellor" button. `Segments.tsx` now renders its heading only when it has text; seed order updated; `about-swap-testimonials-for-video.ts` splits the stored block (when still combined) and places the video after the pillars block (idempotent). LOCAL db applied; page order verified in the browser: about, roadmap, Mission & Vision (2 pillars), Founder (video), Business Segments (3 logos + button), offer, journey. Production not yet (script + redeploy). Not committed.
- Applied on PRODUCTION 2026-11-13: about-swap-testimonials-for-video.ts (Founder block split/placed under Mission & Vision, capitalised) and highlight-about-right-direction.ts. Note: production's About page has no roadmap block yet (add-about-roadmap.ts was never run there). Deployed by the push of the same day.

## 2026-11-13 — "How your journey works": client illustrations (tried, then reverted)
- Seven client illustrations were tried on the 7 steps in several ways (circle crop with nudged positions, whole picture + blurred fill, rounded frame, square extension, edge-colour extension). The user rejected each; everything was reverted to the committed state (`engine.ts`, `tw.css` and the generated `journey-*` files removed). The steps use the earlier photos again. The wide pictures cannot fill a circle without cropping, an artificial fill or a different shape; the clean option is 1:1 (square) versions from the client.

## 2026-11-13 — "How your journey works": the client's own circle artwork
- The client generated the seven pictures as circles (1254x1254, cream square with a gold ring). Sent in reverse order: file 158 = step 1 ... 152 = step 7. Each was cropped to just inside the gold ring (ring found by scanning for gold pixels along 180 rays; the hand-drawn ring is wobbly, so one fixed radius of 567px from a fitted centre, ~6px inside the thinnest part) and resized to 1000x1000: `public/tw/stu/journey-1..7-circ.jpg`. The page's circular disc (object-fit cover) then shows exactly that circle: no crop of the artwork, no gap, no ring remnants. `engine.ts` `pImgs` -> these files, same for every country; `tw.css`: the disc's dark inner shade is dropped for this section. Checked at 375 (step 1: both people and the globe, circle full).
- Earlier attempts (crop, blur fill, frame, extensions) were reverted; the sources of the earlier 7 landscape pictures are no longer used. Not committed.

## 2026-11-16 — About Us: "Get free counselling" opens a popup form
- Client: on the About page the counselling CTAs must open a form, not go to the contact page.
- `components/site/CounsellingPopup.tsx` (new, client): one capture-phase click listener catches `main a.btn` / `main a.vbk__btn` pointing at `/contact-us`, opens a dialog holding the site's own `LeadForm`. The buttons stay plain links, so JS-off and open-in-new-tab still work, and a modified/middle click is left alone. Escape, backdrop click and the × close it; focus returns to the button; the page behind does not scroll.
- Covers every counselling CTA while that page is open, phone included: "Get free counselling" (Founder video), "Talk to a trusted counsellor" (Business Segments), "Learn More" (intro), and "Free Counselling" in the header and in the phone menu (selector `a.btn, a.vbk__btn` pointing at /contact-us). The click still bubbles, so the phone menu closes itself behind the dialog. Left as links: the "Contact" menu item, the header phone button and the three "Explore" cards (`a.ocard`) in the solutions section.
- `LeadForm` gained an optional `source` prop (default "home-enquiry"); the popup sends `about-popup`, so these leads are told apart in the dashboard.
- Mounted in `app/(site)/[slug]/page.tsx` only when `slug === "about-us"`. CSS `.cpop*` in `site.css` (navy card like `.leadcard`, 440px desktop / 325px phone, scrolls inside on short screens).
- Verified on localhost: click keeps the path at /about-us and opens the dialog; Escape closes; a real submit reached the database with source `about-popup` (test row); other pages carry no popup markup; phone 375 shows the card at 325x474 with no horizontal overflow. Not committed.
- Phone checked with real taps at 375: the in-page button, the header button and the phone-menu button all open the dialog and keep the path at /about-us (the menu closes with it); on other pages the header button still goes to the contact page.

## 2026-11-16 — Home preloader: logo and written name resized
- The first-visit preloader (cream sheet, mark, hand-written company name) had a 42px logo beside a 600px line of writing: the mark's own lettering was unreadable and the name dwarfed it.
- `tw-chrome.css`: `.tw-pre__logo` height `clamp(30px,4.4vw,42px)` -> `clamp(52px,7vw,76px)` (opacity .92 -> .95); `.tw-pre__sign` width `min(74vw,600px)` -> `min(66vw,520px)`, phone `86vw` -> `78vw`. The writing is an SVG, so its stroke scales with it — nothing else to change.
- Measured on localhost: desktop logo 69x44 -> 117x74, name 602x117 -> 522x101, sheet 647px wide; phone (375) logo 85x54, name 294x57, sheet 340px, no horizontal overflow. A real first-visit run still shows and fades normally (logo 72px at 1.3s). Not committed.
- Follow-up: the client called the preloader's lettering and mark "not professional". Redesigned rather than resized: the sheet of paper, the torn edge, the hand-written name (Caveat strokes + pencil) and the 5.2s wait are gone. It now shows the mark on its white tile, the company name in the site's own heading face (Poppins, uppercase, .3em tracking), a short gold rule, the tagline and the gold sweep bar — the brand as it appears everywhere else — and leaves after 1.5s (fail-safe 4s, was 5.8s). `Preloader.tsx` rewritten (takes `tagline` from site settings; `layout.tsx` passes it), `.tw-pre__*` rules in `tw-chrome.css` replaced. `handwriting.ts` is now unused — delete it once the client has signed off. Measured: desktop logo 96x60 on a 146x95 tile, name 404x36; phone (375) logo 74x46, name 260x26, no horizontal overflow. Backups of the previous versions kept at /tmp/Preloader.bak.tsx and /tmp/tw-chrome.bak.css for this session. Not committed.
- Timing, measured after the client said it took too long. Two faults, both fixed in `Preloader.tsx`:
  1. It waited for the window `load` event. On the home page that waits for the four 4K globe textures and the 4 MB aircraft model — measured on production: `loadEventEnd` at **16.7s**. The old MAX (5.8s, counted from hydration) was what actually ended it, so the overlay sat for ~6-7s.
  2. MIN/MAX were counted from when React mounted, not from when the browser started on the page — but the overlay is in the server HTML and has been on screen since the first paint. On a cold dev load that measured **15.4s** before it left.
  Now both are measured against `performance.now()` (time since navigation): MIN 1.2s, MAX 2.6s, fade 0.6s -> 0.45s, CSS fail-safe 7.2s -> 3.4s. Measured on localhost after the change: fade begins at 2.1s, screen clear by ~2.6s, and the overlay stops rendering by 3.4s even if JavaScript is starved (the dev build's 3D engine blocks the main thread, which is why the DOM cleanup lags — it is invisible and non-interactive by then). Not committed.

## 2026-11-16 — Footer credit: "Powered by Techinfinity" missing on localhost
- Not a bug in the code: the credit is a stored setting. Production had been changed (through /admin) to "Techinfinity" -> https://www.techinfinity.io/, while the local database still held the October value "Itarsia India Limited" -> https://www.itarsia.com/, so localhost rendered the old name.
- `scripts/set-powered-by.ts` (dry run default, `--apply`, backup, idempotent) sets `footer.poweredByText/Url`; applied to the LOCAL database. The code default in `settings.ts` was updated to match, so a fresh seed no longer reintroduces the old credit. Production already correct — nothing to run there.
- Verified after a dev restart: localhost and production both render `Powered by <a href="https://www.techinfinity.io/">Techinfinity</a>`. Not committed.

## 2026-11-16 — Footer "Powered by" credit removed (client request)

- `src/lib/settings.ts`: `footer.poweredByText` / `poweredByUrl` defaults are now empty strings. `Footer.tsx`
  already renders the credit only when the text is set, so an empty value removes the line — no markup change.
- `scripts/set-powered-by.ts`: now syncs a database's stored `footer` credit to the code default instead of a
  hardcoded name, so running it with the empty default clears the saved value (put a name back in `settings.ts`
  and re-run to restore one). Dry run by default, `--apply` to write, old value backed up to `scripts/backups/`.
- Applied to the local database and verified: the footer bottom bar now shows the copyright line only.
- Production still has "Techinfinity" saved in its `footer` setting; the stored value wins over the code default,
  so production needs `scripts/set-powered-by.ts --apply` against its database plus a redeploy.

## 2026-11-16 — Boarding pass: London shows LGW instead of LHR (client request)

- `src/components/tw/boardingPass.ts`: the UK ticket's airport code is now `LGW` (Gatwick). The client read
  `LHR` as Lahore — Lahore's code is `LHE`, one letter away — so London now uses the airport whose code nothing
  else looks like. City, flight number and gate are unchanged; no other destination touched.
- Verified on localhost: with the route set to "MUMBAI → UK" the pass reads `LGW` / "London, UK".

## 2026-11-16 — Cost cards: "(visa minimum)" shortened to "(visa min)" (client request)

- `src/lib/seed-countries.ts`: Australia's and New Zealand's living-expenses rows now read "(visa min)".
  The full phrase wrapped onto a second line in the cost card ("AUD 29,710" / "(visa minimum)"); the card's
  value is a flex row of nowrap chunks, so the shorter word fits beside the figure.
- `scripts/shorten-visa-minimum.ts` (new): makes the same replacement in the `Country.cost` rows of a
  database, for every country that has the phrase. Dry run by default, `--apply` to write, old rows backed
  up to `scripts/backups/`, idempotent.
- Applied to the local database and verified on /destinations/australia: one line (25px, 1.00 lines) at
  desktop and at 375px.
- Production needs the same script plus a redeploy — the figures live in its database, not in the code.

## 2026-11-17 — Home-page changes of the day undone (client request)

- Reverted: preloader waiting for full `load` (`f6a7552`, reverted by a new commit as it was already pushed),
  and the four window-shade / GPU-memory / cabin-pre-paint commits (never pushed; dropped from `main`).
- `main` is back to the state of `142b3e2` (cost cards "(visa min)"): preloader leaves at 1.2s minimum / 2.6s
  cap, globe intro unchanged, cabin and window CSS as the drop-in ships them.
- Nothing lost: the dropped commits are on branch `wip/home-page-nov17` (tip `816cdb0`), the earlier globe-intro
  speed-up is on `wip/globe-intro`. Not deployed: the revert commit is local until pushed.

## 2026-11-17 — South Korea destination page added (client document)

- Source: the client's Google Doc, tab "South Korea" (the doc has only this tab's content for the link given).
  It is one country, `/destinations/south-korea`; there was no South Korea page before — the menu and the home
  globe sent it to `/#c=korea`.
- `src/lib/seed-countries.ts`: new `kr` entry (order 120) with the document's text — intro (3 paragraphs), 4 stats,
  5 reasons, 13 courses, visa, intakes, cost rows, admission requirements, scholarship, 4 visa steps, work text +
  4 part-time points, 2 FAQs, SEO description. `CountrySeed` gained optional `seoTitle` / `seoDesc`. A freshly
  seeded database gets the page too.
- `scripts/add-south-korea-page.ts` (new): creates the country in a given database. Dry run by default, `--apply`
  writes, idempotent (does nothing if `kr` / `south-korea` exists, so /admin edits are never overwritten).
  Applied to the local database only.
- Links that used to treat Korea as globe-only now go to the page: `src/lib/destination-order.ts` matches the
  agreed-order key `korea` to the `south-korea` row (otherwise Korea would have appeared twice in the menu and
  footer); `TrinityWorldHost.tsx` maps globe key `korea` to `/destinations/south-korea` and drops it from NO_PAGE;
  the search aliases `korea` / `south korea` go to the page.
- Layout conventions applied to the document's wording (content itself unchanged): periods written as `/ year`
  so the cost cards keep their one-line amount ("annually" would have made the amount shrink); "Tuition" split
  into Tuition (UG) and Tuition (PG) rows; trailing "/" removed from intakes; visa paragraphs joined with a space
  (that field renders as one paragraph); page title written without "| Trinity Study Abroad" since the layout
  appends it.
- Verified on localhost: page 200 with every section populated; title correct; 6 menu/footer links to the page and
  none to `/#c=korea`; `/search?q=korea` and `?q=south korea` redirect to it.
- To confirm with the client: (1) hero tagline "Sustainability leaders" is what the doc says but is also Sweden's;
  (2) the stat says intakes "Mar / Sep" while the Intakes section says "Jan / Mar / Sep"; (3) the visa section
  and the intro are kept verbatim, including "Upto" and "Eastern Asia"; (4) no universities were listed, so the
  university gallery is empty (same as Sweden); (5) the doc may have more tabs — only this one was shared.
- Production: not applied. Needs the script run against the production database plus a redeploy (and these
  commits pushed, for the menu / globe / search links).

## 2026-11-17 — Fix: duplicate React key `south-korea` in the header menu

- Symptom: console error "two children with the same key `south-korea`" at `Header.tsx:87`; South Korea was
  listed twice (6 links on the home page instead of the usual 3 per country).
- Cause (mine, from the South Korea page change): `navDestinationsBase` first walks the agreed order, where
  the key is `korea`, and now matches the `south-korea` row to it. Its second loop adds rows "not in the
  agreed order" by checking the row's *slug* against that list — `south-korea` is not in it, so the row was
  added a second time.
- `src/lib/destination-order.ts`: a `used` set of the slugs already placed; the second loop skips them.
- Verified: home page has 3 `/destinations/south-korea` links, same as Australia and Singapore; a fresh
  browser tab loads the page with no console errors. (A long-lived tab keeps showing the old errors in its
  console history — open a new tab to judge.)

## 2026-11-17 — Netherlands destination page added (second tab of the client document)

- Source: the same Google Doc, tab "Netherlands". Page: `/destinations/netherlands` (it was globe-only before).
- `src/lib/seed-countries.ts`: new `nl` entry (order 130): intro, 4 stats, 4 reasons, 6 courses, visa, intakes, 4 cost
  rows, requirements, 4 visa steps, work text, 6 FAQs, SEO description. `sch` and `workPoints` are empty because the
  document has none (its scholarship table is blank) — the page hides the Scholarships section and its jump-nav
  entry when `sch` is empty, and shows the work paragraph without bullets.
- `scripts/add-south-korea-page.ts` renamed to `scripts/add-country-pages.ts` and made to cover both new pages
  (`kr`, `nl`, or pass codes); still dry run by default, `--apply` writes, idempotent per country. Applied locally:
  `kr` already existed, `nl` created.
- `TrinityWorldHost.tsx`: `netherlands` removed from NO_PAGE so the globe links to the page. The menu, footer and
  search already resolve it by slug (`netherlands` is both the agreed-order key and the page slug), so no
  duplicate entry like the South Korea one.
- Wording: same conventions as South Korea — list numbering/bullets dropped, trailing punctuation fixed, living
  expenses tidied to `Euro 15,000 / year (updated: €17,000 / year)` so the cost card can read the period and put
  the note on its own line, title without the "| Trinity Study Abroad" suffix.
- Verified on localhost: page 200, every section populated, title correct, 3 menu/footer links (same as other
  countries), none left to `/#c=netherlands`, `/search?q=netherlands` redirects to it, fresh tab has no
  console errors.
- For the client to confirm: (1) the first intro sentence in the document is spliced with the third paragraph
  ("…English Educational opportunities of the highest standards and a multicultural population. speaking
  population in Europe…"); it was restored to "Country with one of the highest English speaking population in
  Europe (above 90%)." — an inference; (2) hero tagline "PR-friendly pathways" is Canada's, as the Korea tab's
  was Sweden's; (3) the stat label "PGWP" is the Canadian term (the page text says Post-Graduation Work Permit);
  (4) the Intakes text says "Feb" while the other months are spelled out; (5) tuition and total rows carry no
  "/ year" in the document, so none was added; (6) no universities and no scholarships were supplied.
- Production: not applied. Needs `scripts/add-country-pages.ts` against the production database (creates both
  `kr` and `nl`), the commits pushed, and a redeploy.

## 2026-11-17 — Italy page updated from the client document (third tab)

- Source: the same Google Doc, tab "Italy". Unlike South Korea and the Netherlands, Italy already had a page, so this
  is an update, not an addition.
- What changed against the stored page (9 fields): hero tagline -> "Arts & architecture; Fashion & Design";
  stats (first label now spells out the institution types; fourth stat, see below); reason 2 now says "Fashion";
  new course "Medicine & Health"; cost: public tuition "€900 – €4,000+", private tuition up to "€30,000+" (was €20,000),
  living expenses "€13,000+ / year" (was €7,000 – €12,000), total "€9,000 – €30,000+"; requirement "Documents" now
  starts "University pre-enrolment"; new scholarship "MAECI Scholarship (Italian Government Scholarship)"; two FAQ
  answers reworded (learning Italian; Italy's fields). Intro, intakes, steps, work text and points were already identical.
- `src/lib/seed-countries.ts`: the `it` entry carries the new wording (a fresh seeded database matches).
- `scripts/update-italy-page.ts` (new): lists the fields that differ (dry run by default), `--apply` writes them with the
  old values saved to `scripts/backups/`. It writes content fields only — not image, order, active flag, SEO or
  universities — and is idempotent. Unlike the add-* scripts it does replace /admin edits to those fields, so it is
  to be run only to take the document's wording. Applied to the local database.
- Fitted to the layout rather than copied: the document's fourth stat is two ranges on two lines ("€161 to €4,000 per
  year / €3,800 to €38,000+ per year", labelled public / private) which overflowed the stat card to four lines and past
  its edge. It now shows the two ends, "€161 – €38,000+", labelled "Tuition / year, public to private universities";
  the per-type figures are in the cost cards. The document's note on the visa and permit fees ("approximately €166.46
  to €176.46, about ₹17,650 to ₹18,700") sits in the visa paragraph, since a cost card has no room for a sentence.
- Verified on localhost: hero with tagline and four stats inside their cards, new cost figures, MAECI scholarship, the
  Medicine & Health course, the visa note, no horizontal overflow, fresh tab with no console errors.
- To confirm with the client: (1) the document's public-tuition stat starts at €161 but its cost card says €900 –
  €4,000+; (2) "University pre-enrolment" (the old text and the visa steps say Universitaly); (3) the long first stat
  label is kept as written; (4) the document says "Fashion" in the second reason, capitalised mid-sentence; (5) SEO
  title and description are the same as the page's defaults, so they were not stored.
- Production: not applied. Needs `scripts/update-italy-page.ts --apply` against the production database (after a
  dry run to see what production currently holds), then a redeploy.

## 2026-11-17 — Japan destination page added (fourth tab of the client document)

- Source: the same Google Doc, tab "Japan". Page: `/destinations/japan` (it was globe-only before).
- `src/lib/seed-countries.ts`: new `jp` entry (order 140): intro (2 paragraphs), 4 stats, 7 reasons, 6 courses, visa,
  intakes, 5 cost rows, requirements, 2 scholarships (JASSO, university), 5 visa steps, work text + the part-time point,
  2 FAQs, SEO description. `scripts/add-country-pages.ts` now defaults to `kr`, `nl`, `jp`; `TrinityWorldHost.tsx` no
  longer lists `japan` in NO_PAGE, so the globe links to the page. Menu, footer and search resolve it by slug
  (`japan` is already the agreed-order key) — 3 menu/footer links like every other country, none left to `/#c=japan`,
  `/search?q=japan` redirects to it.
- Wording: same conventions as the earlier tabs. The visa field is one paragraph, so the three bullet lines (undergraduate /
  master's / language-school validity) are folded into it with full stops. Periods written as "/ year", "per month".
- Layout fix found while verifying: the total row's note "(21,00,000 to 47,00,000 annually)" was cut off at the card's edge
  ("annu"). "annually" is dropped — the card already says "/ year" — so the note reads "(21,00,000 to 47,00,000)" and fits.
  No cost card or stat is clipped now; the fourth stat ("¥10,00,000 - ¥18,00,000") wraps onto two lines inside its card.
- Verified on localhost: page 200 with every section filled, title correct, fresh tab with no console errors, no
  horizontal overflow.
- For the client to confirm: (1) hero tagline "Sustainability leaders" is Sweden's — it was on the South Korea tab too, so
  it looks like a copied template line; (2) the visa-fee row ends "¥30,000 (" — an unfinished bracket, shown as "¥30,000";
  (3) the total's second range has no ¥ sign in the document; (4) the stat says 5 universities; no university list
  was supplied, so the gallery is empty; (5) "Sep / April" mixes an abbreviated and a full month, as written.
- Production: not applied. `scripts/add-country-pages.ts` (creates `kr`, `nl`, `jp`) against the production database,
  `scripts/update-italy-page.ts`, the commits pushed, and a redeploy.

## 2026-11-17 — Malaysia destination page added (fifth tab of the client document)

- Source: the same Google Doc, tab "Malaysia". Page: `/destinations/malaysia` (it was globe-only before).
- `src/lib/seed-countries.ts`: new `my` entry (order 150): intro (3 paragraphs), 4 stats, 6 reasons, 7 courses, visa, intakes,
  6 cost rows, requirements, 1 scholarship, 5 visa steps, work text (3 paragraphs), SEO description.
  `scripts/add-country-pages.ts` now defaults to `kr`, `nl`, `jp`, `my`; `TrinityWorldHost.tsx` NO_PAGE is down to `europe`,
  so the globe links to the page. Menu, footer and search resolve it by slug: 3 menu/footer links like every other country,
  none left to `/#c=malaysia`, `/search?q=malaysia` redirects to it.
- The document has an "FAQs" heading with no questions under it, so `faq` is empty and the page omits the section and its
  jump-nav entry; `workPoints` is empty too (none given), so the work section is the three paragraphs only.
- Reshaped to fit the cost cards, wording unchanged: the two-line tuition (UG / PG, "Malaysian Ringgit") and two-line visa
  cost (SEV / eVAL) are one row each, with "Malaysian Ringgit" written "MR" (the document's own abbreviation elsewhere) so
  the amounts keep their full size; "13,000 – 17,000 / year MR" reads "MR 13,000 – 17,000 / year".
- Verified on localhost: page 200, title correct, fresh tab with no console errors, no horizontal overflow, no clipped
  card, cost cards read cleanly (long eVAL label wraps to two lines).
- For the client to confirm: (1) hero tagline "PR-friendly pathways" is Canada's — it has now come up on the Netherlands and
  Malaysia tabs; (2) the stat "PGWP / 3 yrs" disagrees with the work section ("1-year Graduate pass"), and PGWP is the
  Canadian term; (3) "Minimum entry criterias" is the document's spelling, kept; (4) the FAQ section was left empty in the
  document; (5) no universities were supplied (the stat says 45+), so the gallery is empty.
- Production: not applied. `scripts/add-country-pages.ts` (creates `kr`, `nl`, `jp`, `my`) and `scripts/update-italy-page.ts`
  against the production database, the commits pushed, and a redeploy.

## 2026-11-17 — Denmark page updated from the client document (sixth tab)

- Source: the same Google Doc, tab "Denmark". Denmark already had a page, so this is an update (like Italy).
- The document reflects a rule change — the 3-year establishment card became a 1-year job-search permit — and new
  DKK figures. Changed against the stored page (8 fields): stats (job-search permit "Upto 1 year, for applications after
  October 1, 2026" replaces "3 yrs Establishment card"; intakes "Aug / Sep & Jan / Feb"; tuition; the first label spells
  out the 8 research universities / 35+ institutions); reason 1 and reason 3; the visa paragraph; cost (living expenses
  DKK 89,112, proof of funds DKK 7,426 per month, permit fee DKK 3,060 ≈ €410; the document's standard / specialised
  tuition ranges); requirement "Funds"; work text ("1 year") and bullets; and the FAQ "What is the establishment card?" is
  gone because the document no longer has it.
- `scripts/update-italy-page.ts` renamed `scripts/update-country-pages.ts` and made to cover `it` and `dk` (or pass codes):
  dry run by default, `--apply` writes the content fields only with the old values backed up, idempotent per country,
  and it replaces /admin edits to those fields. Applied locally: Italy already matched, Denmark updated.
- Fitted to the layout rather than copied (wording kept): the document's stats are sentences and double ranges; the stat
  card shows "DKK 45,000 – 260,750+", and the standard / specialised tuition ranges are cost rows. The long explanations
  (living costs "for a full 12-month period…", the permit fee "processed through SIRI") sit in the visa paragraph. The ₹
  range and the word "approximately" ride in their row labels — as value + note they were cut off at the card edge,
  which a fresh-tab check caught. The document's work bullet "20 hrs/week; full time in summer (September to May (Term
  Time): … 90 hours per month." runs two bullets together with unbalanced brackets; it is split in two, words unchanged.
- Verified on localhost with a fresh tab: no console errors, no horizontal overflow, no clipped card, the SIRI note and
  the term-time bullets present, three FAQs, no mention of the establishment card. (The long-lived tab's console history
  shows old HMR / duplicate-key messages from before earlier fixes — judge by a new tab.)
- For the client to confirm: (1) the "Job-search permit" label was written as "Job-search permit — for applications after
  October 1, 2026": the document gives only "For applications after October 1, 2026" as that stat's label; (2) the document
  lists "₹6,62,000 to ₹17,65,000" for the standard tuition with an unmatched bracket in the source; (3) the stat for
  intakes calls Aug / Sep and Jan / Feb "Main / Minor" while the Intakes text says September main, February limited;
  (4) no universities were supplied.
- Production: not applied. `scripts/add-country-pages.ts` (creates `kr`, `nl`, `jp`, `my`) and
  `scripts/update-country-pages.ts` (updates `it`, `dk`) against the production database — dry runs first — the commits
  pushed, and a redeploy.

## 2026-11-17 — Doc pages pushed and applied to production; full-stop convention

- Pushed the commits for the six client-document tabs (South Korea, Netherlands, Japan, Malaysia new; Italy, Denmark
  updated) plus the menu / globe / search link changes, and ran the scripts against the production database:
  `add-country-pages.ts --apply` created `kr`, `nl`, `jp`, `my`; `update-country-pages.ts --apply` updated `it`, `dk`
  (old values: `scripts/backups/italy-page-*.json`, `denmark-page-*.json`). A re-run of both reports nothing to do.
- Found by the production dry run, before anything was written: every destination page on the live site ends each reason, visa-step
  text and scholarship text with a full stop (UK, Sweden, Italy, Denmark… — from the earlier content imports), while the
  seed and the document mostly do not. Applied as written, Italy and Denmark would have lost their stops and the four new
  pages would have had none. `src/lib/seed-countries.ts` now adds a closing full stop to reasons, steps and scholarship
  texts of these six entries (`DOC_PAGES`) — punctuation only. The dry run afterwards listed only real content changes.
  Production's own inconsistency left alone: one Denmark step ("Give biometrics") had no stop and now has one.
- Local database was not re-synced for this punctuation (it predates production's style); run
  `update-country-pages.ts it dk kr nl jp my --apply` locally if the local pages should match.
## 2026-11-17 — Car Rental link, menu: Affordable Europe
- About Us: Trinity Car Rental card now links (Visit site) to http://www.trinityairtravel.com/services/car-rental/ (`seed-content.ts`). **Production needs the same value in the database** (the About page's Segments block) — a push only changes the seed default.
- Header destinations menu (`destination-order.ts`): Denmark now before Europe; "Other Europe" renamed "Affordable Europe"; clicking it toggles an MBBS sub-row (no navigation), MBBS goes to /contact-us (`Header.tsx`, `tw-chrome.css`).

## 2026-11-17 — Country cards on /why-study-abroad now open the new pages

- Found after the deploy: the card grid on `/why-study-abroad` (a `countries` block stored in the database) still sent Japan, South
  Korea, the Netherlands and Malaysia to the home globe (`/#c=…`). The header menu and footer already pointed at the new pages.
- `src/lib/seed-content.ts`: the four hrefs are now `/destinations/japan`, `/destinations/south-korea`,
  `/destinations/netherlands`, `/destinations/malaysia` (a freshly seeded database matches). "Other European countries"
  stays on the globe — it has no page.
- `scripts/link-country-pages.ts` (new): across every page's `countries` blocks it swaps only the `href` of an item that is
  still one of the four old globe links; names, tags, order and any /admin edit are untouched. Dry run by default,
  `--apply` writes, old blocks saved to `scripts/backups/country-links-*.json`, idempotent.
- Applied to the local database and production (dry run first on both: the same four items, all on `why-study-abroad`).
  Verified locally: the page has globe links only for `europe`, and each of the four new pages is linked from its card.
- Production: needs the redeploy that the push triggers to drop the cached page (a direct write never reaches `revalidateSite()`).

## 2026-11-17 — /contact-us: back-to-top button covered the first letters of card text

- Report: on the production contact page the cards' text looked overlapped. Reproduced at the report's width (1263px):
  the gold back-to-top button is fixed at left 22px and 44px wide, so it spans x 22–66; the "Phone" card's text starts at
  x=54 (24px page gutter + the card's padding), so scrolled to that card the button covered the "P" of "Phone".
- `src/styles/tw-chrome.css`: from 641px up the button is 36px wide, 10px from the left edge and 18px up (it ends at
  x=46, clear of card text at x=54; it still sits within the 66px the footer's bottom padding was measured against).
  Phones keep the original size. Measured locally at 1263px: button x 10–46; card text at x 54 / 463 / 873.
- Not covered: plain text that runs to the page gutter (x=24) is still passed over for a moment as you scroll, as under any
  fixed button. Also seen while checking: the chatbot's "Planning to study abroad?" nudge bubble, on the right, covers part
  of the Head Office address until it is closed with its ×. It is the chatbot's own popup, left as is.
- The blank email icon in the report's hero card is not a missing icon: the glyphs (`fa-phone-alt`, `fa-envelope`) exist and
  Font Awesome is loaded; the screenshot caught the moment before the icon font finished loading.

## 2026-11-17 — /contact-us hero: watermark cut off, empty email icon, email address split ("co" / "m") — the real report

- The back-to-top change above (5931247) was a real overlap but not the one in the client's screenshots, which show the big
  outlined "CONTACT US" at the bottom of the hero cut off by the cards, and the EMAIL card's icon tile empty. Correction to the
  note above: the empty icon is a bug, not a font-load moment — it stayed empty after 6s.
- Watermark: `.page-hero__ghost` sat 14px below the hero's bottom edge and the parallax (`data-plx="0.12"`) pushed it ~36px
  further down, and the hero clips with `overflow:hidden`; measured at 848px, 39% of the word was cut off at the top of the page.
  `site.css`: `bottom:8px` (and on phones); `Hero.tsx`: the parallax attribute is gone. Measured after: 0px hidden at 848, 1263 and 375.
  This applies to every page hero, not only the contact page.
- Empty icon: `.quick__ico--purple` has a navy background (`--primary`) and set no colour, so the envelope inherited navy from the card
  and vanished (computed: icon rgb(35,47,112) on tile rgb(35,47,112)). `color:#fff` added.
- Email address: `strong.sm` used `word-break:break-all`, so at 848px the address wrapped as "…abroad.co" + "m". It is now sized
  `clamp(12px,1.55vw,15px)` (`clamp(12px,3.2vw,14px)` on phones) with `overflow-wrap:anywhere` as the last resort, and the text
  span can shrink (`min-width:0`). One line at 848 (13.1px), 1263 (15px) and 375 (12px).
- Observed, not changed: the chatbot's "Planning to study abroad?" bubble sits over the Call Us number and the Head Office address
  at some widths until it is closed with its ×.
- Verified locally at 848 / 1263 / 375: the watermark is whole, the envelope shows, the address is one line. One trap while measuring: the
  watermark's entrance animation does not advance while the preview pane is throttled, which reads as 18px hidden (its 26px start
  offset less the 8px); a screenshot first (to force a render) gives the settled 0px.

## 2026-11-17 — /contact-us watermark, second round: still cut by the cards — the overlap I had not measured

- Client: "still a bit cut". The previous fix kept the word inside the hero's clipped edge but not out of the strip the cards cover.
  `.contact__cards{margin-top:-50px}` collapses through `.contact` (padding-top 0), so the section starts 50px above the hero's
  bottom edge (measured at 1263px: hero bottom 628, section top 578). The watermark, 8px up from that bottom edge, sat inside the
  strip — its lower 31% was under the cards. (The destination pages hit the same thing and lift theirs 62px: `.cv-ghost`.)
- `src/styles/site.css`, from 641px up (phones have no overlap — the cards get a 40px top margin there): the contact hero's watermark
  `bottom:62px`, and the hero gets `padding-bottom:210px` = 62px clear of the cards + the tallest word (136px) + 12px. Lifting
  alone put the top of the word behind the hero's own Email card, so the extra room is needed. Selector
  `.page-hero:has(+ .contact)`, so only the contact page is affected (`:has` is already used elsewhere in this stylesheet).
- Measured on the settled page at 1440, 1263, 1024, 848, 700 and 375px: the word is 0px behind the hero content, 0px behind
  the cards, 0px clipped by the hero, 0px past its right edge; the hero is 100px taller on the contact page at desktop widths.
- Other page heroes keep the previous fix (watermark inside the hero's edge, no parallax). Any other page whose first section is
  pulled up over its hero would show the same cut; none found besides contact and the destination pages.

## 2026-11-17 — Header menu: "Affordable Europe" sub-tab (MBBS) opens to the right, not underneath (client request)

- Before: hovering / focusing / clicking "Affordable Europe" slid an MBBS sub-row down under it, inside the grid cell. Now the MBBS card
  appears to the right of the row on hover.
- `src/styles/tw-chrome.css` only (no markup or script change): `.cv-dsubmenu` is `position:absolute; left:100%; top:0` instead of an
  in-flow row with a `max-height` slide, so it takes no height and moves nothing; the gold elbow connector is gone; the card is a solid
  navy panel with a gold border and a shadow; the row's chevron nudges right instead of rotating down; an 8px transparent
  padding on the card's left edge bridges the gap so the pointer can cross from the row to the card without the hover ending.
- Placement: Affordable Europe is the last item of the middle column and the third column's last cell is empty, so the card lands in free space.
  Measured at 1263px (the narrowest width the desktop menu shows — below 1261px the header turns into the phone menu, unchanged): card
  x 749–973, panel right edge 994 (0px past it), same top as the row, the row's cell height unchanged (55px), the panel no taller.
- Behaviour kept from the earlier version: hover, keyboard focus (`:focus-within`) and click (toggle, no navigation — for touch) all open it,
  and MBBS still goes to /contact-us. With the panel open, checked: focus shows it, blur hides it, click toggles it, moving the pointer
  onto the card keeps it, moving to another country closes it.

## 2026-11-17 — Home page: student videos now sit above the boarding pass (client request: swap the two sections)

- Order before: … Knowledge Hub → "Student stories (samples)" (text testimonials) → "Book your free counselling session" (boarding pass)
  → "Student stories — Hear it from our students" (videos) → footer. Now: … → testimonials → videos → boarding pass → footer, so the booking
  card is the last thing before the footer.
- Assumption to confirm: "Student stories section" was taken to be the videos block, the one directly under the boarding pass. The page also has
  the testimonials marquee ("Student stories (samples)") directly above it; if that was the one meant, the swap is with that section instead.
- How: the boarding pass is part of the globe engine's own markup (built on the client; `#cta` is looked up inside the engine's root by its
  anchors and by `chooseCountry`), so it could not be moved out without breaking those. Instead the videos block is passed to the host as a prop
  (`below`) and rendered, through a React portal, into a `<div id="tw-below">` inserted into the engine's markup right before `#cta`
  (`TrinityWorldHost.tsx`, `page.tsx`). Until that slot exists — server HTML, or if the engine never builds — the block renders in place after the
  world as before, so it cannot go missing. The slot is left in the engine's parked DOM and reused when the visitor comes back to the home page.
  A ResizeObserver on the slot asks ScrollTrigger to re-measure (window resize) as the block's height settles.
- Two things the move broke, found while testing and fixed in `tw-site.css`:
  1. Inside `.tw` the block lost its styling: the drop-in's `.tw *{margin:0;padding:0}`, `.tw h2{font-family:Sora}` and `.tw a{color:inherit}` out-rank
     the block's single-class rules (80 computed-style differences found by diffing a clone outside `.tw`: section 113px padding, container
     gutters, button padding and dark label, caption padding, kicker/lead margins, heading font and letter-spacing). `.tw #tw-below …` rules restore each
     value. Re-checked the same diff at 1263, 900 and 375px: 0 differences, no horizontal overflow.
  2. The fixed 3D globe canvas painted over the videos: the world's own sections are `position:relative; z-index:3`, the slot was not. It has the same now.
- Verified on localhost: DOM order `#voices → #tw-below(.vbk) → #cta`, nothing left outside `.tw`; the video plays through the portal; the `#cta` anchor
  still scrolls; leaving to /about-us and back keeps one slot, one block, one canvas; fresh-tab console clean. The new order is seen after the engine builds
  (client-side), as the globe and the boarding pass are.
- Reverting: pass the block outside again (`<BlockRenderer …/>` after `<TrinityWorldHost/>`) and drop the `below` prop.

## 2026-11-17 — Home page: keep the blue / white rhythm after the swap (client request: "maintain the order blue white theme as previous")

- Measured before changing anything. Before the swap the closing sections were: testimonials (blue) → boarding pass (WHITE, rgb 246,248,252) → videos
  (blue) → footer (blue). After swapping the content alone: testimonials (blue) → videos (blue) → boarding pass (white) → footer — three blues in a row and
  the white band moved. Read as: the colours stay where they were, by position — third place white, fourth place blue.
- `src/styles/tw-site.css`: the videos section on the home page takes the white treatment (the world's own light-section gradient `#eef3fb → #e3ecf9`, navy
  ink, muted lead, a darker gold kicker so it reads on white, lighter card shadows, dark dots on phones), and the boarding-pass section (`#cta`) takes the
  blue one — flat `#07142e`, exactly the `--seam` colour its punched notches use, which is what it was drawn for ("the section stays navy; the card inside it
  becomes paper", tw-boarding-pass.css). Flat rather than the glow the other dark sections have, or the notches would show as discs on the gradient.
- The light videos look is scoped to `#tw-below` (the home page's slot): the same block on /about-us stays dark — checked, still navy with a white title.
- Now: … testimonials (blue) → videos (white) → boarding pass (blue) → footer (blue), the same shape as before: one white band between blues,
  and the blue boarding pass runs into the blue footer as the blue videos did.
- Verified on localhost at 1263px (real scroll, screenshots of the testimonials → videos → boarding-pass transitions) and 375px (backgrounds, text colours, dots, no horizontal overflow).

## 2026-11-17 — About Us: "Personalized Guidance" roadmap moved to right below the Founder's video (client request)

- Order before (seed and local): intro → roadmap → Mission & Vision → Founder's video → Business Segments → … ; production had no roadmap at all (the
  script that adds it had never been run there). Now, in the seed and the local database: intro → Mission & Vision → Founder's video → **roadmap** →
  Business Segments → Offer → Journey.
- `src/lib/seed-content.ts`: the roadmap block follows `aboutVideos` in `aboutBlocks`.
- `scripts/add-about-roadmap.ts`: rewritten to that placement — right after the page's `videos` block. A page with no roadmap gets the seed's block; one
  that already has a roadmap keeps its own block (any /admin edits) and has it moved; a page already in order is left alone. Dry run prints the
  before / after order; `--apply` writes with the old blocks backed up to `scripts/backups/about-roadmap-*.json`.
- Local database: moved (dry run first, then applied; a re-run says nothing to do). The page's DOM order: Mission & Vision (y 992) → Founder's video (1632)
  → Personalized Guidance (2321) → Business Segments (2998); the dark Founder section runs straight into the white roadmap with no gap, at 1263px and
  375px (no horizontal overflow).
- Production: not applied. It needs `add-about-roadmap.ts --apply` against the production database (it will add the block in the right place) and a
  redeploy, plus these commits pushed (the seed). Production's About page currently ends with: intro → Mission & Vision → Founder's video →
  Business Segments → Offer → Journey.

## 2026-11-17 — About Us: "Personalized Guidance" becomes "Our Process", drawn like the client's reference (7 icon steps in one row)

- Client: replace the text with "our process" and draw it like the reference image — one row of illustrated circles on a yellow line, the step names under them:
  Career Counsellor · Courses & University Selection · Test Preparation · Application & Development · Offer Letter & Acceptance · Student Visa Application ·
  Pre-Departure Support (seven steps; the old block had ten numbered ones).
- Block: heading "Personalized [Guidance]" → "Our [Process]"; the kicker "How we help" and the lead sentence ("One team beside you from the first profile evaluation to the
  day you fly") are kept — an assumption, the client only said to change the text. Seven steps replace the ten.
- Icons: the reference artwork is not ours, so seven original flat icons were drawn as SVGs (teal / orange / yellow palette) in `public/assets/img/process/`
  (01-career-counsellor … 07-pre-departure). Each step carries an `icon` path, editable in /admin like any image (the generic field editor already offers a picker for
  image-valued `icon` fields).
- `src/lib/blocks.ts`: `RoadmapBlock.steps` may have `icon`. `src/components/site/blocks/Segments.tsx`: when every step has an icon the list is rendered as the icon process
  (`road road--icons`, `--n` = number of steps); without icons it is the original numbered path. `src/styles/site.css`: seven circles in a row (72px; lavender, peach,
  light blue, repeating), the soft-yellow line (`--gold`) running circle to circle, labels wrapping to 2–3 lines; from 760px down a vertical rail with the line running down
  between the circles. The row stays a row at 1000 and 800px.
- Content in the databases: `scripts/add-about-roadmap.ts --replace --apply` swaps an existing roadmap block for the seed's (the default run still only moves it and keeps
  /admin edits). Applied locally (dry run first, then applied, re-run is a no-op).
- Verified on localhost: HTML has the seven steps and seven icons, no "Personalized"; at 1263px the seven steps are on one row (1200px wide) with every icon loaded, no
  horizontal overflow; at 1000 and 800px still one row, labels 2–3 lines, nothing clipped; at 375px a vertical rail (60px icons, 4px line), no overflow.
- Production: not applied — needs these commits pushed and `add-about-roadmap.ts --replace --apply` against the production database (production has the old ten-step
  "Personalized Guidance" block), then a redeploy.

## 2026-11-17 — About Us process, second version: the client's own ten steps, with icons (replaces the seven-step "Our Process")

- Client: use this content — "Personalized Guidance": Profile Evaluation → Test Preps → University Shortlisting → SOP & LOR Assistance → University Application Support →
  Scholarship Assistance → Education Loan Guidance → Student Visa Assistance → Accommodation Assistance → Pre-Departure Support — and use images or icons, whichever is best.
  The seven-step "Our Process" (written from the reference image) is therefore replaced: heading back to "Personalized [Guidance]", ten steps, each with an illustration.
- Icons over photos: flat SVG illustrations, the same style as the reference (teal / orange / yellow on pastel circles) — they stay crisp at any size, weigh under 1 KB each, and match
  the site's palette; photos would have needed ten consistent shots. `public/assets/img/process/`, now named by step instead of numbered: profile-evaluation (new),
  test-preps, university-shortlisting, sop-lor (new), application-support, scholarship (new), education-loan (new), student-visa, accommodation (new), pre-departure.
  The seven-step set's `01-career-counsellor.svg` and `05-offer-letter.svg` are removed (no step uses them); the other five were renamed.
- Layout (`Segments.tsx`, `site.css`): with more than seven steps the icon process runs as two rows of equal width — ten → 5 + 5 — instead of one cramped row; `--n` is the column
  count, and `road__step--end` marks the last step of each row so the yellow line stops there. Up to seven steps it is still one row. Under 760px it is a vertical rail, the line running
  down to the ninth step and stopping at the tenth.
- Database: `scripts/add-about-roadmap.ts --replace --apply` swaps the block for the seed's (done locally; the dry run shows `"Our [Process]", 7 steps -> "Personalized [Guidance]", 10 steps`).
  Production still has the original ten numbered steps without icons — the same ten, so after the push and the script the page keeps its wording and gains the icon design.
- Verified on localhost: HTML has the ten steps and ten icons; two rows of five at 1263, 1000 and 800px with the line pattern `1111011110` (stops after steps 5 and 10), every icon loaded, no label clipped,
  no horizontal overflow; at 375px a single column, 60px icons, line pattern `1111111110`.
- Local environment note: the local Postgres (embedded, port 5433) had stopped answering after the session restart — its listener was held by an orphaned child process (PID 2668) whose parent was
  gone. Killed that child and restarted `npm run db:dev`; `.pgdata` untouched, all 9 pages present.

## 2026-11-17 — About Us process: the heading is "Our Process" (correction of how the client's content was read)

- The previous round read "use this content for our process" as a request for the heading "Personalized Guidance". The client meant the opposite for the heading: the section's
  title is "Our Process" (their screenshot of the "Personalized Guidance" heading, "on this we have to use Our process"), and the ten steps are the content under it.
- `src/lib/seed-content.ts`: roadmap title "Personalized [Guidance]" → "Our [Process]". Kicker "How we help", the lead sentence, the ten steps and their icons are unchanged.
  `scripts/add-about-roadmap.ts --replace --apply` applied locally (dry run: `"Personalized [Guidance]", 10 steps -> "Our [Process]", 10 steps`; re-run is a no-op).
- Verified on localhost: the section reads "How we help / Our Process / One team beside you…", "Personalized" no longer appears on the page, the icon rows are as before.
- Production: not applied (still the original numbered ten under "Personalized Guidance"). Needs the push and `add-about-roadmap.ts --replace --apply`.

## 2026-11-17 — Success Stories: eight client testimonials added

- Client sent eight student / parent testimonials (Shonel D’souza, Atulya Shitole, Lynstel Fernandes, AC Santosh, Jai Baloda, Sandesh Chandrashekaran, Charu Mangal, Betsy John) for
  the Success Stories page. They are added after the two stories already there (Rohan Nair, Sharanya Santosh) in the client's order and wording — only stray leading / trailing spaces
  were trimmed; Jai Baloda's three paragraphs are kept as three. The page now has ten, two to a row.
- `src/lib/seed-content.ts`: `clientStories` (exported) and the Success Stories page's testimonials block uses `[...testimonials.items, ...clientStories]`. The shared `testimonials`
  constant itself is untouched, so other pages that use it do not get these.
- None came with a photo, so `Testimonials` (`Pages.tsx`) shows initials when `img` is empty — the first letters of the first and last word of the name ("Shonel D’souza" → SD;
  a " – Mumbai" suffix is ignored) on a navy disc in gold, with the same gold ring as the photos (`.tcard__ini`, `site.css`). The `course` line is only drawn when there is one.
  `.tcard p{white-space:pre-line}` so a story's paragraph breaks show.
- The small grey line under each name ("course") is not in the client's text. It is the context the story states about itself, nothing added: UK student visa (Shonel, Atulya), Irish
  student visa (Lynstel), Parent (AC Santosh), Study in the UK (Jai, Charu), Parent · MS in Australia (Sandesh), Study abroad (Betsy). Editable in /admin; to be confirmed with the client.
- `scripts/add-success-stories.ts` adds them to a database: dry run by default, `--apply` writes, old blocks backed up to `scripts/backups/success-stories-*.json`, idempotent by name
  (a story already there — or edited in /admin — is left alone). Applied locally: 2 -> 10 stories; a re-run adds nothing.
- Verified on localhost: ten cards (8 with initials, 2 with photos) in 5 rows of 2 at 1000px; Jai's three paragraphs render as three and the card beside it matches its height; one
  column at 375px with no clipped text and no horizontal overflow.
- Production: not applied. Needs the push (renderer + seed) and `add-success-stories.ts --apply` against the production database (dry run first), then a redeploy.

## 2026-11-17 — About Us: "What We Offer" and "Start Today" removed; track-record figures added (client request)

- Removed from the About page: the offer block ("What We Offer") and the journey block ("Start Today"). Both stay in the code for other pages that use them.
- Added at the end of the About page: a track-record block (`stats` with a `title`), heading "Numbers that landed." with kicker "Track record", and one row of five figures:
  42+ Years' experience · 50+ Countries · 1200+ Universities · 1 lakh+ Courses · 1 Stop solution (the client's reference image).
- `src/lib/blocks.ts`: `StatsBlock` gets optional `kicker` and `title`; with a title it renders the track-record layout (`Common.tsx`, `TrackRecord`), without one the four cards as before.
- `src/styles/site.css`: `.trk*` rules — grey band, hairline above each figure, one row (two per row under 760px).
- `scripts/update-about-track-record.ts`: removes offer/journey from the About page and appends the track-record block; dry run by default, `--apply` writes with backup, idempotent.
- Applied to the local database; local page checked at 1263px: five figures in one row, no horizontal overflow.
- Not yet done: check at 375px; the figures count up from 0 (the existing counter script); production — needs the push and `update-about-track-record.ts --apply`.

## 2026-11-18 — Track record on About: the figures were stuck at 0

- Symptom: the track-record row showed "0+ / 0+ / 0+ / 0 lakh+ / 0" instead of 42+ Years' experience, 50+ Countries, 1,200+ Universities, 1 lakh+ Courses, 1 Stop solution.
- Cause: the figures are filled in by the page's counter script (`SiteScripts.tsx`), which only looks for an element with id `stats`; the track-record section had id `track-record`, so nothing ever
  counted. `Common.tsx` (`TrackRecord`): the section id is now `stats` (with a comment saying why).
- Verified on localhost after a fresh load: 42+ Years' experience · 50+ Countries · 1,200+ Universities · 1 lakh+ Courses · 1 Stop solution; all reveal elements on the page switch to visible.
  (A first load right after the dev server starts may not hydrate; reloading fixed it — a dev-server effect, not the change.)
- Still to do: 375px check; production — push, then `update-about-track-record.ts --apply` (dry run first).

## 2026-11-18 — About: track record moved above the Business Segments (client request)

- Order was: … Mission & Vision → Founder's video → Our Process → Business Segments → Track record. Now: … → Our Process → **Track record** → Business Segments.
- `seed-content.ts`: the stats block sits before the logos `segments` block. `scripts/update-about-track-record.ts` now puts the block immediately before the Business Segments (the `segments`
  block that has logos) — adding it, or moving it if it is elsewhere; still removes offer/journey if present; idempotent. Applied locally (dry run: `… > segments > stats` → `… > stats > segments`).
- Verified on localhost: page text order Mission → Founder's video → Process (Profile Evaluation) → Numbers that landed → Our Business Segments; no "What We Offer" / "Start Today".
- Production: needs the push and `update-about-track-record.ts --apply` (production is currently `… > segments > stats`).

## 2026-11-18 — About: track record restyled as boxes with icons + hover (client request)

- Each figure is now its own white rounded card: gold circular icon badge on the left, big number (gold suffix) + label. Section background light grey; heading unchanged.
- Hover: card lifts, gold border + gold top bar slides in, badge flips to navy with a gold icon and tilts. `prefers-reduced-motion` respected.
- `blocks.ts`: stats items take an optional `icon` (Font Awesome class). `Common.tsx` `TrackRecord` renders badge + `.trk__txt`. `site.css` `.trk*` rewritten. `seed-content.ts`: icons award / globe / university / book-reader / handshake.
- `update-about-track-record.ts` now compares full block content, so a re-run picks up seed changes (icons). Applied locally (backup in scripts/backups/).
- Verified on localhost: 5 boxes in one row at 1263px, 4+1 at 1000px, stacked full-width at 375px with no horizontal scroll; counters 42+ / 50+ / 1,200+ / 1 lakh+ / 1; hover CSS rules loaded (real pointer hover could not be triggered in the preview pane).
- Production: needs push, then `update-about-track-record.ts` (dry run first, then `--apply`).

## 2026-11-18 — About: track record bottom space halved

- Gap below the track-record boxes was ~210px (section bottom padding 100 + next section top padding 110). `site.css`: `.section.trk{padding-bottom:0}` → ~110px. Verified computed: padding-bottom 0, next section padding-top 110. Mobile gets the same (0 + 56).

## 2026-11-18 — About: section colours varied (client: too much white/grey)

- Rhythm now: intro white → Mission & Vision grey → Founder video dark → **Our Process white** → **Track record navy** (gradient + soft gold/blue glows, white heading, gold kicker, white cards) → **Business Segments white** (logo cards grey, no border).
- `site.css`: `.roadsec` white; `.trk` navy gradient; `.segsec:not(:has(.seg__pillars))` white. `Common.tsx`: track-record heading uses `light`. Bottom padding on `.trk` set to clamp(64–90px) since the navy edge now shows (replaces the earlier 0).
- Verified on localhost: computed backgrounds per section; navy section screenshot (heading, cards, counters). Not pushed.

## 2026-11-18 — Production: track record order + icons (Railway)

- Pushed c64e439. Production is on Railway (project Trinity, services `trinity123` + `Postgres`; CLI already logged in). Ran `update-about-track-record.ts` against the production DB via `railway run --service Postgres` with `DATABASE_URL=$DATABASE_PUBLIC_URL` (dry run → apply → re-run "already up to date"). Backup: scripts/backups/about-track-record-2026-11-18T05-27-29-028Z.json.
- The page stayed cached after the DB write; `railway redeploy --service trinity123 -y` refreshed it.
- Verified live: "Numbers that landed" now before "Our Business Segments", icons present.

## 2026-11-18 — Home: webinar slider (client list of six webinars)

- New section on the Trinity-World home page, between the testimonials block and the Student-stories videos: one webinar card at a time (cream card; status pill "Upcoming · In N days" / "Completed", date, title, short line, **More Info** → /webinars-events and **Register Now** → /contact-us for upcoming ones; poster on the right; dots; 01/06 counter). Opens on the next upcoming webinar, auto-advances every 7 s, pauses on hover/focus, no autoplay under reduced-motion. Stacks with the poster on top at ≤860px.
- Dates/titles from the client: 24 Jul Study in Europe on a Budget (snippet-3), 22 Aug Unlock Your Future in New Zealand (snippet-4), 26 Sep Test Prep for Studying Abroad (snippet-2), 24 Oct Missed 2026? Prepare for 2027 (+ subheading), 21 Nov Study Abroad After 12th – Pathway for Indian Students, 19 Dec topic still to come (shown as "Topic to be announced"). 4–6 have no poster yet → branded navy placeholder (date + title); add `img` in `homeWebinars` (seed-content.ts) when the client sends them.
- Not copied from the reference: "Only 1500 seats left", the live countdown and "500+ registered" — no such data was given. The status is computed in the browser from `date`, so a cached page never shows a stale label.
- Code: `WebinarBlock` gained layout "carousel" + `current[].date/href` (blocks.ts); `homeWebinars` in seed-content.ts, rendered by `(site)/page.tsx` next to `homeVideos` (code-only, no DB script needed); `WebinarCarousel.tsx`; `.wbc*` CSS (prefixed `section.wbc` to beat the world page's `.tw *` reset).
- Verified on localhost (1024 and 375 wide): section order, poster/placeholder slides, status pill, buttons, no horizontal scroll. Not pushed.

## 2026-11-18 — Home: webinar slider takes the old "Knowledge Hub" place

- The world home page has its own static Knowledge Hub (`section#webinar` in `tw/markup.ts`: "Current webinar update" + concluded snippets). The new slider now sits exactly there and the old section is hidden. `TrinityWorldHost` got a `webinars` prop: a slot (`#tw-webinar-slot`) is inserted before `section#webinar`, the old section is `display:none`, and the slider is portalled in (renders after the world until the slot exists, like `below`). `page.tsx` passes `webinars={homeWebinars}`; `below` is the videos only.
- Verified on localhost: order slider → testimonials (#voices) → student videos → boarding pass; one `.wbc`; old section hidden.
- The concluded-webinar photos no longer show on the home page; they are still on /webinars-events. Not pushed.

## 2026-11-18 — Home webinars: schedule redesign undone (client asked to go back)

- `git revert` of 867479c: the section is back to the one-card slider (cream card, poster right, dots), still placed where the old Knowledge Hub was. Kept one fix from the reverted work: `.section.wbc{position:relative;z-index:3}` so the world page's fixed scene cannot paint over it.

## 2026-11-18 — Home webinars: poster for "Study Abroad After 12th"

- Client's image saved as `public/assets/img/webinar/after-12th.webp` (435×245 source, 16:9) and set as `img` of the 21 Nov webinar in `homeWebinars` (seed-content.ts). The source is small, so it looks soft at full card width — a larger original would be sharper.
- Follow-up: the screenshot carried the editor's blue selection border and corner/edge handles. Re-cropped 7px off every side (now 422×231) from the original; no blue pixels remain.

## 2026-11-18 — Webinar posters: "Prepare for 2027" added, "After 12th" edges fixed

- `prepare-2027.webp` (client image, cropped to exact 16:9, 614×345) is now the poster of the 24 Oct "Missed 2026? Prepare for 2027" webinar (`homeWebinars`, seed-content.ts).
- "After 12th": the S of "Study" and the d of "Abroad" were being clipped — my 7px side crop plus the card's `object-fit:cover` on a 1.83:1 image. Rebuilt from the original: the full width is kept, only the two selection handles at the left/right edge middle are painted out, the top/bottom 6px (border + handles) are replaced by replicated edge rows, so the file is exactly 16:9 and nothing is cropped in the card. The letters touch the edges in the client's own slide; a wider original would be needed to show them fully.

## 2026-11-18 — Home webinar slider is now fully editable in /admin

- Source of truth moved from code to the database: the slider is the `webinar` block ("Knowledge Hub") of the **home** page. `(site)/page.tsx` `homeWebinarBlock()` reads it (always drawn as the slider); missing block → seeded fallback `homeWebinars`; a block with no webinars hides the section.
- Admin (Pages → Home → Knowledge Hub): heading/kicker/lead, Register link (`ctaHref`), "All webinars" link/label, and the list of webinars — each with title, **date picker** (drives Upcoming/Completed + Register button), date text as shown, detail line, poster picker (media library/upload), optional own register link; add / remove / reorder. The old two-column fields (Coming up, notes, snippets) and the unused badge are hidden for the slider. Layout select gained "Webinar slider (home page)".
- `FieldEditor.tsx`: `date` input, `when` hint, `carousel` layout option, `current` shape (title/date/when/text/img/href), hidden keys in `ObjectFields`.
- `scripts/add-home-webinars.ts` (dry run / `--apply` / `--replace`, backup, idempotent: a slider that already has webinars is left alone so admin edits survive) — applied to the local DB. **Production still needs: push, then this script, then a redeploy/Save in /admin** (direct DB writes don't revalidate).
- Verified locally: home renders the slider from the DB (6 webinars, heading, old hub hidden). Local dev needed `.next/dev/cache` cleared to see the DB change (cached page). Not verified: the admin screen itself (no admin password available locally); type-check clean for the touched files.

## 2026-11-18 — Production: editable home webinar slider (Railway)

- Pushed 0f479cb. `add-home-webinars.ts` run against the production DB via `railway run --service Postgres` (`DATABASE_URL=$DATABASE_PUBLIC_URL`): dry run → apply → re-run "already set up". Backup: scripts/backups/home-webinars-2026-11-18T06-43-14-064Z.json. (First dry run hit a transient connection error; the retry was clean.)
- `railway redeploy --service trinity123 -y` refreshed the cached home page. Verified live: "Free webinars" slider present with the After-12th and Prepare-2027 posters.

## 2026-11-18 — Events page: photo gallery from the client's event photos

- Client sent 5 zips (St. John, Nagindas College seminar–Malad, Mithibai College, TOI Expo–Dadar, St Francis; several nested zips, 127 photos + ~17 videos). Extracted into their own scratch folders (untrusted downloads), inspected contact sheets, kept a curated, de-duplicated **59 photos / 5 events**. Left out: the "Travel Expense" folder and taxi-meter shots (receipts), photos with a GPS-camera overlay, an unrelated religious-poster image, duplicates (the same photos were in two zips), upside-down frames, and all videos.
- Images: `public/assets/img/events/<event>/NN.webp` (1400px, q78) + `NN-t.webp` (420px thumbs for the viewer strip) — 7 MB total, committed to git (so they survive redeploys, unlike /admin uploads on Railway).
- New block `events` ("Event Photos"): `EventsGallery.tsx` — intro + "5 events · 59 photos" chips; bento grid of event cards (cover photo, photo-count chip, name, place, date, one line, "View photos"); a card opens a full-screen viewer for that event: big photo, prev/next, thumbnail strip that follows the photo, counter, **← → Esc**, swipe, click outside to close, page scroll locked and focus returned on close. 3 columns (first card double width) → 2 → 1 on phones; reduced-motion respected. Sits on /webinars-events right after "The Events We Hold".
- Admin: Pages → Webinars & Events → "Event Photos": each event has name, place, date, line of text and a list of photos (picker, add / remove / reorder; the first photo is the cover). Added the `events`/`photos` shapes to `FieldEditor` and hid the `thumb` helper field.
- Content notes: only facts the files show were filled in — Nagindas is dated 6 Aug 2025 (from the photo file names); Dadar and Malad come from the folder names; the other places/dates are blank for the client or owner to add. Names are the folder names — the full college names should be confirmed.
- `scripts/add-events-gallery.ts` (dry run / `--apply` / `--replace`, backup, idempotent) applied to the local DB. **Production still needs: push, this script, a redeploy.**
- Verified locally: 5 cards, no broken images, viewer open/close/keys, 375px (no horizontal scroll, strip scrolls). Type-check clean for touched files.
- Follow-up (client): removed the "5 events · 59 photos" chips under the Events gallery heading (markup + `.evg__stats` CSS).

## 2026-11-18 — Events page simplified (client request)

- Removed the six "The Events We Hold" cards and the gallery's own "Where you will find us" heading. The photo gallery now opens with the **"What we run — The Events We Hold"** heading and its intake-calendar line, and nothing else between the webinar section and the photos.
- `seed-content.ts`: featureCards block dropped from `webinarsEventsBlocks`; `eventGallery` kicker/title/lead set to the kept heading. `scripts/simplify-events-page.ts` (dry run / `--apply`, backup, idempotent) removes the card block and sets the heading on a stored page; applied locally. Page order: pageHero > webinar > events > leadForm > cta.
- Verified locally: no "University fairs"/"Where you" text, heading directly above the cards. **Production still needs: push, `add-events-gallery.ts --apply`, `simplify-events-page.ts --apply`, redeploy** (or just run the first with the new seed — see below).

## 2026-11-18 — Production: events gallery + simplified events page (Railway)

- Pushed 94f732f. Ran against the production DB via `railway run --service Postgres` (`DATABASE_URL=$DATABASE_PUBLIC_URL`): `add-events-gallery.ts` (dry → apply), then `simplify-events-page.ts` (dry → apply; re-run "already simplified"). Backups: scripts/backups/events-gallery-2026-11-18T09-50-24-035Z.json, events-simplify-2026-11-18T09-50-32-920Z.json. Order matters: add the gallery first, then simplify.
- Waited for the push deploy to finish, then `railway redeploy --service trinity123 -y` to refresh the cached page. Verified live: gallery cards present, "University fairs" gone, event images served (200).

## 2026-11-18 — Student-video section on the Success Stories page (client request)

- The "Student stories — Hear it from our students" video section (same three clips as the home page) now also sits **inside the Success Stories page, after the second row** — i.e. after the first four stories (the grid is two across, so "three stories / 2nd row" was read as the end of row 2; the split is `SUCCESS_SPLIT = 4` in seed-content.ts and the script, easy to move). The remaining six stories continue below it. The home page keeps its own copy, unchanged.
- Page now: testimonials(4) > videos > testimonials(6, no heading) > journey > cta. New `light` option on the videos block (`vbk--light`: same pale background / ink text as the home page's look, via site.css) so it matches the screenshot rather than the dark About-page style; `Testimonials` drops its heading and top padding when kicker/title/lead are all empty (`testi--cont`).
- `scripts/add-success-videos.ts` (dry run / `--apply`, backup, idempotent; keeps any story text edited in /admin, only splits at 4). Applied locally. Verified: 4 stories above, 6 below, light background, 3 clips. **Production still needs: push, the script, a redeploy.** Editable in /admin: Pages → Success Stories (the stories blocks and the Videos block).
- Follow-up (client): the video section should take the **second row's place** — so it now sits after the first row (two stories), not after four. `SUCCESS_SPLIT`/`SPLIT` = 2; page = testimonials(2) > videos > testimonials(8, no heading) > journey > cta. `add-success-videos.ts` now also *moves* an existing split (merges the stories either side of the videos and re-splits; nothing lost, idempotent). Applied locally (backup success-videos-2026-11-18T10-54-28-802Z.json); verified 2 stories above the videos, 8 below. Production still needs push + the script (run it once — it handles a page that has no videos yet) + redeploy.
- Follow-up (client, message cut off after "…three cards in one row and"): story cards are now **three across** on desktop (two ≤1000px, one ≤640px; cards slightly tighter, padding 32px) via `.testi .grid--2` in site.css — this also applies to any other testimonials block. With three across, "the second row's place" = after the first three stories, so `SUCCESS_SPLIT`/`SPLIT` = 3 (page = stories(3) > videos > stories(7, no heading) > journey > cta; the 10 stories end 3 / 3 / 3 / 1). `add-success-videos.ts` re-split locally (backup success-videos-2026-11-18T10-57-17-484Z.json). Verified at 1024px: 3 above, rows 3/3/1 below. The unfinished part of the message ("and …") was not applied — asked the client to finish it.

## 2026-11-18 — Story cards: "Read more" (client: manage long card text, better UI/UX)

- New client component `TestimonialCard.tsx` (used by `Testimonials`): a long story folds to **six lines** with a soft white fade and a pill **Read more ⌄** button; clicking opens the card to the full text (smooth height animation, gold border, button becomes **Show less** with the chevron flipped); clicking again folds it. Short stories show whole with no button. "Long" is measured in the browser from the card's real width (ResizeObserver), so the button appears only where it is needed and follows resizes; reduced-motion respected; the button is a real `<button>` with `aria-expanded` and a focus ring.
- CSS: `.tcard__body/.is-cut/.tcard__more/.is-open` in site.css. Applies to every testimonials block (Success Stories, and any other page using one).
- Verified on localhost (1024px): all 10 stories get the button (their texts are long); open 468 → 801px card height, fold back to 468; fade visible in the screenshot. Note: the preview pane is throttled when hidden, so CSS transitions don't advance there — the open/close was checked with the transition switched off; in a normal browser the 0.45s animation runs.
- Bug fix (client: "card disappears when I click Read more"): the page's reveal script adds an `in` class to each `[data-reveal]` element; the card changed its own `className` (`is-open`) on click, so React rewrote `class` and dropped `in` → the card fell back to its hidden pre-reveal state (opacity 0). The open state is now the attribute `data-open` (`.tcard[data-open]` in site.css) and `className` is constant. Verified on localhost: class stays `tcard in`, opacity 1, before / open / closed. My earlier check missed it because it measured heights, not visibility.

## 2026-11-18 — Home: Student stories button goes to Success Stories (client request)

- The "Get free counselling" button in the home page's Student stories section now links to **/success-stories** (`homeVideos.ctaHref`, seed-content.ts; code-only, so a push is all it needs). The copy of this section on the Success Stories page keeps pointing to /contact-us (overridden in the seed and in `add-success-videos.ts`) so it does not link to its own page.
- Verified on localhost: button text "Get free counselling", href `/success-stories`. The label was left as asked — it now reads oddly for a link to stories ("See success stories" would fit); say if you want it changed.

## 2026-11-18 — Production: success-stories videos, Read more cards, home button (Railway)

- Pushed aad0188 (everything pending: webinar poster fixes, three-across story cards, Read more cards + the fix, home Student-stories button → /success-stories). Production DB: `add-success-videos.ts` (dry → apply; re-run "already split") → stories(3) > videos(3) > stories(7) > journey > cta; backup scripts/backups/success-videos-2026-11-18T11-11-30-212Z.json. The events scripts had already been applied earlier.
- Waited for the push deploy, then `railway redeploy --service trinity123 -y` for the cached pages. Verified live: success-stories has the light video section and the headless continuation block; the home page's Student-stories link points to /success-stories.

## 2026-11-18 — About: Founder section tightened (client: too much empty space)

- Problem: a single vertical video (260px) sat in a wide text-column layout with ~110px gap and 92px padding above and below → a 647px band with large empty areas.
- Now: section padding 44–76px (was up to 120); on desktop the text (max 540px) and the video (270px) form one **centred group** with a 44–100px gap; three fact chips under the text — **42+ Years' experience · 50+ Countries · 1,200+ Universities** (the track-record figures) — fill the text side before the button. Section height 647 → 575px at 1024 wide; mobile stacks, no horizontal scroll (375px checked).
- Code: `VideosBlock.points?` (chips), rendered in `Videos.tsx` as `.vbk__pts`; `aboutVideos.points` in seed; `points` shape in FieldEditor (editable in /admin: Pages → About Us → Founder video → Points); CSS block at the end of site.css (`.vbk--single`, `.vbk__pts`). A first attempt used an `auto` video column which collapsed the card to 1px (its width is a percentage) — fixed with a fixed 270px column. Applies only to single-video blocks (the Founder).
- `scripts/update-about-founder.ts` (dry run / `--apply`, backup, idempotent; keeps chips already edited in /admin) applied locally. **Production still needs: push, the script, a redeploy.**
- Follow-up (client: keep the text on the left — the centred group lost the line-up with the section above): the Founder text is back at the container's left edge (x=24 at 1024 wide, same as the sections above) and the video sits at the right end of the row. Kept: the tighter padding, the three fact chips, and a larger title (up to 3.9rem) so the text side fills out. Video column 280px (card 498px tall); section height 610px at 1024 wide (was 647 originally, 575 in the centred version). CSS only (the `@media (min-width:1001px)` block for `.vbk--single` at the end of site.css); no new DB change beyond `update-about-founder.ts` (chips).

## 2026-11-18 — Production: About Founder section (Railway)

- Pushed e0cfa2b. `update-about-founder.ts` run on the production DB via `railway run --service Postgres` (dry → apply; re-run "already has its chips"); backup scripts/backups/about-founder-2026-11-18T12-06-46-969Z.json. Waited for the push deploy, then `railway redeploy --service trinity123 -y`. Verified live: About page serves the Founder section with the three chips.

## 2026-11-18 — Events page: Pillai colleges and K J Somaiya added (client mail)

- Client mail: "college seminar of Pillai College of Engineering and Pillai College of Arts, Commerce and Science" + "K J Somaiya seminar pics to be added in Events pics (College seminar)"; two zips (extracted into their own scratch folders, untrusted). Four photos for Pillai (one auditorium seminar), two for K J Somaiya (a seminar slide and the building sign "K J Somaiya Institute of Technology, Sion") — every photo kept, no duplicates, nothing private.
- Two new event cards at the end of the gallery: **Pillai College of Engineering & Pillai College of Arts, Commerce and Science** (4 photos; the mail names both colleges together, so they are one event — split it in /admin if they were separate days) and **K J Somaiya Institute of Technology** (2 photos, "Sion, Mumbai" from the sign). Dates are not in the mail or the files (the file dates are the WhatsApp forward date, 5 Nov 2026), so they are blank for the owner to fill. Photos: `public/assets/img/events/pillai-colleges/` and `kj-somaiya/` (webp 1400px + 420px thumbs).
- `seed-content.ts` `eventGallery` gained the two events; `scripts/add-more-events.ts` (dry run / `--apply`, backup, idempotent by event name; edits made in /admin to existing events are untouched, new ones appended) applied locally. Verified: 7 cards, no broken images, viewer opens the Pillai event (4 thumbs). **Production still needs: push, the script, a redeploy.**
- Follow-up (client: don't show how many photos an event has): removed the "15 photos" chip from every event card and the "1 / 15" counter from the viewer (markup + `.evg__count` / `.evg__n` CSS). The viewer still has prev/next, keys, swipe and the thumbnail strip. Verified: 0 count chips, 0 counters, card text = name · place · line · "View photos". Code-only; no DB change.

## 2026-11-18 — Production: Pillai + K J Somaiya events, counts hidden (Railway)

- Pushed 87cdfe5. `add-more-events.ts` on the production DB via `railway run --service Postgres` (dry → apply; re-run "all seed events are already there"): events 5 → 7; backup scripts/backups/more-events-2026-11-18T12-25-02-459Z.json. Waited for the push deploy, then `railway redeploy --service trinity123 -y`. Verified live: the Pillai event is on the page, no photo-count chips in the HTML, K J Somaiya image served (200).

## 2026-11-25 — Local DB synced from production
- Exported production content (read-only, 330 rows) and restored into local Postgres: 9 pages, 3 posts, 8 settings, 17 countries, 293 knowledge items. Local pre-sync backup kept. Dev server restarted to clear the settings/page cache. Images uploaded via /admin on production are not copied (not in DB export).

## 2026-11-25 — Home "Free webinars": TBA (19 Dec 2026) slide first
- Client: the "Topic to be announced / 19 December 2026" slide was 06/06; now 01/06.  Then reordered (client): rest newest→oldest: 19 Dec, 21 Nov, 24 Oct, 26 Sep, 22 Aug, 24 Jul. Seed (`seed-content.ts` webinar `current`) reordered; `scripts/move-webinar-tba-first.ts` (dry run / `--apply`, backup, idempotent) applied locally. Verified on localhost: slide 01/06 = 19 December 2026. Dev cache needed `.next/cache` cleared after a direct DB write. **Production still needs: push, the script, a redeploy.**

## 2026-11-25 — Production: home webinar order (Railway)
- Pushed 948e8b8. `move-webinar-tba-first.ts` applied on the production DB via `railway run --service Postgres` (dry → apply; re-run "already in that order"); backup scripts/backups/home-webinar-order-2026-11-25T09-53-59-839Z.json. Then `railway redeploy --service trinity123 -y`. Verified live: first slide = 19 December 2026.

## 2026-11-25 — Home webinar "More Info" → new detail page /webinars/[slug]
- Client: More Info on the home Free-webinars slider should open a page like the reference (poster + about on the left, sticky card with countdown / date / time / format / host / Register on the right), good UI/UX, responsive.
- New: `src/app/(site)/webinars/[slug]/page.tsx` (slug = slugified title, `src/lib/webinar.ts`), `src/components/site/WebinarDetail.tsx` (client: live countdown d/h/m via useSyncExternalStore, "Completed"/"Happening today" states, About + Show more, "More webinars" list, breadcrumb), CSS block `.wbd*` at the end of site.css. The slider's More Info now links to `/webinars/<slug>` (was /webinars-events).
- New optional fields per webinar in /admin (Pages → Home → Webinar → Current): `time` (e.g. 04:30 PM — also makes the countdown exact; without it the countdown runs to midnight of the date), `mode` (default "Online webinar"), `host`, `hostRole`, `hostImg`, `about` (long text; falls back to the short text). Empty fields are hidden — nothing invented; "About" shows a "details announced soon" note when empty. Past webinars show "See all webinars & events" instead of Register.
- Verified on localhost: desktop 1280, mobile 375 (no horizontal overflow; card first, poster, about), upcoming + completed + TBA states, Show more/less. Code-only — production needs just a push (+ redeploy); no DB script. Dev gotcha: after a direct DB write clear `.next/dev/cache` AND restart.

## 2026-11-25 — Webinars & Events recap info + detail page only for upcoming webinars
- Client: put date / mode / more under each recap poster on /webinars-events; no separate page for completed webinars — only upcoming ones get a page via More Info.
- Recap posters: each `past` item now has `title, when, mode, text` (blocks.ts, FieldEditor shape, seed `RECAPS`); `PosterGallery` prints a `Caption` (date · title · "Online webinar" chip · one-line summary) under each poster; CSS `.wcap*` at the end of site.css. `scripts/update-recap-info.ts` (dry run / `--apply`, backup, fills only empty fields, matched by recap-N.webp) applied locally. Mapping: recap-1 After 12th 21 Nov, recap-2 Prepare 2027 24 Oct, recap-3 Test Prep 26 Sep, recap-4 New Zealand 22 Aug, recap-5 Europe 24 Jul (from the home slider list; "Online webinar" because the recaps are Google Meet screenshots).
- Detail page: `/webinars/[slug]` redirects to /webinars-events when the date has passed (India date, `isPastWebinar` in lib/webinar.ts); "More webinars" lists upcoming only. Home slider: upcoming slide shows More Info → its page; completed slides show "View recap" → /webinars-events.
- Verified on localhost: captions on 5 posters, past slug → 307 to /webinars-events, upcoming → 200, slider buttons per slide, mobile 375 no overflow. **Production still needs: push, `update-recap-info.ts --apply`, redeploy** (plus the earlier detail-page push).

## 2026-11-25 — Production: webinar detail page + recap info (Railway)
- Pushed 32a13d9. `update-recap-info.ts` on the production DB via `railway run --service Postgres` (dry → apply; re-run "already filled"); backup scripts/backups/webinars-events-recaps-2026-11-25T10-28-04-989Z.json. Then `railway redeploy --service trinity123 -y`. Verified live: see below.

## 2026-11-25 — Australia: Visa requirements section (client text)
- Client sent the Australia visa text (intro: Student visa subclass 500, then 8 key requirements). Australia's `visa` field already held the 8 items but showed as one run-on line in a small card.
- `CountryPage.tsx`: a country whose `visa` text is a list (≥3 lines; first line ending ":" = intro) now gets a full-width **"<Country> visa requirements"** section (intro + two-column checklist + counselling button, id `c-visa-req`) before "The visa process, simplified"; the small card shows only for one-paragraph visa texts (all other countries unchanged). CSS `.cv-visareq*` at the end of site.css.
- Data: seed-countries.ts (Australia `visa`) + `scripts/update-australia-visa.ts` (dry run / `--apply`, backup, idempotent) applied locally. Editable in /admin → Destinations → Australia → Visa (one requirement per line; end the intro line with a colon).
- Verified on localhost: desktop 1440 (8 items, 2 columns) and mobile 375 (1 column, no overflow). **Production still needs: push, `update-australia-visa.ts --apply`, redeploy.**

## 2026-11-25 — Production: Australia visa section (Railway)
- Pushed 00ea79e. `update-australia-visa.ts` on the production DB via `railway run --service Postgres` (dry → apply; re-run "already up to date"; production had the old one-line text); backup scripts/backups/australia-visa-2026-11-25T11-57-39-416Z.json. Then `railway redeploy --service trinity123 -y`. Verified live: Australia page serves the Visa requirements section.

## 2026-11-25 — Home "Student stories": third card = Kamran's HD video
- Client's HD file `Desktop/Univercityimg/kamran video.mp4` (1440×2560 VP9, 20 MB, 64 s) re-encoded with ffmpeg to 720×1280 H.264/AAC, CRF 23, faststart → `public/tw/voices/voice-4.mp4` (7.6 MB, same format as voice-1…3; VP9-in-mp4 does not play everywhere). `homeVideos.items` = VOICE(1), VOICE(3), VOICE(4); "Video coming soon" gone. (An earlier 144×256 copy was discarded for quality.) Verified on localhost: three videos in the section, mp4 served (206 range), a frame checked — sharp, same person as thumb-4. Code-only; **production needs a push (+ redeploy).** Note: the home section is rendered from `homeVideos` in code, not editable in /admin.
