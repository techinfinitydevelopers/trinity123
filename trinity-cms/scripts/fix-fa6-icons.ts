/* The site loads Font Awesome 5.15.4. Some icon fields in the database were filled with Font Awesome 6 names
   (fa-earth-americas, fa-indian-rupee-sign, …), which that version does not have, so the card shows an empty box
   (the Brochure page on production). This swaps each one for its FA5 equivalent, in every page's blocks.

     DATABASE_URL="<url>" npx tsx scripts/fix-fa6-icons.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-fa6-icons.ts --apply    # write

   Only whole `fa-…` class tokens in the table below are replaced; nothing else on any page is touched. The old
   blocks of each changed page are saved to scripts/backups/ first. Idempotent. A direct database write never
   reaches `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

/* FA6 name -> the FA5 name that draws the same glyph. */
const MAP: Record<string, string> = {
  "fa-earth-americas": "fa-globe-americas", "fa-earth-europe": "fa-globe-europe", "fa-earth-asia": "fa-globe-asia",
  "fa-earth-africa": "fa-globe-africa", "fa-indian-rupee-sign": "fa-rupee-sign", "fa-calendar-days": "fa-calendar-alt",
  "fa-list-check": "fa-tasks", "fa-people-roof": "fa-users", "fa-circle-check": "fa-check-circle",
  "fa-magnifying-glass": "fa-search", "fa-xmark": "fa-times", "fa-house": "fa-home", "fa-wand-magic-sparkles": "fa-magic",
  "fa-graduation-cap": "fa-graduation-cap", "fa-file-lines": "fa-file-alt", "fa-user-group": "fa-user-friends",
  "fa-money-bill-wave": "fa-money-bill-wave", "fa-location-dot": "fa-map-marker-alt", "fa-phone-volume": "fa-phone-volume",
  "fa-arrow-right-long": "fa-long-arrow-alt-right", "fa-circle-info": "fa-info-circle", "fa-triangle-exclamation": "fa-exclamation-triangle",
  "fa-pen-to-square": "fa-edit", "fa-chart-line": "fa-chart-line", "fa-gear": "fa-cog", "fa-bars-staggered": "fa-stream",
  "fa-right-to-bracket": "fa-sign-in-alt", "fa-building-columns": "fa-university", "fa-hand-holding-dollar": "fa-hand-holding-usd",
  "fa-chalkboard-user": "fa-chalkboard-teacher", "fa-person-chalkboard": "fa-chalkboard-teacher", "fa-comments-dollar": "fa-comments-dollar",
};
const TOKEN = new RegExp(`(?<![\w-])(${Object.keys(MAP).filter((k) => MAP[k] !== k).map((k) => k.replace(/-/g, "\-")).join("|")})(?![\w-])`, "g");

async function main() {
  const pages = await db.page.findMany({ select: { slug: true, blocks: true } });
  const changes: { slug: string; next: unknown; found: Record<string, number> }[] = [];
  for (const p of pages) {
    const json = JSON.stringify(p.blocks);
    const found: Record<string, number> = {};
    const out = json.replace(TOKEN, (m) => { found[m] = (found[m] ?? 0) + 1; return MAP[m]; });
    if (Object.keys(found).length) changes.push({ slug: p.slug, next: JSON.parse(out), found });
  }
  if (!changes.length) { console.log("no Font Awesome 6 names in any page — nothing to do"); return; }
  for (const c of changes) console.log(`${c.slug}: ${Object.entries(c.found).map(([k, n]) => `${k} -> ${MAP[k]}${n > 1 ? ` x${n}` : ""}`).join(", ")}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = `scripts/backups/fa6-icons-${stamp}.json`;
  writeFileSync(file, JSON.stringify(Object.fromEntries(pages.filter((p) => changes.some((c) => c.slug === p.slug)).map((p) => [p.slug, p.blocks])), null, 2));
  for (const c of changes) await db.page.update({ where: { slug: c.slug }, data: { blocks: c.next as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
