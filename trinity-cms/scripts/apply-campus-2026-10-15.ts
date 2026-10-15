/* Section 4 of the client's brief — "Find your Campus".

     DATABASE_URL="<url>" npx tsx scripts/apply-campus-2026-10-15.ts

   Adds the block to the home page just after the world map, or refreshes it in place if it is
   already there. The logo lists are deliberately empty: the brief says the client is sending the
   files, and the panel says so on the page rather than inventing universities.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { campus } from "../src/lib/seed-content";

const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("No home page in this database.");

  const blocks = page.blocks as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "campus");

  if (at >= 0) {
    /* Already placed: refresh the copy but keep whatever logos the owner has added since. */
    const existing = blocks[at] as typeof campus;
    blocks[at] = {
      ...campus,
      options: campus.options.map((o) => {
        const was = existing.options?.find((x) => x.id === o.id);
        return was?.logos?.length ? { ...o, logos: was.logos } : o;
      }),
    };
    console.log("home: campus block refreshed");
  } else {
    const after = blocks.findIndex((b) => b.type === "worldMap");
    blocks.splice(after >= 0 ? after + 1 : blocks.length, 0, campus as unknown as Record<string, unknown>);
    console.log(`home: campus block added${after >= 0 ? " after the world map" : " at the end"}`);
  }

  await db.page.update({ where: { slug: "home" }, data: { blocks: blocks as unknown as object[] } });
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
