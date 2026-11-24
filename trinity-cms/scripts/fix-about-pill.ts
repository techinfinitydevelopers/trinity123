/* Client sheet (24/11), About Us › "Our Story": the second of the three pills reads "Learn Globally, Succeed Confidently."
   instead of "Study Globally, Succeed Anywhere." The pill text is stored in the "about-us" page blocks in the database.

     DATABASE_URL="<url>" npx tsx scripts/fix-about-pill.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-about-pill.ts --apply    # write

   Only the about-us page is touched (the home page's own "About Trinity" block keeps its wording). The old blocks are backed up to
   scripts/backups/ first. Idempotent. A direct database write never reaches revalidateSite(): redeploy (or save the page once in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const OLD = "Study Globally, Succeed Anywhere.";
const NEW = "Learn Globally, Succeed Confidently.";
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const json = JSON.stringify(page.blocks);
  const n = json.split(JSON.stringify(OLD).slice(1, -1)).length - 1;
  console.log(`about-us: ${n} occurrence(s) of "${OLD}"`);
  if (!n) { console.log("nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-us-pill-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  const next = JSON.parse(json.split(OLD).join(NEW));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
