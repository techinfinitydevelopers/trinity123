/* Client sheet (24/11): the home page's webinar heading reads "Learn live from our TSA Counsellors".
   The heading is stored in the `webinar` block of the "home" page, so the code default alone does not change it.

     DATABASE_URL="<url>" npx tsx scripts/fix-webinar-title.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-webinar-title.ts --apply    # write

   Only touches that block's `title`; the old blocks are saved to scripts/backups/ first. Idempotent. A direct database write never
   reaches revalidateSite(), so redeploy (or save the page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const WANT = "Learn live from our TSA [Counsellors]";
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("home page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "webinar");
  if (at < 0) { console.log("no webinar block on the home page — nothing to do"); return; }
  console.log(`webinar title is currently: ${JSON.stringify(blocks[at].title)}`);
  if (blocks[at].title === WANT) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/home-webinar-title-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  const next = blocks.map((b, i) => (i === at ? { ...b, title: WANT } : b));
  await db.page.update({ where: { slug: "home" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
