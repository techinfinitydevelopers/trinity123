/* Client sheet (25/11), Webinars & Events › "Register interest": the small "REGISTER INTEREST" line above the heading is removed, the heading
   becomes "Get notified about events", the paragraph "Choose your country or course. We'll notify you about the next event.", and the photo of the
   boy in the green shirt is swapped for another student (public/assets/img/home/hero-student.webp). The form itself is untouched.

     DATABASE_URL="<url>" npx tsx scripts/fix-register-interest.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-register-interest.ts --apply    # write

   Only the `leadForm` block of the "webinars-events" page changes (kicker, tagline, text, image, imageAlt); the old blocks are backed up to scripts/backups/
   first. Idempotent. A direct database write never reaches revalidateSite(): redeploy (or save the page once in /admin). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const NEXT = {
  kicker: "",
  tagline: "Get notified about events",
  text: "Choose your country or course. We’ll notify you about the next event.",
  image: "/assets/img/home/hero-student.webp",
  imageAlt: "Smiling student with a bag, ready to study abroad",
};
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "webinars-events" } });
  if (!page) throw new Error("webinars-events page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "leadForm");
  if (at < 0) { console.log("no leadForm block on webinars-events — nothing to do"); return; }
  const cur = blocks[at];
  for (const k of Object.keys(NEXT) as (keyof typeof NEXT)[]) console.log(`${k}: ${JSON.stringify(cur[k])} -> ${JSON.stringify(NEXT[k])}`);
  if ((Object.keys(NEXT) as (keyof typeof NEXT)[]).every((k) => cur[k] === NEXT[k])) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/register-interest-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "webinars-events" }, data: { blocks: blocks.map((b, i) => (i === at ? { ...b, ...NEXT } : b)) as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
