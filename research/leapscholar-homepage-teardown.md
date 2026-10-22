# leapscholar.com — homepage teardown

Recorded 22/10/2026 in Chrome at **1536 × 639** (desktop). Page height **14,438px** ≈ 22.6 viewports.

> Reference notes for the Trinity build. Structure, motion and interaction are described;
> their marketing copy is summarised rather than transcribed, and their artwork is not reproduced.

---

## Tech stack

| | |
|---|---|
| Framework | **Next.js + React** (`#__next` present) |
| Styling | **MUI / Emotion** (`MuiBox-root`, `css-ra9e76`) **mixed with Tailwind** (`bg-neutralWhite`, `py-s24 md:py-s40`) |
| Animation | **GSAP + ScrollTrigger** — bundled as a module, not on `window`. Proven by 2 × `.pin-spacer` in the DOM and GSAP's CSSPlugin signature on every animated node: `translate: none; rotate: none; scale: none; transform: translate3d(...)` |
| Smooth scroll | **Lenis** |
| Fonts | Mona Sans (`span.font-monaSans`) |
| Scripts | 61 total (incl. Facebook `scrolldepth.js`) |

Design tokens are Tailwind-custom: spacing `s24 / s40`, colour `neutralWhite`.

**Cost of the approach:** 800–1,200 inline-style writes *per 600px of scroll*. Every frame is
driven from JS; nothing comes from CSS keyframes. That is the price of this look.

---

## Section map

| # | Scroll range | Height | Section |
|---|---|---|---|
| 1 | 0 – 1,373 | 1,373 | Hero — pinned, scroll-driven |
| 2 | 1,373 – 1,849 | 476 | Numbers that speak for themselves |
| 3 | 1,849 – 5,977 | **4,128** | Why Choose Leap — pinned card-stack |
| 4 | 5,977 – 6,624 | 647 | How We Help You — chevron pipeline |
| 5 | 6,624 – 8,244 | 1,620 | All the Right Support, In One Place — feature bento |
| 6 | 8,244 – 9,109 | 865 | Testimonials |
| 7 | 9,109 – 10,029 | 920 | 256+ Experts / Masterclass events |
| 8 | 10,029 – 10,465 | 436 | Chevron marquee strip |
| 9 | 10,465 – 11,407 | 942 | Offline centres |
| 10 | 11,407 – 12,170 | 762 | CTA band, white → `#CDE8FB` |
| 11 | 12,170 – 14,438 | 2,269 | Footer |

---

## 1. Hero — pinned, scroll-driven (0 → ~1,373)

The whole transformation is driven by one custom property, **`--hero-fit-p`**, rewritten inline
every frame. It is the scroll progress of the pin.

**It completes in ~310px of scroll** — fast, not a long pin.

| scrollY | `--hero-fit-p` | h1 colour | state |
|---|---|---|---|
| 0 | `0` | `rgb(53,12,14)` near-black | rest |
| 100 | `0.693474` | `rgb(98,38,24)` | mid-morph |
| 200 | `0.961341` | `rgb(208,103,47)` | nearly open |
| 300 | `0.997648` | `rgb(255,130,57)` orange | open |
| 400 | `0.999988` | `rgb(255,130,57)` | second line arriving |
| 500+ | `1` | `rgb(255,130,57)` | settled |

### Frame 0 — rest
- Headline, three lines, near-black, left of centre.
- Student photographed into a **vertical rounded-pill mask**, centred.
- A small circular university badge pinned to the photo's lower edge.
- A **soft dotted curve** sweeps the full width behind her, peach.
- **Five labelled nodes** scattered along that curve — each a small square bullet + tiny caps label.
- Dark pill CTA, lower right.
- Background: flat pale lavender-blue.

### Frames 100 → 300 — the open
All continuous, all from `--hero-fit-p`:
1. The pill mask **expands via `clip-path: circle(150% at 50% 50%)`** into a full-bleed rounded
   rectangle (`height:556px; width:1392px; border-radius:20px`).
2. An **illustrated campus** (arched ochre colonnade) fades up inside it, plus a watercolour tree
   and a tiny walking figure far left — each on its own translate, so they parallax.
