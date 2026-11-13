/* About Us page: removes the "Stories of Success" testimonials block and adds the videos block (founder, the middle
   client video) right after the intro (the testimonials and the first/last videos move to the home page — see src/app/(site)/page.tsx).

     DATABASE_URL="<url>" npx tsx scripts/about-swap-testimonials-for-video.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/about-swap-testimonials-for-video.ts --apply    # write

   The videos block text comes from src/lib/seed-content.ts (aboutVideos). The old blocks are saved to
   scripts/backups/ first. Idempotent. A direct database write never reaches `revalidateSite()`, so
   redeploy (or save any page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { aboutVideos } from "../src/lib/seed-content";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;

async function main() {
  const page = await db.page.findUnique({ where: { slug: "about-us" } });
  if (!page) throw new Error("about-us page not found");
  const blocks = page.blocks as unknown as Block[];
  const testi = blocks.filter((b) => b.type === "testimonials").length;
  const want = aboutVideos as unknown as Block;
  /* Drop the testimonials and any older videos block. If Mission & Vision and the Business Segments are still one `segments`
     block, split it in two (heading + pillars / logos + button) so the Founder's video can sit between them. */
  let rest = blocks.filter((b) => b.type !== "testimonials" && b.type !== "videos");
  const both = rest.findIndex((b) => b.type === "segments" && Array.isArray(b.pillars) && b.pillars.length && Array.isArray(b.logos) && b.logos.length);
  if (both >= 0) {
    const s = rest[both];
    const mv = { ...s, logosTitle: "", logos: [], ctaLabel: "", ctaHref: "" };
    const bs = { ...s, kicker: "", title: "", lead: "", pillars: [] };
    rest = [...rest.slice(0, both), mv, bs, ...rest.slice(both + 1)];
  }
  /* The video goes right after the block that holds the Mission & Vision pillars; if there is none, after the intro ("about"). */
  const mvAt = rest.findIndex((b) => b.type === "segments" && Array.isArray(b.pillars) && b.pillars.length);
  const at = (mvAt >= 0 ? mvAt : Math.max(0, rest.findIndex((b) => b.type === "about"))) + 1;
  const next = [...rest.slice(0, at), want, ...rest.slice(at)];
  /* Postgres JSONB does not keep key order, so compare with keys sorted. */
  const stable = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));
  if (stable(next) === stable(blocks)) { console.log("about-us: already up to date — nothing to do"); return; }
  console.log(`about-us: removing ${testi} testimonials block(s); Founder video block goes to position ${at + 1} (${blocks.length} -> ${next.length} blocks)`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/about-swap-testimonials-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  await db.page.update({ where: { slug: "about-us" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
