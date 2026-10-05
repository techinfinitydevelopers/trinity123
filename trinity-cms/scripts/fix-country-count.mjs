/* One-off: the countries figure had been set to the client's "50+", but the site only has 11
   destination pages (and the footer already said 11), so the claim contradicted itself.
   This sets it to the real count everywhere the content stores it.

     DATABASE_URL="<url>" node scripts/fix-country-count.mjs

   Idempotent. As with the other content script, a direct database write never reaches
   `revalidateSite()`, so redeploy afterwards or the deployment keeps serving the cached pages. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();
const countries = await db.country.findMany({ select: { name: true } });
const n = countries.length;
const names = countries.map((c) => c.name);
const list = `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/* "50+ Countries", "in 50+ countries", "50+" next to a Countries label — all become the real
   number, and the "+" goes with it because 11 is exactly what we list, not a floor. */
const TEXT = [
  [/\b50\+(\s+[Cc]ountries)/g, `${n}$1`],
  [/\b50\+(?=["']?,?\s*(?:metricLabel|chipSmall|label)?)/g, `${n}`],
];
const renum = (v) =>
  typeof v === "string" ? TEXT.reduce((a, [re, to]) => a.replace(re, to), v)
  : Array.isArray(v) ? v.map(renum)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, renum(x)]))
  : v;

const isCountries = (label) => /countries/i.test(String(label ?? ""));

for (const page of await db.page.findMany()) {
  const blocks = renum(page.blocks);
  for (const b of blocks) {
    if (b.type === "stats") {
      for (const item of b.items) if (isCountries(item.label) && item.count === 50) { item.count = n; item.suffix = ""; }
    }
    if (b.type === "hero") {
      for (const cell of b.hive ?? []) if (isCountries(cell.label)) cell.value = String(n);
      for (const stat of b.stats ?? []) if (isCountries(stat.label)) stat.value = String(n);
    }
    /* Stat chips split the figure and its "+" across two fields, so the string pass above never
       sees "33+" or "50+" as one token. */
    if (b.type === "pageHero" && b.aside?.kind === "statchips") {
      for (const chip of b.aside.items) {
        if (!isCountries(chip.small)) continue;
        chip.strong = String(n);
        delete chip.suffix;
      }
    }
  }
  const seoDesc = page.seoDesc ? renum(page.seoDesc) : page.seoDesc;
  await db.page.update({ where: { id: page.id }, data: { blocks, seoDesc } });
}
console.log(`pages updated — countries now ${n}`);

for (const item of await db.knowledgeItem.findMany()) {
  if (!/countries do you cover/i.test(item.question)) continue;
  const answer = `${n} countries — ${list} — with 1200+ partner universities.`;
  if (answer === item.answer) continue;
  await db.knowledgeItem.update({ where: { id: item.id }, data: { answer } });
  console.log(`knowledge: ${answer}`);
}

const site = await db.setting.findUnique({ where: { key: "site" } });
if (site) {
  const footerText = String(site.value.footerText).replace(/across \d+\+? countries/i, `across ${n} countries`);
  if (footerText !== site.value.footerText) {
    await db.setting.update({ where: { key: "site" }, data: { value: { ...site.value, footerText } } });
    console.log(`site.footerText: ${footerText}`);
  }
}

await db.$disconnect();
