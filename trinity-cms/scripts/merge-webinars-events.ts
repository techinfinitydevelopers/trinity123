/* Resources menu: Webinars and Events become ONE page, "Webinars & Events" (/webinars-events), and the Brochure page goes.

   What this does to the database:
     - creates the page `webinars-events` from the existing `webinars` page (hero + webinar gallery, with the real past
       sessions kept) followed by the `events` page content (what we hold, register-interest form, call to action);
     - deletes the pages `webinars`, `events`, `resources` and `brochure`;
     - sets the nav "Resources" item to link to /webinars-events with a single child, "Webinars & Events" (no Brochure).
   next.config.ts redirects /webinars, /events, /resources and /brochure to the new page, so old links keep working.

     DATABASE_URL="<url>" npx tsx scripts/merge-webinars-events.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/merge-webinars-events.ts --apply    # write

   Everything it touches is saved to scripts/backups/ first. Idempotent (does nothing once `webinars-events` exists and the
   old pages are gone). A direct database write never reaches `revalidateSite()`, so redeploy (or save in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, any>;
const OLD = ["webinars", "events", "resources", "brochure"];

async function main() {
  const [existing, web, ev, nav] = await Promise.all([
    db.page.findUnique({ where: { slug: "webinars-events" } }),
    db.page.findUnique({ where: { slug: "webinars" } }),
    db.page.findUnique({ where: { slug: "events" } }),
    db.setting.findUnique({ where: { key: "nav" } }),
  ]);
  const olds = await db.page.findMany({ where: { slug: { in: OLD } } });

  /* ---- the merged page ---- */
  let blocks: Block[] | null = null;
  if (!existing) {
    if (!web && !ev) throw new Error("neither `webinars` nor `events` exists, nothing to merge from (re-seed instead)");
    const wb = ((web?.blocks as Block[]) ?? []).map((b) => ({ ...b }));
    const eb = ((ev?.blocks as Block[]) ?? []).map((b) => ({ ...b }));
    const hero = wb.find((b) => b.type === "pageHero") ?? { type: "pageHero", words: [{ t: "Learn" }, { t: "Before", br: true }, { t: "You Go", s: "gold" }], aside: { kind: "visual", img: "/assets/img/hero-light/desk.jpg" } };
    hero.crumb = "Webinars & Events";
    hero.ghost = "WEBINARS & EVENTS";
    hero.sub = "Free live webinars and events on countries, courses, tests, visas and funding — run by the counsellors who handle the applications. Parents are welcome, and every session ends with questions.";
    if (hero.aside?.chipB) hero.aside.chipB = { ...hero.aside.chipB, strong: "Online & in person" };
    const gallery = wb.find((b) => b.type === "webinar");
    blocks = [hero, ...(gallery ? [gallery] : []), ...eb];
  }

  /* ---- nav ---- */
  const items = (((nav?.value as any)?.items ?? []) as Block[]).map((i) => ({ ...i }));
  const wantRes = { label: "Resources", href: "/webinars-events", children: [{ label: "Webinars & Events", href: "/webinars-events" }] };
  const ri = items.findIndex((i) => i.label === "Resources");
  /* Postgres JSONB does not keep key order, so compare with keys sorted. */
  const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));
  const navNeeds = ri >= 0 && stable(items[ri]) !== stable(wantRes);

  console.log(`webinars-events page: ${existing ? "already there" : `will be created (${blocks!.map((b) => b.type).join(" | ")})`}`);
  console.log(`old pages to delete: ${olds.map((p) => p.slug).join(", ") || "none"}`);
  console.log(`nav Resources: ${ri < 0 ? "no Resources item found (left alone)" : navNeeds ? `will become ${JSON.stringify(wantRes)}` : "already correct"}`);
  if (existing && !olds.length && !navNeeds) { console.log("nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }

  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/merge-webinars-events-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ pages: olds, nav: nav?.value ?? null }, null, 2));

  if (!existing) {
    await db.page.create({
      data: {
        slug: "webinars-events", title: "Webinars & Events - Trinity Study Abroad", navLabel: "Webinars & Events",
        seoDesc: "Free live webinars, university fairs, spot-admission days, visa workshops and pre-departure briefings from Trinity Study Abroad — open to students and parents.",
        blocks: blocks as unknown as object[], isSystem: true,
      },
    });
  }
  if (olds.length) await db.page.deleteMany({ where: { slug: { in: OLD } } });
  if (navNeeds) { items[ri] = wantRes; await db.setting.update({ where: { key: "nav" }, data: { value: { ...(nav!.value as object), items } as object } }); }
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
