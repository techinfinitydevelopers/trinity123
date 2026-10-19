/* The home hero, rebuilt to the design the client sent on 19/10.

     DATABASE_URL="<url>" npx tsx scripts/apply-hero-design-2026-10-19.ts

   Content only — the look lives in site.css. This sets the icon that goes above each honeycomb
   figure, the three reassurances under the form's button, the button's own label, and clears
   the two buttons under the honeycomb, which the design does not have. Nothing is deleted from
   the block: `primary` and `ghost` keep their links, so typing a label into either one in the
   dashboard brings that row straight back.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

/* Matched to the client's artwork, in its order: graduation cap, globe, bank/university,
   books, shield. Font Awesome 5.15 names — the FA6 spellings draw nothing on this site. */
const HIVE_ICONS = [
  "fas fa-user-graduate",
  "fas fa-globe",
  "fas fa-university",
  "fas fa-book-open",
  "fas fa-shield-alt",
];

const TRUST = [
  { icon: "fas fa-user-shield", text: "100% Genuine Guidance" },
  { icon: "fas fa-user-friends", text: "Expert Counsellors" },
  { icon: "fas fa-star", text: "Personalized Support" },
];

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("No home page in this database.");
  const blocks = page.blocks as Record<string, unknown>[];
  const hero = blocks.find((b) => b.type === "hero");
  if (!hero) throw new Error("No hero block on the home page.");
  const done: string[] = [];

  const hive = (hero.hive ?? []) as Record<string, unknown>[];
  hive.forEach((cell, i) => {
    const icon = HIVE_ICONS[i];
    if (!icon || cell.icon === icon) return;
    cell.icon = icon;
    done.push(`honeycomb ${i + 1}: ${icon}`);
  });

  const form = hero.form as Record<string, unknown> | undefined;
  if (form) {
    if (JSON.stringify(form.trust) !== JSON.stringify(TRUST)) {
      form.trust = TRUST;
      done.push("the three reassurances under the button");
    }
    if (form.submitLabel !== "Apply Now") {
      form.submitLabel = "Apply Now";
      done.push("button reads Apply Now");
    }
  }

  /* The design has no button row under the honeycomb. Only the labels are cleared, so the
     hrefs survive and the row returns the moment someone types a label back in. */
  for (const key of ["primary", "ghost"]) {
    const btn = hero[key] as Record<string, unknown> | undefined;
    if (btn && btn.label) { btn.label = ""; done.push(`${key} button hidden`); }
  }

  await db.page.update({ where: { slug: "home" }, data: { blocks: blocks as unknown as object[] } });
  console.log(done.length ? done.join("\n") : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
