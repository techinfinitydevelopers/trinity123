/* Home page webinar slider -> editable in /admin (Pages > Home > "Knowledge Hub").

     DATABASE_URL="<url>" npx tsx scripts/add-home-webinars.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/add-home-webinars.ts --apply    # write
     DATABASE_URL="<url>" npx tsx scripts/add-home-webinars.ts --replace --apply   # also overwrite a slider that is already there

   The slider on the Trinity-World home page is drawn from the `webinar` block of the stored "home" page. This puts the seeded schedule
   (`homeWebinars` in src/lib/seed-content.ts: six webinars with dates, posters and links) into that block and marks it `layout: "carousel"`.
   Fields the owner may already have set on the block that the slider does not own (`past`, `moreHref`...) are kept.
   - A block that is already a slider with webinars in it is left alone (so edits made in /admin survive) unless `--replace` is given.
   - A page with no webinar block gets one, inserted before the first `videos`/`testimonials` block, else appended.
   The old blocks are saved to scripts/backups/ first. A direct database write never reaches `revalidateSite()`, so redeploy (or save the
   page once in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { homeWebinars } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const replace = process.argv.includes("--replace");
const db = new PrismaClient();
type Block = Record<string, unknown>;
const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("home page not found");
  const blocks = page.blocks as unknown as Block[];
  const at = blocks.findIndex((b) => b.type === "webinar");
  const seed = homeWebinars as unknown as Block;

  let next: Block[];
  if (at >= 0) {
    const cur = blocks[at];
    const already = cur.layout === "carousel" && Array.isArray(cur.current) && cur.current.length > 0;
    if (already && !replace) { console.log("home: the webinar slider is already set up — nothing to do (use --replace to overwrite it)"); return; }
    const merged = { ...cur, ...seed, past: cur.past ?? seed.past };
    next = blocks.map((b, i) => (i === at ? merged : b));
    console.log(`home: converting the "${cur.title}" block (${(cur.current as unknown[] | undefined)?.length ?? 0} webinars now) into the slider with ${(seed.current as unknown[]).length} webinars`);
  } else {
    const before = blocks.findIndex((b) => b.type === "videos" || b.type === "testimonials");
    const pos = before >= 0 ? before : blocks.length;
    next = [...blocks.slice(0, pos), seed, ...blocks.slice(pos)];
    console.log(`home: no webinar block — adding the slider at position ${pos}`);
  }
  if (stable(next) === stable(blocks)) { console.log("nothing changes"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/home-webinars-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "home" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
