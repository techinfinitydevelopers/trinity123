/* About Us page: puts the "Personalized Guidance" roadmap right below the Founder's video.

     DATABASE_URL="<url>" npx tsx scripts/add-about-roadmap.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-about-roadmap.ts --apply    # write
     DATABASE_URL="<url>" npx tsx scripts/add-about-roadmap.ts --replace --apply   # also take the seed's wording and icons

   Where it goes: immediately after the `videos` block (the Founder's video), which is itself between Mission & Vision and the
   Business Segments — so the page reads  intro → Mission & Vision → Founder's video → roadmap → Business Segments → ….
   The first version of this script put it before Mission & Vision; this one moves it.

   - A page with no roadmap gets the block from src/lib/seed-content.ts.
   - A page that already has one keeps ITS block (any edits made in /admin) and has it moved to the new place —
     unless `--replace` is given, which swaps it for the seed's block (the current "Our Process": seven steps with icons).
   - A page already in this order is left alone (idempotent). Postgres JSONB does not keep key order, hence the sorted comparison.
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or
   save the page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const replace = process.argv.includes("--replace");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));
const names = (bs: Block[]) => bs.map((b) => String(b.type)).join(" > ");

async function main() {
  const seed = seedPages.find((p) => p.slug === "about-us")?.blocks.find((b) => b.type === "roadmap");
  if (!seed) throw new Error("seed has no roadmap block on about-us");
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const roadmap = (replace ? undefined : blocks.find((b) => b.type === "roadmap")) ?? (seed as unknown as Block);
  const rest = blocks.filter((b) => b.type !== "roadmap");
  const at = rest.findIndex((b) => b.type === "videos");
  if (at < 0) throw new Error("about-us has no videos (Founder) block to place it after");
  const next = [...rest.slice(0, at + 1), roadmap, ...rest.slice(at + 1)];
  if (stable(next) === stable(blocks)) { console.log("about-us: roadmap is already right below the Founder's video — nothing to do"); return; }
  const had = blocks.some((b) => b.type === "roadmap");
  console.log(`about-us: ${had ? (replace ? "replacing and moving" : "moving") : "adding"} the roadmap right after the Founder's video`);
  if (had && replace) { const cur = blocks.find((b) => b.type === "roadmap") as Block; console.log(`  roadmap now: "${cur.title}", ${(cur.steps as unknown[]).length} steps  ->  "${(roadmap as Block).title}", ${((roadmap as Block).steps as unknown[]).length} steps`); }
  console.log(`  now:  ${names(blocks)}`);
  console.log(`  then: ${names(next)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-roadmap-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
