/* Italy destination page: brings the stored page up to the client's "Italy" tab (2026-11-17).

     DATABASE_URL="<url>" npx tsx scripts/update-italy-page.ts            # dry run — lists what would change
     DATABASE_URL="<url>" npx tsx scripts/update-italy-page.ts --apply    # write

   The content is the `it` entry in src/lib/seed-countries.ts. Only the content fields are written (tag, intro,
   stats, reasons, courses, visa, intakes, cost, requirements, scholarships, steps, work text and points, FAQs);
   the image, order, active flag, SEO fields and universities are left as they are. The page's previous values
   are saved to scripts/backups/ first. Idempotent: once the stored page matches, it does nothing — so, unlike
   the add-* scripts, it DOES replace edits made in /admin to these fields; run it only to take the document's
   wording. Postgres JSONB does not keep key order, hence the sorted comparison. A direct write never reaches
   `revalidateSite()`, so redeploy (or save the country in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedCountries } from "../src/lib/seed-countries";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

const FIELDS = ["tag", "intro", "stats", "why", "courses", "visa", "intakes", "cost", "req", "sch", "steps", "work", "workPoints", "faq"] as const;
const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));
const short = (v: unknown) => { const t = typeof v === "string" ? v : JSON.stringify(v); return t.length > 90 ? t.slice(0, 87) + "…" : t; };

async function main() {
  const def = seedCountries.find((c) => c.code === "it") as unknown as Record<string, unknown>;
  if (!def) throw new Error("seed has no `it` country");
  const row = await db.country.findUnique({ where: { slug: "italy" } });
  if (!row) { console.log("no Italy page in this database — use add-country-pages.ts instead"); return; }
  const current = row as unknown as Record<string, unknown>;
  const changed = FIELDS.filter((f) => stable(current[f]) !== stable(def[f]));
  if (!changed.length) { console.log("Italy already matches the document — nothing to do"); return; }
  for (const f of changed) console.log(`${f}:\n   now:  ${short(current[f])}\n   to:   ${short(def[f])}`);
  console.log(`\n${changed.length} field(s) differ: ${changed.join(", ")}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/italy-page-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(Object.fromEntries(changed.map((f) => [f, current[f]])), null, 2));
  await db.country.update({ where: { slug: "italy" }, data: Object.fromEntries(changed.map((f) => [f, def[f]])) as never });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
