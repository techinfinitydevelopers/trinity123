/* Success Stories page: puts the "Student stories" video section inside the stories, after the second row (the first four stories — the
   grid is two across), with the remaining stories continuing underneath.

     DATABASE_URL="<url>" npx tsx scripts/add-success-videos.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-success-videos.ts --apply    # write

   Before:  testimonials (all) > journey > cta
   After:   testimonials (first 4) > videos (light) > testimonials (the rest, no heading) > journey > cta

   - The videos block is `homeVideos` (src/lib/seed-content.ts) with `light: true`; stories keep whatever text the owner edited in /admin —
     only the split point is new.
   - A page that already has a `videos` block is left alone (idempotent). A page whose stories block has 4 or fewer stories gets the videos
     right after it.
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or save the
   page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { homeVideos } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const SPLIT = 4;
const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const names = (bs: Block[]) => bs.map((b) => `${b.type}${Array.isArray(b.items) ? `(${b.items.length})` : ""}`).join(" > ");

async function main() {
  const page = await db.page.findUnique({ where: { slug: "success-stories" } });
  if (!page) throw new Error("success-stories page not found");
  const blocks = page.blocks as unknown as Block[];
  if (blocks.some((b) => b.type === "videos")) { console.log("success-stories: already has a videos section — nothing to do"); return; }
  const at = blocks.findIndex((b) => b.type === "testimonials");
  if (at < 0) throw new Error("success-stories has no testimonials block");
  const stories = blocks[at];
  const items = (stories.items as unknown[]) ?? [];
  const videos = { ...(homeVideos as unknown as Block), light: true };
  let next: Block[];
  if (items.length > SPLIT) {
    const first = { ...stories, items: items.slice(0, SPLIT) };
    const rest = { ...stories, kicker: "", title: "", lead: "", items: items.slice(SPLIT) };
    next = [...blocks.slice(0, at), first, videos, rest, ...blocks.slice(at + 1)];
  } else {
    next = [...blocks.slice(0, at + 1), videos, ...blocks.slice(at + 1)];
  }
  console.log(`  now:  ${names(blocks)}`);
  console.log(`  then: ${names(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/success-videos-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "success-stories" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
