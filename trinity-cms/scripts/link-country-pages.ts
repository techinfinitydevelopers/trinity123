/* Country-list blocks: points Japan, South Korea, the Netherlands and Malaysia at their destination pages instead of
   the home globe, now that those pages exist.

     DATABASE_URL="<url>" npx tsx scripts/link-country-pages.ts            # dry run — lists the links it would change
     DATABASE_URL="<url>" npx tsx scripts/link-country-pages.ts --apply    # write

   Looks at every page's `countries` blocks (the card grid on /why-study-abroad and wherever else one is used) and
   swaps only the `href` of an item that is still one of the old globe links; names, tags, order and any other edit made
   in /admin are left as they are. The old blocks are saved to scripts/backups/ first. Idempotent. A direct write
   never reaches `revalidateSite()`, so redeploy (or save the page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, any>;

const MAP: Record<string, string> = {
  "/#c=japan": "/destinations/japan",
  "/#c=korea": "/destinations/south-korea",
  "/#c=netherlands": "/destinations/netherlands",
  "/#c=malaysia": "/destinations/malaysia",
};

async function main() {
  const pages = await db.page.findMany({ select: { slug: true, blocks: true } });
  const changes: { slug: string; next: Block[]; n: number }[] = [];
  for (const p of pages) {
    const blocks = p.blocks as unknown as Block[];
    if (!Array.isArray(blocks)) continue;
    let n = 0;
    const next = blocks.map((b) => {
      if (b?.type !== "countries" || !Array.isArray(b.items)) return b;
      return { ...b, items: b.items.map((it: Block) => (MAP[it?.href] ? (n++, console.log(`  ${p.slug}: ${it.name}  ${it.href}  ->  ${MAP[it.href]}`), { ...it, href: MAP[it.href] }) : it)) };
    });
    if (n) changes.push({ slug: p.slug, next, n });
  }
  if (!changes.length) { console.log("no country-list block holds an old globe link — nothing to do"); return; }
  console.log(`${changes.reduce((a, c) => a + c.n, 0)} link(s) on ${changes.length} page(s)`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/country-links-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(Object.fromEntries(pages.filter((p) => changes.some((c) => c.slug === p.slug)).map((p) => [p.slug, p.blocks])), null, 2));
  for (const c of changes) await db.page.update({ where: { slug: c.slug }, data: { blocks: c.next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
