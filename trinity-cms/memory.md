# Project memory — trinity-cms

## Build log
### 2026-09-28 — Full student-support chatbot system
Rebuilt the chatbot from "open chat, whole-KB-in-prompt, no escalation" into the client's full
spec: pre-chat lead form, real two-level FAQ matching with a confidence threshold, bulk CSV/Excel
import, an honest "I don't know" flow with escalation, urgent-query email alerts, full
conversation history with match metadata, and a much richer admin dashboard. Confirmed with the
owner first: **Resend** for email (`RESEND_API_KEY`), bulk upload accepts **CSV + Excel**.

**Data model** (`prisma/schema.prisma`): `ChatSession` gained `status` (OPEN/IN_PROGRESS/RESOLVED),
`isUrgent`/`urgentQuestion`/`urgentAt`. `ChatMessage` gained `matchedKnowledgeId`, `matchedQuestion`,
`confidence`, `fromKnowledgeBase`, `unmatched`, `unmatchedResolved`. `KnowledgeItem` gained
`keywords`, `category`, `relatedQuestions` (kept unused legacy `tags`). New `ChatNote` model for
timestamped admin notes. **Deliberately did NOT add separate `Student`/`UrgentRequest`/`Category`
tables** — `ChatSession` already *is* the conversation (has name/email/phone), so "Urgent Requests"
and "Student Conversations" in the admin are the same list, just filtered — avoids duplicate,
driftable data. Category is free text with datalist autocomplete, not its own CRUD screen.

**Matching** (`src/lib/chat-match.ts`) is two-level, with no new vector-DB infra:
1. Fast keyword/substring overlap scorer against `KnowledgeItem` (active only) + each destination's
   own `Country.faq` entries (so existing country FAQ content still answers questions without
   retyping it — corpus = `getMatchCorpus()`).
2. If inconclusive and `ANTHROPIC_API_KEY` is set: one cheap `claude-haiku-4-5` call that picks the
   best-matching FAQ by meaning + last 4 turns of context, returning `{index, confidence}` JSON.
Below the admin-configured `matchThreshold` (default 0.55) → unmatched flow, **never** a guess.
Matched answers are served **verbatim** from the stored `KnowledgeItem.answer` (not
model-regenerated) — this is what makes "never invent beyond the approved KB" actually true, and
it's also why the chatbot no longer needs `buildSystemPrompt`/the old full-KB-prompt-stuffing
approach at all; `src/lib/chat.ts` is now just the IP/rate-limit abuse guards.

**English-only** (owner request, same day): `isNonEnglish()` in chat-match.ts checks for
Devanagari script OR ≥2 common romanised-Hindi function words ("kya", "hai", "chahiye", "mujhe",
etc. — see `HINGLISH_WORDS`) among a message's words; `/api/chat` intercepts before matching and
replies with a fixed "ask in English" message instead of processing the question. This catches
native-script Hindi and common Hinglish reliably; it's a heuristic, not real language detection,
so unusual phrasing can slip through — that's an accepted, documented limitation, not a bug to
chase further.

**Removed the `save_lead` Claude tool entirely** — redundant now that the pre-chat form
(`startChatSessionAction` in `src/lib/chat-session.ts`) captures name/email/phone *before* any
question, unlike the old mid-conversation tool-call capture.

**Gotcha (cost real debugging time): `unstable_cache` persists across `next dev` restarts.**
`getSetting()` merges `{...DEFAULTS[key], ...row.value}`, so changing `DEFAULTS` or a `Setting`
row's DB value does **not** take effect on the next request even after restarting `next dev` —
Next's dev cache is stored on disk under `.next/cache`, keyed by the literal `unstable_cache` key
array, not by source hash or row `updatedAt`. Symptom hit here: `cfg.notifyEmail` was `undefined`
(crashing `sendUrgentEmail` on `.trim()`) even though `DEFAULTS.chatbot.notifyEmail` was clearly
`""` in the edited source, because a stale cached settings object from before the edit was still
being served. **Fix: `rm -rf .next` and restart** whenever a `Setting` row or a `DEFAULTS` value
changes and the running dev server doesn't seem to pick it up — don't waste time re-reading the
code, the code is usually already correct. (Also hardened `notify.ts` defensively either way:
`(cfg.notifyEmail || "").trim()`.)

**Gotcha: reused chip CSS classes carry their old positioning.** N/A here directly, but the same
class of bug as the earlier hero redesign — always check a shared class (`chip--c`, etc.) doesn't
already have `left/right/top/bottom` baked in before combining it with a new position modifier.

**Verified end-to-end in the browser** (not just tsc/eslint/build, all clean): pre-chat form blocks
chat until submitted; exact-wording question → verbatim KB answer, confidence 1.0,
`fromKnowledgeBase:true`; Hinglish-phrased version of the same question → matched via the semantic
pass at confidence 0.95 (proves the two-level matcher genuinely works, not just luck); unrelated
question → unmatched flow with the three buttons, no invented answer; "Ask Admin" → session flagged
urgent in the DB + confirmation shown (no `RESEND_API_KEY` configured locally, so email send is a
verified no-op, not tested live); `/admin/chats` search/urgent-filter/status/notes all verified
against real data; `/admin/chatbot` bulk CSV upload verified for valid-import, duplicate-skip and
per-row-validation-error cases. **Excel (.xlsx) upload could not get a clean live browser test** —
the generated test file was proven byte-valid by reading it back with the `xlsx` package in Node,
but got corrupted specifically in transit through this session's own base64-inline test method; the
xlsx-specific code (`XLSX.read` + `sheet_to_json`) is a few lines of standard SheetJS API shared
with the already-verified CSV path, so this is a test-tooling gap, not a known product bug — worth
a real manual check with an actual Excel file before calling it fully proven.

**Fixed a real bug found during manual verification**: the "Unanswered questions" admin list was
showing the bot's own canned reply text instead of the student's actual question, because
`unmatched:true` was being set on the assistant's reply message, not the preceding user message.
Fixed in `/api/chat/route.ts` by creating the user `ChatMessage` first (capturing its id) and
setting `unmatched` on *that* row when no match is found; repaired the handful of test rows already
in the dev DB that had it backwards.


## Knowledge base
- `unstable_cache` JSON-serialises its return value on **every** cache hit. Any `Date`
  revived *inside* the cached function is handed back to callers as a string again.
  Date revival must happen in a wrapper **outside** `unstable_cache`. (`src/lib/content.ts`)
- Symptom of violating this: first (cold) `next build` passes, second (warm-cache) build
  fails with `publishedAt?.toISOString is not a function` during prerender.
- Prisma client is generated to `src/generated/prisma`; its `path.join(process.cwd(), ...)`
  produces 2 harmless Turbopack "whole project traced" warnings on every build.
- Local dev DB is `embedded-postgres` on `localhost:5433`, started with `npm run db:dev`.
  It is NOT auto-started by `npm run dev` — if it's down, every DB-backed route (chat,
  admin, anything hitting Prisma) fails; `next dev` itself still serves static pages fine.
- Chatbot (`src/app/api/chat/route.ts`) needs `ANTHROPIC_API_KEY` in `.env`. If it's empty,
  `src/lib/chat.ts`'s `fallbackAnswer()` serves keyword-matched replies instead of erroring —
  this is intentional so the client can add their own key post-handover without code changes.
- Writing BOTH `backdrop-filter` and `-webkit-backdrop-filter` manually in one declaration
  (in that order — standard first) can make Turbopack/Lightning CSS's autoprefixer drop the
  standard property from the compiled output, silently disabling the blur. Elsewhere in this
  codebase only the standard `backdrop-filter` is written and the tool auto-adds the prefix —
  follow that pattern; don't hand-write the vendor prefix.
- `[data-reveal]` scroll-in-view animation (`src/components/site/SiteScripts.tsx` +
  `site.css`) starts every element at `opacity:0`; only IntersectionObserver adds `.in`.
  Two safety nets now exist so a JS failure never permanently hides content: `html.no-js`
  CSS fallback (`src/app/layout.tsx` sets `.no-js`→`.js` via inline script) and a 4s
  force-reveal timeout in `SiteScripts.tsx`.
- **The `.container` specificity trap.** `site.css` has scoped resets — `.section .container{padding:0}`
  (line ~108) and `.footer .container{padding:0;position:relative}` (line ~540). Several block
  elements render as `class="container <block>"` (e.g. `container footer__cta`, `container cta
  cta--center`, `container footer__grid`, `container footer__bottom`). A bare `.footer__cta{padding:…}`
  rule is specificity (0,1,0) and **silently loses** to those (0,2,0) resets, so its padding computes
  to `0px`, content overflows, and `overflow:hidden` clips it. Any new block class that also carries
  `.container` MUST be written as `.footer .x` / `.section .x` to out-specify the reset. Symptom to
  look for: `el.scrollHeight > el.clientHeight` on a card that should have padding.
