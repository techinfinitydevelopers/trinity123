/* Client: the recap posters on Webinars & Events get information under them — date, title, format and a one-line summary.
   Fills `title / when / mode / text` on the `past` items of the "webinars-events" page's webinar block, matched by poster file (recap-1 … recap-5).
   Only EMPTY fields are filled, so anything edited in /admin is kept. Idempotent; backs up the old blocks first.

     DATABASE_URL="<url>" npx tsx scripts/update-recap-info.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/update-recap-info.ts --apply    # write

   A direct DB write never reaches revalidateSite(): redeploy (or save the page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

const INFO: Record<string, { title: string; when: string; text: string }> = {
  "recap-1": { title: "Study Abroad After 12th – Pathway for Indian Students", when: "21 November 2026", text: "" },
  "recap-2": { title: "Missed 2026? Prepare for 2027", when: "24 October 2026", text: "Your step-by-step guide to planning for 2027." },
  "recap-3": { title: "Test Prep for Studying Abroad", when: "26 September 2026", text: "Which test is right for you? IELTS, TOEFL, PTE, GRE, SAT, GMAT." },
  "recap-4": { title: "Unlock Your Future in New Zealand", when: "22 August 2026", text: "Study, work and settle — your complete guide to studying in New Zealand." },
  "recap-5": { title: "Study in Europe on a Budget", when: "24 July 2026", text: "Affordable tuition, quality education and global careers." },
};

async function main() {
  const page = await db.page.findUnique({ where: { slug: "webinars-events" } });
  if (!page) throw new Error("webinars-events page not found");
  const blocks = page.blocks as unknown as Record<string, any>[];
  const at = blocks.findIndex((b) => b.type === "webinar");
  if (at < 0) { console.log("no webinar block — nothing to do"); return; }
  let changed = 0;
  const past = (blocks[at].past as Record<string, any>[]).map((p) => {
    const key = /(recap-\d)\.webp/.exec(String(p.img))?.[1];
    const info = key ? INFO[key] : undefined;
    if (!info) return p;
    const next = { ...p };
    for (const [k, v] of Object.entries({ ...info, mode: "Online webinar" })) if (!next[k] && v) { next[k] = v; changed++; }
    return next;
  });
  console.log(`${changed} empty field(s) to fill`);
  if (!changed) { console.log("already filled — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/webinars-events-recaps-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  const next = blocks.map((b, i) => (i === at ? { ...b, past } : b));
  await db.page.update({ where: { slug: "webinars-events" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
