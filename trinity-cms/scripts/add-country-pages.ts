/* Adds the destination pages written from the client's document — South Korea (`kr`), the Netherlands (`nl`), Japan (`jp`) and Malaysia (`my`).

     DATABASE_URL="<url>" npx tsx scripts/add-country-pages.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-country-pages.ts --apply    # write
     DATABASE_URL="<url>" npx tsx scripts/add-country-pages.ts nl --apply # only some, by code

   The content lives in src/lib/seed-countries.ts, so a fresh database seeded with `prisma db seed` gets the same
   pages. Idempotent per country: one that already exists (same code or slug) is left alone, so edits made in
   /admin are never overwritten. New pages, and the menu / footer / globe links that now point at them instead of
   the home globe, appear on the next deploy or cache refresh (a direct write never reaches `revalidateSite()`). */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedCountries } from "../src/lib/seed-countries";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const codes = args.filter((a) => !a.startsWith("--"));
const wanted = codes.length ? codes : ["kr", "nl", "jp", "my"];
const db = new PrismaClient();

async function main() {
  for (const code of wanted) {
    const def = seedCountries.find((c) => c.code === code);
    if (!def) { console.log(`${code}: not in the seed — skipped`); continue; }
    const existing = await db.country.findFirst({ where: { OR: [{ code: def.code }, { slug: def.slug }] }, select: { slug: true, code: true } });
    if (existing) { console.log(`${code}: already exists (${existing.code} / ${existing.slug}) — nothing to do`); continue; }
    console.log(`${code}: will create /destinations/${def.slug} — ${def.stats.length} stats, ${def.why.length} reasons, ${def.courses.length} courses, ${def.cost.length} cost rows, ${def.steps.length} steps, ${def.faq.length} FAQs`);
    if (!apply) continue;
    await db.country.create({ data: def });
    console.log(`${code}: done`);
  }
  if (!apply) console.log("dry run — pass --apply to write");
}
main().finally(() => db.$disconnect());
