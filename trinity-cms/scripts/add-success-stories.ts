/* Success Stories page: adds the eight student / parent testimonials the client sent (2026-11-17).

     DATABASE_URL="<url>" npx tsx scripts/add-success-stories.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-success-stories.ts --apply    # write

   They are the `clientStories` list in src/lib/seed-content.ts, appended to the `items` of the page's first `testimonials` block, after the stories already there.
   Idempotent by name: a story whose name is already in the block is left alone (so an edit made in /admin is never overwritten, and a second run adds nothing).
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or save the page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { clientStories } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
type Item = { img: string; name: string; course: string; text: string };

async function main() {
  const page = await db.page.findUnique({ where: { slug: "success-stories" } });
  if (!page) throw new Error("success-stories page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "testimonials");
  if (at < 0) throw new Error("success-stories has no testimonials block");
  const block = blocks[at] as Block & { items: Item[] };
  const have = new Set(block.items.map((i) => i.name.trim().toLowerCase()));
  const add = clientStories.filter((s) => !have.has(s.name.trim().toLowerCase()));
  if (!add.length) { console.log(`success-stories: all ${clientStories.length} stories are already there — nothing to do`); return; }
  console.log(`success-stories: ${block.items.length} stories now; adding ${add.length}: ${add.map((s) => s.name).join(", ")}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  const next = blocks.map((b, i) => (i === at ? { ...block, items: [...block.items, ...add] } : b));
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/success-stories-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "success-stories" }, data: { blocks: next as unknown as object[] } });
  console.log(`done (${block.items.length} -> ${block.items.length + add.length} stories). backup: ${file}`);
}
main().finally(() => db.$disconnect());
