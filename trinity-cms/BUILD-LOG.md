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
