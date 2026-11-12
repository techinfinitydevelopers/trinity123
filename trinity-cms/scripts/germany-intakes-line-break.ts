/* Germany page, "Intakes & timeline": puts "Start 10–12 months ahead — APS and blocked account add lead time."
   on its own line, as the client asked.

     DATABASE_URL="<url>" npx tsx scripts/germany-intakes-line-break.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/germany-intakes-line-break.ts --apply    # write

   Replaces ". Start 10" with ".\nStart 10" in the Germany country's `intakes` (the page renders newlines).
   Old value saved to scripts/backups/ first. Idempotent. Redeploy (or save a page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
async function main() {
  const c = await db.country.findUnique({ where: { slug: "germany" } });
  if (!c) throw new Error("germany country not found");
  const next = c.intakes.replace(/\.\s+Start 10/, ".\nStart 10");
  if (next === c.intakes) { console.log("germany: nothing to change"); return; }
  console.log(`germany intakes:\n  ${JSON.stringify(c.intakes)}\n  -> ${JSON.stringify(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/germany-intakes-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ intakes: c.intakes }, null, 2));
  await db.country.update({ where: { slug: "germany" }, data: { intakes: next } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
