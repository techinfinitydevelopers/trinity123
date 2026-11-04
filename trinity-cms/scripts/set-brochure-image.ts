/* Brochure page: the picture beside the "Send me the brochure" form changes from the boy to the girl
   (home/hero-student.webp, a cut-out like the one it replaces).

     DATABASE_URL="<url>" npx tsx scripts/set-brochure-image.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/set-brochure-image.ts --apply    # write

   Only the `image` of the Brochure page's `leadForm` block changes (Events and the rest keep theirs). The old
   blocks are saved to scripts/backups/ first. Idempotent. A direct database write never reaches
   `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const NEW = "/assets/img/home/hero-student.webp";

async function main() {
  const page = await db.page.findUnique({ where: { slug: "brochure" } });
  if (!page) throw new Error("brochure page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "leadForm");
  if (at < 0) { console.log("brochure: no leadForm block — nothing to do"); return; }
  if (blocks[at].image === NEW) { console.log("brochure: already the girl image — nothing to do"); return; }
  console.log(`brochure: ${String(blocks[at].image)} -> ${NEW}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/brochure-image-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  blocks[at] = { ...blocks[at], image: NEW, imageAlt: "Student ready to study abroad" };
  await db.page.update({ where: { slug: "brochure" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