3. The headline **recolours** black → orange across the same progress, and **shrinks**.
4. The five scattered nodes **collapse into a tidy right-hand vertical list**, re-ordered
   top-to-bottom, each gaining a round dot.
5. The university badge **flies from the photo's edge to the top-right** of the frame.

### Frames 400 → 500 — the payoff
6. A **graduation cap drops in from above**, overshoots, settles with a slight tilt — the only
   thing that moves *after* the pin finishes.
7. A **second headline line wipes in**, much larger and near-black, completing the sentence the
   first line starts. Word by word; the last word arrives grey, then darkens.
8. The CTA **changes its label** between state A and state B.

### The button animation (reused everywhere on the page)
A pill that **grows its own width while fading in** — captured mid-flight:

| t (ms) | width | opacity |
|---|---|---|
| +0 | 92px | 0.040 |
| +16 | 101px | 0.249 |
| +33 | 109px | 0.424 |
| +50 | 117px | 0.570 |
| +67 | 125px | 0.683 |
| +84 | 132px | 0.779 |
| +101 | 138px | 0.853 |
| +118 | 144px | 0.906 |

≈ **150ms, ease-out**, with `overflow:hidden; white-space:nowrap` so the label is *uncovered* by the
widening box rather than fading on its own. Background `rgb(4,1,1)`, text white.

---

## 2. Numbers that speak for themselves (1,373 → 1,849)

Two columns. Left: heading + a **hand-drawn scribble underline** (orange, deliberately rough), with
the pill button beneath. Right: **2 × 2 grid of stat cards**, pale grey, generous radius.

Four stats: students supported, loans granted (₹ Cr), admissions experts, offline centres.
**One figure is indigo while the other three are near-black** — a single deliberate accent.
Labels sit under the figure, small and grey. **No count-up animation — the numbers are static.**

---

## 3. Why Choose Leap — the pinned card-stack (1,849 → 5,977)

**4,128px of scroll driving one pinned viewport.** The biggest idea on the page.

### Frame 1,900 — the title
Huge display type, three lines, near-black, centred, **larger than the viewport comfortably holds**
(it bleeds into both gutters). A small indigo pennant chip above it as the kicker.

Four small objects float **over the letterforms**: an orange pennant tag, a yellow pennant tag, a
periwinkle rounded square, an indigo pennant with a mortarboard glyph. Each drifts on its own
translate. The type does not get out of their way — that is the effect.

### Frame 2,050 — cards fly in as pure colour
Everything resolves to **three tilted rounded rectangles and nothing else** — periwinkle at the
back (~+2°), orange at the left (~−2°), amber in front. No text, no image. A pure geometric beat
before any content arrives. Radius ~16px.

### Frames 2,200 → 2,500 — panel 1 resolves
The amber front card becomes **deep navy**, keeping the orange and periwinkle cards peeking out
behind it at their angles — a three-layer stack showing ~10px of each back card on the left and
bottom.

Right column appears **first**: a vertical ticker of six services.
Left column follows: the heading wipes in over ~2 frames (its second line is still mid-wipe at
2,350), then the paragraph fades up beneath it.

### Frames 2,500 → 3,250 — the ticker runs
The six services scroll **upward at roughly one item per 300px of scroll**:

`Prepare for Exams → Get Visa Ready → Plan Your Finances → Unlock Scholarships → Education Loan → Find the Right Universities`

Row state is driven by distance from the vertical centre:

| position | label | icon chip |
|---|---|---|
| centre | white, largest | fully saturated (amber / orange / indigo) |
| ±1 | light grey | ~60% opacity |
| ±2 | dim grey, nearly gone | ~25%, desaturated |

Labels are **right-aligned** with the **circular icon chip to their right**, so the chips form a
clean vertical column while the text rags left. Each service owns a colour.

### Frames 3,250 → 3,850 — panel 2
The navy card **slides up and out of frame** while panel 2 rises underneath. Panel 2 is cream,
same tilt, same periwinkle card behind it.

- Left: heading, paragraph, pill button.
- Right: a **sky photograph** (student in sunglasses, looking up) with **university pills floating
  over it in three rows** — each pill a circular flag + name, white, soft shadow.
