# Project memory — trinity-cms

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
- Useful verification trick for "did my CSS actually ship?": grab the chunk URL out of the page HTML
  and grep the rule straight out of it —
  `CSS_URL=$(curl -s <site>/ | grep -o '/_next/static/[^"]*\.css' | head -1); curl -s "<site>$CSS_URL" | grep -o '\.my-rule{[^}]*}'`
  Beats guessing from a browser screenshot, and instantly distinguishes "not deployed yet" from
  "deployed but overridden".
