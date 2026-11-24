/* Client sheet (24/11), About Us › the sister-companies block: the heading "Our Business Segments" becomes "Our Group Companies", and the button
   "Talk to a trusted counsellor" becomes "Talk to our Counsellor" (the word "Trusted" goes). Both are stored in the `segments` block with logos on
   the "about-us" page.

     DATABASE_URL="<url>" npx tsx scripts/fix-group-companies.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-group-companies.ts --apply    # write

   Only that block's `logosTitle` and `ctaLabel` change. The old blocks are backed up to scripts/backups/ first. Idempotent. A direct database write
   never reaches revalidateSite(): redeploy (or save the page once in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const TITLE = "Our Group Companies";
const CTA = "Talk to our Counsellor";
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "segments" && Array.isArray(b.logos) && (b.logos as unknown[]).length > 0);
  if (at < 0) { console.log("no sister-companies block on about-us — nothing to do"); return; }
  const cur = blocks[at];
  console.log("title:", JSON.stringify(cur.logosTitle), "->", JSON.stringify(TITLE));
  console.log("button:", JSON.stringify(cur.ctaLabel), "->", JSON.stringify(CTA));
  if (cur.logosTitle === TITLE && cur.ctaLabel === CTA) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-group-companies-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks.map((b, i) => (i === at ? { ...b, logosTitle: TITLE, ctaLabel: CTA } : b)) as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
