/* About Us page: highlights the phrase "right direction" in the third paragraph of the intro block by wrapping it in
   [square brackets], which the About block renders as a highlighted phrase.

     DATABASE_URL="<url>" npx tsx scripts/highlight-about-right-direction.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/highlight-about-right-direction.ts --apply    # write

   Only that one phrase in that one paragraph changes. The old blocks are saved to scripts/backups/ first.
   Idempotent (does nothing once the phrase is already in brackets). The page is cached: redeploy (or save in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, any>;

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = (page.blocks as Block[]).map((b) => ({ ...b }));
  let changed = 0;
  for (const b of blocks) {
    if (b.type !== "about" || !Array.isArray(b.paragraphs)) continue;
    b.paragraphs = b.paragraphs.map((p: string) => {
      if (/\[right direction\]/i.test(p)) return p;
      if (!/\bright direction\b/i.test(p)) return p;
      changed++;
      return p.replace(/\bright direction\b/i, (m) => `[${m}]`);
    });
  }
  if (!changed) { console.log("nothing to change (phrase not found, or already highlighted)"); return; }
  console.log(`will highlight "right direction" in ${changed} paragraph(s) of the About intro block`);
  if (!apply) { console.log("dry run, pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-highlight-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
