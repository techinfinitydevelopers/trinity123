/* Section 6 of the client's brief — "How Your Journey Works", their seven steps.

     DATABASE_URL="<url>" npx tsx scripts/apply-steps-2026-10-15.ts

   Replaces the four-step block on the home page with the seven the brief sets out, keeping the
   existing design, which is what "similar pattern to How it works" asks for.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";

const home = seedPages.find((p) => p.slug === "home");
const found = home?.blocks.find((b) => b.type === "steps");
if (!found || !("steps" in found)) throw new Error("No steps block in the seed home page.");
const seedBlock = found;

const db = new PrismaClient();

async function main() {
  for (const page of await db.page.findMany()) {
    const blocks = page.blocks as Record<string, unknown>[];
    let touched = false;
    for (const b of blocks) {
      if (b.type !== "steps") continue;
      b.title = seedBlock.title;
      b.kicker = seedBlock.kicker;
      b.steps = seedBlock.steps;
      touched = true;
    }
    if (!touched) continue;
    await db.page.update({ where: { id: page.id }, data: { blocks: blocks as unknown as object[] } });
    console.log(`${page.slug}: ${seedBlock.steps.length} steps — ${seedBlock.steps.map((s) => s.title).join(", ")}`);
  }
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
