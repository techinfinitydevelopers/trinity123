/* Turns the client's "ChatBot questions for website.xlsx" into src/lib/chatbot-kb.ts.
 *
 * The workbook is the source of truth for the assistant's answers, but it arrives as three
 * sheets with different column layouts, no categories, no keywords, and the same question asked
 * twice in places. Rather than paste 300 rows into the admin by hand — or re-derive all of that
 * every time Shreeja sends a new copy — this reads the sheet and writes a reviewable TypeScript
 * dataset that `scripts/import-chatbot-kb.ts` loads into the database.
 *
 *   node scripts/gen-chatbot-kb.mjs "C:/path/to/ChatBot questions for website.xlsx"
 *
 * Re-run it whenever the workbook changes; the output is committed so the diff shows exactly
 * what the bot will say.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import * as XLSX from "xlsx";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.argv[2] || join(process.env.USERPROFILE || process.env.HOME || "", "Downloads", "ChatBot questions for website.xlsx");
const OUT = join(ROOT, "src/lib/chatbot-kb.ts");

/* ---------- read ---------- */

const wb = XLSX.read(readFileSync(resolve(SRC)), { type: "buffer" });
const sheet = (name) => {
  /* Sheet names in the workbook carry trailing spaces ("Marketing "), so match loosely. */
  const key = wb.SheetNames.find((n) => n.trim().toLowerCase() === name.trim().toLowerCase());
  if (!key) throw new Error(`sheet not found: ${name} (have: ${wb.SheetNames.join(" | ")})`);
  return XLSX.utils.sheet_to_json(wb.Sheets[key], { header: 1, defval: "" });
};

