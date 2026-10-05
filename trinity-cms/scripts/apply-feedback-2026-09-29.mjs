/* Client feedback of 25/09 and 29/09/2026, as a content migration.
   The seed carries the same changes; live databases are never re-seeded, so run this against each:

     DATABASE_URL="<url>" node scripts/apply-feedback-2026-09-29.mjs

   Idempotent. A direct database write never reaches `revalidateSite()` (src/lib/content.ts), so
   redeploy afterwards or the deployment keeps serving the cached pages.

     29/09  the countries block moves to sit right after the USP rail and the enquiry card, and
            takes the client's wording: "Choose your Country" over "Shape your direction"

   The 25/09 items are code, not content: the page-hero asides (the contact page's Call us and
   Email links among them) were hidden below 1120px, and the legacy palette hues are swapped for
   the brand ones in the stylesheets.                                                            */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

for (const page of await db.page.findMany()) {
  const blocks = page.blocks;
  const i = blocks.findIndex((b) => b.type === "countries");
  if (i === -1) continue;

  const countries = blocks[i];
  let touched = false;

  if (countries.kicker !== "Shape your direction") { countries.kicker = "Shape your direction"; touched = true; }
  if (countries.title !== "Choose your [Country]") { countries.title = "Choose your [Country]"; touched = true; }
  countries.lead = countries.lead.replace(/over 1,100 renowned/, "over 1,200 renowned");

  /* Move it directly after the enquiry card, or the USP rail, whichever is last. */
  if (page.slug === "home") {
    const anchor = Math.max(blocks.findIndex((b) => b.type === "leadForm"), blocks.findIndex((b) => b.type === "usp"));
    if (anchor !== -1 && i !== anchor + 1) {
      blocks.splice(i, 1);
      blocks.splice(anchor + 1, 0, countries);
      touched = true;
    }
  }

  if (!touched) continue;
  await db.page.update({ where: { id: page.id }, data: { blocks } });
  console.log(`${page.slug}: ${blocks.map((b) => b.type).join(", ")}`);
}

await db.$disconnect();
