/* Sections 7 and 8 of the client's brief — the Knowledge Hub and Our Vision to their Journey.

     DATABASE_URL="<url>" npx tsx scripts/apply-sections-7-8-2026-10-15.ts

   The webinar block goes after the courses section, the vision block after the testimonials.
   Both carry empty lists: the client is sending the webinar dates, the snippets and two of the
   three videos. Re-running refreshes the copy but keeps anything the owner has added since.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { webinar, vision } from "../src/lib/seed-content";

const db = new PrismaClient();

/* Where each block belongs if it is not on the page yet: after this block type, else at the end. */
const PLACE = [
  { block: webinar as Record<string, unknown>, after: "courses" },
  { block: vision as Record<string, unknown>, after: "testimonials" },
];

async function main() {
  const page = await db.page.findUnique({ where: { slug: "home" } });
  if (!page) throw new Error("No home page in this database.");
  const blocks = page.blocks as Record<string, unknown>[];
  const done: string[] = [];

  for (const { block, after } of PLACE) {
    const at = blocks.findIndex((b) => b.type === block.type);
    if (at >= 0) {
      const was = blocks[at];
      /* Keep whatever the owner has filled in; refresh only the wording around it. */
      blocks[at] = { ...block, ...pick(was, ["current", "past", "videos"]) };
      done.push(`${block.type} refreshed`);
    } else {
      const i = blocks.findIndex((b) => b.type === after);
      blocks.splice(i >= 0 ? i + 1 : blocks.length, 0, block);
      done.push(`${block.type} added`);
    }
  }

  await db.page.update({ where: { slug: "home" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`home: ${done.join(", ")}`);
  await db.$disconnect();
}

/* Copies across only the keys that hold content someone may have entered, and only when they
   actually hold something. */
function pick(from: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = from[k];
    if (Array.isArray(v) && v.length) out[k] = v;
  }
  return out;
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
