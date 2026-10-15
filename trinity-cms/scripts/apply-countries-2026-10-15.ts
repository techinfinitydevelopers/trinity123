/* Section 3 of the client's brief — "Choose your Country".

     DATABASE_URL="<url>" npx tsx scripts/apply-countries-2026-10-15.ts

   Their list and their order: UK, Ireland, France, Germany, USA, New Zealand, Australia, Canada,
   UAE, Singapore, Netherlands, and "39+ & counting" on the dark card. Only the home page's
   `countries` block is touched; the one on Why Study Abroad keeps its own wider list.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";

const home = seedPages.find((p) => p.slug === "home");
const found = home?.blocks.find((b) => b.type === "countries");
if (!found || !("items" in found)) throw new Error("No countries block in the seed home page.");
/* Re-bound to a const: the narrowing above does not survive into the async function below. */
const seedBlock = found;

const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("No home page in this database.");

  const blocks = page.blocks as Record<string, unknown>[];
  let touched = false;
  for (const b of blocks) {
    if (b.type !== "countries") continue;
    b.items = seedBlock.items;
    b.dark = seedBlock.dark;
    touched = true;
  }
  if (!touched) throw new Error("The home page has no countries block.");

  await db.page.update({ where: { slug: "home" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`home: ${seedBlock.items.map((i) => i.name).join(", ")} + ${seedBlock.dark.num} ${seedBlock.dark.text}`);
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
