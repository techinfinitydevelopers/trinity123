# Memory — Trinity project clarification

## Project layout (as of 2026-09-17)
- `Trinity Study Abroad.dc.html` (262 KB) — single-file design-canvas source; `Canvas.dc.html` empty; `support.js` (69 KB) = canvas runtime.
- `export/trinity-site/` — deliverable static site: 6 pages + 3 blog posts, `assets/css/style.css` (673 lines), `assets/js/main.js` (135 lines), robots.txt, sitemap.xml, README.txt.
- `uploads/` — 20 reference screenshots. `.thumbnail` — preview.
- `_ds/enpower-design-system-*` — ENpower design system, unrelated to Trinity (leftover from another project).

## Site facts
- Brand: #5751E1 purple, #161439 navy, #FFC224 gold; Poppins headings / Inter body.
- Contact: helpdesk@trinitystudyabroad.com, +91-8453045304 / 8828800367 / 8828800368 / 022-69655855, wa.me/918453045304.
- Contact form `action="#"` — no backend; JS fakes a success state.
- Images self-hosted in `export/trinity-site/assets/img/` (35 files, 4.1 MB) since 2026-09-17. og:image + JSON-LD image/logo stay absolute production URLs on purpose. Still external: Google Fonts, Font Awesome 5.15.4 (cdnjs), Google Maps embed.
- JSON-LD only on the 3 blog posts (Article, FAQPage, BreadcrumbList, Organization); main pages have none.
- 9 URLs in sitemap.xml; nav covers index, about-us, why-study-abroad, our-service, contact-us, blog.

## Build log
### 2026-09-17 — Self-host images
- Downloaded 24 files from https://www.trinitystudyabroad.com/assets/img/ + 11 flags from flagcdn.com/w160 into `export/trinity-site/assets/img/` (flags under `assets/img/flags/`). Total 35 files, 4.1 MB.
- Rewrote refs: root pages/CSS/JS → `assets/img/...`; `blog/*.html` → `../assets/img/...`.
- Reverted og:image and JSON-LD `image`/`logo.url` in blog posts back to absolute `https://www.trinitystudyabroad.com/assets/img/...` (crawlers need absolute).
- Updated README.txt asset notes.
- Verified: all referenced paths exist on disk; served on localhost:8777 — index, blog post, logo, flags, banner, university images all 200; browser shows 0 failed loads (8 university images stay lazy-unloaded because the pinned scroller parks them ~14000px off-screen — pre-existing behaviour, fetch returns 200).

### 2026-09-17 — Phase 1: Next.js CMS (trinity-cms/)
Stack chosen by the owner: **Next.js 16 + Vercel + Postgres**, **Claude API chatbot**, **phase-wise** delivery.

- Scaffolded `trinity-cms/` (Next 16 App Router, TS, Tailwind v4 for the ADMIN only; the site keeps the original `style.css` untouched at `src/styles/site.css`).
- Local dev DB: `embedded-postgres` on port 5433 (`npm run db:dev`) — real Postgres 18, no install. **Must be initialised with `--encoding=UTF8 --locale=C`** or emoji in seed data fail with a WIN1252 error.
- Prisma 6 (NOT 7 — v7 drops `datasource.url` in the schema and requires a driver adapter). Models: User, Page, Post, Media, Setting, Lead, ChatSession, ChatMessage, KnowledgeItem, Country.
- Page content = ordered `Block[]` JSON (19 block types in `src/lib/blocks.ts`); admin renders a form per field automatically via the recursive `FieldEditor`. `[brackets]` in headings = purple accent, `{braces}` = gold.
- Frontend proven identical to the static export by `scripts/structural-diff.mjs` — class-sequence inside `<main>` matches 1:1 on all 7 pages (home 638/638).
- Admin: dashboard, Pages (block editor + live preview + SEO), Destinations, Blog (rich text, FAQ, takeaways, sources, tags), Media, Leads (+CSV), Theme & UI (live CSS-variable preview via postMessage), Settings, Chatbot config + knowledge base.
- Contact form now real: POST /api/leads → Lead table (honeypot + zod).
- **Destinations recovered from the design canvas** (`Trinity Study Abroad.dc.html` had a `<script type="text/x-dc">` with `countryInfo`/`countryDetail` for 11 countries that the static export dropped): Study Destinations mega-menu + `/destinations/[slug]` pages with costs, requirements, scholarships, visa steps, work/PR, FAQs. Ported to `src/lib/seed-countries.ts`.
- Default admin login: admin@trinitystudyabroad.com / Trinity@2026.

**Gotchas hit (keep in mind):**
- Tailwind v4: custom classes used by other `@apply` rules must be `@utility`, not `.class`.
- `unstable_cache` JSON-serialises results → Date columns come back as strings; `src/lib/content.ts` revives them.
- Server-only code (`revalidateTag`, `db`) must not sit in a module imported by client components → settings split into `settings.ts` (pure) + `settings-server.ts`.
- After a schema change, `prisma generate` fails with EPERM while `next dev` is running — stop the dev server first.

**Still to do:** Phase 2 leftovers (none blocking), Phase 3 chatbot (`ChatWidget` is a stub; `ANTHROPIC_API_KEY` not set).

### 2026-09-17 — Phase 3: Student assistant (chatbot)
- `/api/chat` (`src/app/api/chat/route.ts`): streams the Messages API as NDJSON (`session` / `delta` / `lead` / `done` / `error` events). Model from admin settings, default **claude-opus-5**; `output_config.effort: "low"` for chat latency; thinking left ON (disabling it on Opus 5 can leak tool calls into visible text).
- Grounding: `src/lib/chat.ts` builds the system prompt from the CMS only — KnowledgeItem + all destinations + posts + pages + contact settings — cached under tags `knowledge/countries/posts/pages`, with `cache_control: ephemeral` so the big stable prefix is prompt-cached.
- `save_lead` tool (strict schema) writes into the Leads inbox mid-conversation and stamps the ChatSession. Verified end to end: "My name is Rahul Sharma and my phone is +91 9876500011" → lead row created, badge shown, confirmation sent. Test data deleted afterwards.
- No `ANTHROPIC_API_KEY` → graceful keyword fallback over the knowledge base, so the widget never looks broken.
- Per-IP in-memory rate limit (20/min) — move to Redis/KV if it ever runs multi-instance.
- Widget `src/components/site/ChatWidget.tsx` + `src/styles/chat.css`: uses the site's CSS variables, so the Theme editor restyles it too. Model output is escaped and only **bold** / links / line breaks are rendered — never raw HTML.
- Admin → Conversations (`/admin/chats`) shows every transcript with call/WhatsApp/email buttons.
- Note: the SDK found credentials without `ANTHROPIC_API_KEY` being set in `.env` (resolved from the machine's Anthropic profile), which is why live answers worked in dev.

### 2026-09-17 — Git
- Repo initialised at the PROJECT ROOT (removed the nested `trinity-cms/.git` that create-next-app made), remote `origin` = https://github.com/techinfinitydevelopers/trinity123.git, branch `main`.
- Root `.gitignore` excludes node_modules, .next, .pgdata, .env, `src/generated/`, `public/uploads/*`.
- Commit `d96a4dd` — 240 files. **Push was blocked by the sandbox credential classifier**; the owner runs `git push -u origin main` themselves.
