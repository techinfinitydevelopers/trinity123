/* Events page (Webinars & Events): adds the event photo gallery block.

     DATABASE_URL="<url>" npx tsx scripts/add-events-gallery.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-events-gallery.ts --apply    # write
     DATABASE_URL="<url>" npx tsx scripts/add-events-gallery.ts --replace --apply   # also overwrite a gallery that is already there

   The block is `eventGallery` in src/lib/seed-content.ts (five events from the client's photos, files in public/assets/img/events/).
   - A page with no `events` block gets it, right after the "The Events We Hold" feature cards (else before the register-interest form,
     else at the end).
   - A page that already has one keeps it (so captions, dates and photos edited in /admin survive) unless `--replace` is given.
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or save the
   page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { eventGallery } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const replace = process.argv.includes("--replace");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const names = (bs: Block[]) => bs.map((b) => String(b.type)).join(" > ");

async function main() {
  const page = await db.page.findUnique({ where: { slug: "webinars-events" } });
  if (!page) throw new Error("webinars-events page not found");
  const blocks = page.blocks as unknown as Block[];
  const seed = eventGallery as unknown as Block;
  const at = blocks.findIndex((b) => b.type === "events");
  let next: Block[];
  if (at >= 0) {
    if (!replace) { console.log("webinars-events: the event gallery is already there — nothing to do (use --replace to overwrite it)"); return; }
    next = blocks.map((b, i) => (i === at ? seed : b));
    console.log("webinars-events: replacing the event gallery with the seed");
  } else {
    const cards = blocks.findIndex((b) => b.type === "featureCards");
    const form = blocks.findIndex((b) => b.type === "leadForm");
    const pos = cards >= 0 ? cards + 1 : form >= 0 ? form : blocks.length;
    next = [...blocks.slice(0, pos), seed, ...blocks.slice(pos)];
    console.log(`webinars-events: adding the event gallery at position ${pos}`);
  }
  console.log(`  now:  ${names(blocks)}`);
  console.log(`  then: ${names(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/events-gallery-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "webinars-events" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
