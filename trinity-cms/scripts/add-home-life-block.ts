/* Client (26/11): the globe home page's "What life actually looks like" section (heading, note and the four photo cards) must be editable from
   Pages → Home in /admin. That is a `life` block on the "home" page; this adds it when the page has none, right before the webinar block, with the
   photos and captions the page already used — so nothing changes on the site until the owner edits it. Idempotent; backs up the old blocks first.

     DATABASE_URL="<url>" npx tsx scripts/add-home-life-block.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-home-life-block.ts --apply    # write

   If the heading/note were already changed in Settings → Home page, those values are copied into the block so the page keeps reading the same.
   A direct database write never reaches revalidateSite(): redeploy (or save the page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { homeLife } from "../src/lib/seed-content";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("home page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  if (blocks.some((b) => b.type === "life")) { console.log("the home page already has a Student Life block — nothing to do"); return; }

  /* Carry over whatever Settings → Home page already holds for this section, so the visible text does not change. */
  const world = await db.setting.findUnique({ where: { key: "world" } });
  const text = ((world?.value as { text?: Record<string, string> } | undefined)?.text) ?? {};
  const block = { ...homeLife, heading: text.lifeTitle?.trim() || homeLife.heading, note: text.lifeNote?.trim() || homeLife.note };

  const at = blocks.findIndex((b) => b.type === "webinar");
  const next = at >= 0 ? [...blocks.slice(0, at), block, ...blocks.slice(at)] : [...blocks, block];
  console.log(`will add the Student Life block at position ${(at >= 0 ? at : blocks.length) + 1} of ${next.length}`);
  console.log(`  heading: ${JSON.stringify(block.heading)}  note: ${JSON.stringify(block.note)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }

  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/home-blocks-before-life-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "home" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
