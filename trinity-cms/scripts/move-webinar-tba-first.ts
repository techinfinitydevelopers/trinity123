/* Client: on the home page's "Free webinars" slider the order is: "Topic to be announced / 19 December 2026" FIRST, then the rest
   newest to oldest (Nov, Oct, Sep, Aug, Jul). Reorders the `webinar` block's `current` list on the "home" page. Idempotent; backs up first.

     DATABASE_URL="<url>" npx tsx scripts/move-webinar-tba-first.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/move-webinar-tba-first.ts --apply    # write

   A direct DB write never reaches revalidateSite(): redeploy (or save the page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("home page not found");
  const blocks = page.blocks as unknown as Record<string, any>[];
  const at = blocks.findIndex((b) => b.type === "webinar");
  if (at < 0) { console.log("no webinar block — nothing to do"); return; }
  const cur = blocks[at].current as Record<string, any>[];
  const tba = cur.find((w) => w.date === "2026-12-19" && /topic to be announced/i.test(w.title));
  if (!tba) { console.log("TBA slide not found — nothing to do"); return; }
  const rest = cur.filter((w) => w !== tba).sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  const order = [tba, ...rest];
  const same = order.every((w, i) => w === cur[i]);
  console.log("target:", order.map((w) => w.date).join(" "));
  if (same) { console.log("already in that order — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/home-webinar-order-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  const next = blocks.map((b, i) => (i === at ? { ...b, current: order } : b));
  await db.page.update({ where: { slug: "home" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
