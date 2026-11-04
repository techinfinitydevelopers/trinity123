/* Removes the hero (breadcrumb, "Empowering Global Education Since 1982") from the About Us page, so the
   page starts at the "Our Story" section.

     DATABASE_URL="<url>" npx tsx scripts/remove-about-hero.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/remove-about-hero.ts --apply    # write

   Only the About Us page's `pageHero` block is dropped (src/lib/seed-content.ts no longer has it). The old
   blocks are saved to scripts/backups/ first. Idempotent. A direct database write never reaches
   `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const next = blocks.filter((b) => b.type !== "pageHero");
  if (next.length === blocks.length) { console.log("about-us: no hero block — nothing to do"); return; }
  console.log(`about-us: dropping the hero (${blocks.length} -> ${next.length} blocks); first block is now "${next[0]?.type}"`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-hero-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
