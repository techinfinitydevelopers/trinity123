/* Renames the country "Dubai" to "UAE" on its destination page (/destinations/dubai — the URL stays), as the
   client asked. Only country-level mentions change; real names such as "Dubai airport" or "Regent College
   Dubai" are left alone. Mirrors content/client-brief/country-dubai.json.

     DATABASE_URL="<url>" npx tsx scripts/rename-dubai-to-uae.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/rename-dubai-to-uae.ts --apply    # write

   The old row is saved to scripts/backups/ first. Idempotent. A direct database write never reaches
   `revalidateSite()`, so redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

const R: [string, string][] = [
  ["Dubai is a global city and aviation hub,", "The UAE is a global aviation and business hub,"],
  ["programmes in Dubai", "programmes in the UAE"],
  ["For Dubai the", "For the UAE the"],
  ["entry permit to enter Dubai", "entry permit to enter the UAE"],
  ["Dubai Universities have", "UAE universities have"],
  ["Arrive in Dubai", "Arrive in the UAE"],
  ["Students in Dubai", "Students in the UAE"],
  ["Does Dubai offer PSWV?", "Does the UAE offer PSWV?"],
  ["Post-Study Work Visa in Dubai", "Post-Study Work Visa in the UAE"],
  ["possible in Dubai.", "possible in the UAE."],
  ["Show Fund in Dubai", "Show Fund in the UAE"],
  ["after reaching Dubai", "after reaching the UAE"],
  ["Study in Dubai", "Study in UAE"],
];
const fix = (s: string) => R.reduce((t, [a, b]) => t.split(a).join(b), s);

async function main() {
  const c = await db.country.findUnique({ where: { slug: "dubai" } });
  if (!c) throw new Error("dubai country not found");
  const row = c as unknown as Record<string, any>;
  const data: Record<string, unknown> = {};
  if (row.name === "Dubai") data.name = "UAE";
  for (const k of ["hero", "intro", "visa", "intakes"]) if (typeof row[k] === "string" && fix(row[k]) !== row[k]) data[k] = fix(row[k]);
  const steps = (row.steps ?? []) as { title?: string }[];
  const steps2 = steps.map((s) => (s && typeof s.title === "string" ? { ...s, title: fix(s.title) } : s));
  if (JSON.stringify(steps2) !== JSON.stringify(steps)) data.steps = steps2;
  const faq = (row.faq ?? []) as { q?: string; a?: string }[];
  const faq2 = faq.map((f) => ({ ...f, q: typeof f.q === "string" ? fix(f.q) : f.q, a: typeof f.a === "string" ? fix(f.a) : f.a }));
  if (JSON.stringify(faq2) !== JSON.stringify(faq)) data.faq = faq2;
  const keys = Object.keys(data);
  if (!keys.length) { console.log("dubai: already UAE — nothing to do"); return; }
  console.log(`dubai: updating ${keys.join(", ")}`);
  for (const k of keys) if (typeof data[k] === "string") console.log(`  ${k}: ${String(row[k]).slice(0, 70)}  ->  ${String(data[k]).slice(0, 70)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/dubai-to-uae-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(c, null, 2));
  await db.country.update({ where: { slug: "dubai" }, data: data as any });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
