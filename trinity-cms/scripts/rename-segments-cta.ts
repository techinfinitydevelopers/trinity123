/* About Us, "Our Mission & Vision / business segments" block: the button "Talk to a trusted advisor"
   becomes "Talk to a trusted counsellor".

     DATABASE_URL="<url>" npx tsx scripts/rename-segments-cta.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/rename-segments-cta.ts --apply    # write

   Only that block's `ctaLabel` is changed, and only while it still reads "Talk to a trusted advisor".
   The old blocks are saved to scripts/backups/ first. Idempotent. A direct database write never reaches
   `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const OLD = "Talk to a trusted advisor", NEW = "Talk to a trusted counsellor";

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "segments");
  if (at < 0) { console.log("about-us: no segments block — nothing to do"); return; }
  if (blocks[at].ctaLabel !== OLD) { console.log(`about-us: button reads "${String(blocks[at].ctaLabel)}" — left alone`); return; }
  console.log(`about-us: "${OLD}" -> "${NEW}"`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/segments-cta-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  blocks[at] = { ...blocks[at], ctaLabel: NEW };
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
