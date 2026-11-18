/* Success Stories page: puts the "Student stories" video section inside the stories, in the second row's place — after the first row
   (the first three stories; the grid is three across), with the remaining stories continuing underneath. First version put it after four
   stories; running this again moves it (the stories either side are merged and re-split, nothing is lost).

     DATABASE_URL="<url>" npx tsx scripts/add-success-videos.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-success-videos.ts --apply    # write

   Result:  testimonials (first 3) > videos (light) > testimonials (the rest, no heading) > journey > cta

   - The videos block is `homeVideos` (src/lib/seed-content.ts) with `light: true`; stories keep whatever text the owner edited in /admin —
     only the split point is new. An existing videos block keeps its own edits too; it is only moved.
   - Idempotent: a page already split after SPLIT stories is left alone.
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or save the
   page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { homeVideos } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const SPLIT = 3;
const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const names = (bs: Block[]) => bs.map((b) => `${b.type}${Array.isArray(b.items) ? `(${b.items.length})` : ""}`).join(" > ");

async function main() {
  const page = await db.page.findUnique({ where: { slug: "success-stories" } });
  if (!page) throw new Error("success-stories page not found");
  const blocks = page.blocks as unknown as Block[];
  const vAt = blocks.findIndex((b) => b.type === "videos");
  let next: Block[];
  if (vAt > 0 && blocks[vAt - 1]?.type === "testimonials" && blocks[vAt + 1]?.type === "testimonials") {
    /* Already split somewhere: merge the stories either side of the videos and split again at SPLIT. */
    const before = blocks[vAt - 1], after = blocks[vAt + 1];
    const all = [...((before.items as unknown[]) ?? []), ...((after.items as unknown[]) ?? [])];
    const first = { ...before, items: all.slice(0, SPLIT) };
    const rest = { ...after, items: all.slice(SPLIT) };
    next = [...blocks.slice(0, vAt - 1), first, blocks[vAt], rest, ...blocks.slice(vAt + 2)];
  } else if (vAt >= 0) {
    console.log("success-stories: has a videos section that is not between two story blocks — leaving it alone");
    return;
  } else {
    const at = blocks.findIndex((b) => b.type === "testimonials");
    if (at < 0) throw new Error("success-stories has no testimonials block");
    const stories = blocks[at];
    const items = (stories.items as unknown[]) ?? [];
    const videos = { ...(homeVideos as unknown as Block), light: true };
    if (items.length > SPLIT) {
      const first = { ...stories, items: items.slice(0, SPLIT) };
      const rest = { ...stories, kicker: "", title: "", lead: "", items: items.slice(SPLIT) };
      next = [...blocks.slice(0, at), first, videos, rest, ...blocks.slice(at + 1)];
    } else {
      next = [...blocks.slice(0, at + 1), videos, ...blocks.slice(at + 1)];
    }
  }
  if (JSON.stringify(next) === JSON.stringify(blocks)) { console.log("success-stories: already split after the first row — nothing to do"); return; }
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
