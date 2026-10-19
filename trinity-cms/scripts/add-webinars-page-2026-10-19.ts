/* A page of its own for the webinars.

     DATABASE_URL="<url>" npx tsx scripts/add-webinars-page-2026-10-19.ts

   The home page only has room for a strip of thumbnails, and the client's posters are slides —
   crop one and you cut the heading off it. This page prints each one whole, three to a row, and
   the home strip gets a link through to it.

   Creates the page, adds "Webinars" under Resources in the menu, and points the home block here.
   Re-running refreshes the page's own copy but keeps any webinar the owner has since added.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { webinar } from "../src/lib/seed-content";

const db = new PrismaClient();

const SLUG = "webinars";

const pageHero = {
  type: "pageHero",
  crumb: "Webinars",
  ghost: "WEBINARS",
  words: [{ t: "Learn" }, { t: "Before", br: true }, { t: "You Go", s: "gold" }],
  sub: "Free live sessions on countries, courses, tests, visas and funding — run by the counsellors who handle the applications. Parents are welcome, and every session ends with questions.",
  aside: {
    kind: "visual",
    /* Not one of the posters: all six are printed further down the same page. */
    img: "/assets/img/home/inner_about_img-1.jpg",
    chipA: { big: "Free", small: "No charge to attend" },
    chipB: { icon: "fas fa-video", strong: "Online", small: "Join from anywhere" },
  },
};

/* No call-to-action block here on purpose. The footer already closes every page with "Ready to
   start your study abroad journey?" and the same two buttons, so a second navy panel directly
   above it was the same ask twice. The "Register now" button in the card above does this job. */

async function main() {
  const done: string[] = [];

  /* ---- the page ---- */
  const existing = await db.page.findUnique({ where: { slug: SLUG } });
  /* Keep anything the owner has added to either list; refresh only the wording around them. */
  const old = (existing?.blocks as Record<string, unknown>[] | undefined)?.find((b) => b.type === "webinar");
  const gallery: Record<string, unknown> = {
    ...webinar,
    layout: "gallery",
    lead: "Every session we have recorded so far. Each poster is the session as it ran — pick the one that matches where you are in your application.",
    moreHref: "", moreLabel: "",
  };
  for (const key of ["current", "past"]) {
    const kept = old?.[key];
    if (Array.isArray(kept) && kept.length) gallery[key] = kept;
  }

  const blocks = [pageHero, gallery];
  const data = {
    title: "Webinars - Trinity Study Abroad",
    seoDesc: "Free live webinars from Trinity Study Abroad on study destinations, entrance tests, student visas and funding — open to students and parents.",
    blocks: blocks as unknown as object[],
  };

  if (existing) {
    await db.page.update({ where: { slug: SLUG }, data });
    done.push(`/${SLUG} refreshed`);
  } else {
    await db.page.create({ data: { slug: SLUG, navLabel: "Webinars", ...data } });
    done.push(`/${SLUG} created`);
  }

  /* ---- the menu ---- */
  const navRow = await db.setting.findUnique({ where: { key: "nav" } });
  if (navRow) {
    const nav = navRow.value as { items: { href: string; label: string; children?: { href: string; label: string }[] }[] };
    const resources = nav.items.find((i) => i.href === "/resources");
    if (resources && !(resources.children ?? []).some((c) => c.href === `/${SLUG}`)) {
      resources.children = [{ label: "Webinars", href: `/${SLUG}` }, ...(resources.children ?? [])];
      await db.setting.update({ where: { key: "nav" }, data: { value: nav as unknown as object } });
      done.push("menu: Webinars added under Resources");
    }
  }

  /* ---- the link from the home strip ---- */
  const home = await db.page.findUnique({ where: { slug: "home" } });
  if (home) {
    const hb = home.blocks as Record<string, unknown>[];
    const at = hb.findIndex((b) => b.type === "webinar");
    if (at >= 0 && hb[at].moreHref !== `/${SLUG}`) {
      hb[at] = { ...hb[at], moreHref: `/${SLUG}`, moreLabel: "See all webinars" };
      await db.page.update({ where: { slug: "home" }, data: { blocks: hb as unknown as object[] } });
      done.push("home: the strip now links to the page");
    }
  }

  console.log(done.length ? done.join("\n") : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
