/* "Universities" in the stats counter had no "+", while the hero strip and the honeycomb both
   say "1200+" — the same claim shown two ways on one page.

     DATABASE_URL="<url>" npx tsx scripts/fix-stats-suffix-2026-10-19.ts

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

type Item = { count: number; suffix: string; label: string };

async function main() {
  const done: string[] = [];

  for (const page of await db.page.findMany()) {
    const blocks = page.blocks as Record<string, unknown>[];
    let touched = false;
    for (const block of blocks) {
      if (block.type !== "stats") continue;
      for (const item of block.items as Item[]) {
        if (item.label === "Universities" && item.suffix === "") {
          item.suffix = "+";
          touched = true;
          done.push(`${page.slug}: Universities now reads ${item.count}+`);
        }
      }
    }
    if (touched) await db.page.update({ where: { slug: page.slug }, data: { blocks: blocks as unknown as object[] } });
  }

  console.log(done.length ? done.join("\n") : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
