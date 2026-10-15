/* The client's honeycomb: five cells, each with its own photograph.

     DATABASE_URL="<url>" npx tsx scripts/apply-hive-2026-10-15.ts

   42+ Years Experience · 50+ Countries · 1200+ Universities · 1 lakh+ Courses · 1 Stop Solution

   The cells are matched by position, not by label, because the fifth one is being renamed
   ("100% Visa success" becomes "1 Stop Solution") and a label match would miss it.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";

const home = seedPages.find((p) => p.slug === "home");
const seedHero = home?.blocks.find((b) => b.type === "hero");
if (!seedHero || !("hive" in seedHero)) throw new Error("No hive in the seed hero — check seed-content.ts.");
const HIVE = seedHero.hive;

const db = new PrismaClient();

async function main() {
  for (const page of await db.page.findMany()) {
    const blocks = page.blocks as Record<string, unknown>[];
    let touched = false;
    for (const b of blocks) {
      if (b.type !== "hero" || !Array.isArray(b.hive)) continue;
      b.hive = HIVE;
      touched = true;
    }
    if (!touched) continue;
    await db.page.update({ where: { id: page.id }, data: { blocks: blocks as unknown as object[] } });
    console.log(`${page.slug}: ${HIVE.map((h) => `${h.value} ${h.label}`).join(" · ")}`);
  }
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
