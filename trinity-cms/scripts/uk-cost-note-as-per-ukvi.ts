/* UK cost cards: "(UKVI minimum)" -> "(as per UKVI)", as the client asked. Only the UK country's `cost` rows.

     DATABASE_URL="<url>" npx tsx scripts/uk-cost-note-as-per-ukvi.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/uk-cost-note-as-per-ukvi.ts --apply    # write

   Old cost rows are saved to scripts/backups/ first. Idempotent. Redeploy (or save a page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
async function main() {
  const c = await db.country.findUnique({ where: { slug: "uk" } });
  if (!c) throw new Error("uk country not found");
  const before = JSON.stringify(c.cost), after = before.split("(UKVI minimum)").join("(as per UKVI)");
  if (before === after) { console.log("uk: nothing to change"); return; }
  console.log(`uk: cost notes -> "(as per UKVI)" (${before.split("(UKVI minimum)").length - 1} place(s))`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/uk-cost-note-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, before);
  await db.country.update({ where: { slug: "uk" }, data: { cost: JSON.parse(after) } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
