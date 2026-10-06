/* Sets the "countries" figure everywhere the content stores it. It has flipped twice already
   (33+ → 50+ → 11 → 50+), so it is parameterised rather than hard-coded:

     DATABASE_URL="<url>" COUNTRIES="50+" node scripts/set-countries-figure.mjs

   COUNTRIES takes the displayed form, e.g. "50+" or "11". Idempotent. A direct database write
   never reaches `revalidateSite()`, so redeploy afterwards.

   The figure lives in more shapes than a plain search would find: stats counters keep the number
   and its suffix in separate numeric/string fields, and so do the page-hero stat chips. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const shown = process.env.COUNTRIES;
if (!shown || !/^\d+\+?$/.test(shown)) {
  console.error('Set COUNTRIES to a figure like "50+" or "11".');
  process.exit(1);
}
const num = parseInt(shown, 10);
const plus = shown.endsWith("+") ? "+" : "";

/* Any other figure for countries, in prose or on a chip, becomes this one. */
const TEXT = [
  [/\b\d+\+?(\s+countries)/gi, `${shown}$1`],
  [/(education in )\d+\+?( countries)/gi, `$1${shown}$2`],
];
const renum = (v) =>
  typeof v === "string" ? TEXT.reduce((a, [re, to]) => a.replace(re, to), v)
  : Array.isArray(v) ? v.map(renum)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, renum(x)]))
  : v;

const isCountries = (label) => /countries/i.test(String(label ?? ""));

const db = new PrismaClient();

for (const page of await db.page.findMany()) {
  const blocks = renum(page.blocks);
  for (const b of blocks) {
    if (b.type === "stats") {
      for (const item of b.items) if (isCountries(item.label)) { item.count = num; item.suffix = plus; }
    }
    if (b.type === "hero") {
      for (const cell of b.hive ?? []) if (isCountries(cell.label)) cell.value = shown;
      for (const stat of b.stats ?? []) if (isCountries(stat.label)) stat.value = shown;
    }
    if (b.type === "offer") {
      for (const c of b.cards ?? []) if (isCountries(c.metricLabel)) c.metric = shown;
    }
    if (b.type === "steps") {
      for (const st of b.steps ?? []) if (isCountries(st.chipSmall)) st.chipStrong = shown;
    }
    if (b.type === "pageHero" && b.aside?.kind === "statchips") {
      for (const chip of b.aside.items) {
        if (!isCountries(chip.small)) continue;
        chip.strong = String(num);
        if (plus) chip.suffix = plus; else delete chip.suffix;
      }
    }
  }
  await db.page.update({
    where: { id: page.id },
    data: { blocks, seoDesc: page.seoDesc ? renum(page.seoDesc) : page.seoDesc },
  });
}
console.log(`pages updated — countries now ${shown}`);

for (const item of await db.knowledgeItem.findMany()) {
  const answer = renum(item.answer);
  if (answer === item.answer) continue;
  await db.knowledgeItem.update({ where: { id: item.id }, data: { answer } });
  console.log(`knowledge: ${item.question}`);
}

const site = await db.setting.findUnique({ where: { key: "site" } });
if (site) {
  const footerText = renum(site.value.footerText);
  if (footerText !== site.value.footerText) {
    await db.setting.update({ where: { key: "site" }, data: { value: { ...site.value, footerText } } });
    console.log(`site.footerText: ${footerText}`);
  }
}

await db.$disconnect();
