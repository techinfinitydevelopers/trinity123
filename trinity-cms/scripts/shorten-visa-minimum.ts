/* Destination pages: shortens "(visa minimum)" to "(visa min)" in the cost rows.

     DATABASE_URL="<url>" npx tsx scripts/shorten-visa-minimum.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/shorten-visa-minimum.ts --apply    # write

   The full phrase wrapped onto a second line inside the living-expenses cost card (Australia's
   "AUD 29,710 (visa minimum)"), which the card is not sized for; the short form fits on one line and
   still says the figure is the amount the visa requires. Matches src/lib/seed-countries.ts.

   Only that phrase changes, in every country that has it. The old cost rows are saved to
   scripts/backups/ first. Idempotent. A direct database write never reaches `revalidateSite()`,
   so redeploy (or save a country in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Row = { label: string; value: string };
const FROM = /\(visa minimum\)/gi;
const TO = "(visa min)";

async function main() {
  const countries = await db.country.findMany({ select: { slug: true, cost: true } });
  const hits = countries
    .map((c) => ({ slug: c.slug, cost: c.cost as unknown as Row[] }))
    .filter((c) => Array.isArray(c.cost) && c.cost.some((r) => FROM.test(r.value) && (FROM.lastIndex = 0) === 0));
  if (!hits.length) { console.log('no country has "(visa minimum)" — nothing to do'); return; }
  for (const c of hits) for (const r of c.cost) if (/\(visa minimum\)/i.test(r.value)) console.log(`${c.slug}: ${r.label} — ${r.value}  ->  ${r.value.replace(FROM, TO)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/visa-minimum-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(hits, null, 2));
  for (const c of hits) {
    const next = c.cost.map((r) => ({ ...r, value: r.value.replace(FROM, TO) }));
    await db.country.update({ where: { slug: c.slug }, data: { cost: next as unknown as object[] } });
  }
  console.log(`done (${hits.length} country/countries). backup: ${file}`);
}
main().finally(() => db.$disconnect());
