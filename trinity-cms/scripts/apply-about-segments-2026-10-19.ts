/* About Us, from the client's brief: their own wording, the mission and vision statements, the
   sister-company logos, and the photographs they sent of a counsellor with a family.

     DATABASE_URL="<url>" npx tsx scripts/apply-about-segments-2026-10-19.ts

   The brief also asks for "Trusted advisors" rather than "consultants", and for the picture
   beside the story to show a student with a counsellor rather than a building.

   Re-running refreshes the wording and the logo list. Idempotent. A direct database write never
   reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

/* The client's own two paragraphs, kept as they wrote them. The block renders `paragraphs` as
   one <p> each, so they stay separate entries rather than one string with a blank line in it —
   that was being run together into a single 600-character block. */
const STORY = [
  "Trinity Study Abroad is the overseas education division of Trinity Air Travel & Tours Pvt. Ltd., a travel group established in 1982. We help students and families make informed international education decisions with clear guidance at every stage.",
  "We believe there is no single “best” country, university or course for every student. We look beyond rankings and popular destinations to help students identify options that balance quality. The right direction depends on academic background, interests, financial comfort, career goals, and long-term plans. Our role is to understand the student first and then build a pathway around that individual profile.",
];

const segments = {
  type: "segments",
  kicker: "What we stand for",
  title: "Our Mission & [Vision]",
  lead: "",
  pillars: [
    {
      icon: "fas fa-compass",
      title: "Our Mission",
      text: "To make international education simpler, more informed, and more accessible through personalized guidance.",
    },
    {
      icon: "fas fa-eye",
      title: "Our Vision",
      text: "To be a trusted global education partner for students and families.",
    },
  ],
  logosTitle: "Our Business Segments",
  /* Trinity Car Rental has no website in the brief, so its card is shown without a link rather
     than pointed at a guess. */
  logos: [
    { name: "Trinity Air Travel and Tours Pvt. Ltd.", img: "/assets/img/sister/air.webp", href: "https://www.trinityairtravelandtours.com" },
    { name: "Trinity World Holidays", img: "/assets/img/sister/holidays.webp", href: "https://www.trinityworldholidays.com" },
    { name: "Trinity Car Rental", img: "/assets/img/sister/car.webp", href: "" },
  ],
  ctaLabel: "Talk to a trusted advisor",
  ctaHref: "/contact-us",
};

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("No about-us page in this database.");
  const blocks = page.blocks as Record<string, unknown>[];
  const done: string[] = [];

  /* ---- the story block: their words, their photograph ---- */
  const at = blocks.findIndex((b) => b.type === "about");
  if (at >= 0) {
    const was = blocks[at];
    delete was.text;
    blocks[at] = {
      ...was,
      /* The mission and vision used to be two more paragraphs tacked on here. They have a
         section of their own now, so they are not said twice. */
      paragraphs: STORY,
      /* "Picture on left should depict a student and counsellor" — it was a photograph of a
         building in Edinburgh. */
      mainImg: "/assets/img/about/counsel-1.webp",
      mainAlt: "A Trinity advisor with a student and her parents",
      /* The gold caption on that photograph still read "Our Founder / Mr Baby John / Industry
         veteran & visionary" — written for the founder's portrait, which this replaced. It was
         putting a real person's name on a photograph of somebody else. The caption describes
         what is actually in the picture. The founder's credit needs a place of its own; say
         where and it goes back. */
      capSmall: "In our office",
      capStrong: "Guidance, one family at a time",
      capSpan: "Mumbai · Kalina, Santacruz (E)",
      sideImg: "/assets/img/about/counsel-2.webp",
      sideAlt: "A family going through university brochures with their advisor",
    };
    done.push("about: the client's own wording, and counsellor photographs instead of a building");
  }

  /* ---- mission, vision and the group, after the story ---- */
  const segAt = blocks.findIndex((b) => b.type === "segments");
  if (segAt >= 0) {
    blocks[segAt] = segments;
    done.push("segments refreshed");
  } else {
    blocks.splice(at >= 0 ? at + 1 : blocks.length, 0, segments);
    done.push("segments added");
  }

  /* ---- "Trusted advisors", not "consultants" ----
     The brief asks for this wording, and the phrase is not only on this page: the home page's
     story chip reads "Trusted Consultants". So the rename runs over every page. */
  let renamed = 0;
  const rename = (v: unknown): unknown => {
    if (typeof v === "string") {
      const next = v
        .replace(/\bConsultants\b/g, "Trusted Advisors")
        .replace(/\bconsultants\b/g, "trusted advisors")
        .replace(/\bConsultant\b/g, "Trusted Advisor")
        .replace(/\bconsultant\b/g, "trusted advisor");
      if (next !== v) renamed++;
      return next;
    }
    if (Array.isArray(v)) return v.map(rename);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, rename(x)]));
    }
    return v;
  };
  const renamedBlocks = rename(blocks) as Record<string, unknown>[];
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: renamedBlocks as unknown as object[] } });

  for (const other of await db.page.findMany({ where: { slug: { not: "about-us" } } })) {
    const before = renamed;
    const next = rename(other.blocks) as object[];
    if (renamed > before) {
      await db.page.update({ where: { slug: other.slug }, data: { blocks: next } });
      done.push(`${other.slug}: reworded`);
    }
  }
  if (renamed) done.push(`"consultant" reworded in ${renamed} place(s)`);
  console.log(done.length ? done.join("\n") : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
