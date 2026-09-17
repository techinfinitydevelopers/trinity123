# Trinity Study Abroad — Website + CMS

Next.js 16 (App Router) · Prisma 6 · PostgreSQL · Tailwind v4 (admin only) · Claude API (chatbot)

The public site is a 1:1 port of the original static export (`../export/trinity-site`) — same CSS, same markup — with every section, image, text and colour editable from `/admin`.

## Local development

```bash
npm install
npm run db:dev        # starts an embedded PostgreSQL on :5433 (first run downloads it) — keep this terminal open
npm run db:push       # creates tables
npm run db:seed       # admin user + 6 pages + 3 posts + settings + chatbot facts
npm run dev           # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Local development seeds `admin@trinitystudyabroad.com` with a well-known default password,
printed by the seed command. **Change it in Settings → Security before the site is public.**

Seeding a production database *requires* `ADMIN_PASSWORD` — the seed refuses to run without it,
so a live site can never end up with the documented default:

```bash
ADMIN_EMAIL="you@trinitystudyabroad.com" ADMIN_PASSWORD="<a long random password>" npx prisma db seed
```

`npm run db:reset` re-seeds and **overwrites** page content with the defaults.

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string (Neon / Vercel Postgres in prod) |
| `AUTH_SECRET` | yes | ≥32 random chars — signs admin session cookies |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://www.trinitystudyabroad.com` — used for sitemap, OG, schema |
| `ANTHROPIC_API_KEY` | for chatbot | Enables the student assistant |
| `BLOB_READ_WRITE_TOKEN` | prod | Vercel Blob for image uploads (filesystem is read-only on Vercel) |

## Deploy to Vercel

1. Push this folder to a Git repo, import it in Vercel.
2. **Storage → Create Database → Neon (Postgres)** and **Create → Blob**. Vercel injects `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`.
3. Add `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables.
4. Deploy. `postinstall` runs `prisma generate`; the build does not touch the DB.
5. First time only, create tables + seed from your machine against the production DB:
   ```bash
   DATABASE_URL="postgres://…neon…" npx prisma db push
   DATABASE_URL="postgres://…neon…" ADMIN_PASSWORD="strong-password" npx prisma db seed
   ```
6. Point the domain at Vercel. Done — log in at `/admin`.

## Project map

```
prisma/schema.prisma         data model (User, Page, Post, Media, Setting, Lead, ChatSession, KnowledgeItem)
prisma/seed.ts               default content (idempotent; --force to overwrite)
src/lib/blocks.ts            block types — the page content model
src/lib/seed-content.ts      the original site's content as blocks
src/lib/settings.ts          typed settings + defaults (theme, contact, nav, chatbot, site)
src/lib/actions.ts           all server actions used by the admin
src/styles/site.css          ORIGINAL stylesheet, untouched
src/components/site/**       public site — Header, Footer, blocks/*, SiteScripts (port of main.js)
src/components/admin/**      dashboard UI — BlockEditor, FieldEditor, RichEditor, forms
src/app/(site)/**            public routes
src/app/admin/**             dashboard routes (auth-guarded in (dash)/layout.tsx)
src/app/api/leads            contact-form endpoint
src/app/api/media            upload / list media
scripts/structural-diff.mjs  proves the React site matches the static export class-for-class
```

## How editing works

- **Pages** are an ordered list of *blocks* (JSON). The admin renders a form for every block field automatically; images get a media picker, `[brackets]` in headings become the purple accent, `{braces}` become gold.
- **Theme** edits CSS variables (`:root`) that the original stylesheet already uses — so colours/fonts/radius change site-wide without touching CSS.
- **Settings → Contact** drives header, footer, contact page, WhatsApp/phone buttons everywhere (`href: "whatsapp" | "phone" | "email"` in blocks resolve to these).
- Saving revalidates the cached pages immediately (`revalidateTag`), so changes are live on the next request.
