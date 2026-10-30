/* Exports every editable row of CMS content to a single JSON file.

     DATABASE_URL="<url>" npx tsx scripts/backup-content.ts
     DATABASE_URL="<url>" npx tsx scripts/backup-content.ts --latest
     DATABASE_URL="<url>" npx tsx scripts/backup-content.ts --out ../somewhere/else.json

   Why this exists: all of the site's content lives in Postgres and none of it lives in git.
   The repo holds the seed (src/lib/seed-content.ts), but the seed is where the content STARTED,
   not where it is now — every edit made in /admin since launch exists only in the database. If
   the Railway instance is lost, deleted or restored to an older snapshot, every page, blog post
   and setting goes with it and there is nothing to re-import. This script is that something.

   What it exports — the content a human typed and would have to retype:
     Page, Post, Setting, Country, KnowledgeItem

   What it deliberately does NOT export, and why:
     User          — rows are bcrypt password hashes. A backup file that gets committed to git
                     (which is the whole point of --latest) must never carry credentials, even
                     hashed ones. Admin accounts are cheap to recreate: scripts/set-admin-password.mjs.
     Lead          — real enquiries from real people: names, emails, phone numbers. Personal data,
                     not content, and it has no business sitting in a repo. Export it from the
                     admin's own CSV/XLSX download if it needs keeping.
     ChatSession / ChatMessage / ChatNote
                   — same reasoning, and worse: these are verbatim conversations with visitors.
     Media         — the rows are only pointers (url, alt, dimensions) at files in Vercel Blob.
                     Restoring the rows without the blobs gives you a library of dead links, so
                     the row backup would be a false reassurance. The blobs need their own backup.

   The output is one JSON object: { exportedAt, database, counts, data: { page: [...], ... } }.
   Rows are ordered by a stable natural key rather than by insertion, so re-running this against
   an unchanged database produces a byte-identical file — which is what makes committing
   content-latest.json on a schedule produce meaningful diffs instead of noise. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const db = new PrismaClient();

const argv = process.argv.slice(2);
const wantsLatest = argv.includes("--latest");
/* --out takes the NEXT argument, so read the pair rather than scanning for a prefix; on Windows
   a path with a space in it arrives as one argv entry already, no un-quoting needed here. */
const outFlag = argv.indexOf("--out");
if (outFlag !== -1 && !argv[outFlag + 1]) {
  console.error("--out needs a path, e.g. --out backups/content.json");
  process.exit(1);
}

/* The one mistake this script can make silently is running against the wrong database: local is
   localhost:5433, production is Railway, and both answer happily. So say out loud where the rows
   came from — minus the password, because this line ends up in CI logs and scrollback. */
function describeDatabase(url: string | undefined): string {
  if (!url) return "(DATABASE_URL is not set)";
  try {
    const u = new URL(url);
    const name = u.pathname.replace(/^\//, "") || "(no database name)";
    return `${u.hostname}:${u.port || "5432"}/${name} as ${u.username || "(no user)"}`;
  } catch {
    /* A malformed URL still gets reported, just coarsely — never echo the raw string, it
       contains the password. */
    return "(unparseable DATABASE_URL)";
  }
}

async function main() {
  console.log(`Connecting to: ${describeDatabase(process.env.DATABASE_URL)}`);

  /* Json columns (Page.blocks, Post.faqs, Country.*, Setting.value) come back as
     Prisma.JsonValue, which JSON.stringify serialises exactly as stored — no cast is needed on
     the way OUT. A future restore script is where Prisma.InputJsonValue becomes necessary,
     because JsonValue permits null and the create/update inputs do not. */
  const [page, post, setting, country, knowledgeItem] = await Promise.all([
    db.page.findMany({ orderBy: { slug: "asc" } }),
    db.post.findMany({ orderBy: { slug: "asc" } }),
    db.setting.findMany({ orderBy: { key: "asc" } }),
    db.country.findMany({ orderBy: { code: "asc" } }),
    db.knowledgeItem.findMany({ orderBy: { id: "asc" } }),
  ]);

  const data = { page, post, setting, country, knowledgeItem };
  const counts = Object.fromEntries(
    Object.entries(data).map(([model, rows]) => [model, rows.length]),
  );

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultOut = resolve("scripts/backups", `content-${stamp}.json`);
  const out = outFlag !== -1 ? resolve(argv[outFlag + 1]) : defaultOut;

  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      database: describeDatabase(process.env.DATABASE_URL),
      counts,
      data,
    },
    null,
    2,
  );

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, payload);

  /* --latest keeps a stable path a scheduled job can `git add` without having to work out which
     of the timestamped files is newest. It is a second copy of the same bytes, not a symlink:
     symlinks are a liability on Windows, which is what this machine is. */
  let latest: string | undefined;
  if (wantsLatest) {
    latest = resolve("scripts/backups", "content-latest.json");
    mkdirSync(dirname(latest), { recursive: true });
    writeFileSync(latest, payload);
  }

  const width = Math.max(...Object.keys(counts).map((k) => k.length));
  for (const [model, n] of Object.entries(counts)) {
    console.log(`  ${model.padEnd(width)}  ${String(n).padStart(5)} rows`);
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`  ${"total".padEnd(width)}  ${String(total).padStart(5)} rows`);

  const kb = statSync(out).size / 1024;
  console.log(`\nWrote ${out} (${kb.toFixed(1)} KB)`);
  if (latest) console.log(`Wrote ${latest} (same contents)`);

  /* An empty export is almost certainly a wrong-database or wrong-schema run rather than a site
     with no content, and it would be a disaster to commit it over a good content-latest.json.
     The file is already written, so this is a loud warning rather than a rollback. */
  if (total === 0) {
    console.warn("\nWARNING: zero rows exported. Check DATABASE_URL points at the right database.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
