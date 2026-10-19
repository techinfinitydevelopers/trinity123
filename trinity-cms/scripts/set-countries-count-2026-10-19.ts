/* The countries figure, set in one place across every page, setting and FAQ.

     COUNT=50 DATABASE_URL="<url>" npx tsx scripts/set-countries-count-2026-10-19.ts

   It was changed site-wide from 50 to 39 and the client has since said 50 is right, so this
   exists to move it either way rather than hand-editing a dozen strings again. It rewrites only
   a number that is immediately followed by a countries word, or that sits in a field whose own
   label says "countries" — never a bare number elsewhere.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

const TO = process.env.COUNT ?? "50";
/* The figures this is allowed to replace. Anything else is left alone. */
const FROM = /\b(39|50)\b/;

let hits = 0;

/* "…in 39+ countries…", "39+ Countries", "Countries covered" — the number only counts when a
   countries word is right beside it. */
function inText(s: string): string {
  return s.replace(/\b(39|50)(\s*\+?)(\s*(?:countries|Countries|COUNTRIES))/g, (_m, _n, plus, word) => {
    hits++;
    return `${TO}${plus}${word}`;
  });
}

/* A record like { strong: "39", suffix: "+", small: "Countries" } or { value: "39+",
   label: "Countries" } — the number is in one field and the word in its neighbour. */
const LABEL = /countr/i;
const NUM_WITH_LABEL: [numKey: string, labelKey: string][] = [
  ["strong", "small"], ["value", "label"], ["metric", "metricLabel"],
  ["count", "label"], ["chipStrong", "chipSmall"], ["num", "text"],
];

function walk(v: unknown): unknown {
  if (typeof v === "string") return inText(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = { ...(v as Record<string, unknown>) };
    for (const [numKey, labelKey] of NUM_WITH_LABEL) {
      const label = o[labelKey];
      const num = o[numKey];
      if (typeof label !== "string" || !LABEL.test(label)) continue;
      if (typeof num === "string" && FROM.test(num)) { o[numKey] = num.replace(FROM, TO); hits++; }
      else if (typeof num === "number" && (num === 39 || num === 50)) { o[numKey] = Number(TO); hits++; }
    }
    for (const k of Object.keys(o)) o[k] = walk(o[k]);
    return o;
  }
  return v;
}

async function main() {
  const done: string[] = [];

  for (const page of await db.page.findMany()) {
    const before = hits;
    const blocks = walk(page.blocks) as object[];
    const seo = typeof page.seoDesc === "string" ? inText(page.seoDesc) : page.seoDesc;
    if (hits > before) {
      await db.page.update({ where: { slug: page.slug }, data: { blocks, seoDesc: seo } });
      done.push(`${page.slug}: ${hits - before}`);
    }
  }

  for (const s of await db.setting.findMany()) {
    const before = hits;
    const value = walk(s.value) as object;
    if (hits > before) {
      await db.setting.update({ where: { key: s.key }, data: { value } });
      done.push(`setting ${s.key}: ${hits - before}`);
    }
  }

  /* The chatbot answers this question too. */
  for (const k of await db.knowledgeItem.findMany()) {
    const before = hits;
    const answer = inText(k.answer);
    if (hits > before) {
      await db.knowledgeItem.update({ where: { id: k.id }, data: { answer } });
      done.push(`knowledge: ${hits - before}`);
    }
  }

  console.log(done.length ? `${TO}+ countries\n${done.join("\n")}` : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
