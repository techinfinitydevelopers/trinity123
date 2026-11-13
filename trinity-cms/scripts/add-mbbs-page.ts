/* Adds the `mbbs` page (/mbbs) that the "MBBS" sub-tab under Study Destinations > Other Europe links to.
   The page content comes from src/lib/seed-content.ts (`mbbsBlocks`); it makes no fee/rule claims and can be edited in /admin.

     DATABASE_URL="<url>" npx tsx scripts/add-mbbs-page.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-mbbs-page.ts --apply    # write

   Idempotent: does nothing if the page already exists (so later edits in /admin are never overwritten). The new page is
   served on the next deploy or cache refresh (a direct database write never reaches `revalidateSite()`). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mbbsBlocks, seedPages } from "../src/lib/seed-content";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const def = seedPages.find((p) => p.slug === "mbbs");
  if (!def) throw new Error("seed has no mbbs page");
  const existing = await db.page.findUnique({ where: { slug: "mbbs" } });
  if (existing) { console.log("mbbs page already exists, nothing to do"); return; }
  console.log(`will create /mbbs (${mbbsBlocks.map((b) => b.type).join(" | ")})`);
  if (!apply) { console.log("dry run, pass --apply to write"); return; }
  await db.page.create({ data: { slug: def.slug, title: def.title, navLabel: def.navLabel, seoDesc: def.seoDesc, blocks: def.blocks as unknown as object[], isSystem: false } });
  console.log("done");
}
main().finally(() => db.$disconnect());
