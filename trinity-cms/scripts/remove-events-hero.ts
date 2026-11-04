/* Removes the hero (breadcrumb, "Meet Us In Person", the Mumbai/Online chips) from the Events page, so the
   page starts at the "The Events We Hold" section.

     DATABASE_URL="<url>" npx tsx scripts/remove-events-hero.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/remove-events-hero.ts --apply    # write

   Only the Events page's `pageHero` block is dropped (src/lib/seed-content.ts no longer has it). The old
   blocks are saved to scripts/backups/ first. Idempotent. A direct database write never reaches
   `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;

async function main() {
  const page = await db.page.findUnique({ where: { slug: "events" } });
  if (!page) throw new Error("events page not found");
  const blocks = page.blocks as unknown as Block[];
  const next = blocks.filter((b) => b.type !== "pageHero");
  if (next.length === blocks.length) { console.log("events: no hero block — nothing to do"); return; }
  console.log(`events: dropping the hero (${blocks.length} -> ${next.length} blocks); first block is now "${next[0]?.type}"`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/events-hero-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "events" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
