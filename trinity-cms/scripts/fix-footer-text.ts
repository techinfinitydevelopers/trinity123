/* Client sheet (24/11): the footer description now reads
   "Trinity Study Abroad helps students find the right direction with expert guidance, from counselling to visa approval and settling in."
   It is saved in the database (site.footerText), so the code default alone does not change a live site.

     DATABASE_URL="<url>" npx tsx scripts/fix-footer-text.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-footer-text.ts --apply    # write

   Only touches `footerText`; the rest of the "site" setting is kept and the old value is backed up to scripts/backups/ first. Idempotent.
   Settings are cached: redeploy (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const WANT = "Trinity Study Abroad helps students find the right direction with expert guidance, from counselling to visa approval and settling in.";
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "site" } });
  if (!row) { console.log("no site setting saved: the code default is in use — nothing to do"); return; }
  const v = row.value as Record<string, unknown>;
  console.log(`site.footerText is currently: ${JSON.stringify(v.footerText)}`);
  if (v.footerText === WANT) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/site-footer-text-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  await db.setting.update({ where: { key: "site" }, data: { value: { ...v, footerText: WANT } as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
