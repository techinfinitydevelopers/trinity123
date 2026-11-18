/* Events page: adds events that are in the seed's gallery but not yet on the stored page (matched by name) — currently the two from the
   client's mail of 2026-11-18: "Pillai College of Engineering & Pillai College of Arts, Commerce and Science" and "K J Somaiya Institute
   of Technology".

     DATABASE_URL="<url>" npx tsx scripts/add-more-events.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-more-events.ts --apply    # write

   Existing events (and anything edited in /admin — dates, captions, photo order) are not touched; new ones go at the end of the list.
   Idempotent. The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so
   redeploy (or save the page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { eventGallery } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
type Ev = { name: string };

async function main() {
  const page = await db.page.findUnique({ where: { slug: "webinars-events" } });
  if (!page) throw new Error("webinars-events page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "events");
  if (at < 0) throw new Error("webinars-events has no events block — run add-events-gallery.ts first");
  const cur = blocks[at];
  const have = ((cur.events as Ev[]) ?? []);
  const missing = (eventGallery.events as unknown as Ev[]).filter((e) => !have.some((h) => h.name === e.name));
  if (!missing.length) { console.log("webinars-events: all seed events are already there — nothing to do"); return; }
  console.log(`webinars-events: adding ${missing.length} event(s): ${missing.map((m) => m.name).join(" | ")}`);
  console.log(`  events now: ${have.length}  then: ${have.length + missing.length}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  const next = blocks.map((b, i) => (i === at ? { ...b, events: [...have, ...missing] } : b));
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/more-events-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "webinars-events" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
