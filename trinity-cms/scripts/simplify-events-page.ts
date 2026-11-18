/* Events page (Webinars & Events): drop the six "The Events We Hold" cards and keep that heading (and its line) directly above the
   photo gallery in place of the gallery's own "Where you will find us" heading.

     DATABASE_URL="<url>" npx tsx scripts/simplify-events-page.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/simplify-events-page.ts --apply    # write

   - Removes the `featureCards` block whose kicker is "What We Run" (the six event-type cards).
   - Sets the `events` block's kicker / title / lead to the seed's ("What We Run" / "The Events We [Hold]" / the intake-calendar line).
     Its events and photos are left exactly as they are.
   Idempotent. The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy
   (or save the page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { eventGallery } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const names = (bs: Block[]) => bs.map((b) => String(b.type)).join(" > ");

async function main() {
  const page = await db.page.findUnique({ where: { slug: "webinars-events" } });
  if (!page) throw new Error("webinars-events page not found");
  const blocks = page.blocks as unknown as Block[];
  const seed = eventGallery as unknown as Block;
  const withoutCards = blocks.filter((b) => !(b.type === "featureCards" && b.kicker === "What We Run"));
  const next = withoutCards.map((b) => (b.type === "events" ? { ...b, kicker: seed.kicker, title: seed.title, lead: seed.lead } : b));
  if (JSON.stringify(next) === JSON.stringify(blocks)) { console.log("webinars-events: already simplified — nothing to do"); return; }
  console.log(`webinars-events: ${blocks.length - withoutCards.length} card block removed; gallery heading set to "${seed.title}"`);
  console.log(`  now:  ${names(blocks)}`);
  console.log(`  then: ${names(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/events-simplify-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "webinars-events" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
