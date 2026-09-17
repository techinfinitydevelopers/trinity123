# ENpower Design System

A reusable design system for **ENpower** (Enlearning Skill Development Limited) — India's first comprehensive entrepreneurship-learning ecosystem for schools.

> "Think. Create. Lead." — Empowering children with future skills and entrepreneurial mindsets.

---

## 🏢 Company Context

**ENpower** partners with K-12 schools across India to deliver hands-on, future-skills education that combines design thinking, entrepreneurship, STEM and assessment in a single integrated ecosystem. Founded by Enlearning Skill Development Limited (Mumbai), with a strategic alliance with **TATA ClassEdge**.

### Products represented

| Product | Focus | Slug |
|---|---|---|
| **Future Skills Lab (FSL)** | Entrepreneurship & 17-skill future ecosystem (Grades 6-12) | `future-skills-lab` |
| **Composite Skills Lab (CSL)** | CBSE CSL & Kaushal Bodh compliance, project-based skills | `composite-skills-lab` |
| **Tech Innovation Lab (TIL)** | AI, robotics, coding, smart systems — STEM→Innovation | `tech-innovation-lab` |
| **Training & Certification Academy** | Educator certification (Design Thinking, STEM) | `training-academy` |
| **Impact Programs** | CSR partnerships, livelihood, ATL enhancement, I.D.E.A Labs | `impact-programs` |
| **India's Future Tycoons (IFT)** | National entrepreneurship search & mentorship platform (13-18) | external — indiafuturetycoons.com |
| **About / Company** | Story, team, vision, mission, 2015-2025 timeline | `about-us` |

### Sources

- **Codebase:** `techinfinitydevelopers/ESL` (main branch) — vanilla HTML/CSS/JS + Bootstrap 5.3.2 + GSAP + Material Symbols. Imported via GitHub on May 11, 2026.
- Key files referenced: `index.css` (115 KB master stylesheet), `home.html`, `index.html`, `header.html`, `footer.html`, `about-us.html`, `claude.md` (full overview from the dev team).
- **Contact:** info@enlearning.in · 1402 Dosti Carnation, Antop Hill, Mumbai 400037.
- **Socials:** Facebook (`Enpowerbschool`), LinkedIn (`enlearning`), Instagram (`enpower.thinkcreatelead`).

---

## 📁 Index — what's in this folder

```
README.md              ← you are here
SKILL.md               ← agent-invocable skill manifest
colors_and_type.css    ← all brand CSS variables + semantic helpers
assets/                ← logos, illustrations, icon GIFs, student photos, partner logos
preview/               ← Design System tab cards (palette, type, components…)
ui_kits/
  └── marketing-site/  ← high-fidelity recreation of the ENpower public website
```

---

## ✍️ Content Fundamentals

**Voice:** confident, warm, mission-driven. ENpower writes like an educator-evangelist — bold ambitions, clear capability claims, occasional poetic flourishes.

- **Person:** mostly second person (*"your children"*, *"empowering you to"*) blended with first-person plural for the brand (*"We bridge this gap…"*). Avoid first-person singular.
- **Casing:** Title Case for headings; Sentence case for sub-heads & paragraphs. **All-caps reserved for super-emphasis** (e.g. `CREATING LARGE-SCALE IMPACT.`).
- **Capitalize product names** as proper nouns: *Future Skills Lab*, *Tech Innovation Lab*, *Skill Passport*.
- **Hindi/Hinglish welcome internally** (the dev `claude.md` mixes "Ye schools ke liye…") but external copy is polished English.
- **Numbers, metrics, scale.** Copy reaches for tangible counts: *17 future skills*, *5 future-ready outcomes*, *12+ states*, *750+ partner schools*, *200,000+ future leaders*, *48-72 hours/year*. Use `+` suffix on round numbers.
- **Tagline pattern:** three-verb stanzas — *"Think. Create. Lead."*, *"Skill • Innovate • Transform"*.
- **Frameworks name-drop:** OECD, WEF, UNICEF, NEP 2020, NFTE, Atal Marathon, INSPIRE MANAK — credibility through alignment.
- **No emoji in production copy.** Replace with Material Symbols Outlined (`visibility`, `track_changes`, `star`, `arrow_forward`). Emoji appears only in internal dev docs.
- **Sentence length:** mix of short punchy (*"Hands-on. Future-ready. Recognized nationally."*) and longer descriptive sentences.

