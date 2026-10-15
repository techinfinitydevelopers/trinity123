/* Puts the client's About Us copy, extracted from their brief, onto the About page.

     DATABASE_URL="<url>" npx tsx scripts/apply-about-content.ts <about-us.json>

   Only the `about` block's heading and paragraphs are rewritten — the images, the stat chip and
   the tags stay as they are, because the brief does not supply replacements for them. Mission and
   Vision follow the main paragraph as their own sentences, which is how the brief orders them.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("Pass the path to about-us.json."); process.exit(1); }

type About = {
  introTitle?: string; introParagraph?: string; mission?: string; vision?: string;
  cta?: { title?: string };
};
const a = JSON.parse(readFileSync(file, "utf8")) as About;

const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("No about-us page in this database.");

  const blocks = page.blocks as Record<string, unknown>[];
  const done: string[] = [];

  for (const b of blocks) {
    if (b.type !== "about") continue;
    if (a.introTitle) { b.title = a.introTitle; done.push("title"); }

    const paras: string[] = [];
    if (a.introParagraph) paras.push(a.introParagraph);
    if (a.mission) paras.push(`Our mission: ${a.mission}`);
    if (a.vision) paras.push(`Our vision: ${a.vision}`);
    if (paras.length) { b.paragraphs = paras; done.push(`${paras.length} paragraphs`); }
  }

  if (!done.length) { console.log("about-us: nothing to write"); await db.$disconnect(); return; }

  await db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`about-us: ${done.join(", ")}`);
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
