/* Client sheet (24/11), About Us › "Our Process": the line under the heading ("One team beside you from the first profile evaluation to the day you
   fly.") is removed and replaced by the tagline "Because Every Dream Needs a Direction". The text lives in the `roadmap` block of the about-us page.

     DATABASE_URL="<url>" npx tsx scripts/fix-process-lead.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-process-lead.ts --apply    # write

   Only that block's `lead` changes; the old blocks are backed up to scripts/backups/ first. Idempotent. A direct database write never reaches
   revalidateSite(): redeploy (or save the page once in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const LEAD = "Because Every Dream Needs a Direction";
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "roadmap");
  if (at < 0) { console.log("no roadmap block on about-us — nothing to do"); return; }
  console.log("lead:", JSON.stringify(blocks[at].lead), "->", JSON.stringify(LEAD));
  if (blocks[at].lead === LEAD) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-process-lead-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks.map((b, i) => (i === at ? { ...b, lead: LEAD } : b)) as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