### Headline phrasing examples (drawn from live site)

- "Nurturing a Generation of Future Creators"
- "India's First Integrated Future-Skills Ecosystem for Schools"
- "An End-to-End Ecosystem For Schools"
- "Stories of Transformation"
- "Innovator's Spotlight"
- "The ENpower Footprint"
- "CREATING LARGE-SCALE IMPACT."
- "Empowering Educators to Shape Future Learners"

### Highlight word treatment

Headings frequently split into **two-tone** spans: black/ink text + one purple-or-italic-purple word. E.g.

> An <span style="color:#6c32a8">End-to-End Ecosystem</span> For Schools
> ENpower's <em style="color:#6c32a8">Engagements</em>
> Stories of <em style="color:#6c32a8">Transformation</em>

---

## 🎨 Visual Foundations

### Colors

- **Primary purple** `#6c32a8` — the brand. Used for headings highlights, buttons, links, icon tints.
- **Deep purple** `#652b7d` / `#4a307d` for hover/active.
- **Accent gold** `#e5a93e`, `#facc48`, `#E5A817` — sparkles, secondary CTAs (nav arrows, back-to-top), occasional highlight.
- **Backgrounds:** light lavender `#f5f0fa` / `#f6f0fa` is the canonical page background. Plain white sections used between lavender sections for rhythm.
- **Signature gradient:** `linear-gradient(135deg, #efdeff 0%, #fffce3 100%)` — a soft purple→cream that appears on the *Vision card*, *Counter cards*, *Lets-Connect card*, *Cookie banner*, *Card flips*. This is the most iconic single visual decision in the system.

### Type

- **Display:** Space Grotesk 700-800, tight letter-spacing (`-1.5px` to `-3px`).
- **Body:** Montserrat 400-600, line-height 1.6.
- Hero heading uses `clamp(2.8rem, 6.5vw, 6.2rem)` with image **capsules** (pill-shaped photos) flowing inside the headline — a signature treatment.

### Backgrounds & motifs

- **Animated wave canvas** behind every hero (`#waveCanvas`) — subtle diagonal waves in brand colors.
- **Sparkle stars** (✦) scattered around heroes, with `sparklePulse` animation (rotate + scale).
- **Image capsules:** pill-shaped images (`border-radius: 100px`) sitting inline within hero headlines, with a 3-px white border and purple shadow.
- **Hand-drawn rocket SVG** as a decorative element on the homepage hero.
- **Animated GIFs:** `idea.gif`, `recognition.gif`, `AI Searching.gif`, plus iconography GIFs (foundation literacy, future competency, human skills, self-exploration, tech of the future) — substitute for static icons in feature callouts.
- **Marquee strips:** dual-row infinite scroll for partner logos (LTR + RTL), greyscale→color on hover.
- **Faint structural grid lines** behind big sections (25%/50%/75% h-lines & v-lines at `rgba(91,63,166,0.065)`).
- **Curved-bottom image masks** on story cards (`border-radius: 50% 50% 0 0 / 100% 100% 0 0` overlay).

### Animation

- **Library:** GSAP 3.12.5 + ScrollTrigger. Plus CSS keyframes for marquees, sparkles, fades.
- **Easing:** mostly `cubic-bezier(0.4, 0, 0.2, 1)` for entrances; `ease` for hover.
- **Durations:** 0.3-0.8s. Card flips run 0.8s. Slides fade 0.8s.
- **Counters:** roll up with `easeOutQuart`, triggered by IntersectionObserver.
- **Horizontal scroll** (timeline + stories): GSAP pins the section, scroll drives the X-translate, snaps to nearest item.
- **Card flips:** 3D Y-axis flip on hover (`transform: rotateY(180deg)`). Wide cards use X-axis flip instead.
- **No bounces.** Motion stays smooth, never playful-cartoony.

### Hover & press

- **Buttons:** translateY(-2 to -3px) + deeper shadow + slightly lighter gradient.
- **Cards:** translateY(-5px) and image-inside `scale(1.05)`.
- **Logos in marquees:** greyscale 100% → 0% on hover, opacity 0.7 → 1.
- **Icons:** rotation (chevron rotates 180°), or fill-on-hover for Material Symbols.
- **No "shrink on press"** — feel is gentle/premium, not snappy/app-like.

### Borders, shadows, radii

