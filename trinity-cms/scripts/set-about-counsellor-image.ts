/* Swaps the About Us picture pair (founder + Edinburgh) for one counsellor portrait.

     DATABASE_URL="<url>" npx tsx scripts/set-about-counsellor-image.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/set-about-counsellor-image.ts --apply    # write

   Touches only the About Us "about" block's picture fields: mainImg (a placeholder for now — replace the
   file public/assets/img/services/guidance.webp, or set a new path in /admin), mainAlt, the
   caption fields (emptied, so no caption shows) and sideImg (emptied, so the second picture is dropped).
   Paragraphs, title and tags are left alone. Old values are saved to scripts/backups/ first. Idempotent.
   A direct database write never reaches `revalidateSite()`, so redeploy (or save any page in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const want = { mainImg: "/assets/img/services/guidance.webp", mainAlt: "Trinity Study Abroad counsellor with a student", capSmall: "", capStrong: "", capSpan: "", sideImg: "", sideAlt: "" };

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "about");
  if (at < 0) throw new Error("about-us has no about block");
  const cur = blocks[at];
  if ((Object.keys(want) as (keyof typeof want)[]).every((k) => (cur[k] ?? "") === want[k])) { console.log("about-us: already a single counsellor image — nothing to do"); return; }
  console.log(`about-us: ${String(cur.mainImg)} + ${String(cur.sideImg)} -> ${want.mainImg}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-counsellor-image-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  blocks[at] = { ...cur, ...want };
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
