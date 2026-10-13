/* The client's revised main navigation (13 Oct 2026), plus the four pages it points at.

     DATABASE_URL="<url>" npx tsx scripts/apply-nav-2026-10-13.ts

   Home · About Us · Study Destinations ▾ · Services · Resources ▾ (Events / Brochure) ·
   Success Stories · Blog · Contact

   Pages are created only when the slug is missing, so a second run never overwrites copy the
   owner has edited. The menu is rewritten — that is the point of the script — but only the
   `items` list; the header button keeps whatever it was set to.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";
import { DEFAULTS } from "../src/lib/settings";

const NEW_SLUGS = ["success-stories", "resources", "events", "brochure"];

const db = new PrismaClient();

/* Wrapped in a function: tsx compiles a bare .ts as CommonJS, where top-level await is an error. */
async function main() {
  for (const slug of NEW_SLUGS) {
    const page = seedPages.find((p) => p.slug === slug);
    if (!page) throw new Error(`No seed content for "${slug}" — check seed-content.ts.`);
    if (await db.page.findUnique({ where: { slug } })) {
      console.log(`${slug}: already exists, left alone`);
      continue;
    }
    await db.page.create({
      data: { slug: page.slug, title: page.title, navLabel: page.navLabel, seoDesc: page.seoDesc, blocks: page.blocks as object[], isSystem: page.isSystem },
    });
    console.log(`${slug}: created`);
  }

  const row = await db.setting.findUnique({ where: { key: "nav" } });
  const current = (row?.value ?? {}) as Record<string, unknown>;
  await db.setting.upsert({
    where: { key: "nav" },
    create: { key: "nav", value: DEFAULTS.nav },
    update: { value: { ...current, items: DEFAULTS.nav.items } },
  });
  console.log(`nav: ${DEFAULTS.nav.items.map((i) => i.label).join(" · ")}`);

  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