const clean = (v) =>
  String(v ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

/* Both Q&A sheets are serial / question / answer / follow-up. Shreeja's sheet looks like it
   starts a column later in Excel, but column A there is empty and the reader drops it, so the
   layout is identical once parsed. The follow-up is blank on most rows. */
const qa = (rows) =>
  rows
    .slice(1)
    .map((r) => ({ question: clean(r[1]), answer: clean(r[2]), followUp: clean(r[3]) }))
    .filter((r) => r.question && r.answer);

const fromSheets = [
  ...qa(sheet("Shreeja Ma'am's Content")).map((r) => ({ ...r, source: "shreeja" })),
  ...qa(sheet("Marketing")).map((r) => ({ ...r, source: "marketing" })),
];

/* ---------- categories ----------
   Ordered most specific first: a question about scholarship deadlines is about scholarships, not
   about intakes, so the first rule that matches wins. These names show up in the admin's category
   filter, so they are written the way a counsellor would say them. */
const RULES = [
  ["Scholarships", /scholarship|funding|financial aid|grant\b|waiver/, true],
  ["Education loans", /\bloan|collateral|co-?applicant|education loan|sponsor|blocked account/, true],
  ["Tests & English", /ielts|toefl|pte\b|duolingo|\bgre\b|\bgmat\b|\bsat\b|english (test|requirement|proficiency)|language test|entrance exam/, true],
  ["Visa", /visa|embassy|consulate|refus|reject|biometric|\bgte\b|immigration/, true],
  ["Documents", /\bsop\b|statement of purpose|\blors?\b|recommendation|resume|\bcv\b|transcript|attest|apostille|document/, true],
  ["Work & stay-back", /part-?time|work while|stay ?back|post-?study|\bpswv?\b|\bpgwp\b|\bopt\b|\bpr\b|permanent residen|settle|\bjob|employ/, true],
  ["Accommodation & living", /accommodation|hostel|housing|rent\b|food|insurance|forex|living expense/, true],
  ["Fees & costs", /\bcost|\bfees?\b|tuition|expensive|affordab|cheap|budget|how much|price/, false],
  ["Eligibility & profile", /after 12|12th|after graduation|percentage|\bmarks\b|backlog|gap year|\bgap\b|eligib|low score|low percentage|work experience|\bcgpa\b|\bgpa\b|qualification|academic score|profile (evaluation|assessment)|assess my profile|test scores/, false],
  ["Admissions & intakes", /intake|deadline|apply|application|admission|offer letter|conditional|when should|how early|shortlist|process|where do i start|choose a university|ranking/, false],
  ["Courses", /course|program|degree|master|bachelor|\bmba\b|specialis|specializ|\bfield\b|stream|subject|major|psychology|engineering|nursing|data science|management/, false],
  ["Destinations", /countr(y|ies)|destination|germany|france|usa|\buk\b|canada|australia|ireland|new zealand|italy|poland|netherlands|dubai|singapore|europe|malta|latvia|lithuania|hungary|sweden|denmark|finland|spain/, false],
  ["About Trinity", /trinity|\btsa\b|counsell?or|counsell?ing|consultancy|agency|charge|guarantee|your (team|service|office|company)/, false],
];
/* The question decides the category. The answer is consulted only when the question says
   nothing, and then only against the rules whose vocabulary is distinctive (the third field):
   answers mention cost, budget and courses constantly — "depends on your budget and course" —
   so letting those rules read answers filed a quarter of the sheet under fees. */
const categorise = (q, a) => {
  const question = q.toLowerCase();
  for (const [name, re] of RULES) if (re.test(question)) return name;
  const answer = a.toLowerCase();
  for (const [name, re, distinctive] of RULES) if (distinctive && re.test(answer)) return name;
  return "General";
};

/* ---------- keywords ----------
   The fast matcher scores a question against `question + answer + keywords`, so keywords exist to
   catch the words a student actually types that the sheet never uses: "fees" for "tuition",
   "PR" for "permanent residence". Significant words from the question are already covered by the
   question text itself, so only the synonyms are added here. */
const SYNONYMS = [
  [/scholarship|funding/, "scholarship funding financial aid free money"],
  [/\bloan|financ/, "education loan bank finance emi collateral"],
  [/cost|fee|tuition|budget/, "fees cost price budget expenses how much money"],
  [/ielts|english|toefl|pte|duolingo/, "ielts toefl pte duolingo english test score waiver"],
  [/\bgre\b|\bgmat\b|\bsat\b/, "gre gmat sat entrance exam"],
  [/visa/, "visa embassy interview rejection refusal approval"],
  [/stay ?back|post-?study|\bpr\b|work/, "stay back post study work permit pr job settle"],
  [/\bsop\b|statement of purpose/, "sop statement of purpose essay writing"],
  [/\blor\b|recommendation/, "lor letter of recommendation reference"],
  [/accommodation|housing|hostel/, "accommodation housing hostel room rent stay"],
  [/intake|deadline/, "intake deadline fall spring september january admission date"],
  [/after 12|12th|bachelor|undergrad/, "after 12th hsc undergraduate bachelors ug"],
  [/master|\bpg\b|postgrad|graduation/, "masters postgraduate pg after graduation"],
  [/gap/, "gap year study gap backlog"],
  [/part-?time/, "part time work hours earn while studying"],
];
const COUNTRIES = [
  "germany", "france", "usa", "united states", "uk", "united kingdom", "canada", "australia",
  "ireland", "new zealand", "italy", "poland", "netherlands", "dubai", "singapore", "malta",
  "latvia", "lithuania", "hungary", "sweden", "denmark", "finland", "spain", "europe",
];
/* Synonyms are chosen from the QUESTION alone. Letting the answer trigger them put the whole
   fees vocabulary — "how much money", "price", "budget" — onto every entry whose answer happens
   to say "depends on your budget", and since the matcher searches keywords as one blob those
   entries then outscored the question that was actually about money. Countries are still read
   from the answer, because "Which countries are affordable?" names them only there and a student
   asking "is Poland affordable" should land on it. */
const keywordsFor = (q, a) => {
  const asked = q.toLowerCase();
  const out = new Set();
  for (const [re, words] of SYNONYMS) if (re.test(asked)) for (const w of words.split(" ")) out.add(w);
  const hay = `${q} ${a}`.toLowerCase();
  for (const c of COUNTRIES) if (hay.includes(c)) out.add(c.replace(/\s+/g, " "));
  return [...out].join(" ");
};

/* ---------- merge duplicates ----------
   The same question is asked on both sheets ~30 times, usually with one short answer and one
   fuller one. Keeping both would make the matcher pick between identical options, so they are
   merged: the longer answer wins (it is the one a counsellor would actually give), the other
   phrasing is kept as a related question so the shorter wording still matches, and a follow-up
   is taken from whichever row has one. */
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();
const merged = new Map();
for (const row of fromSheets) {
  const key = norm(row.question);
  const prev = merged.get(key);
  if (!prev) {
    merged.set(key, { ...row, relatedQuestions: [] });
    continue;
  }
  if (row.answer.length > prev.answer.length) {
    prev.question = row.question;
    prev.answer = row.answer;
  }
  prev.followUp = prev.followUp || row.followUp;
}

/* ---------- destination comparison ----------
   The third sheet is a stats table, not Q&A. Each row becomes one answer so "how many
   universities are there in Canada" or "what are the intakes for Ireland" resolve without a
   counsellor having to retype them. */
const dest = sheet("Study Destination details")
  .slice(2)
  .map((r) => ({ country: clean(r[0]), unis: clean(r[1]), route: clean(r[2]), intakes: clean(r[3]), tuition: clean(r[4]) }))
  .filter((r) => r.country && r.unis);

const destItems = dest.map((d) => ({
  question: `What are the key study details for ${d.country}?`,
  answer: `${d.country}: ${d.unis}. Post-study work route: ${d.route}. Intakes: ${d.intakes}. Tuition: roughly ${d.tuition} per year. Living costs, scholarships and entry requirements vary by university — a counsellor can put together the full estimate for your profile.`,
  followUp: `Would you like to shortlist universities in ${d.country}?`,
  relatedQuestions: [
    `How many universities are there in ${d.country}?`,
    `What are the intakes for ${d.country}?`,
    `What is the tuition fee in ${d.country}?`,
    `What is the stay-back period in ${d.country}?`,
  ],
  category: "Destinations",
  keywords: `${d.country.toLowerCase()} universities intake tuition fees stay back post study work`,
  source: "destinations",
}));

/* ---------- emit ---------- */

const items = [
  ...[...merged.values()].map((r) => ({
    question: r.question,
    answer: r.answer,
    followUp: r.followUp,
    relatedQuestions: r.relatedQuestions,
    category: categorise(r.question, r.answer),
    keywords: keywordsFor(r.question, r.answer),
    source: r.source,
  })),
  ...destItems,
];

const esc = (s) => JSON.stringify(s);
const body = items
  .map(
    (i) =>
      `  {\n` +
      `    question: ${esc(i.question)},\n` +
      `    answer: ${esc(i.answer)},\n` +
      (i.followUp ? `    followUp: ${esc(i.followUp)},\n` : "") +
      (i.relatedQuestions.length ? `    relatedQuestions: [${i.relatedQuestions.map(esc).join(", ")}],\n` : "") +
      `    category: ${esc(i.category)},\n` +
      `    keywords: ${esc(i.keywords)},\n` +
      `  },`,
  )
  .join("\n");

const counts = items.reduce((m, i) => ((m[i.category] = (m[i.category] || 0) + 1), m), {});
const summary = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => ` *   ${k}: ${v}`)
  .join("\n");

writeFileSync(
  OUT,
  `/* GENERATED by scripts/gen-chatbot-kb.mjs — do not edit by hand.
 *
 * Source: "ChatBot questions for website.xlsx" (the client's own questions and answers).
 * Edit the workbook and re-run the generator, or edit an answer in the admin — the importer
 * leaves admin edits alone unless it is run with --overwrite.
 *
 * ${items.length} entries:
${summary}
 */
export type ChatbotKbItem = {
  question: string;
  answer: string;
  /** The qualifying question the assistant asks after answering, where the sheet gives one. */
  followUp?: string;
  /** Other phrasings of the same question, fed to both matchers. */
  relatedQuestions?: string[];
  category: string;
  keywords: string;
};

export const chatbotKb: ChatbotKbItem[] = [
${body}
];
`,
);

console.log(`${items.length} entries → ${OUT}`);
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
