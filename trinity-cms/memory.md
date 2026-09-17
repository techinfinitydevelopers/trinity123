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
