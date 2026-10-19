/* Photographs for the Services page, from the set the client sent.

     DATABASE_URL="<url>" npx tsx scripts/apply-service-images-2026-10-19.ts

   Three of the twenty they sent are watermarked iStock previews — the girl with the toy plane,
   the Departures/Arrivals sign and the "Study Abroad Scholarship" form. Those are not published;
   they need licensed copies first. Three services are therefore still without a picture, and
   they are listed at the end of the run.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

const IMG = "/assets/img/services";

/* Keyed on the service's own title, so re-ordering the list in the dashboard cannot put a
   picture on the wrong service. */
const SHOTS: Record<string, { img: string; alt: string }> = {
  "Personalised Guidance": { img: `${IMG}/guidance.webp`, alt: "A Trinity counsellor going through options with a student" },
  "Profile Evaluation": { img: `${IMG}/profile.webp`, alt: "A counsellor reading a student's academic record with her" },
  "Entrance Exam Preparation": { img: `${IMG}/exams.webp`, alt: "A student working through practice material with a tutor" },
  "University Selection": { img: `${IMG}/university.webp`, alt: "Two students comparing university campuses on a laptop" },
  "SOP & LOR Assistance": { img: `${IMG}/sop-lor.webp`, alt: "Letters of recommendation and statement of purpose" },
  "University Application Support": { img: `${IMG}/application.webp`, alt: "A counsellor checking an application with a student" },
  "Scholarship Assistance": { img: `${IMG}/scholarship.webp`, alt: "Scholarship options" },
  "Education Loan Guidance": { img: `${IMG}/loan.webp`, alt: "Education loan planning" },
  "Student Visa Assistance": { img: `${IMG}/visa.webp`, alt: "A passport with an approved student visa" },
  "Accommodation Assistance": { img: `${IMG}/accommodation.webp`, alt: "Students being shown a room in student accommodation" },
};

async function main() {
  const page = await db.page.findUnique({ where: { slug: "our-service" } });
  if (!page) throw new Error("No our-service page in this database.");
  const blocks = page.blocks as Record<string, unknown>[];
  const done: string[] = [];
  const without: string[] = [];

  for (const block of blocks) {
    /* The hero counted eight services; there are thirteen. */
    if (block.type === "pageHero" && typeof block.sub === "string" && /^Eight\b/.test(block.sub)) {
      block.sub = block.sub.replace(/^Eight\b/, "Thirteen");
      done.push("the hero says thirteen services, which is how many there are");
    }

    if (block.type !== "services") continue;
    for (const item of block.items as Record<string, unknown>[]) {
      const shot = SHOTS[String(item.title)];
      if (!shot) { without.push(String(item.title)); continue; }
      if (item.img === shot.img && item.imgAlt === shot.alt) continue;
      item.img = shot.img;
      item.imgAlt = shot.alt;
      done.push(`${item.title}`);
    }
  }

  await db.page.update({ where: { slug: "our-service" }, data: { blocks: blocks as unknown as object[] } });
  console.log(done.length ? done.join("\n") : "nothing to change");
  if (without.length) console.log(`\nstill without a picture: ${without.join(", ")}`);
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
