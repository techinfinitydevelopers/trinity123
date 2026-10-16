/* The enquiry forms list the destinations a student can pick. That list was written out by hand
   when there were eleven countries, so Dubai and Singapore — added later — could not be chosen on
   the very forms that exist to capture the enquiry.

     DATABASE_URL="<url>" npx tsx scripts/sync-form-destinations-2026-10-16.ts

   It is rebuilt from the destinations table, in the same order the site shows them, with the
   owner's own trailing options (anything not a country, such as "Not decided yet") kept at the
   end. Run it again whenever a destination is added or retired.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

async function main() {
  const countries = (await db.country.findMany({
    where: { isActive: true }, orderBy: { order: "asc" }, select: { name: true },
  })).map((c) => c.name);
  const known = new Set(countries);

  const pages = await db.page.findMany();
  const done: string[] = [];

  for (const page of pages) {
    const blocks = page.blocks as Record<string, unknown>[];
    let touched = false;

    blocks.forEach((block, i) => {
      /* A form is either the block itself or the `form` a hero carries. */
      for (const [where, holder] of [["", block], [".form", block.form]] as [string, unknown][]) {
        const f = holder as Record<string, unknown> | undefined;
        if (!f || !Array.isArray(f.destinations)) continue;
        const old = f.destinations as string[];
        /* Whatever the owner put at the end that is not a country — "Not decided yet" and the
           like — stays at the end. */
        const extras = old.filter((d) => !known.has(d));
        const next = [...countries, ...extras];
        if (JSON.stringify(next) === JSON.stringify(old)) continue;
        f.destinations = next;
        touched = true;
        done.push(`${page.slug} ${block.type}${where}: +${next.length - old.length}`);
      }
    });

    if (touched) await db.page.update({ where: { slug: page.slug }, data: { blocks: blocks as unknown as object[] } });
  }

  console.log(done.length ? done.join("\n") : "nothing to change");
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
