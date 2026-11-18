/* About Us page, Founder video section: adds the three fact chips (42+ Years' experience · 50+ Countries · 1,200+ Universities).

     DATABASE_URL="<url>" npx tsx scripts/update-about-founder.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/update-about-founder.ts --apply    # write

   Only the `points` list of the `videos` block titled "A word from our Founder." is set (from `aboutVideos` in src/lib/seed-content.ts);
   the video, heading and button are untouched. A block that already has chips is left alone, so edits made in /admin survive. Idempotent.
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or save the
   page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { aboutVideos } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "videos" && /founder/i.test(String(b.title ?? "")));
  if (at < 0) throw new Error("about-us has no Founder videos block");
  const cur = blocks[at];
  if (Array.isArray(cur.points) && cur.points.length) { console.log("about-us: the Founder section already has its chips — nothing to do"); return; }
  const next = blocks.map((b, i) => (i === at ? { ...b, points: aboutVideos.points } : b));
  console.log(`about-us: adding ${aboutVideos.points?.length} chips to "${cur.title}"`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-founder-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
