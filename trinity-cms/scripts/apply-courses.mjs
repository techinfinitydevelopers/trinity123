/* Adds the courses section after the universities scroller (client brief 29/09).

     DATABASE_URL="<url>" node scripts/apply-courses.mjs

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards.  */
import { PrismaClient } from "../src/generated/prisma/index.js";

const COURSES = {
  type: "courses",
  kicker: "What you can study",
  title: "Courses",
  lead: "Whatever you want to study, there is a route to it. These are the fields our students apply for most — tell us yours and we will shortlist the universities that fit.",
  items: [
    { icon: "fas fa-briefcase", name: "MBA & Management", text: "General and specialised MBAs, plus one-year management master's for students with work experience.", duration: "1 – 2 years", where: "UK, USA, Ireland" },
    { icon: "fas fa-laptop-code", name: "Computer Science & IT", text: "Software engineering, cybersecurity, cloud and networks — the largest intake across every destination we cover.", duration: "1 – 2 years", where: "USA, Canada, Germany" },
    { icon: "fas fa-chart-line", name: "Data Science & AI", text: "Machine learning, analytics and applied statistics, with strong post-study work demand.", duration: "1 – 2 years", where: "USA, UK, Canada" },
    { icon: "fas fa-cogs", name: "Engineering", text: "Mechanical, civil, electrical and automotive, including Germany's low-tuition public universities.", duration: "1.5 – 2 years", where: "Germany, Canada, Australia" },
    { icon: "fas fa-chart-pie", name: "Business Analytics", text: "A business degree with a quantitative core — popular with commerce and engineering graduates alike.", duration: "1 – 2 years", where: "UK, USA, Ireland" },
    { icon: "fas fa-heartbeat", name: "Nursing & Healthcare", text: "Nursing, public health and allied health, with registration pathways in the destination country.", duration: "2 – 4 years", where: "Australia, UK, New Zealand" },
    { icon: "fas fa-concierge-bell", name: "Hospitality & Tourism", text: "Hotel and tourism management with paid internships built into the course.", duration: "1 – 3 years", where: "Switzerland, Australia, UAE" },
    { icon: "fas fa-coins", name: "Finance & Accounting", text: "Finance, accounting and fintech, including courses aligned to ACCA and CFA.", duration: "1 – 2 years", where: "UK, Ireland, Canada" },
  ],
};

const db = new PrismaClient();

for (const page of await db.page.findMany()) {
  const blocks = page.blocks;
  if (page.slug !== "home" || blocks.some((b) => b.type === "courses")) continue;
  const after = blocks.findIndex((b) => b.type === "universities");
  if (after === -1) continue;
  blocks.splice(after + 1, 0, COURSES);
  await db.page.update({ where: { id: page.id }, data: { blocks } });
  console.log(`${page.slug}: ${blocks.map((b) => b.type).join(", ")}`);
}

await db.$disconnect();
