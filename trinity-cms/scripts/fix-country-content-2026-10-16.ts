/* Content defects the destination-page audit found.

     DATABASE_URL="<url>" npx tsx scripts/fix-country-content-2026-10-16.ts

   Every change here removes something wrong or restores something the brief already said. Where a
   figure is only suspicious rather than provably wrong — Dubai's living cost reads like a monthly
   number against a yearly label — it is left alone and raised with the client instead of guessed at.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

type Row = { label: string; value: string };
type Stat = { l: string; v: string };

async function main() {
  const done: string[] = [];

  /* New Zealand's `hero` held a 166-character sentence, so the <h1> ran to five lines on desktop
     and pushed everything else below the fold on a phone. */
  const nz = await db.country.findUnique({ where: { slug: "new-zealand" } });
  if (nz && nz.hero.length > 60) {
    const sentence = nz.hero.trim();
    await db.country.update({
      where: { slug: "new-zealand" },
      data: {
        hero: "Study in New Zealand",
        intro: nz.intro.includes(sentence) ? nz.intro : `${sentence}\n\n${nz.intro}`,
      },
    });
    done.push("new-zealand: hero is a title again, its sentence moved into the intro");
  }

  /* France: two more tuition rows sat *after* "Total year one", contradicting the two tuition rows
     above them and taking the total's navy card with them. */
  const fr = await db.country.findUnique({ where: { slug: "france" } });
  if (fr) {
    const cost = fr.cost as Row[];
    const kept = cost.filter((r) => !/^tuition fee (bachelors|masters)$/i.test(r.label.trim()));
    if (kept.length !== cost.length) {
      await db.country.update({ where: { slug: "france" }, data: { cost: kept } });
      done.push(`france: dropped ${cost.length - kept.length} tuition rows appended after the total`);
    }
  }

  /* Singapore had euros in a Singapore-dollar table — those two figures are Ireland's, pasted into
     the wrong section of the brief. The health-insurance row goes rather than being converted at a
     rate nobody gave us; the tuition chip is restated from the table directly above it. The intakes
     chip said "3 to 4" where the page lists exactly three. */
  const sg = await db.country.findUnique({ where: { slug: "singapore" } });
  if (sg) {
    const cost = (sg.cost as Row[]).filter((r) => !r.value.includes("€"));
    const tuition = (sg.cost as Row[]).find((r) => /tuition/i.test(r.label))?.value ?? "";
    const stats = (sg.stats as Stat[]).map((s) => {
      if (s.v === "3 to 4") return { ...s, v: "3" };
      if (s.v.includes("€") && /tuition/i.test(s.l) && tuition) return { ...s, v: "SGD 16k–30k" };
      return s;
    });
    if (cost.length !== (sg.cost as Row[]).length || JSON.stringify(stats) !== JSON.stringify(sg.stats)) {
      await db.country.update({ where: { slug: "singapore" }, data: { cost, stats } });
      done.push("singapore: euro figures out of the SGD table, intakes chip now says 3");
    }
  }

  /* "a 18 months Graduate Route work visa" */
  const uk = await db.country.findUnique({ where: { slug: "uk" } });
  if (uk?.intro.includes("a 18 months Graduate Route")) {
    await db.country.update({
      where: { slug: "uk" },
      data: { intro: uk.intro.replace("a 18 months Graduate Route", "an 18-month Graduate Route") },
    });
    done.push("uk: grammar in the intro");
  }

  /* z3.jpg is Teviot Row House in Edinburgh — a building any UK-bound student recognises, and it
     was the hero photograph for both New Zealand and Singapore. Ten photographs cover thirteen
     countries, so some repetition is unavoidable; a named landmark on the wrong continent is not.
     These two get the unbranded campus shot until the client sends real photographs. */
  for (const slug of ["new-zealand", "singapore"]) {
    const row = await db.country.findUnique({ where: { slug } });
    if (row?.img.endsWith("/z3.jpg")) {
      await db.country.update({ where: { slug }, data: { img: "/assets/img/campus/private.webp" } });
      done.push(`${slug}: hero is no longer a photograph of Edinburgh`);
    }
  }

  console.log(done.length ? done.join("\n") : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
