/* Adds the world-map section and retitles the universities scroller (client brief 29/09).

     DATABASE_URL="<url>" node scripts/apply-world-map.mjs

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards.
   The map's pins are generated into src/components/site/world-map.ts, not stored here — only the
   surrounding copy is content.                                                                  */
import { PrismaClient } from "../src/generated/prisma/index.js";

const WORLD_MAP = {
  type: "worldMap",
  kicker: "Explore · Learn · Grow",
  title: "Study Abroad, [Across the World]",
  lead: "Fourteen destinations, one counsellor who knows all of them. Follow the cap to see where Trinity places students.",
  note: "Your global future awaits.",
};

const db = new PrismaClient();

for (const page of await db.page.findMany()) {
  const blocks = page.blocks;
  let touched = false;

  const uni = blocks.find((b) => b.type === "universities");
  if (uni && uni.title !== "Universities") {
    uni.title = "Universities";
    uni.kicker = "1200 Partner Institutions";
    touched = true;
  }

  /* Straight after the countries grid, which already sits after the USP rail. */
  const after = blocks.findIndex((b) => b.type === "countries");
  if (page.slug === "home" && after !== -1 && !blocks.some((b) => b.type === "worldMap")) {
    blocks.splice(after + 1, 0, WORLD_MAP);
    touched = true;
  }

  if (!touched) continue;
  await db.page.update({ where: { id: page.id }, data: { blocks } });
  console.log(`${page.slug}: ${blocks.map((b) => b.type).join(", ")}`);
}

await db.$disconnect();
