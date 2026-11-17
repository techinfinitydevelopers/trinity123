/* About Us page: removes "What We Offer" (the offer block) and "Start Today" (the journey block), and adds the track-record figures at the end.

     DATABASE_URL="<url>" npx tsx scripts/update-about-track-record.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/update-about-track-record.ts --apply    # write

   The track-record block is the stats block in src/lib/seed-content.ts (the last one in aboutBlocks). Idempotent: once the page has no offer or journey
   block and already has the track-record stats block, it does nothing. The old blocks are saved to scripts/backups/ first. A direct database write never
   reaches `revalidateSite()`, so redeploy (or save the page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const REMOVE = new Set(["offer", "journey"]);
const isTrack = (b: Block) => b.type === "stats" && b.title === "Numbers that landed.";
const names = (bs: Block[]) => bs.map((b) => String(b.type)).join(" > ");

async function main() {
  const seed = seedPages.find((p) => p.slug === "about-us")?.blocks as unknown as Block[] | undefined;
  const track = seed?.find(isTrack);
  if (!track) throw new Error("seed has no track-record stats block on about-us");
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const kept = blocks.filter((b) => !REMOVE.has(String(b.type)) && !isTrack(b));
  const next = [...kept, track];
  const gone = blocks.filter((b) => REMOVE.has(String(b.type))).map((b) => String(b.type));
  if (!gone.length && blocks.some(isTrack) && names(blocks) === names(next)) { console.log("about-us: already up to date — nothing to do"); return; }
  console.log(`about-us: removing ${gone.length ? gone.join(" + ") : "nothing"}; adding the track-record figures at the end`);
  console.log(`  now:  ${names(blocks)}`);
  console.log(`  then: ${names(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-track-record-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