- **Corner radii:** pills (100px) for buttons & badges; 12-20px for cards; 24-40px for hero cards and call-out blocks.
- **Card borders:** 1px solid `rgba(91, 63, 166, 0.15)` — purple-tinted, not grey.
- **Shadows:** purple-tinted (`rgba(107, 33, 168, 0.10–0.18)`) for cards; black for hard-edge elements (modals, video cards).
- **No inner shadows.** No skeuomorphism.

### Layout rules

- Nav is **fixed**, 80-90px tall, translucent + `backdrop-filter: blur(8-16px)`. Background goes more opaque on scroll.
- **Container max-width** ~1140-1320px (Bootstrap 5.3.2 grid).
- **Section padding** 5-7rem vertical on desktop, 2.5-4rem on mobile.
- **Bento grid** for engagement cards: 1 wide top card spanning 3 cols + 3 regular cards.

### Transparency & blur

- Used in **glass badges** on video cards (`rgba(255,255,255,0.2) + backdrop-filter: blur(12px)`).
- Used in **nav bar** background.
- Used in **modal overlays** (`rgba(0,0,0,0.85) + backdrop-filter: blur(8px)`).
- Used in **decorative blobs** (`filter: blur(100px)` purple at 7% opacity, floating behind hero/sections).

### Imagery vibe

- **Warm, hopeful, very Indian.** Photos feature students of diverse ethnicities in school uniforms, classrooms, project setups, awards podiums. Bright daylight, saturated colors. No grain, no b&w, no dark-mode photography.
- Stock photos used for slideshow placeholders (Unsplash, team/students/trainers/events buckets).
- Student-innovator portraits are the brand's emotional anchor — always shown with full name + grade + state.

### Iconography

See *ICONOGRAPHY* section below.

---

## 🔣 Iconography

- **Primary:** **Material Symbols Outlined** (Google Fonts) — `arrow_forward`, `architecture`, `extension`, `psychology`, `emoji_events`, `visibility`, `track_changes`, `star`, `analytics`, `auto_awesome`, `explore`, `tips_and_updates`, `trending_up`, `volunteer_activism`, `science`, `chevron_left`, `chevron_right`, `arrow_upward`. **Fill: 0** by default; some hover to filled.
- **Secondary:** **Material Icons** (classic) — still loaded on most pages and used interchangeably with Symbols Outlined.
- **Custom inline SVG** for: hand-drawn rocket (hero deco), social brand glyphs (Facebook/LinkedIn/Instagram in footer — inline 24×24 path), nav chevron, hero CTA arrow.
- **Animated GIFs as icons** in feature callouts: `assets/icons/foundation-literacy.gif`, `future-competency.gif`, `human-skills.gif`, `self-exploration.gif`, `tech-of-the-future.gif`, plus `idea.gif`, `recognition.gif`, `AI Searching.gif`. These appear at ~70-120px, free-floating, often near headings.
- **Sparkle character** `✦` (Unicode U+2726) used decoratively, never inline in body copy.
- **No emoji** in production copy. Project history shows emoji being explicitly replaced by Material Symbols (e.g. 🔭→`visibility`, 🎯→`track_changes`, ✦→`star`).
- **Partner / school logos** in `assets/csr-logo/` and `assets/school-logo/` — used at low contrast (greyscale + 70% opacity), color-restored on hover.

To use Material Symbols in HTML:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
<span class="material-symbols-outlined">arrow_forward</span>
```

---

## 🧱 UI Kits

| Kit | Path | Description |
|---|---|---|
| Marketing Site | `ui_kits/marketing-site/index.html` | Hi-fi recreation of the ENpower public website: nav, hero with image capsules, story scroller, impact counter, ecosystem cards, bento engagements grid, footer. |

---

## ⚠️ Substitutions / Caveats

- **Fonts:** Space Grotesk and Montserrat are both Google Fonts → no local font files needed. Loaded via `colors_and_type.css` `@import`.
- **Icons:** Material Symbols Outlined + Material Icons loaded from Google Fonts CDN. No local sprite/font copied.
- **Photography:** Hero photos `hero1.jpg`, `hero3.png`, `hero4.jpg` and Unsplash slideshow stock images were NOT imported (they're not unique brand assets and would bloat the project). Use `assets/home/hero2.png` and `assets/home/article.jpg` plus student portraits as the canonical imagery anchors.

---

*Last updated: May 11, 2026.*
