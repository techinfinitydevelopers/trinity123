/* Content fixes found in the pre-handover audit.

     DATABASE_URL="<url>" node scripts/apply-content-fixes-2026-10-06.mjs

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards.

     - The University of Alberta card showed the city as "USA" beside a Canadian flag, and "Of"
       was capitalised mid-name.
     - The courses figure appeared three ways on one page: "1 lakh+", "100,000+" and "100k+".
     - "Every Dream Needs a Direction" ran as an <h2> twice on the home page (the enquiry card and
       the About split) on top of the hero <h1> and the page title.
     - Three honeycomb cells gain a photograph, which is what the client's reference shows. Only
       three: there is no honest image for "Countries" or "Visa success" in the library, and a
       campus block under either would make the viewer hunt for a connection that is not there. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const HIVE_PHOTOS = {
  Years: "/assets/img/unversity/z4.jpg",
  Universities: "/assets/img/unversity/z1.jpg",
  Courses: "/assets/img/home/inner_about_img-1.jpg",
};

const db = new PrismaClient();

for (const page of await db.page.findMany()) {
  const blocks = page.blocks;
  let touched = false;
  const note = [];

  for (const b of blocks) {
    if (b.type === "universities") {
      for (const u of b.items ?? []) {
        if (!/university of alberta/i.test(u.name)) continue;
        if (u.name !== "University of Alberta" || u.city !== "Edmonton") {
          u.name = "University of Alberta";
          u.city = "Edmonton";
          touched = true;
          note.push("alberta");
        }
      }
    }

    if (b.type === "hero") {
      for (const cell of b.hive ?? []) {
        const want = HIVE_PHOTOS[cell.label];
        if (want && cell.img !== want) { cell.img = want; touched = true; note.push(`photo:${cell.label}`); }
        if (!want && cell.img) { delete cell.img; touched = true; note.push(`nophoto:${cell.label}`); }
      }
      for (const stat of b.stats ?? []) {
        if (/courses/i.test(stat.label ?? "") && stat.value !== "1 lakh+") { stat.value = "1 lakh+"; touched = true; }
      }
    }

    if (b.type === "offer") {
      for (const c of b.cards ?? []) {
        if (/courses/i.test(c.metricLabel ?? "") && c.metric !== "1 lakh+") { c.metric = "1 lakh+"; touched = true; }
      }
    }

    if (b.type === "about" && b.title === "Every Dream Needs [a Direction]") {
      b.title = "Four Decades of [Guiding Students]";
      touched = true;
      note.push("heading");
    }

    if (b.type === "band") {
      for (const it of b.items ?? []) {
        if (/^100,000\+ Courses$/.test(it.text)) { it.text = "1 lakh+ Courses"; touched = true; }
      }
    }
  }

  if (!touched) continue;
  await db.page.update({ where: { id: page.id }, data: { blocks } });
  console.log(`${page.slug}: ${[...new Set(note)].join(", ") || "updated"}`);
}

await db.$disconnect();
