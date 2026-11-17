/* Adds the South Korea destination page (/destinations/south-korea) from the client's document.

     DATABASE_URL="<url>" npx tsx scripts/add-south-korea-page.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-south-korea-page.ts --apply    # write

   The content lives in src/lib/seed-countries.ts (the `kr` entry), so a fresh database seeded with
   `prisma db seed` gets the same page. Idempotent: does nothing if a country with code `kr` or slug
   `south-korea` already exists, so later edits made in /admin are never overwritten. The new page,
   and the menu / footer entries that now link to it instead of the home globe, appear on the next
   deploy or cache refresh (a direct database write never reaches `revalidateSite()`). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedCountries } from "../src/lib/seed-countries";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const def = seedCountries.find((c) => c.code === "kr");
  if (!def) throw new Error("seed has no `kr` country");
  const existing = await db.country.findFirst({ where: { OR: [{ code: def.code }, { slug: def.slug }] }, select: { slug: true, code: true } });
  if (existing) { console.log(`a country already exists (${existing.code} / ${existing.slug}) — nothing to do`); return; }
  console.log(`will create /destinations/${def.slug}: ${def.stats.length} stats, ${def.why.length} reasons, ${def.courses.length} courses, ${def.cost.length} cost rows, ${def.steps.length} steps, ${def.faq.length} FAQs`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  await db.country.create({ data: def });
  console.log("done");
}
main().finally(() => db.$disconnect());
