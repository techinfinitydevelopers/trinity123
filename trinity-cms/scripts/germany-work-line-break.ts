/* Germany page, "Work & settlement options": the second line starts at "18-month job-seeker residence permit, ...",
   as the client asked ("... a year. After graduating you get an" / "18-month job-seeker residence permit, ...").

     DATABASE_URL="<url>" npx tsx scripts/germany-work-line-break.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/germany-work-line-break.ts --apply    # write

   Works on the original text and on the earlier ". <newline>After graduating" variant. Only the Germany country's
   `work` changes (the page renders newlines). Old value saved to scripts/backups/ first. Idempotent. Redeploy
   (or save a page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
async function main() {
  const c = await db.country.findUnique({ where: { slug: "germany" } });
  if (!c) throw new Error("germany country not found");
  const next = c.work.replace(/\.\s+After graduating you get an\s+18-month/, ". After graduating you get an\n18-month");
  if (next === c.work) { console.log("germany: nothing to change"); return; }
  console.log(`germany work:\n  ${JSON.stringify(c.work)}\n  -> ${JSON.stringify(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/germany-work-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ work: c.work }, null, 2));
  await db.country.update({ where: { slug: "germany" }, data: { work: next } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
