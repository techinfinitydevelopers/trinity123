/* Client sheet (25/11): the "What a Trinity Journey Looks Like" section (the `journey` block, "How it goes") is removed from the Success Stories page.

     DATABASE_URL="<url>" npx tsx scripts/remove-success-journey.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/remove-success-journey.ts --apply    # write

   Only that block on the "success-stories" page is dropped; the old blocks are backed up to scripts/backups/ first. Idempotent. A direct database
   write never reaches revalidateSite(): redeploy (or save the page once in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "success-stories" } });
  if (!page) throw new Error("success-stories page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const keep = blocks.filter((b) => b.type !== "journey");
  console.log(`success-stories: ${blocks.length} blocks, ${blocks.length - keep.length} journey block(s) to remove`);
  if (keep.length === blocks.length) { console.log("nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/success-journey-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "success-stories" }, data: { blocks: keep as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
