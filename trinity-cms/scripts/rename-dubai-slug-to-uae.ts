/* Moves the UAE page from /destinations/dubai to /destinations/uae, and takes the dash out of the footer text
   ("... 50+ countries counselling, admissions ..."), as the client asked.

     DATABASE_URL="<url>" npx tsx scripts/rename-dubai-slug-to-uae.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/rename-dubai-slug-to-uae.ts --apply    # write

   1. Country: slug "dubai" -> "uae" (run rename-dubai-to-uae first so its name is already UAE).
   2. Every "/destinations/dubai" link inside page blocks and settings -> "/destinations/uae".
   3. Setting `site` footerText: " countries — counselling" -> " countries counselling".
   next.config.ts redirects /destinations/dubai -> /destinations/uae, so old links keep working.
   Old rows are saved to scripts/backups/ first. Idempotent. Redeploy (or save a page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
const swap = (t: string) => t.split("/destinations/dubai").join("/destinations/uae").split("countries — counselling").join("countries counselling");

async function main() {
  const backup: Record<string, unknown> = {};
  const writes: (() => Promise<unknown>)[] = [];

  const c = await db.country.findUnique({ where: { slug: "dubai" } });
  const already = await db.country.findUnique({ where: { slug: "uae" } });
  if (c && already) throw new Error("both dubai and uae slugs exist — resolve by hand");
  if (c) { backup.country = c; writes.push(() => db.country.update({ where: { slug: "dubai" }, data: { slug: "uae" } })); console.log("country: slug dubai -> uae"); }
  else console.log(already ? "country: already uae" : "country: neither dubai nor uae found");

  for (const p of await db.page.findMany()) {
    const before = JSON.stringify(p.blocks), after = swap(before);
    if (before !== after) { (backup.pages ??= {} as Record<string, unknown>); (backup.pages as Record<string, unknown>)[p.slug] = p.blocks; writes.push(() => db.page.update({ where: { slug: p.slug }, data: { blocks: JSON.parse(after) } })); console.log(`page ${p.slug}: links updated`); }
  }
  for (const s of await db.setting.findMany()) {
    const before = JSON.stringify(s.value), after = swap(before);
    if (before !== after) { (backup.settings ??= {} as Record<string, unknown>); (backup.settings as Record<string, unknown>)[s.key] = s.value; writes.push(() => db.setting.update({ where: { key: s.key }, data: { value: JSON.parse(after) } })); console.log(`setting ${s.key}: updated`); }
  }

  if (!writes.length) { console.log("nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/dubai-slug-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  for (const w of writes) await w();
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
