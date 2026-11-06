/* Adds the "Personalized Guidance" roadmap to the About Us page, just before the Mission / Business Segments
   block, as the client asked (the numbers section was removed from the home page at the same time).

     DATABASE_URL="<url>" npx tsx scripts/add-about-roadmap.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-about-roadmap.ts --apply    # write

   The block text comes from src/lib/seed-content.ts. The old blocks are saved to scripts/backups/ first.
   Idempotent (does nothing if a roadmap block is already there). A direct database write never reaches
   `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;

async function main() {
  const want = seedPages.find((p) => p.slug === "about-us")?.blocks.find((b) => b.type === "roadmap");
  if (!want) throw new Error("seed has no roadmap block on about-us");
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  if (blocks.some((b) => b.type === "roadmap")) { console.log("about-us: roadmap already there — nothing to do"); return; }
  const at = blocks.findIndex((b) => b.type === "segments");
  if (at < 0) throw new Error("about-us has no segments block to place it before");
  const next = [...blocks.slice(0, at), want as unknown as Block, ...blocks.slice(at)];
  console.log(`about-us: adding the roadmap before "segments" (${blocks.length} -> ${next.length} blocks)`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-roadmap-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
