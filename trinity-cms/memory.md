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
