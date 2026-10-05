/* Client feedback of 23/09/2026 plus brief point 16, as a content migration.
   The seed carries the same changes; live databases are never re-seeded, so run this against each:

     DATABASE_URL="<url>" node scripts/apply-feedback-2026-09-23.mjs

   Idempotent. A direct database write never reaches `revalidateSite()` (src/lib/content.ts), so
   redeploy afterwards or the deployment keeps serving the cached pages.

     16  "Est. 1982 · Mumbai · Trinity Group" leaves the hero banner
     4   the tagline goes on one line (the break lived on the "Dream" word)
     6   an enquiry card is added to the home page, beside the picture and the tagline       */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();
const countries = (await db.country.findMany({ select: { name: true } })).map((c) => c.name);

const LEAD_FORM = {
  type: "leadForm",
  kicker: "Talk to a counsellor",
  tagline: "Every Dream Needs [a Direction]",
  text: "Tell us where you want to study and a Trinity counsellor will call you back — no cost, no obligation.",
  image: "/assets/img/home/home-page-2.png",
  imageAlt: "Student ready to study abroad",
  formTitle: "Get in touch with us",
  submitLabel: "Contact me",
  okMsg: "Thank you — a counsellor will call you within one working day.",
  cities: ["Mumbai", "Navi Mumbai", "Thane", "Pune", "Other"],
  destinations: [...countries, "Not decided yet"],
};

for (const page of await db.page.findMany()) {
  const blocks = page.blocks;
  let touched = false;

  for (const b of blocks) {
    if (b.type !== "hero") continue;
    if (b.sideText) { b.sideText = ""; touched = true; }
    for (const w of b.words ?? []) if (w.br) { delete w.br; touched = true; }
  }

  if (page.slug === "home" && !blocks.some((b) => b.type === "leadForm")) {
    /* After the USP rail if there is one, otherwise straight after the hero. */
    const after = blocks.findIndex((b) => b.type === "usp");
    blocks.splice((after === -1 ? blocks.findIndex((b) => b.type === "hero") : after) + 1, 0, LEAD_FORM);
    touched = true;
  }

  if (!touched) continue;
  await db.page.update({ where: { id: page.id }, data: { blocks } });
  console.log(`${page.slug}: ${blocks.map((b) => b.type).join(", ")}`);
}

await db.$disconnect();