- Don't assume "declaration missing at runtime" means the build dropped it — check specificity FIRST.
  Fetch the compiled chunk (`/_next/static/immutable/chunks/*.css`) and grep the rule: if the
  declaration is present verbatim there but `getComputedStyle` disagrees, it's the cascade, not
  Lightning CSS. (Only `.nav`'s hand-written `-webkit-backdrop-filter` was ever a genuine build drop.)
- The scrolled header pill (`.site-header.is-scrolled .nav`) caps at `max-width:1200px` while
  `.nav__links` and `.nav__actions` both refuse to shrink (`white-space:nowrap`), so the row's
  min-content width exceeds the pill and the CTA spills past the rounded edge at viewports ≥~1250px.
  Fixed by tightening `gap` and link padding in the scrolled state; don't "fix" it with
  `overflow:hidden` on `.nav` — that clips the button instead of fitting it.
- The Browser-pane screenshot tool in this environment is unreliable when the pane isn't
  the focused window — it returns stale/frozen frames or blank white without erroring.
  Cross-check any suspected visual bug against real computed styles / DOM state
  (`getComputedStyle`, `getBoundingClientRect`, `getAnimations()`) before trusting a
  screenshot, especially for scroll-position-dependent or animation-related issues.

## Build log
### 2026-09-17 — first production build verification
- Ran `npm run build` (Next.js 16.3.5, Turbopack). Cold build passed, warm build failed.
- Root cause: revive-inside-cache bug above.
- Fix: `src/lib/content.ts` — split `getPage`, `getPageSlugs`, `getPost`, `getRelatedPosts`,
  `getPublishedPostSlugs`, `getCountry` into a private `unstable_cache` fetcher plus an
  exported wrapper that applies `revive`/`reviveAll`.
- Verified: `npx tsc --noEmit` clean, `npx eslint src --quiet` clean,
  cold + 2 warm builds exit 0, all 13 checked routes return 200 under `npm start`.

### 2026-09-23 — Home hero redesign
Owner-requested changes to the home hero (`src/components/site/blocks/Hero.tsx`), confirmed via
AskUserQuestion before building:
- Removed the rotating country-flag "orbit" + its `chipA`/`chipB` floating stat chips and the
  "Your Gateway to Global Education" badge pill. The orbit is NOT deleted — pulled out intact
  into `src/components/site/OrbitFlags.tsx` (self-contained, hardcoded defaults) per the owner's
  explicit "retain it, we'll reuse it elsewhere with different flags" request. Nothing renders it
  yet.
- New hero visual: student cutout photo (placeholder `home-page-2.png`, already used elsewhere,
  swap via Media picker once a real photo is supplied) on a gradient card
  (`.hero-visual__img--cutout`, object-fit:contain since it's a transparent-background cutout —
  the base `.hero-visual__img` is object-fit:cover for real photography, used by PageHero's
  "visual" aside kind, so don't reuse that modifier for cutouts elsewhere) + a 3-hexagon
  honeycomb stat cluster (new `.hive`/`.hive__item`/`.hive__item__face` CSS, gold-bordered via
  padding-trick nested clip-paths) overlapping it — modelled on a reference screenshot the owner
  supplied (SIEC India-style honeycomb).
  **Gotcha**: `.chip--c` (still used by `OrbitFlags`) carries its own legacy `right:4%;bottom:6%`
  position rule. Reusing the `chip--c` class name for the new hero's "Trusted by students" chip
  while also adding `.chip--hv-a` for positioning made both rules apply at once (conflicting
  left+right → the chip stretched to ~465px wide). Fixed by dropping `chip--c` entirely there and
  using the unrelated `.chip--hv-b` position class instead. When reusing a positioned chip
  variant in a new context, check it doesn't already carry positioning CSS from its old home.
- New tagline: "Every Dream needs a direction" / "Let Trinity Study Abroad help you find yours."
  (`HeroBlock.words`/`.text`), replacing "Transform Your Future with TSA".
- Removed the blue marquee `<Band>` block ("Dream Big…", "Free Counselling", etc.) from the home
  page entirely (component/type kept, just not in `homeBlocks`).
- Fixed a real mobile bug flagged by the owner: the "Free Counselling" header CTA
  (`.nav__cta`) was `display:none` below 1120px — desktop-only by accident, not by design (unlike
  the orbit, which really was meant to be desktop-only). Made it visible on mobile in a
  compact form; that overflowed the header until the wordmark next to the logo
  (`.nav__logo-name`) was also hidden below 640px to make room — the mobile header was already
  tight with just phone+hamburger, before this CTA needed a third slot.
- `HeroBlock` type (`src/lib/blocks.ts`) changed: removed `badge/badgeIcon/flags/centerImg/
  centerLabel/chipA/chipB`, added `photo: string` and `hive: {img,value,label}[]`. Old DB content
  for the home page's hero block is a different shape — **pushed the new defaults live via the
  admin's own "Reset to default" button** (`resetPageAction`, home page only; that action fully
  replaces the page's blocks with `seed-content.ts` and there was nothing else customized on
  Home to lose). Any other page with a stale hero block shape would need the same treatment.
- Verified: `npx tsc --noEmit` clean, `npx eslint src --quiet` clean, `npm run build` exit 0,
  live-checked home page at 1440px (hero-visual + hive render, chip fixed) and 375px
  (hero-visual correctly hidden, nav CTA + hamburger both fit and both work).

### 2026-09-17 — local live preview, chatbot fallback, header blur bug
- Exposed local dev server via a Cloudflare quick tunnel for a shareable link
  (`trycloudflare.com`, no account, dies when the tunnel process/PC stops).
- Local DB was down (`localhost:5433` unreachable) causing chat API to 503 with
  "assistant is unavailable" — started with `npm run db:dev`. Confirmed working after.
- Investigated "many sections not showing" report. Full site scan (11 pages + all 11
  destination pages): all 200 OK, no broken images, no console errors, all content present.
- Found and fixed a real bug: `.nav{backdrop-filter:...; -webkit-backdrop-filter:...}` in
  `src/styles/site.css` had the standard property stripped by the build's autoprefixer,
  so the floating header pill never blurred — page content scrolling underneath it showed
  through and visually overlapped the nav text. Fix: removed the redundant manual
  `-webkit-backdrop-filter` line (see knowledge base above). Verified via
  `getComputedStyle` and screenshots on desktop + mobile viewports, before/after.
- Hardened the `[data-reveal]` scroll animation against permanent invisibility (no-js CSS
  fallback + 4s JS timeout) as a defensive fix, independent of the above bug.
- Verified: `npx tsc --noEmit` clean, `npx eslint src --quiet` clean, full manual scroll-
  through of homepage + about/why/services/contact/blog/destinations on desktop and mobile.

### 2026-09-17 — nav links wrapping to 2 lines
- User reported nav items ("About Us", "Study Destinations", "Contact Us") wrapping onto
  2 lines at wide desktop widths (~1600px), both in the top (full-width) and scrolled
  (pill-shaped, max-width:1200px) header states.
- Root cause: `.nav__links a` (`site.css`) and `.nav__links .cv-ddbtn` (`canvas.css` — the
  "Study Destinations" dropdown button, styled separately since it's a `<button>` not an
  `<a>`) both lacked `white-space:nowrap`, so flex-shrink let multi-word labels wrap.
- Fix: added `white-space:nowrap` to both rules. Verified via `getBoundingClientRect()`
  height (43px, single-line) on every nav item at 1600px width, both header states.

### 2026-09-17 — first Vercel production deploy
- Repo `techinfinitydevelopers/trinity123` on GitHub was empty; committed all pending work
  and pushed `main` for the first time (commit `447ba9d`).
- Pushing to GitHub auto-created a Vercel project (`trinity123`, team `vivek's projects`)
  via the pre-installed Vercel GitHub App, with **wrong defaults**: Root Directory `./`
  (repo root — the Next.js app is in `trinity-cms/`) and Framework Preset **blank/"Other"**.
  Net effect: the "deployment" only uploaded `public/` static assets, zero serverless
  functions, so every route 404'd — this looked like a build failure but wasn't; the build
  logs showed no errors because Vercel wasn't invoking `next build` at all.
- Fixed in Project Settings → Build and Deployment: Root Directory → `trinity-cms`,
  Framework Preset → `Next.js`. Both must be set; fixing only one still 404s.
- Added env vars: `AUTH_SECRET` (freshly generated), `NEXT_PUBLIC_SITE_URL` (must be type
  **Config**, not Secret — Vercel rejects `NEXT_PUBLIC_*` vars saved as Secret since they're
  inlined at build time, not runtime-only).
- Provisioned a free Neon Postgres via Vercel Storage → Create Database → Neon (accepted
  Neon's ToS/Privacy Policy as part of that flow). On the "Connect to Project" step, changed
  the **Custom Environment Variable Prefix** from the default `STORAGE` to `DATABASE` — this
  is what makes it show up as `DATABASE_URL` (Prisma's expected var) instead of
  `STORAGE_URL`. Neon also auto-adds a pile of `POSTGRES_*`/`PG*` vars alongside it, harmless.
  `ANTHROPIC_API_KEY` deliberately left unset — client adds their own post-handover; the
  keyword-fallback chatbot covers it until then.
- Ran `prisma db push` + `prisma db seed` against the new Neon `DATABASE_URL` locally
  (one-off, passed as an inline env var override — never written to `.env`) to get the
  production DB into the same state as local dev. Seed prints a **dev-default admin login**
  (`admin@trinitystudyabroad.com` / `Trinity@2026`) — must be changed in Settings → Security
  before the client goes live for real.
- After fixing Root Directory + Framework Preset and redeploying ("Redeploy" picks up
  latest Project Settings, not just latest commit), the Resources tab showed actual
  serverless functions (previously: static assets only) and the live site rendered
  correctly. Verified: home page, `/destinations/canada` (DB-backed content), `/admin/login`.
- Live URL: **https://trinity123.vercel.app**

### 2026-09-17 — footer/CTA padding collapse + nav CTA overflow (parallel audit)
- User reported the footer "Ready to start your study abroad journey?" card looking broken (kicker
  text spilling out / clipped) and the header "Free Counselling" button sticking out of the nav pill.
- Ran 9 parallel audit agents (one per page + one CSS-source inventory + one root-cause agent).
  Initial hypothesis — "the build is dropping declarations" — was **wrong**: agents fetched the
  compiled chunk and proved every declaration survives Lightning CSS verbatim. Real cause was the
  `.container` specificity trap (see knowledge base). Worth remembering: the parallel audit paid for
  itself by killing a wrong hypothesis fast and finding a 4th instance (`.cta--center`) nobody had
  reported yet.
- Fixed by raising specificity on the four affected rules: `.footer .footer__cta` (+ explicit
  `position:relative`, since it had been leaning on the reset for that), `.footer .footer__grid`,
  `.footer .footer__bottom`, `.section .cta--center`.
- Fixed the nav overflow in the scrolled state: `gap:14px` on the pill and `padding:10px 14px` on
  the links, plus `.nav__actions{flex-shrink:0}`. CTA now sits 11px inside the pill (was 12.8px out).
- Verified locally via `getComputedStyle` + `scrollHeight`/`clientHeight`: footer CTA padding
  40.96px and no clipping, `.cta--center` 80px, footer grid/bottom padding restored, nav overflow
  negative at 1440px.
- Deployed (commit `347e857`) and re-verified on production: footer CTA padding `48px 56px`, kicker
  now renders inside the card, nav CTA sits 11px inside the scrolled pill, and all four rules are
  present verbatim in the shipped chunk.
### 2026-09-17 — admin dashboard + editor UI modernisation
- Admin styling lives entirely in `src/app/globals.css` (Tailwind v4 `@theme` + `@apply` primitives)
  and is separate from the public site's `site.css`. Changing one cannot affect the other.
- **Gotcha:** in Tailwind v4 a plain `.foo { @apply … }` class CANNOT be `@apply`-ed by another rule —
  you get `Cannot apply unknown utility class 'foo'` at build time. It must be declared as
  `@utility foo { … }` (that's why `btn` already was). Hit this converting `.chip` so `.chip-live`
  and `.chip-draft` could extend it.
- Primitives now available for any new admin panel: `.card-head` / `.card-title` (panel header strip),
  `.chip-live` / `.chip-draft` (status pills), `.icon-tile` (tinted square behind an icon),
  `.sticky-bar` (glassy floating strip). Use these instead of re-styling headers per page.
- The editors are long-scroll forms, so save controls belong in a `.sticky-bar` at the top, not only
  in the sidebar — on a full-length article the sidebar Save is far off-screen.
### 2026-09-23 — client brand palette rollout
- **Theme colours live in the DATABASE, not just in code.** `getSetting` returns
  `{ ...DEFAULTS[key], ...row.value }`, so the `Setting` row named `theme` WINS over `DEFAULTS` in
  `src/lib/settings.ts`. Editing DEFAULTS alone changes nothing on a seeded install — the row must
  be updated too (local dev DB *and* production Neon).
- **`unstable_cache` keeps settings in memory for the life of the dev server process.** Writing to
  the DB directly (bypassing `saveSetting`, which calls `revalidateTag("settings")`) leaves the old
  values served until a *full* restart. Deleting `.next/cache` is not enough and neither is
  `pkill -f "next dev"` on Windows — that does not kill the real process. Use
  `Get-NetTCPConnection -LocalPort 3000 … | Stop-Process -Force`, then `rm -rf .next`, then restart.
  Changing the theme through **/admin/theme** avoids all of this — it invalidates the tag properly.
- Client brand palette (brand sheet, 2026): Trinity Blue `#232F70` (dominant) · Sky `#5B84C4` ·
  Teal `#1ABC9C` · Gold `#F7DD7D` · Cream `#FFE8BE` · Charcoal `#333` · Grey `#6B7280` ·
  Light grey `#F5F7FA`. Approved combination is "Modern & Fresh" = Navy + Teal + Cream + White.
- Client asked for the big blue page backgrounds to go. Hero, inner page hero, post hero and the
  pinned universities scroller are now cream/light; the footer, CTA band, stack cards and small
  dark cards stay Trinity Blue so the brand still anchors the page.
- `.badge` / `.btn--ghost` / `.w__in.gold` / `.w__in.grad` / `.kicker--gold` were written as
  white-on-navy. There is now a **"Light-surface overrides"** block at the bottom of `site.css`
  that flips them, scoped to `.hero`, `.page-hero` and `.post__hero` only — do not unscope it or the
  still-dark panels lose their contrast.
- `CountryPage.tsx` and `blog/[slug]/page.tsx` had ~128 hardcoded old-palette hexes in inline
  styles and so ignored the Theme editor entirely. They now use `var(--primary)` etc. Keep it that
  way — inline `style={{ color: "var(--token)" }}` resolves fine at runtime.
- Gradients that ran navy → primary go flat now that both tokens are Trinity Blue; end them on
  `var(--primary-2)` (Sky) instead.
- Useful verification trick for "did my CSS actually ship?": grab the chunk URL out of the page HTML
  and grep the rule straight out of it —
  `CSS_URL=$(curl -s <site>/ | grep -o '/_next/static/[^"]*\.css' | head -1); curl -s "<site>$CSS_URL" | grep -o '\.my-rule{[^}]*}'`
  Beats guessing from a browser screenshot, and instantly distinguishes "not deployed yet" from
  "deployed but overridden".
- Flipping a surface from dark to light is never just the `background`. `.pin` (universities
  scroller, now `--grey`) and `.section--dark` (journey band, now `--cream`) still carried
  `h2--light`, `lead--light`, `.pin__count`, `.pin__bar`, `.jcard` white-on-navy ink, so their
  headings and body copy were invisible. The Light-surface overrides block now has `.pin …` and
  `.section--dark …` rules alongside the hero ones. Rule of thumb: when a background token changes,
  grep the block's component for `--light`, `#fff` and `rgba(255,255,255` before calling it done.
- `.gold` (`#F7DD7D`) as *text* is unreadable on cream or light grey. On any light surface the
  highlight word flips to `var(--teal)` — that is why the overrides map `.gold` → teal inside
  `.hero`, `.page-hero`, `.pin` and `.section--dark`.

## Build log — 2026-09-28
- Fixed invisible copy in the "Explore Our World's Best Courses" (`.pin`) and "Start your Learning
  Journey Today!" (`.section--dark`) sections after the cream palette rollout. Extended the
  Light-surface overrides in `src/styles/site.css`: headings → `--navy`, leads/hints → `--muted`,
  gold highlights → `--teal`, `.pin__count`/`.pin__bar` re-inked, `.jcard` turned into a white card
  with navy title and muted body (white text restored on its hover fill), decorative glows damped
  to `.1`. Verified with `getComputedStyle` on `/` and `/about-us`. `tsc --noEmit` clean, lint
  0 errors (9 pre-existing warnings).
- `.ucard__img` used to declare `width:120%;margin-left:-10%` for parallax headroom, but the global
  `img{max-width:100%}` (site.css line 25) capped it, so the photo had no headroom at all and the
  scroller's `translateX(dn*40)` slid it off the card, leaving a bare strip. The headroom now comes
  from `transform:scale(1.14)` on the image and the travel is `clamp(dn,-1,1) * cardWidth * 0.05`,
  which stays inside the 7% overhang at every scroll position. Lesson: a percentage `width` on an
  `img` is meaningless here unless `max-width` is lifted too — check the computed width, not the rule.

## Build log — 2026-09-28 (2)
- Fixed the university cards in the pinned scroller showing a bare strip down the left. Cause was
  the parallax in `src/components/site/SiteScripts.tsx` translating the cover image further than
  its 10% overhang; clamped `dn` to ±1 and the travel to 22px. Verified across the whole pin scroll
  range in the browser (image edges stay outside the card at every step). `tsc --noEmit` clean.
- Brand teal `#1ABC9C` and grey `#6B7280` are fill colours; as **type** on cream or light grey they
  measure ~2:1 and ~4.0:1. `site.css` now derives `--teal-ink` and `--muted-ink` with `color-mix()`
  off the theme tokens, so they still follow whatever the dashboard sets. Use the `-ink` variants for
  copy on light surfaces (kickers, highlight words, crumbs, hero stat labels, post byline).
- Contrast/overflow sweep recipe: stash an auditor in `localStorage` from the browser pane, then
  `navigate` + `eval(localStorage.getItem('__audit'))` per page — it survives reloads, so the script
  is only sent once. Ignore hits whose background resolves to `body`/a light section but whose text
  actually sits over a photo with an overlay `<span>`: the walker follows ancestors, not siblings
  (`.ocard`, `.bento__cap`, `.ucard__body`, `.cv-hcard` are all this kind of false positive).

## Build log — 2026-09-28 (3)
- Swept every public page (home, about, why, services, contact, blog index, blog post, destination,
  search) at 1009px and 375px for contrast failures and horizontal overflow.
- Real fixes: blog post byline was white on the cream post hero (invisible); teal kickers and
  highlight words measured 2.0–2.2:1 on cream/light grey; breadcrumbs, hero stat labels and the
  scroll hint sat at 4.04:1. Added `--teal-ink` / `--muted-ink` derived tokens and applied them.
- Also rebuilt the university-card parallax after finding `img{max-width:100%}` was defeating the
  `width:120%` headroom the effect assumed (user asked for `margin-left:-10%` to go).
- No horizontal scroll on any page at either width. Remaining audit hits are text over photos.
- Still open for the client: destination-page heroes (`.cv-hero`) and the footer are the last big
  Trinity Blue surfaces — the brief said remove blue backgrounds, so they may want these cream too.
- Client signed off (2026-09-28) on cream for the last two blue surfaces: the destination-page hero
  (`.cv-hero` in `CountryPage.tsx`) and the site footer. What is still deliberately dark: the footer
  CTA card, the home CTA band, the stack cards, the destination page's "Visa requirements" card and
  closing CTA, and the `.marquee` strips. Those are accents on light, not page backgrounds.
- `CountryPage.tsx` keeps two button styles on purpose — `btnSolid`/`btnGhostInk` for the cream hero
  and `btnGold`/`btnGhost` for the still-navy closing CTA. Don't collapse them.

## Build log — 2026-09-28 (4)
- Turned the destination hero cream: cream base, hero photo down to 0.22 opacity under a cream wash
  instead of the navy gradient, navy h1, `--text` intro, `--muted-ink` crumbs, `--teal-ink` chevrons,
  white-glass flag chip, and new light button variants.
- Turned the footer cream: cream base, navy titles, `--muted-ink` links and contact lines, white
  glass social/tag pills with navy ink, `--teal-ink` accents, navy grid lines and watermark stroke.
  The footer CTA card stays on the primary gradient as the accent.
- Replaced the last two `const P = "Poppins,sans-serif"` literals (`CountryPage.tsx`,
  `blog/[slug]/page.tsx`) with `var(--font-h)`, so the Theme editor's font picker now reaches
  every inline style on those pages.
- Re-ran the sweep on /, /about-us, /contact-us, /destinations/uk, /destinations/canada, /blog and
  the blog post: no new contrast failures, no horizontal scroll. `tsc` clean, lint 0 errors.
- The hero headline's photo "capsule" (`capsuleImg` on the home hero block) is content, not code —
  `Words` only renders it when the field is non-empty. The client asked for it gone (2026-10-05), so
  the seed now ships `capsuleImg: ""` and the local `home` page row was blanked. **Production needs
  the same**: clear the capsule image in /admin → Pages → Home → hero, or blank it in the Neon row.
- Writing to the `page` table directly bypasses `revalidateTag("pages")`, so the dev server keeps
  serving the old blocks until a full restart + `rm -rf .next`. Editing through /admin does not have
  this problem — it revalidates properly.

## Build log — 2026-10-05
- Verified the client's four brief items on 7 pages at 1440px and 375px (no code changed for this):
  palette matches the brand sheet exactly and is DB-driven; logo renders at its true aspect ratio
  (1.913) with the wordmark stacked below in navy; topbar has search + phone icon + socials and no
  address or email; the phone icon next to Free Counselling shows on phone. Two gaps reported to the
  client: below 640px both `.nav__logo-name` and `.topbar__social` are hidden for space.
- Removed the photo capsule from the hero headline per the client: `capsuleImg` blanked in
  `seed-content.ts` and in the local `home` page row. Verified 0 `.capsule` nodes at both widths,
  no horizontal overflow. `tsc` clean.
- Client brief round 2 (2026-10-05), points 5–15. Delivered: the blue `band` page breaker is gone
  from every page; the hero honeycomb carries the client's five claims (42+ years · 50+ countries ·
  1200+ universities · 1 lakh+ courses · 100% visa success); a new `usp` block renders a scrolling
  rail of their 13 services with "One Stop Solution" pinned in the middle; "Gateway to Global" is
  out of the home title and the site tagline; headline figures moved 33+→50+ and 1100→1200 site-wide.
- The client's figures contradict the rest of the copy that existed (33+ countries, 1100
  universities, 30 years). We now claim 50+ countries while `/destinations` lists 11 — flagged to
  the client, not invented.
- Live databases are never re-seeded, so content-shape changes need a script as well as a seed edit.
  `scripts/apply-client-brief-2026-10.mjs` is idempotent and takes `DATABASE_URL` — run it once
  against production.
- `.hero-visual` used to be hidden below 1120px. The client wants everything on phones, so it now
  stacks under the copy and `.hive` reflows 3+2 → 2+2+1 under 860px.
- `color-mix()` needs Safari 16.2+. `--teal-ink` / `--muted-ink` now declare a static hex first and
  the `color-mix()` version second, so older iPhones still get readable ink.
- The inner page hero's aside widgets (`.statchip--glass`, `.svc-chip`, `.quick__item`) were
  glass-on-navy and became invisible on the cream hero — but only above 1120px, which is why the
  earlier sweep at 1009px missed them. **Audit at 1440 as well as 375.**

## Build log — 2026-10-05 (2)
- Applied client brief points 8, 11, 13, 14, 15 (5, 6, 7 were already satisfied by the hero rebuild).
  New `usp` block type + `Usp` component + admin label; seed and local DB migrated; one-off
  production script added.
- Made the hero visual responsive (photo + honeycomb now show on tablet and phone), added a phone
  layout for the USP rail, and added `color-mix()` fallbacks for older iOS.
- Fixed contrast the change exposed: `.hero__side` (1.96:1) and the page-hero glass widgets on
  /about-us and /our-service, which were white-on-cream and unreadable.
- Swept /, /about-us, /why-study-abroad, /our-service, /contact-us, /destinations/uk and a blog post
  at 1440, 768 and 375: no contrast failures left outside text-over-photo, no horizontal scroll.
  `tsc` clean, lint 0 errors.
- Honeycomb geometry, learned the hard way (2026-10-05): a hex lattice only interlocks if the
  clip-path and the aspect ratio agree. Pointy-top `polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,
  0 25%)` needs `H = 1.1547 * W`; columns then step by exactly `W`, rows by `0.75 * H`, and every
  other row shifts `W/2`. The first version mixed a flat-top clip-path with a pointy-top aspect at
  arbitrary steps, which is why it read as five loose badges. The mortar comes from
  `transform:scale(1 - gap/W)` on the cell — all six neighbours are `W` away, so one scale gives an
  equal gap on every edge. Padding plus a second inner clip-path skews the inner hexagon.
- A hexagon's usable text width is about 70% of its box. At a 104px cell that is ~73px, and
  "UNIVERSITIES" in caps with 1.4px tracking needs ~92px — which is why the labels are sentence
  case, not uppercase. `.hive__item span` also had no `font-family` and was silently falling back
  to Inter.
- White on `--teal` is 2.41:1 — never do it. The teal accent cell takes `--navy-3` ink (6.09:1).
  `--primary-2` (Sky) fails as a cell fill against white, navy and navy-3 alike; it is a wash
  colour only.
- The hero's plain `.hero__stats` row was removed because the honeycomb repeats the same claims and
  the two disagreed on screen — "100k+ Courses" against "1 lakh+ Courses". The `stats` field stays
  on the hero block so it can be brought back from the editor.

## Build log — 2026-10-05 (3)
- Redesigned the hero honeycomb after the client called it odd. Root cause was a flat-top
  clip-path on a pointy-top aspect with mismatched steps. Now a true lattice (W110/H127 desktop,
  W88/H101.6 under 860px), tonal navy ladder with a teal accent cell, cream sentence-case labels,
  one shared drop-shadow on the wrapper instead of five gold frames and photo fills.
- Dropped the duplicate `.hero__stats` row; removed `aria-hidden` from the comb since two of its
  five claims appear nowhere else.
- Verified at 1440, 1180, 375 and 320: lattice steps exact, no text clipped, no horizontal scroll,
  cell contrast 6.09-14.68:1. `tsc` clean, lint 0 errors.
- Countries figure: the client's brief said "50+", but the site only has **11** destination pages
  and the footer already said 11, so the claim contradicted itself on the same screen. On the
  user's instruction (2026-10-05) it is now the real **11** everywhere — and without a "+", because
  11 is exactly what is listed, not a floor. If destinations are added later, update the figure in
  the same places: the hero honeycomb, the stats counters (`count` + `suffix`), the offer card
  metric, the steps chip, the countries lead, both SEO descriptions, the chatbot knowledge row and
  `site.footerText`. `scripts/fix-country-count.mjs` derives it from the `country` table, so
  re-running it after adding destinations does the whole sweep.
- The chatbot's "Which countries do you cover?" answer used to name Dubai, which has no destination
  page. It now lists exactly the 11 rows in the `country` table.

## Build log — 2026-10-05 (4)
- Corrected the countries figure from the brief's "50+" to the real 11, in the seed and the local
  database: hero honeycomb, stats counters, offer metric, steps chip, countries lead, both SEO
  descriptions, the chatbot answer and the footer line. Added
  `scripts/fix-country-count.mjs` (idempotent, derives the count from the `country` table) so the
  same fix can run against production.
- Verified: no "50+", "33+" or "1100" in the HTML of any of the six core pages. `tsc` clean.
- Client feedback 23/09/2026 + brief point 16. Done: socials on mobile (already), "Est. 1982 ·
  Mumbai · Trinity Group" removed from the hero, tagline on one line, enquiry card added.
  **Still waiting on the client**: a student picture that "depicts the tagline" (the current one is
  the existing cut-out), and which font they want for the tagline — the family is a dropdown in
  /admin/theme, so that is a settings change, not code.
- The tagline cannot fit one line inside half the hero grid: at hero size the string needs about
  15x its font-size (1154px at 76.8px) against a 636px column. The `<h1>` now spans
  `.hero__inner` above a `.hero__cols` split, at `min(5.4rem,6vw)` with `white-space:nowrap`, and
  reverts to wrapping below 640px. If the tagline text ever changes, re-check that multiplier.
- `/api/leads` takes name/email/phone/subject/message/source only. The enquiry card's "nearest
  city" and "destination" fold into `message` and `subject` so the Lead table and the admin inbox
  did not need a migration. Source is `home-enquiry`, so those leads are filterable.
- `.leadsec__img` repeats the hero's navy gradient + grid treatment because `home-page-2.png` is a
  cut-out with no background of its own — dropped straight onto the grey section it looked like a
  mistake.

## Build log — 2026-10-05 (5)
- Removed the rotated "Est. 1982" strip from the hero (brief point 16) and its CSS.
- Put the tagline on one line (feedback 4): the headline moved above the hero split and spans the
  container; sized off the viewport so it holds one line from 1440 down to 640, wrapping below.
- Added the enquiry card from the client's sample (feedback 6): new `leadForm` block +
  `LeadForm.tsx`, navy panel with Name / Email ID / code + Mobile No / Choose Nearest City /
  Destination(s) of Interest / CONTACT ME, beside the picture and the tagline. Destinations come
  from the `country` table. Submitted a test lead end-to-end and removed the row.
- Fixed the gold kicker on the new grey section (1.25:1) by extending the light-surface override.
- `scripts/apply-feedback-2026-09-23.mjs` carries all three to production, idempotently.
- Verified at 1440, 375 and 320: tagline one line on desktop, form fields fit, no horizontal
  scroll, no new contrast failures. `tsc` clean, lint 0 errors.
- The page-hero asides (`.statchips`, `.svc-chips`, `.quick`) used to be `display:none` below
  1120px alongside the nav links. That took the contact page's **Call us** and **Email** links off
  every phone and tablet — the client reported it on 25/09. They stack under the copy now. If
  anything else is ever added to that hide list, check whether it carries content.
- Stat chips store the figure and its "+" in **separate fields** (`strong: "33"`, `suffix: "+"`),
  so a string pass for "33+" silently misses them. Any figure migration has to handle
  `pageHero.aside.items` explicitly — this is why About still showed "33+ Countries" after two
  earlier sweeps.
- Legacy palette hues were still all over the stylesheets in shadows and tints: `87,81,225` (old
  purple), `22,20,57` and `15,17,40` (old navy), `255,194,36` (old gold). All swapped for brand
  values across `site.css`, `chat.css`, `canvas.css`, `CountryPage.tsx` and `Header.tsx`. The admin
  (`globals.css`, admin pages) still has a few — internal only, left alone.

## Build log — 2026-10-05 (6)
- 25/09 item 1: unhid the page-hero asides below 1120px, so Call us and Email are reachable on
  phones again; stacked them under the copy and gave `.statchips` a single column under 640px.
- 25/09 item 2: swapped every legacy palette hue for the brand ones (53 occurrences across the
  public stylesheets and components, plus 8 in chat/canvas), and moved `.post__body` off its
  off-palette slate to `var(--text)`.
- 29/09: the countries block now sits right after the USP rail and the enquiry card, titled
  "Choose your Country" over the kicker "Shape your direction".
- Caught a stale "33+ Countries" on the About hero that two earlier figure sweeps had missed, and
  taught `fix-country-count.mjs` about stat chips so it cannot recur.
- `scripts/apply-feedback-2026-09-29.mjs` carries the content half to production.
- Verified at 1440 and 375 on home, about, services and contact: no horizontal scroll, no new
  contrast failures. `tsc` clean, lint 0 errors.
- The world map is generated, not an image asset. `scripts/build-world-map.mjs` turns
  `world-atlas`'s countries-110m topology into one SVG path plus projected marker coordinates and
  writes `src/components/site/world-map.ts`, which is committed. `world-atlas` and
  `topojson-client` are **devDependencies** — nothing ships to the browser but the generated
  string (~49KB raw, far less gzipped). Re-run the script if the destination list changes.
- Two things that bite when projecting a world map: rings crossing the **antimeridian** (Russia,
  Fiji) produce a point at lon +180 next to one at -180, which draws a stripe straight across the
  box — split the ring wherever consecutive points jump more than half the width. And the raw
  coastlines carry far more detail than a 1000px box can show, so thin points below a 3px
  manhattan step and drop rings under 1.5 square pixels; that took the path from 112KB to 49KB.
- Antarctica is excluded from the map: it costs a third of the height and no one studies there.
- Destination list on the map (client's, 29/09) is **14** and deliberately wider than the 11
  destination *pages*: it adds UAE, South Korea, Japan, Singapore, Malaysia and "Other European
  countries". Only the ones with a page link through; the rest are plain pills.

## Build log — 2026-10-05 (7)
- Added the world-map section the client asked for: 14 pinned destinations, a graduation cap that
  flies between them every 2.2s, pins that stay put so the map reads without the animation,
  hover-to-pause, hover-a-pill-to-jump, and `prefers-reduced-motion` honoured. Generated the
  geometry rather than shipping an image.
- Retitled the universities scroller to "Universities" per "next header will be universities".
- `scripts/apply-world-map.mjs` carries both to production.
- Verified at 1180 and 375: 14 pins and 14 pills, no horizontal scroll, no contrast failures.
  `tsc` clean, lint 0 errors.
- `Title` (src/components/site/ui.tsx) renders its **own** heading element — `as` defaults to
  `"h2"`. Wrapping it in another heading nests `<h2>` inside `<h2>`, which is invalid HTML and
  fails hydration. Pass `className` to `Title` instead of wrapping it. This is how the enquiry
  section's tagline broke.
- A bare inline `<script>` in a React component makes Next 16 log "Encountered a script tag while
  rendering React component" — it never runs on a client navigation. The root layout's
  `no-js` → `js` flip now uses `next/script` with `strategy="beforeInteractive"`, which still runs
  before paint and silences the warning.

## Build log — 2026-10-05 (8)
- Fixed the four dev-overlay errors the client's screenshots showed: a nested `<h2>` in the enquiry
  section (my own bug from the enquiry card, and the cause of the hydration failure), and the root
  layout's inline script, moved to `next/script` `beforeInteractive`.
- Verified on home, about, contact, a destination page and a blog post: zero nested headings, the
  `js` class still applied, console error-free. `tsc` clean, lint 0 errors.
- `(site)/layout.tsx` is `export const dynamic = "force-dynamic"`. It reads settings, nav and
  footer from the database in both `generateMetadata` and the layout body, and a build host that
  cannot reach the database used to fail there. Everything else that touches the database at build
  time — `sitemap.ts` and all three `generateStaticParams` — already has `.catch(() => [])`, so
  `getAllSettings()` was the only unguarded call. Verified by building with a bogus `DATABASE_URL`:
  it completes, logging `prisma:error` lines that the guards swallow.
- Deployment is moving from Vercel + Neon to **Railway** (app + Postgres). Railway needs, on the
  service: `DATABASE_URL`, `AUTH_SECRET` (32+ chars), `NEXT_PUBLIC_SITE_URL`, optionally
  `ANTHROPIC_API_KEY`. The project has **no Prisma migrations** — it is a `db push` project — so
  the schema is created with `prisma db push`, and the seed is run once.

## Build log — 2026-10-06
- Made the public layout render per request so the build no longer needs a reachable database.
  Confirmed with a build against an unreachable `DATABASE_URL`: compiles, generates all 19 pages,
  and `/` is now server-rendered on demand. `tsc` clean.
- The hero's two columns are **explicit grid tracks** now
  (`minmax(300px,1fr) minmax(300px,1.12fr)`), not `repeat(auto-fit,…)`, so they do **not** collapse
  on their own — there is a `grid-template-columns:1fr` under 860px. Without it a 375px phone got
  two 300px tracks and `.hero{overflow:hidden}` silently cut the photo in half, with no horizontal
  scroll to hint at it.
- `.hero` is sized by its content (`min-height:auto`), not `100vh`. Pinned at full height it left
  ~350px of empty cream under the buttons, because the copy column is half the height of the photo.
  `.hero__cols` is also `align-items:start` for the same reason — centred, it opened a 141px hole
  between the headline and the sub-line.
- When measuring hero geometry in the browser pane, nudge the scroll first: the pane throttles CSS
  animations when it is not painting, and `.hero-visual` reads as `opacity:0` with a
  `translateY(100%)` still applied — which looks exactly like a layout bug and is not one.

## Build log — 2026-10-06 (2)
- Tightened the hero after the client said it looked empty: height follows content (900 → 763 at
  1440), the copy column starts under the headline instead of centring (gap 141 → 60px), slightly
  larger photo and sub-line, and the honeycomb tucks into the card's bottom-left corner rather than
  lying across the student.
- Fixed the regression that came with it: the explicit grid tracks did not collapse on phones, so
  the photo was being clipped at 375px and 320px.
- Verified at 1440, 1024, 375 and 320: one-line tagline on desktop, card and comb inside the hero
  with slack, nothing clipped, no horizontal scroll. `tsc` clean, lint 0 errors.
- The site header overlays the hero, so `.hero`'s top padding has to clear it — and the **phone
  header is taller than the desktop one** because the wordmark wraps under the mark (117px at
  375px, 116px at 320px, against ~133px on desktop where the nav is roomier). Padding is 176px on
  desktop, 152px under 640px and 166px under 380px, giving ~43-50px of clearance everywhere. If the
  logo lockup changes, re-measure `h1.top - header.bottom`.

## Build log — 2026-10-06 (3)
- Desktop hero: the headline was sitting 3px *above* the header's bottom edge — the nav overlapped
  it. Top padding raised to clear it by 43px, and the columns rebalanced (.92fr / 1.2fr) so the
  photo carries more width and the band beside it reads as air rather than a gap.
- Same overlap on phones, worse: 3px of clearance at 375px. Fixed per breakpoint.
- Verified at 1440, 1024, 375 and 320: clearance 42-50px, one-line tagline on desktop, card and
  comb inside the hero, nothing clipped, no horizontal scroll. `tsc` clean, lint 0 errors.
- The courses cards carry **no fees**, deliberately: tuition swings by country, university and
  intake, and one figure on a card would mislead a prospective student more than it helps. Cards
  show the field, a line of copy, a duration range and the destinations it is strongest in. If the
  client wants fees, they need to supply per-course ranges — do not invent them.
- `--primary-2` (Sky) with white is 3.79:1 and fails as an icon tile too, not just as type. The
  third courses tile uses `--navy-2` (9.7:1). Sky stays a wash colour.

## Build log — 2026-10-06 (4)
- Built the Courses section (client brief 29/09, which named the section but gave no content).
  New `courses` block type + `CoursesSection` + admin label, eight fields Indian students actually
  apply for, each with duration and strongest destinations. Everything is editable from the admin.
  Sits after the Universities scroller, which is the order the brief lists.
- `scripts/apply-courses.mjs` carries it to production, idempotently.
- Verified at 1440 and 375: 8 cards, 4-up on desktop and 1-up on phone, nothing clipped, no
  horizontal scroll, card type 5.4–12.3:1. `tsc` clean, lint 0 errors.
- `blockTemplates()` builds the "Add block" menu by cloning the **first occurrence of each type in
  the seed pages**. Remove a block type from every page — as happened to `band` — and it stays in
  the menu with no template, so adding one pushes `undefined`. `band` now has an explicit fallback
  next to `richText`. If a type is ever dropped from all seed pages again, give it one too.
- **Testimonial quotes are not ours to write.** The client asked for a management message and two
  named students (Sushant, Vaibhavi) on the home page but has not sent the words. The home page
  carries the two genuine quotes we already have; the rest wait for the client. Inventing praise
  attributed to named people would be fabricating reviews.

## Build log — 2026-10-06 (5)
- Home now ends with Courses → Testimonials → Stats → CTA → FAQ. The testimonials block is shared
  between home and About, so the two real student quotes have a single source.
- Audited the dashboard: all **23** block types have both a label and an add-template, so every
  section on the home page can be edited, reordered, added and removed from /admin/pages.
  Fixed `band`, which was in the menu but had lost its template.
- `scripts/apply-testimonials-home.mjs` carries the home testimonials to production.
- Verified: home renders 14 sections including the new Courses (8 cards) and Testimonials,
  no horizontal scroll. `tsc` clean, lint 0 errors.
- The seed **creates** the admin user but never updates it (`user.upsert` has an empty `update`),
  so re-running it does not reset a forgotten password. `scripts/set-admin-password.mjs` is the way
  — it takes `ADMIN_PASSWORD` from the environment and rehashes.
- Postgres public access on Railway is **off** again (removed after seeding). To reach the
  production database from a laptop you have to add it back: Postgres → Settings → Networking →
  Add Public Access, which recreates `DATABASE_PUBLIC_URL`. The internal
  `postgres.railway.internal` host only resolves inside Railway.

## Build log — 2026-10-06 (6)
- Ran the Courses and home-Testimonials migrations against production; both verified live.
- Removed the database's public TCP proxy now that seeding is done, and confirmed from this machine
  that it is no longer reachable. Deleted the local credentials file.
- Mistake worth recording: that file also held the generated admin password, which is now
  unrecoverable (the database stores only the bcrypt hash). Added
  `scripts/set-admin-password.mjs` so it can be set again.

## Build log — 2026-10-06 (7)
- Reset the production admin password after losing the first one: re-added Railway public access,
  ran `scripts/set-admin-password.mjs`, removed public access again and confirmed from this machine
  that the database is unreachable. The site and /admin/login both still return 200.
- The new password is in `trinity-cms/ADMIN-LOGIN.local.txt` (gitignored). **Left in place on
  purpose** — do not delete it until the owner confirms they have saved it.
- `sitemap.ts` is `force-dynamic` for the same reason as the site layout: it queries the database,
  the build host cannot reach one, and its three `.catch(() => [])` guards turned that into a
  **silently empty sitemap** baked into the deployment — 0 URLs, which no amount of crawling would
  have revealed. Worth remembering: a guard that degrades gracefully at runtime can bake a broken
  artefact at build time.

## Build log — 2026-10-06 (8)
- Audited production: all 14 routes return 200, home carries every new section, and no page still
  has the band, "33+", "1100" or a localhost URL.
- Found and fixed the empty sitemap — it listed no URLs at all. Now rendered per request: 20 URLs
  locally. `tsc` clean, lint 0 errors.
- The countries figure has flipped three times (33+ → 50+ → 11 → 50+), so it is no longer edited by
  hand: `scripts/set-countries-figure.mjs` takes `COUNTRIES="50+"` (or `"11"`) and updates every
  shape it lives in — prose, hero hive, stats counters (numeric `count` + separate `suffix`), offer
  metric, steps chip, page-hero stat chips (`strong` + separate `suffix`), SEO descriptions, the
  chatbot answer and `site.footerText`. Use it rather than grepping; two earlier sweeps missed the
  split number/suffix fields.
- With 50+ claimed and 11 destination pages, the chatbot answer now says 50+ countries *and* names
  the eleven we have guides for, so it is not contradicted by the destinations menu. The nav's
  "View all destinations" link is deliberately count-free for the same reason.

## Build log — 2026-10-06 (9)
- Countries figure back to **50+** (the client's brief) everywhere: home hero honeycomb, stats
  counters, offer card, steps chip, countries lead, About stat chip, both SEO descriptions, the
  chatbot answer and the footer. Applied locally and to production.
- Ten parallel audits before handover (2026-10-06) found these, all now fixed: chat server actions
  had **no rate limit** so anyone could loop `markUrgentAction` into an email flood; both lead forms
  hung on "Sending…" for ever if `fetch` rejected, losing the enquiry silently; the honeypot was
  named `website`, which password managers autofill — killing real leads; the nav overflowed
  between 1121 and 1420px, i.e. on 1280 and 1366 laptops; the back-to-top button sat underneath the
  chat launcher at every width; the compact nav tier stopped at 380px so iPhone 14/15 (390) and
  Pixel (393) clipped the hamburger.
- Content bugs the same audits found: a University of Alberta card labelled city "USA" beside a
  Canadian flag; the courses figure written three ways on one page ("1 lakh+", "100,000+",
  "100k+"); "Every Dream Needs a Direction" as an `<h2>` **twice** on home plus the hero `<h1>` and
  the title.
- Honeycomb photos: only three cells carry one (Years, Universities, Courses). There is no honest
  image for Countries or Visa success, and a campus block under either makes the viewer hunt for a
  connection that is not there. The photo sits under a navy scrim
  (`rgba(26,36,86,.78→.92)` + `saturate(.25)`) because raw photography at ~104px turns to mush and
  swallows the type; that scrim is what holds the cream label above 4.5:1.

## Build log — 2026-10-06 (10)
- Ran ten parallel audits (admin readiness, live content, accessibility, SEO, performance,
  responsive, chatbot, leads, plus two on the honeycomb) and fixed the handover blockers: the chat
  abuse vector, both forms' silent failure, the autofill-prone honeypot, the leads rate limit
  (5/hr → 15/hr, which one school NAT could exhaust), and four responsive breaks.
- Put photographs into three honeycomb cells, per the client's reference.
- `scripts/apply-content-fixes-2026-10-06.mjs` carries the content half to production.

## Build log — 2026-10-07 · Footer editable from the dashboard
**Asked:** "footer ka bhi edit option dashboard me rehna chaiye".

**Already editable before this** (so no work needed): logo, footer description,
copyright (Settings → General), the Quick Links list (→ Navigation), address,
phones, email, social icons (→ Contact & social). Destinations tags come from the
country table.

**Was hard-coded in `Footer.tsx`, now editable:** CTA kicker, CTA heading, both
button labels and the primary button's link, the three column headings, the
scrolling marquee word, and the "Powered by" name + URL (blank hides the line).

**How:** new `footer` key in `src/lib/settings.ts` (`FooterSettings` + DEFAULTS +
`SettingsMap`), read as a prop in `Footer.tsx`, passed from `(site)/layout.tsx`,
and a **Footer** tab in `SettingsForms.tsx`.

**No migration script.** `getSetting` spreads `DEFAULTS[key]` under the stored
row, so production — which has no `footer` row — renders today's wording until
someone saves the tab. Saving goes through `saveSettingsAction` → `revalidateTag`,
so it is live immediately.

Verified: `tsc --noEmit` clean, `npm run build` clean. Commit `1346827`, pushed.

## Build log — 2026-10-07 · Everything editable from the dashboard
Asked for, in three messages: "har ak word edit or har ke image change sab kuch hona
chaiye dashboard me", "sab jitne social media ko bhi edit kar saku", and drag-and-drop
section reordering "sab pages ke liye".

**Wording.** A scan of `src/components/site/**` and `src/app/(site)/**` for JSX text
nodes and `placeholder`/`alt`/`title`/`aria-label` props turned up ~100 literals. They
are now a `labels` settings key (header, common, contactCards, forms, blog, search,
errors, destination) plus a `chatbot.ui` block, edited at Settings → **Text & labels**
and the Chatbot page. Both admin forms render them with `ObjectFields` from
`FieldEditor.tsx` — the schema-less editor already picks the right control per field,
so ~100 inputs cost two lines of JSX and an image field gets an ImagePicker for free.

- `{country}` in a destination string is filled per country; `[brackets]` mark the
  accent word. Helpers `fillCountry` and `Marked` in `site/ui.tsx`.
- Server components read `getLabels()` (`src/lib/labels.ts`, `import "server-only"`).
  Several became `async` for it — fine in RSC. **Do not import that module into
  `site/ui.tsx`**: the client `Header` imports from there, so it would pull a
  server-only module into the browser bundle. That is why `Stars` takes `label` as a
  prop instead.
- Client components get props: `Header` ← layout, `ContactForm`/`LeadForm` ← their
  blocks, `Faq` ← `blocks/index.tsx` (avatar only).
- `error.tsx` keeps its literals deliberately — it renders when the request already
  failed, and the settings it would read come from the database that may be down.

**Socials.** `contact.socials` (five fixed keys) → `contact.socialLinks`, a list of
`{label, icon, href}` the owner can add to, reorder, rename or blank. `href: "whatsapp"`
reuses the number via the existing `resolveHref` sentinel. The old object stays in the
type so pre-existing rows still load; `scripts/apply-social-links.mjs` copies edited
URLs across. `OrgSchema`'s `sameAs` now filters to real `https://` profiles — a wa.me
deep link is not a profile.

**Drag-and-drop.** `BlockEditor.tsx` Sections rail uses native HTML5 DnD (no library):
`drag`/`over` state, insertion point decided by whether the pointer is past a row's
midpoint, a brand-coloured line as the drop indicator. Works on every page, since the
rail is the same component for all of them. Up/Down buttons stay — touch devices do not
fire HTML5 drag events.

**No migration needed for the new keys**: `getSetting` spreads `DEFAULTS[key]` under the
stored row, so production rendered the new captions immediately.

Verified on production after deploy `0649e36`: home, a destination, a blog post, search,
contact and the 404 all 200 with the new captions in the HTML; all six social icons
render from the list; `/admin/settings` still 307s to login.

## Build log — 2026-10-13 · New navigation + four new pages
Client's revised menu (screenshot): Home · About Us · Study Destinations · Services ·
Resources (Events / Brochure) · Success Stories · Blog · Contact.

**The menu is data now.** `NavItem` gained `children` (makes a dropdown) and
`kind: "destinations"` (makes the country mega-menu). `Header.tsx` renders `nav.items`
in order and decides per item — the hard-coded `LEFT` array that pinned the
destinations menu to position five is gone, and it would have silently dropped the
two new items behind it. Settings → Navigation has a type selector (Link / Dropdown /
Study Destinations menu) and a sub-page editor. The mobile menu lists children under
their parent: touch has no hover.

**Four pages built** in the existing idiom (pageHero → content blocks → cta), all
editable in the page editor: `success-stories` (stats + the client's two real
testimonials + a five-step journey), `resources` (landing, links to the two below),
`events`, `brochure`. **No invented dates on the events page** — the copy says we
write to you when the next relevant event is confirmed, which is the only honest line
without a calendar from the client. Both `events` and `brochure` reuse the `leadForm`
block so an enquiry lands in the same leads inbox.

`scripts/apply-nav-2026-10-13.ts` creates pages only when the slug is missing and
rewrites `nav.items`. Run with `npx tsx` — note **tsx compiles a bare `.ts` as
CommonJS, so top-level await fails**; wrap the body in `async function main()`.

Drive-by: `.cv-ditem:hover` was `#5751E1`, a purple left from the canvas port. The
Resources dropdown reuses that class, so it is `var(--primary)` now.

Verified on production after `81921a8`: all four pages 200, full menu renders at
1440px, the Resources dropdown opens with Events/Brochure, the mobile menu nests them.
Careful with browser checks — a click sent immediately after `navigate` lands before
hydration and does nothing; the second click worked.

## Build log — 2026-10-15 · Hero headline, capsule removed for good
"Because Every Dream Needs a Direction", with an explicit `br` after "Dream".
**`.hero__title` is `white-space:nowrap` on desktop** (`site.css`), so a longer
headline does not wrap — it runs off the page. Any future headline change has to
set its own line breaks or relax that rule. Checked at 1440px and 375px.

The photo capsule is gone from the code, not just blanked: `capsuleImg` off
`HeroBlock`, the capsule branch out of `Words`, the two `.capsule` rules out of
`site.css`, and `capsule` dropped from `FieldEditor`'s `IMG_KEY`. It had been left
as an empty field "so it can be set again without a code change", which is exactly
how it would have come back.

Note: `site.tagline` in Settings → General is still "Every Dream Needs a Direction"
and feeds the browser-tab title and SEO title. Left alone deliberately — changing
page titles is an SEO decision for the client.

**Local dev needs its own database.** `DATABASE_URL` points at `localhost:5433`,
served by `npm run db:dev` (embedded Postgres, data in `.pgdata`). With it stopped
every page renders empty — no map, no sections — because all content lives in the
database. That is not "local is out of sync with git"; git and Railway were both at
`b314fa6`. First thing to check when local looks blank: is `npm run db:dev` running.

## Build log — 2026-10-15 (2) · Hero restructure + scroller
Client brief, in three steps across one session:

1. **Enquiry form into the hero.** `HeroBlock` gained an optional `form`; `LeadForm`
   gained a `bar` variant (grid of fields, 6 → 3 → 1 columns). The standalone
   `leadForm` section was removed from the **home page only** — Events and Brochure
   keep theirs.
2. **Scroller.** The client's sixteen services, and "One Stop Solution" moved from
   *over* the rail to *above* it (under the hero's SCROLL cue). Painted on top it hid
   whichever items were passing behind. Items are bold now.
3. **Hero stacked.** One column instead of two: copy → photo+honeycomb → form.
   `.hero__copy` capped at 620px so the headline breaks where it did; `.hero-visual`
   keeps its 500px frame and left edge. **`margin-bottom:86px` on `.hero-visual` is
   load-bearing** — `.hive` is `position:absolute; bottom:-74px`, so it hangs below
   the frame and would otherwise land on the form. Verified: 68px gap.

Applied with `scripts/apply-hero-form-2026-10-15.ts` (idempotent) to both databases.

**Mistake worth remembering: I pushed without `npm run build` and the deploy failed.**
`next build` type-checks `scripts/` as well as `src/`, and `npx tsc --noEmit` had been
run *before* the new script existed. Prisma's `blocks` column takes `InputJsonValue`,
which `Record<string, unknown>[]` does not satisfy — cast via `as unknown as object[]`.
Run the build, not just tsc, before every push.

Also: Railway's `deployment list` shows SUCCESS/FAILED, and `railway logs --build <id>`
gives the real reason. A plain `railway logs --build` shows the *latest* build, which
during a failure can still be the previous successful one — pass the id.

## Build log — 2026-10-15 (3) · Form to the right column + responsive audit
Client: form beside the copy, not under it. Hero is two columns again — copy +
student photo left, enquiry form right, both starting on the same line. The wide
`bar` variant of `LeadForm` was deleted (prop, class and three breakpoints): a
6-across field row does not fit a 400px column.

**Hero grid now collapses at 980px, not 1420.** The 1420 breakpoint exists for the
nav; collapsing the hero there pushed the form below the fold on every 1280 and
1366 laptop.

Two faults the column swap left behind, both fixed:
- `.hive{left:clamp(-62px,-4vw,-10px)}` bled the honeycomb *out* from under the
  photo. Fine when the photo was on the right; with it on the left the honeycomb
  bled off the page edge and `.hero{overflow:hidden}` cut 12–34px off it. Now
  `left:0`.
- The photo's `margin-bottom:86px` reserves room for the honeycomb hanging below.
  Under 860px the honeycomb is `position:static`, so that margin reserved room for
  nothing — 86px of dead space above the form on every phone. Now 0 there.

**Two measurement traps, both cost me time — remember them:**
1. `getBoundingClientRect()` on hero elements includes the entrance animation's
   transform while it is still running, so positions read wildly wrong (a child
   appearing to start below its parent's end). Use `offsetTop`/`offsetLeft`, or
   wait ~1s first.
2. `documentElement.scrollWidth > clientWidth` reported 23px of "overflow" on
   /events, /brochure and /contact-us — all transient, same cause. `body` already
   has `overflow-x:hidden`, and it propagates to the viewport, so **no page can
   actually be scrolled sideways**. Test by calling `scrollTo(400,y)` and reading
   back `scrollX`, not by comparing widths.

Verified at 1440, 1366, 1280, 1024, 900, 768, 430, 393, 360.

## Build log — 2026-10-15 (4) · New hero photo, buttons below the honeycomb
- Client supplied `Isolated Smiling Woman with Backpack Strap.png` at 1121x1403 /
  2.3MB — nine times the image it replaced, above the fold. Resized with sharp to
  719x900 and re-encoded to 280KB (`public/assets/img/home/hero-student.png`). The
  frame shows it at ~250x320, so 900px tall still covers 2x screens. **Always check
  the weight of a client-supplied hero image before shipping it.**
- The old `home-page-2.png` stays: the lead-capture section on Events and Brochure
  still uses it, so the boy appears there. Worth asking the client whether they want
  that swapped too.
- Hero order is now text → photo + honeycomb → buttons. `.hero__copy .btn-row` gets
  `margin-top:30px`; without it the buttons touched the honeycomb on phones (where it
  is `position:static` inside the frame) and cleared it by only 12px on desktop.

Reminder that bit again: after a direct database write, the dev server keeps serving
the old content from `.next/cache` — `rm -rf .next` and restart, or the change looks
like it did not apply.

## Build log — 2026-10-15 (5) · Closing the hero's empty gap
The photo was pinned at 500px inside an ~866px left column, leaving a field of cream
between it and the form. Fixed by width band:
- **≥1200px** — `.hero-visual` becomes a flex row: photo (max 520) + the honeycomb
  beside it (`position:static`). At 1440 that is 520 + comb + 60px before the form.
- **981–1199px** — no room for the pair, so the photo grows to the column width
  (653px at 1100) and the comb keeps overlapping its corner.
- **≤980px** — unchanged.

Three things this exposed, all worth remembering:
1. **`.hero__copy{max-width:620px}` was squeezing the photo row**, not just the lead
   line. Removed; the lead line and `.btn-row` carry their own caps.
2. The rating chip is `position:absolute` inside `.hero-visual`. Once that became a
   flex row the chip anchored to the row's right edge, past the comb. Photo + chip are
   wrapped in `.hero-visual__frame` now.
3. **Media-query order bit me:** the new `@media (min-width:1200px)` sat above
   `@media (max-width:1420px)`, which re-capped `.hero-visual` at 420px — the photo
   collapsed to 80px beside the comb. Equal specificity, so source order decides. New
   hero rules go at the **end** of site.css.

## Build log — 2026-10-15 (6) · Countries grid, map labels, 5 audits
**Section 3 (Choose your Country)** rebuilt from the client's brief: UK, Ireland,
France, Germany, USA, New Zealand, Australia, Canada, UAE, Singapore, Netherlands,
and "39+ & counting" on the dark card. That dark card had been stuck at "33" through
two country-figure sweeps because the number lives in its own `num` field.
UAE/Singapore/Netherlands have **no destination page**, so they point at
/why-study-abroad rather than a 404 — real pages as soon as the client sends content.
Their flags were missing from the library; drawn as SVG and rasterised to 160px.

**World map**: continent colours (client's reference), and country names beside each
pin with leader lines. Placements are **hand-set in `WorldMap.tsx`**, not derived —
five of fourteen pins sit inside a 54px-wide European cluster. Labels are hidden
below 900px: the SVG scales with its box so 9px becomes ~3px, and the chip row
carries the same names. Section order is kicker → title → lead → chips → map → note.

**Process mistake to not repeat:** I chained `npm run build` into a commit with
`&& grep -i "Compiled successfully"`. That line prints *before* type checking, so the
grep passed, the build had actually failed, and a broken commit was pushed (Railway
caught it). **Check the build's exit code**, e.g. `npm run build > log 2>&1; echo $?`.

**Five parallel audits** (accessibility, responsive, content, SEO, performance). Fixed
immediately: the Journey block rendered Font Awesome classes as `<img src>`, so the
Success Stories page I built shipped five broken images and five 404s. Everything else
is written up for the client in the session; the big ones are `banner-1.png` at 1.5MB
for a 440px slot, the ten university JPEGs at 1.4MB, `home-page.png` (722KB, dead —
`OrbitFlags` is imported by nothing), `:focus-visible` gold at 1.1–1.35:1 on light
surfaces, and the world-map path data (49KB) shipping to the client bundle because
`WorldMap` is `"use client"`.

## Build log — 2026-10-15 (7) · Sections 4 and 6, and the client's brief doc
**The whole brief is readable.** The Google Doc renders to canvas, so the browser's text
extraction returns only the chrome. `curl -sL ".../export?format=txt"` returns the lot —
71KB, no sign-in needed. Sections found: 2 (honeycomb + chat + form), 4 (Find your
Campus), 5 (Choose a Course), 6 (How Your Journey Works), 7 (Webinar), 8 (Our Vision to
their Journey). The doc's tab list also names the destination pages the client expects:
UK, Ireland, France, Germany, USA, New Zealand, Australia, Canada, **Sweden, Dubai,
Singapore, Netherlands**, "39+ more" — note Sweden is in that list but **not** in
section 3's country grid, and section 3 says "UAE" where the tab says "Dubai".

**Section 4, Find your Campus** — new `campus` block type and component, on the home page
after the world map. Radio group (not tabs: the choice is about the visitor's own
profile), tick as well as colour on the selected card. Public carries the four entry
criteria; Private links to the destinations. **Logo grids are deliberately empty** with a
"logos to follow" note — the brief says the client is sending the files. Card photos cut
from the client's own split artwork, below its wordmarks since the cards set that text.

**Section 6, How Your Journey Works** — the `steps` block goes from four steps to the
client's seven, their wording, same design.

**Still blocked on the client:** university logos (section 4), webinar content and pics
(section 7 — "Knowledge Hub" / "Be Updated" / "Register now"), the three videos and
Instagram access (section 8), testimonial quotes and the tagline student photo.

Also in the brief and not yet done: Success Stories in the nav is meant to point at
https://www.youtube.com/@TrinityStudyAbroad/featured, not the page I built.

## Build log — 2026-10-15 (8) · Sections 7 and 8
**Knowledge Hub** (`webinar` block, after Courses): "coming up" panel, past-snippet
strip, "Register now" CTA. Both lists empty with their own worded empty states — the
client is sending dates and snippets.

**Our Vision to their Journey** (`vision` block, after Testimonials): three video slots.
Only Sushant's URL exists in the brief (youtube.com/shorts/LwHzS7EqjhA); the other two
show "video to follow" over their poster rather than a dead play button. "Know more" →
/success-stories.

**The players are facades** — poster image until clicked, iframe created on click. Three
live embeds would pull YouTube's player for every visitor. `youtube-nocookie`, and
`frame-src` in `next.config.ts` widened to exactly that host (it already had to be
widened once before, for the admin live preview).

Home order is now: hero · usp · countries · worldMap · **campus** · about · offer ·
steps · universities · courses · **webinar** · testimonials · **vision** · stats · cta · faq.

Three contradictions in the brief still unanswered by the client: Sweden is in the doc's
destination tabs but not in section 3's grid; section 3 says "UAE" where the tab says
"Dubai"; and the nav's Success Stories is meant to point at the YouTube channel, not the
page we built.

## Build log — 2026-10-15 (9) · The client's brief, applied in bulk
**Twelve agents** (not the fifty asked for — the work only has twelve independent units,
and more would have duplicated each other): one per country, one for About Us, one to
recover the images.

**Reading the brief.** `curl ".../export?format=txt"` gives all tabs, no sign-in. For the
images, `export?format=zip` works — 155MB, 119 images plus an HTML file whose text can be
matched back against the txt export to place each picture.

**Destination content.** Eleven countries extracted to one JSON each, applied by
`scripts/apply-country-content.ts <dir>`. A key absent from the file leaves the existing
value alone. **Dubai and Singapore did not exist and were created** — the site has
thirteen destinations now. Extracted JSON is committed under `content/client-brief/`.

**Empty sections now hide their heading.** Singapore has no scholarships, visa steps or
FAQs in the brief, and those were rendering as a heading above nothing. Each section in
`CountryPage.tsx` is conditional, and the jump nav lists only what is present (Singapore
four, UK seven).

**No country section in the brief has any image** — the pictures are About Us (51), an
unanchored stock gallery (35), home page (17), webinar (9), logo grids (7). Six landscape
webinar photographs now fill section 7's strip, captionless because the client sent no
captions. The "university logos" seven are screenshots of grids, not logo files, so
section 4 still waits.

**Contradictions the client has to settle** (recorded, not guessed at): About says the
parent group was "established in 1982" while the home page claims "42+ years" (1982→2026
is 44), and the brief separately says "remove est since 1982 from hero banner"; several
countries give tuition twice in different ranges (USA $25k–55k chip vs $15,000–55,000
table, Canada, Ireland, Australia, Sweden the same); Singapore's own tables carry two
euro figures that look like Ireland leakage.

## Build log — 2026-10-16 · Ten agents, the brief closed out, and what they found
**Services page** was still the eight legacy services; the brief has thirteen of its own
(`content/client-brief/services.json`, applied by `scripts/apply-services-content.ts`).
**The scroller had the wrong list** — the brief gives the services twice and its note
**[e]** says "do not use the highlighted content, use the content in Bold". I had merged
both into eighteen chips. Eleven now, the bold flow.

**Read the brief's lettered notes [a]–[j].** They sit at the very end of the txt export,
after all the section content, and they are corrections to everything above them. Missing
them is how the scroller went wrong.

**Things the audits caught that were visibly broken:**
- `content:"¹3"` — a check mark mangled to mojibake, printing "Public Universities ¹3".
- **Notes written for the client were published on the live page**: "Logos to follow — the
  client is sending them." and "Video to follow.". An empty slot shows its poster now.
- **Nine Font Awesome 6 names on a site loading FA 5.15** drew nothing — `fa-list-check`,
  `fa-triangle-exclamation`, `fa-rotate-right`, `fa-calendar-days`, `fa-earth-americas`,
  `fa-indian-rupee-sign`, `fa-chalkboard-user`, `fa-people-roof`, `fa-circle-question`.
  **Check any new icon against FA5 before using it.**
- **861–980px: the honeycomb covered 41% of the student photo.** The mobile comb rule was
  keyed to 860 but the hero stacks at 980. Also `.w__in` is `inline-block`, so the photo
  sat beside the lead instead of under it.
- `prefers-reduced-motion` returned before the pinned scroller was laid out — six of ten
  cards off-screen behind 320vh of dead scroll.
- `webinar.current` and `campus.options[].logos` **could not be filled from the dashboard**:
  the recursive editor learns a list's shape from its first row, and these ship empty, so
  "+ Add" pushed a string into a list of objects. `FieldEditor` now has declared `SHAPES`.
- A refresh script that preserved a whole array to keep the owner's edits also preserved
  the placeholder note — clearing it in the seed changed nothing on a live database.

**2.9MB off the site**: the z-series JPEGs were encoded at 3–5x the quality a 560x380 photo
needs (1.44MB → 404KB), banner-1.png 1.44MB → 172KB, webinar snippets 226KB → 76KB, the
hero PNG → WebP 280KB → 120KB. `home-page.png` (706KB) and `OrbitFlags.tsx` were both dead.

**Still open** (client's call, all recorded): map left/countries right per note [b]; Services
mega-menu; About Us sister-concern logos; hero CTA wording "FIND YOUR DIRECTION | BOOK FREE
COUNSELLING"; "last qualification" instead of "nearest city" in the hero form; TISA mascot;
"Trusted advisors" not "Consultants"; the universities slider's invented star ratings and
"Enroll Now"; the stats counter printing 99,996.

---

## 2026-10-16 — The thirteen destination pages, audited and corrected

A pass over every `/destinations/<slug>` page. Four defects were in the content the client's
document supplied, three in the component that renders it.

**Code** (`CountryPage.tsx`, `site.css`):
- The navy "total" cost card was always the **last** row in the table. France had two tuition
  rows appended after its total, so "Tuition fee Masters" wore the total's styling; Singapore
  has no total row at all, so "Health insurance" wore it. The card is now the row matching
  `/\btotals?\b/i`, and when no row says it is the total, no card is one.
- `intro` carries blank lines for five countries and they were being rendered into one block —
  Germany's ran to 565 characters without a break. It is split on `\n{2,}` into paragraphs.
- With no scholarships listed, the admission grid kept its second column: 580px of nothing
  beside the requirements on Singapore. The grid is one column and 820px wide in that case.
- The breadcrumb links were 18px tall and the jump chips 40px. Both are 44px+ on a phone now.
  The breadcrumb needed a `cv-crumbs` class before the CSS could reach it.

**Content** (`scripts/fix-country-content-2026-10-16.ts`, run against local and production):
- New Zealand's `hero` held a 166-character sentence, so the `<h1>` ran to five lines. The
  title is "Study in New Zealand" like the other twelve; the sentence opens the intro.
- France: the two tuition rows after the total were duplicates of the two above it. Deleted.
- Singapore: two figures arrived in **euros** inside a Singapore-dollar table — they are
  Ireland's, pasted into the wrong section of the brief. The health-insurance row is gone
  rather than converted at a rate nobody gave us; the tuition chip is restated from the table
  above it. Its intakes chip said "3 to 4" where the page lists exactly three.
- UK: "a 18 months Graduate Route" → "an 18-month".
- `z3.jpg` is **Teviot Row House, Edinburgh** — and it was the hero photograph for both New
  Zealand and Singapore. Ten photographs cover thirteen countries so some repetition is
  unavoidable, but a named landmark on the wrong continent is not. Both now use the unbranded
  campus shot. **Real photographs for these two are still wanted.**

**Left alone deliberately, for the client to answer:**
- **Dubai living expenses, "AED 5000 to 7000 / year"** — that is a monthly figure against a
  yearly label; AED 5,000 a year is not a plausible cost of living in Dubai. Not guessed at.
- Several stat chips disagree with their own cost tables (USA, Canada, Ireland, Australia,
  Sweden all carry two different tuition figures). Flagged, not reconciled.

**Same day — the enquiry forms could not accept Dubai or Singapore.** The destination dropdown
was a hand-written list from when there were eleven countries, on the home hero form and on the
Events and Brochure pages. `scripts/sync-form-destinations-2026-10-16.ts` rebuilds it from the
destinations table in the site's own order and keeps the owner's trailing non-country options
("Not decided yet") at the end. **Run it whenever a destination is added or retired** — nothing
wires the two together automatically.

Noticed, not changed: the map section's lead says "Fourteen destinations" where the table holds
thirteen and that section lists eleven. The client's wording — their call which number is right.

## 2026-10-19 — The stats counter, and the figure it never reached

The counter animating 0 → 1,00,000 stopped at **99,996**. Two separate causes, both fixed in
`SiteScripts.tsx`:

- The easing loop wrote `round(target × eased)` on every frame and stopped when `k` reached 1.
  **A background or hidden tab throttles `requestAnimationFrame`**, so the run simply ended a
  few frames early and left the eased value showing. The last frame now writes the target
  itself, and a `setTimeout(land, D + 400)` writes the figures whether or not the frames ever
  arrive. The numbers matter more than the animation.
- `threshold: 0.3` asked for 30% of the stats section to be on screen **at once**. The section
  is 828px tall on a laptop and taller stacked on a phone, so on a short window the ratio never
  got there and **all four numbers sat at zero for the entire visit**. Now `threshold: 0`.
- `prefers-reduced-motion` now lands the figures immediately instead of animating, and the rAF
  and timer are both cancelled on route change.

**Verifying this in the Claude browser pane is unreliable**: the pane reports
`document.visibilityState === "hidden"` even with its tab fronted, which defers
IntersectionObserver callbacks and throttles rAF — the very condition that caused the bug. The
counters read 0 there and land correctly once a frame is forced.

**Stats consistency**: "Universities" carried no `+` while the hero strip and the honeycomb both
say "1200+" — the same claim twice on one page, two ways. `scripts/fix-stats-suffix-2026-10-19.ts`
fixed it on home, why-study-abroad and success-stories. All four figures now agree with the hero:
42+ / 50+ / 1200+ / 1,00,000+ (the hero writes the last one as "1 lakh+" — same number).

**Still the client's call**: they say "since 1982" and "42+ years". 2026 − 1982 = 44.

## 2026-10-19 — The campus panel, and a page for the webinars

**"Private Universities" showed an almost empty panel.** Both columns were conditional: that
option has no criteria list yet and no logos, so clicking it left a heading and a lone button
where a panel should be. The panel now always has a text column — the criteria when they exist,
the option's own one-line description when they do not — with the call to action under it, and a
picture column showing that option's photograph. **The private-university criteria are still
missing from the client's brief**; the fallback is honest filler, not the real content.

**Webinars now have a page of their own** (`scripts/add-webinars-page-2026-10-19.ts`): hero,
the gallery, a CTA; added under Resources in the menu; the home strip links through to it.
`WebinarBlock` gained `layout: "split" | "gallery"` and `moreHref`/`moreLabel`.

- **The posters were being cropped.** They are 16:9 and `.webinar__snip img` forced 16:10 with
  `object-fit:cover`, which sliced the heading off every one — "THE TEST UNIVERSE" rendered as
  "HE TEST UNIVERSE". Now 16/9, so cover crops nothing.
- **An earlier optimisation pass had shrunk them to 400x225**, too small to print at full size.
  Restored from commit `0f5d010` at their original 900x507, WebP q82, 250KB for all six, lazy.
  **Check an image's intended display size before down-scaling it.**
- The Knowledge Hub was redesigned: "Coming up" held one sentence and a button and was
  stretching an empty grey box down the page beside the posters. It is a narrower navy gradient
  card now, and the posters take the wider column. On the Webinars page the same card runs full
  width with its button beside it.

**Same day, the Webinars page reviewed against a print of it.** Four things, two of which were
site-wide:

- **The two floating hero chips sat on top of one another** — "Free / No charge to attend" was
  hidden behind "Online / Join from anywhere". Both were pinned near the bottom-left of the
  picture. **This was wrong on every page using `pageHero`, not just this one** (confirmed on
  Events). They stack now with a 16px gap. The home hero renders only the second chip, so it is
  untouched.
- **The ghost watermark ran 1,043px wide on a 1,280px window**, straight across the hero
  picture — it read as a second headline. `clamp(4rem,10vw,9.5rem)` brings it to 652px.
- **Two navy call-to-action panels, back to back.** The page carried its own "Ask a counsellor
  directly" and the footer closes every page with "Ready to start your study abroad journey?" —
  the same two buttons twice. The page's own block is gone. (`/events` still has this; left
  alone as out of scope.)
- The hero used poster 1, which is also the first card further down the same page. It uses the
  students photograph now. The posters also lost their grey panel, and the empty note inside the
  navy card no longer looks like a disabled text field.

**One closing call to action per page, not two.** Six pages — blog, brochure, events,
our-service, resources, success-stories — ended with their own navy CTA panel directly above the
footer's "Ready to start your study abroad journey?", which offers the same two buttons to the
same place. The page's own wording is the better of the two ("Book a session this week", "Start
the story you will tell"), so the footer's banner stands down where a page already closes with
one: the CTA sections carry a `cta-block` class and `main:has(> .cta-block:last-child) + .footer
.footer__cta{display:none}` does the rest. No per-page hardcoding. Pages without one — About Us,
Contact, Webinars, the destination pages — still get the footer's. The home page's CTA sits
mid-page and asks something different ("Register Now" / "Call us now"), so it is untouched.

## 2026-10-19 — Eleven agents over every page, looking for cut-off text

Each took a slice of the 24 pages (plus one on the chrome that appears on all of them), measured
the DOM at 1280 / 768 / 375 rather than trusting screenshots, and traced each finding to a rule.

**Two measurement traps, worth knowing before any future audit of this site:**
- The browser pane reports `document.visibilityState === "hidden"`, so the `[data-word]`
  entrance animation (`canvas.css:5`, `translateY(100%)`) never completes and **every hero
  element measures as overflowing its section by its own height**. Three agents hit this and
  reported phantom 50–64px overflows. Neutralise with
  `[data-word],[data-reveal],.w,.w__in{opacity:1!important;transform:none!important;animation:none!important}`
  before measuring.
- A wrapped inline `<span>`'s `getBoundingClientRect()` is the union of its line boxes, so any
  two inline spans in one wrapped heading always report an overlap. Use `getClientRects()`
  per line, or restrict the test to block-level boxes.

**Six real defects, all now fixed:**
1. **The hamburger menu ran off the bottom of the screen and could not be scrolled.** 913px tall
   inside a `position:fixed` header with no `max-height` and no scroller. On a 375x812 phone the
   last 178px were unreachable, "Free Counselling" among them; on a 1366x650 laptop every one of
   the thirteen country links was. **This is not only a phone problem** — `.nav__links` is
   hidden below 1421px, so on a 1280 or 1366 laptop this panel *is* the navigation.
2. **Hero headlines lost their descenders.** `.w` is the clip box the words slide up through and
   it was exactly one line box tall; Poppins' descenders reach past a 1.03 line-height, so the
   tail of every g, y, p and j was sliced flat — 7.9px of it at 1280. Measured with
   `fontBoundingBox*` vs `actualBoundingBoxDescent`. The fix adds `padding-bottom:.18em` with a
   matching negative margin, and pushes `.w__in`'s start offset down by the same amount so the
   word does not peek out of the new space before it animates.
3. **The footer e-mail painted 35px into the next column** at 900px wide.
   `helpdesk@trinitystudyabroad.com` is an anonymous flex item with no break opportunity, so its
   287px min-content width beat the 252px track. `overflow-wrap:anywhere` is the form that also
   lowers min-content width, which is what the track is sized from.
4. **The back-to-top button sat on "Powered by"** at 375px and on "Copyright ©" at 768px, and
   **the WhatsApp circle covered half the "Itarsia India Limited" link** — and being z-index 60,
   made it unclickable. The footer's last row now keeps clear of both.
5. **The top search placeholder was cut** — "Search universities or co" at 375px, 91px short at
   320px. The row's other 133px went to a call icon and social links that are both already on
   the page (the nav's call button is immediately below, the socials are in the footer), so on a
   phone the search takes the whole row.
6. **"On this page" was invisible on ordinary desktops.** The caption borrowed `cv-dsk` from the
   header's desktop/mobile switch, which `canvas.css:35` hides below 1320px. It has its own
   class and its own breakpoint now.

Everything else came back clean: all 13 destination pages, home, About Us, Services, Why Study
Abroad, Resources, Events, Success Stories, Contact, Brochure — no clipped, truncated or
overlapping text at any of the three widths, and no real horizontal scroll anywhere
(`window.scrollTo(50,0)` then `window.scrollX === 0` on every page).

**Left for the client / a decision:** on a 1280 or 1366 laptop there is no horizontal navigation
at all, only the hamburger, because `.nav__links` is hidden below 1421px. That is a product
choice, not a bug, but it is a surprising one.

**One more from the last agent back:** `.btn` carries `white-space:nowrap` and 32px of side
padding, which is wider than some containers get on the narrowest phones. "Book Free
Consultation" was sliced by the footer panel's rounded edge below ~340px, and the same button
bulged past its centred row on /resources at 375px. Below 380px buttons take two lines rather
than lose a word. Desktop is untouched.

**All eleven agents are in. 24 pages, three widths each, nothing else found.** The audit's own
method notes are above; they are the part worth keeping.

## 2026-10-19 — About Us, from the client's brief

- **Their own wording** for the story, as two paragraphs. The block renders `paragraphs` (an
  array), not `text` — setting `text` renders nothing, and putting both paragraphs in one array
  entry runs them together into a 600-character block.
- **Mission and Vision** have a section of their own now, a new `segments` block
  (`src/components/site/blocks/Segments.tsx`). They used to be two extra lines tacked onto the
  story paragraphs; those are gone, so neither is said twice.
- **"OUR Business Segments"**: the three sister-company logos the client sent, as cards that
  open the sister sites. **Trinity Car Rental has no website in the brief**, so its card is shown
  without a link rather than pointed at a guess — give me the URL and it becomes a link.
- **"Picture on left should depict a student and counsellor"** — it was a photograph of a
  building in Edinburgh. Both of the client's counsellor-with-family photographs are in now
  (`/assets/img/about/counsel-1.webp`, `-2.webp`). Their originals are only 512px wide; larger
  files would render better on a big screen.
- **"Trusted advisors" not "consultants"** (brief). The only occurrence was the home page's
  story chip, "Trusted Consultants" — the rename in the script walks every page, so re-running
  it catches any that come back.

`scripts/apply-about-segments-2026-10-19.ts` does all of it, idempotently.

**Still missing for this page:** the client's brief shows an "animated toggle" beside the
advisors wording that has no spec, and no URL for Trinity Car Rental.

## Build log — 2026-10-19
- Chatbot FAB + header: animated SVG girl-agent avatar (`AgentAvatar.tsx`, CSS in `chat.css`, reduced-motion safe).
- Country count 50+ → 39+ site-wide (DB rows via script + `seed-content.ts`, `settings.ts`).
- Mobile audit @375px: /, /about-us, /why-study-abroad, /our-service, /contact-us, /destinations/canada, /blog — no horizontal scroll; chat panel + pre-chat form fit.
- Note: running dev server may show stale "50+" (unstable_cache) → `rm -rf .next` + restart.
- Uncommitted: AgentAvatar.tsx, ChatWidget.tsx, chat.css, seed-content.ts, settings.ts.
