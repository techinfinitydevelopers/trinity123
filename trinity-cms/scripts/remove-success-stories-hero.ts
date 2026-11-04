/* Success Stories page: drop the hero (with its three stat chips) and the "stats" block, as the seed now does, so the
   page starts at "Stories of Success".

     DATABASE_URL="<url>" npx tsx scripts/remove-success-stories-hero.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/remove-success-stories-hero.ts --apply    # write

   Only the `success-stories` page's `pageHero` and `stats` blocks are removed. The old blocks are saved to
   scripts/backups/ first. Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy (or
   save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const DROP = new Set(["pageHero", "stats"]);

async function main() {
  const page = await db.page.findUnique({ where: { slug: "success-stories" } });
  if (!page) throw new Error("success-stories page not found");
  const blocks = page.blocks as unknown as Block[];
  const next = blocks.filter((b) => !DROP.has(String(b.type)));
  if (next.length === blocks.length) { console.log("success-stories: no hero or stats block — nothing to do"); return; }
  console.log(`success-stories: ${blocks.length} -> ${next.length} blocks; first is now "${next[0]?.type}"`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/success-stories-hero-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "success-stories" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
