/* Client sheet (24/11), About Us › "A word from our Founder": the line under the heading is now the Founder's quotation, signed
   "Mrs. Melissa Antony", and the "42+ Years' experience / 50+ Countries / 1,200+ Universities" chips under it are removed.
   The block lives in the "about-us" page in the database (the `videos` block whose kicker is "From our Founder").

     DATABASE_URL="<url>" npx tsx scripts/fix-founder-quote.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-founder-quote.ts --apply    # write

   Only that block's `lead`, `leadBy` and `points` change. The old blocks are backed up to scripts/backups/ first. Idempotent. A direct
   database write never reaches revalidateSite(): redeploy (or save the page once in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const LEAD = "“Because choosing the right path for your future is a journey we believe in supporting”";
const BY = "Mrs. Melissa Antony";
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "videos" && /founder/i.test(String(b.kicker ?? "") + String(b.title ?? "")));
  if (at < 0) { console.log("no Founder videos block on about-us — nothing to do"); return; }
  const cur = blocks[at];
  console.log("lead :", JSON.stringify(cur.lead), "->", JSON.stringify(LEAD));
  console.log("by   :", JSON.stringify(cur.leadBy), "->", JSON.stringify(BY));
  console.log("points:", JSON.stringify(cur.points), "-> removed");
  const { points: _drop, ...rest } = cur;
  const next = { ...rest, lead: LEAD, leadBy: BY };
  if (JSON.stringify(next) === JSON.stringify(cur)) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-founder-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks.map((b, i) => (i === at ? next : b)) as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
