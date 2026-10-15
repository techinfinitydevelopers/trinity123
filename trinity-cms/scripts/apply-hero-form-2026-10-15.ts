/* Client brief, Oct 2026: fold the enquiry form into the hero, and rebuild the scroller.

     DATABASE_URL="<url>" npx tsx scripts/apply-hero-form-2026-10-15.ts

   - The home hero gains a second row holding the enquiry form, taken from the standalone
     `leadForm` section that used to sit lower down.
   - That standalone section is removed **from the home page only**. The Events and Brochure
     pages have their own `leadForm` and keep it.
   - The scroller gets the client's sixteen services, in their order.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { leadForm, usp } from "../src/lib/seed-content";

const db = new PrismaClient();

const HERO_FORM = {
  title: leadForm.formTitle, submitLabel: leadForm.submitLabel, okMsg: leadForm.okMsg,
  cities: leadForm.cities, destinations: leadForm.destinations,
};

async function main() {
  for (const page of await db.page.findMany()) {
    let blocks = page.blocks as Record<string, unknown>[];
    const note: string[] = [];

    for (const b of blocks) {
      if (b.type === "hero" && page.slug === "home" && !b.form) {
        b.form = HERO_FORM;
        note.push("hero form");
      }
      if (b.type === "usp") {
        b.items = usp.items;
        b.center = usp.center;
        note.push("scroller");
      }
    }

    if (page.slug === "home") {
      const before = blocks.length;
      blocks = blocks.filter((b) => b.type !== "leadForm");
      if (blocks.length !== before) note.push("leadForm section removed");
    }

    if (!note.length) continue;
    await db.page.update({ where: { id: page.id }, data: { blocks } });
    console.log(`${page.slug}: ${[...new Set(note)].join(", ")}`);
  }

  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