- **The three rows drift horizontally at different speeds** — a parallax marquee tied to *scroll*,
  not to time. Across frames 3,400 / 3,550 / 3,700 / 3,850 each row shifts by a visibly different
  amount.
- The button starts **grey and fills to black** as the panel settles (the §1 reveal again).

### Frames 4,000 → 5,400 — panel 3
The quietest panel, and it holds the longest.

- Background: **glowing orange radial gradient**, near-white at the edges.
- Centre: a **dark halftone globe** — continents as a dot matrix, the sphere near-black with an
  orange rim light.
- Over it, **place names scroll vertically** in orange, **scaled by distance from the centre** —
  largest and most opaque at the sphere's equator, shrinking and fading toward top and bottom.
  They pass *in front of* the globe, which is what sells the depth.
- Left: heading, paragraph, pill button (same grey → black fill).

Unpins at ~5,400.

### Cost
800–1,200 inline-style writes per 600px through this section. By a wide margin the most expensive
thing on the page.

---

## 4. How We Help You (5,977 → 6,624)

Left: kicker pennant, two-line display heading.
Right: short paragraph + black pill button — **the right column is set much smaller than the left**,
which is what stops the row reading as a 50/50 split.

Below: a **single horizontal chevron pipeline** — eight arrow segments butted together, all
pointing right, in a deliberately clashing sequence:
`indigo → amber → orange → pale blue → orange → peach → deep maroon`.

Labels **alternate above and below the band**, so eight steps fit without collision:

- above — a personalised roadmap, prepare for exams, plan your finances, get visa ready
- below — one-one guidance, find the right universities with admit chances, build your application, unlock scholarships

~420 text-node + ~420 span mutations on entry: labels and segments animate in individually.

---

## 5. All the Right Support, In One Place (6,624 → 8,244)

Kicker, then a two-line heading **with an indigo pennant chip tucked inline after the first line's
last word** — the chip is part of the text flow, not decoration beside it.

A **bento grid of feature cards**, each a different flat pastel with its own illustration and an
`Explore Now ›` / `Build Now ›` link:

| card | ground | illustration |
|---|---|---|
| University Shortlist | peach → orange gradient, wide | tilted campus photo cards + a dark "300+ Universities" pill |
| Secure Finances | periwinkle | stacked coins + a floating "Scholarship Eligibility" chip |
| Better Admit Chances | lilac | mortarboard + a "CONGRATULATIONS!" notification card |
| Build Your Application | pale pink, wide | an envelope card + two circular student portraits + floating dots |
| Visa & Beyond | pale lilac | a passport glyph inside concentric rings |
| Test Prep | deep maroon, wide | exam names as **large outlined pills** — IELTS, TOEFL, GMAT, GRE, NCRT — overlapping and running off both edges |

The grid is **irregular on purpose**: wide and narrow cards share a row.

---

## 6. Testimonials (8,244 → 9,109)

The ground changes completely: **pale blue sky with faint cloud texture**, the only such section.
Decoration: a thin paper-plane doodle, a small square grid of dots, one orange dot, and a blue
scalloped "verified" rosette with a white tick overlapping the card's corner.

**Two tilted cards side by side**, both deep maroon:
- left, narrow — circular student photo, name, course, university
- right, wide — the quote in large white type, opening with a curly quotation mark

---

## 7. 256+ Experts / Masterclass events (9,109 → 10,029)

Left: kicker, three-line display heading **with an amber pennant chip inline after the last word**,
paragraph, black pill button.

Right: a vertical list of event rows on pale grey cards, each carrying:
- a **chevron-shaped thumbnail** (clip-path, pointing right) holding the session poster
- date in small grey caps
- title, two lines, semibold
- presenter credential in italic
- registered count + a small dark **Register Now** pill

---

## 8. Chevron marquee strip (10,029 → 10,465)

**Two full-bleed rows of the same chevron shape, travelling in opposite directions.**
Row 1: indigo / amber / orange / peach / indigo. Row 2: peach / orange / indigo / pale blue / peach.
No text at all — pure colour and motion, used as a divider between two content blocks.

---

## 9. Offline centres (10,465 → 11,407)

