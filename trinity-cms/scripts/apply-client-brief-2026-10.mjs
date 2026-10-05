/* One-off content migration for the client brief of 2026-10-05.
   The seed file carries the same changes, but live databases are never re-seeded, so run this
   against each one instead:  DATABASE_URL="<prod url>" node scripts/apply-client-brief-2026-10.mjs

   It is idempotent — running it twice leaves the same result.

   Writing straight to the database bypasses `revalidateSite()` (src/lib/content.ts), which only
   runs from the admin's server actions, so the deployment keeps serving the cached pages until it
   is redeployed. Redeploy from the Vercel dashboard, or `npx vercel --prod`, once this finishes.

     5/6  the hero's country orbit and floating badges are already gone (the hero was rebuilt)
     8    "Gateway to Global" drops out of the home title and the site tagline
     11   the blue animated page breaker (`band` block) is removed from every page
     13   the hero honeycomb becomes the client's five claims
     14/15 a scrolling USP rail goes in under the hero, with "One Stop Solution" pinned in it
     plus the headline figures move to 42+ years / 50+ countries / 1200+ universities          */
import { PrismaClient } from "../src/generated/prisma/index.js";

const HIVE = [
  { value: "42+", label: "Years" },
  { value: "50+", label: "Countries" },
  { value: "1200+", label: "Universities" },
  { value: "1 lakh+", label: "Courses" },
  { value: "100%", label: "Visa success" },
];

const USP = {
  type: "usp",
  center: "One Stop Solution",
  items: [
    "Personalised Counselling", "Profile Analysis", "SOP & LOR Assistance", "Shortlisting Universities",
    "Visa Assistance", "Accommodation", "Loan Assistance", "Pre-Departure Support", "Forex",
    "Insurance", "Coaching for IELTS", "Language Coaching", "Air Ticketing",
  ],
};

/* The old figures are spread through headings, chips, leads and SEO copy, so rewrite them
   wherever they appear rather than listing every field. */
const FIGURES = [[/\b33\+/g, "50+"], [/\b1100\+/g, "1200+"], [/\b1100\b/g, "1200"], [/\b30\+ ?([Yy]ears)/g, "42+ $1"]];
/* The stats counters hold their figure as a number, so the string rules never reach them. */
const COUNTS = { 30: 42, 33: 50, 1100: 1200 };
const renum = (v) =>
  typeof v === "string" ? FIGURES.reduce((a, [re, to]) => a.replace(re, to), v)
  : Array.isArray(v) ? v.map(renum)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, renum(x)]))
  : v;

const db = new PrismaClient();

for (const page of await db.page.findMany()) {
  let blocks = renum(page.blocks).filter((b) => b.type !== "band");
  const hero = blocks.find((b) => b.type === "hero");
  if (hero) hero.hive = HIVE;
  for (const stats of blocks.filter((b) => b.type === "stats")) {
    for (const item of stats.items) item.count = COUNTS[item.count] ?? item.count;
  }
  /* Point 9: the phrase they asked us to drop also sat on the home About heading. */
  const about = blocks.find((b) => b.type === "about" && /Transform Your Future/i.test(b.title ?? ""));
  if (about) about.title = "Every Dream Needs [a Direction]";
  if (page.slug === "home" && !blocks.some((b) => b.type === "usp")) {
    blocks.splice(blocks.findIndex((b) => b.type === "hero") + 1, 0, USP);
  }
  const data = { blocks, seoDesc: page.seoDesc ? renum(page.seoDesc) : page.seoDesc };
  if (page.slug === "home") data.title = "Trinity Study Abroad — Every Dream Needs a Direction";
  await db.page.update({ where: { id: page.id }, data });
  console.log(`${page.slug}: ${blocks.map((b) => b.type).join(", ")}`);
}

/* The chatbot answers from its own table, so it quotes the figures too. */
for (const item of await db.knowledgeItem.findMany()) {
  const question = renum(item.question), answer = renum(item.answer);
  if (question === item.question && answer === item.answer) continue;
  await db.knowledgeItem.update({ where: { id: item.id }, data: { question, answer } });
  console.log(`knowledge: ${question}`);
}

const site = await db.setting.findUnique({ where: { key: "site" } });
if (site) {
  await db.setting.update({
    where: { key: "site" },
    data: { value: { ...site.value, tagline: "Every Dream Needs a Direction" } },
  });
  console.log("site.tagline: Every Dream Needs a Direction");
}

await db.$disconnect();
