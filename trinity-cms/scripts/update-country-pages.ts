/* Existing destination pages — Italy (`it`) and Denmark (`dk`): brings each stored page up to the client's tab of the
   same name (2026-11-17).

     DATABASE_URL="<url>" npx tsx scripts/update-country-pages.ts            # dry run — lists what would change
     DATABASE_URL="<url>" npx tsx scripts/update-country-pages.ts --apply    # write
     DATABASE_URL="<url>" npx tsx scripts/update-country-pages.ts dk --apply # only some, by code

   The content is the matching entry in src/lib/seed-countries.ts. Only the content fields are written (tag, intro,
   stats, reasons, courses, visa, intakes, cost, requirements, scholarships, steps, work text and points, FAQs);
   the image, order, active flag, SEO fields and universities are left as they are. A page's previous values
   are saved to scripts/backups/ first. Idempotent: once a stored page matches, it is left alone — so, unlike
   the add-* scripts, this DOES replace edits made in /admin to those fields; run it only to take the document's
   wording. Postgres JSONB does not keep key order, hence the sorted comparison. A direct write never reaches
   `revalidateSite()`, so redeploy (or save the country in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedCountries } from "../src/lib/seed-countries";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const codes = args.filter((a) => !a.startsWith("--"));
const wanted = codes.length ? codes : ["it", "dk"];
const db = new PrismaClient();

const FIELDS = ["tag", "intro", "stats", "why", "courses", "visa", "intakes", "cost", "req", "sch", "steps", "work", "workPoints", "faq"] as const;
const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));
const short = (v: unknown) => { const t = typeof v === "string" ? v : JSON.stringify(v); return t.length > 90 ? t.slice(0, 87) + "…" : t; };

async function main() {
  for (const code of wanted) await one(code);
  if (!apply) console.log("\ndry run — pass --apply to write");
}

async function one(code: string) {
  const def = seedCountries.find((c) => c.code === code) as unknown as Record<string, unknown> | undefined;
  if (!def) { console.log(`${code}: not in the seed — skipped`); return; }
  const slug = String(def.slug);
  const row = await db.country.findUnique({ where: { slug } });
  if (!row) { console.log(`${code}: no ${slug} page in this database — use add-country-pages.ts instead`); return; }
  const current = row as unknown as Record<string, unknown>;
  const changed = FIELDS.filter((f) => stable(current[f]) !== stable(def[f]));
  if (!changed.length) { console.log(`${code}: ${slug} already matches the document — nothing to do`); return; }
  console.log(`\n${code}: ${slug}`);
  for (const f of changed) console.log(`  ${f}:\n     now:  ${short(current[f])}\n     to:   ${short(def[f])}`);
  console.log(`  ${changed.length} field(s) differ: ${changed.join(", ")}`);
  if (!apply) return;
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/${slug}-page-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(Object.fromEntries(changed.map((f) => [f, current[f]])), null, 2));
  await db.country.update({ where: { slug }, data: Object.fromEntries(changed.map((f) => [f, def[f]])) as never });
  console.log(`  done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