- Left: an **India map drawn as diagonal hatching** in periwinkle, with orange connector lines
  radiating from a highlighted HQ pin out to other city pins. A **"Search for a Center" field**
  floats over the map's lower edge as a white pill.
- Right, stacked: a peach stat card (cities count, label, one line of copy) above a **photograph of
  an actual branch reception**.

---

## 10. CTA — "Ready To Take The Leap?" (11,407 → 12,170)

White → `#CDE8FB` vertical gradient with soft white cloud blobs.

Two cards side by side:
- **Left:** logo, a phone field with a flag country-code select, and a black pill CTA with a long
  arrow `→`.
- **Right: a boarding pass.** FROM / TO, then STATUS / SEAT / GROUP as a three-column strip with
  plausible values. Its right edge is an **orange perforated stub** — vertical ticks standing in for
  a tear-off. The strongest single idea in the lower half of the page.

---

## 11. Footer (12,170 → 14,438) — 2,269px

Sky blue, continuing the CTA gradient, with a **jet illustration banking across the upper left**.

- A row of expandable link groups (Free Counselling, IELTS Coaching, Top Universities, Study Abroad
  Intakes, Cue Card Categories, IELTS Practice Test, Duolingo English Test …) — accordions.
- Eight link columns: Countries, Top Universities, Company, Our Partners, Our Offerings,
  Testimonials, Our Products, Exam Information.
- Social icons, copyright, two app download links, and a Contact block (phone / WhatsApp / email).
- **~20 branch addresses** in a four-column grid, each with full address and phone, including two
  international (Singapore, UAE).
- Privacy Policy / Terms and Conditions / Refund Policy.
- A **giant "LEAP SCHOLAR" wordmark bleeding off the bottom edge**, pale and low-contrast.

---

## Header

A **floating white pill** holding logo + nav + a dark Sign Up button, inset from the top with
rounded ends — it does not span the full width. Three nav items carry dropdown chevrons.
It sits over the hero and **scrolls away with it; it is not sticky.**

---

## What is worth taking for Trinity

**Cheap, high return:**

1. **The button reveal.** 150ms, width 92→144px, opacity 0.04→0.91, `overflow:hidden;
   white-space:nowrap`. The label is uncovered by the growing box. Pure CSS, no library.
2. **Inline pennant chips inside headings** — a coloured tag sitting *in* the text flow after a
   word, not floated beside it. Costs nothing, reads as designed.
3. **Alternating labels above/below a horizontal step band.** Solves eight steps in one row.
4. **The boarding-pass card** for the final CTA. A metaphor an education consultancy owns outright
   — and Trinity already has the plane asset.
5. **Two-row opposing chevron marquee** as a section divider. One CSS animation, no JS.
6. **One accent colour per list item**, active saturated, neighbours desaturated by distance.
   Trinity's honeycomb could do exactly this on hover and on its auto-flip.

**Expensive — decide deliberately:**

7. **The pinned card-stack.** 4,128px of scroll, GSAP ScrollTrigger, 800–1,200 style writes per
   600px. Genuinely impressive, and the reason the page is 14,438px long.
8. **The scroll-driven hero open** (`--hero-fit-p`, `clip-path: circle(150% …)`). Note it finishes
   in **310px** — they did not make you scroll far for it. If Trinity does this, keep it that short.

**What Trinity should not copy:**

- Display type set larger than the viewport can hold, bleeding into both gutters.
- Decorative chips overlapping headline letterforms — legibility traded for style.
- A 2,269px footer carrying ~20 full postal addresses.
- **Nothing in their hero is a form.** Trinity's enquiry card above the fold is the better
  commercial choice; do not trade it for a single CTA button.

---

## Technical notes for anyone re-measuring this

- **Lenis intercepts `window.scrollTo`.** Programmatic jumps land at the wrong offset unless the
  position is set twice with a gap between, or `lenis.scrollTo` is driven directly. Several frames
  in this pass had to be re-taken for that reason.
- GSAP is bundled, so `window.gsap` is `false`. Detect it by `.pin-spacer` in the DOM and by the
  `translate: none; rotate: none; scale: none;` prefix GSAP's CSSPlugin writes on every target.
- `IntersectionObserver` is **never constructed** on this page — every reveal is ScrollTrigger.
