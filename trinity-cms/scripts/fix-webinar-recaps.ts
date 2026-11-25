/* Client sheet (25/11), Webinars & Events › "Snippets of our recently concluded webinar": the existing snippets are replaced by the five recap posters
   the client sent (public/assets/img/webinar/recap-1..5.webp: After 12th, 2027 readiness, test prep, New Zealand, Affordable Europe).

     DATABASE_URL="<url>" npx tsx scripts/fix-webinar-recaps.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-webinar-recaps.ts --apply    # write

   Only the `past` list of the `webinar` block on the "webinars-events" page changes; the old blocks are backed up to scripts/backups/ first.
   Idempotent. A direct database write never reaches revalidateSite(): redeploy (or save the page once in /admin). The image files must be deployed first. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const NEXT = [1, 2, 3, 4, 5].map((n) => ({ title: "", when: "", img: `/assets/img/webinar/recap-${n}.webp`, href: "" }));
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "webinars-events" } });
  if (!page) throw new Error("webinars-events page not found");
  const blocks = page.blocks as unknown as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "webinar");
  if (at < 0) { console.log("no webinar block on webinars-events — nothing to do"); return; }
  const cur = blocks[at];
  console.log("past now:", JSON.stringify((cur.past as { img: string }[] | undefined)?.map((p) => p.img)));
  console.log("past ->  :", JSON.stringify(NEXT.map((p) => p.img)));
  if (JSON.stringify(cur.past) === JSON.stringify(NEXT)) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/webinar-recaps-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "webinars-events" }, data: { blocks: blocks.map((b, i) => (i === at ? { ...b, past: NEXT } : b)) as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
