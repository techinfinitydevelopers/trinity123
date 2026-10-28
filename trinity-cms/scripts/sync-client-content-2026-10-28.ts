/* Brings the live database in line with the client's About and Services copy (28/10/2026).

     DATABASE_URL="<url>" npx tsx scripts/sync-client-content-2026-10-28.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/sync-client-content-2026-10-28.ts --apply    # write

   What it touches, and nothing else:
     - about-us   : the first "about" block's title and paragraphs
     - our-service: the page hero's sub + service chips, and the "services" block (all 13 cards)
     - setting nav: the "Services" item's dropdown children
     - setting chatbot: name -> "TISA", only while it is still the old "Trinity Assistant"
   The source of truth is src/lib/seed-content.ts and src/lib/settings.ts, so the live site gets
   exactly what localhost shows. Every other page, block, post and setting is left alone.

   Before writing it saves the old values to scripts/backups/ (JSON), so a bad run can be undone.
   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy (or save any
   page in /admin) afterwards to clear the cache. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { seedPages } from "../src/lib/seed-content";
import { DEFAULTS, type NavSettings } from "../src/lib/settings";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;
/* jsonb hands keys back in its own order, so compare with the keys sorted. */
const canon = (v: unknown): unknown => Array.isArray(v) ? v.map(canon) : v && typeof v === "object"
  ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([x], [y]) => x.localeCompare(y)).map(([k, x]) => [k, canon(x)])) : v;
const same = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

const seed = (slug: string) => {
  const p = seedPages.find((x) => x.slug === slug);
  if (!p) throw new Error(`seed has no page "${slug}"`);
  return p.blocks as unknown as Block[];
};

async function main() {
  const backup: Record<string, unknown> = {};
  const plan: string[] = [];
  const writes: (() => Promise<unknown>)[] = [];

  /* ---- About Us: intro heading + paragraphs only ---- */
  {
    const page = await db.page.findUnique({ where: { slug: "about-us" } });
    const want = seed("about-us").find((b) => b.type === "about");
    if (!page || !want) throw new Error("about-us page or seed block missing");
    const blocks = page.blocks as unknown as Block[];
    const at = blocks.findIndex((b) => b.type === "about");
    if (at < 0) throw new Error("about-us has no about block");
    if (same(blocks[at].paragraphs, want.paragraphs) && blocks[at].title === want.title) plan.push("about-us: already up to date");
    else {
      backup["about-us"] = structuredClone(page.blocks);
      blocks[at] = { ...blocks[at], title: want.title, paragraphs: want.paragraphs };
      plan.push(`about-us: update about block (title + ${(want.paragraphs as string[]).length} paragraphs)`);
      writes.push(() => db.page.update({ where: { slug: "about-us" }, data: { blocks: blocks as unknown as object[] } }));
    }
  }

  /* ---- Services page: hero sub/chips + the services block; the CTA is untouched ---- */
  {
    const page = await db.page.findUnique({ where: { slug: "our-service" } });
    const wantBlocks = seed("our-service");
    const wantHero = wantBlocks.find((b) => b.type === "pageHero");
    const wantSvc = wantBlocks.find((b) => b.type === "services");
    if (!page || !wantHero || !wantSvc) throw new Error("our-service page or seed blocks missing");
    const blocks = page.blocks as unknown as Block[];
    const h = blocks.findIndex((b) => b.type === "pageHero");
    const s = blocks.findIndex((b) => b.type === "services");
    if (h < 0 || s < 0) throw new Error("our-service is missing its hero or services block");
    const next = { hero: { ...blocks[h], sub: wantHero.sub, aside: wantHero.aside }, svc: { ...blocks[s], ...wantSvc } };
    if (same(blocks[h], next.hero) && same(blocks[s], next.svc)) plan.push("our-service: already up to date");
    else {
      backup["our-service"] = structuredClone(page.blocks);
      const was = blocksOld(page.blocks, s).length;
      blocks[h] = next.hero; blocks[s] = next.svc;
      plan.push(`our-service: hero + services block -> ${(wantSvc.items as unknown[]).length} cards (was ${was})`);
      writes.push(() => db.page.update({ where: { slug: "our-service" }, data: { blocks: blocks as unknown as object[] } }));
    }
  }

  /* ---- Nav: the Services dropdown ---- */
  {
    const row = await db.setting.findUnique({ where: { key: "nav" } });
    const wantItem = (DEFAULTS.nav as NavSettings).items.find((i) => i.label === "Services");
    if (!wantItem?.children) throw new Error("DEFAULTS.nav has no Services children");
    if (!row) plan.push("nav: no saved nav (site uses defaults, which already include the dropdown)");
    else {
      const nav = row.value as unknown as NavSettings;
      const at = nav.items.findIndex((i) => i.label === "Services");
      if (at < 0) plan.push("nav: no 'Services' item in the saved nav — skipped, add it in Settings");
      else if (same(nav.items[at].children, wantItem.children)) plan.push("nav: already up to date");
      else {
        backup.nav = structuredClone(row.value);
        nav.items[at] = { ...nav.items[at], children: wantItem.children };
        plan.push(`nav: Services dropdown -> ${wantItem.children.length} links`);
        writes.push(() => db.setting.update({ where: { key: "nav" }, data: { value: nav as unknown as object } }));
      }
    }
  }

  /* ---- Chatbot name ---- */
  {
    const row = await db.setting.findUnique({ where: { key: "chatbot" } });
    if (!row) plan.push("chatbot: no saved settings (defaults already say TISA)");
    else {
      const bot = row.value as Record<string, unknown>;
      if (bot.name === "Trinity Assistant") {
        backup.chatbot = structuredClone(row.value);
        const next = { ...bot, name: "TISA" };
        plan.push('chatbot: name "Trinity Assistant" -> "TISA"');
        writes.push(() => db.setting.update({ where: { key: "chatbot" }, data: { value: next as unknown as object } }));
      } else plan.push(`chatbot: name is "${String(bot.name)}" — left alone`);
    }
  }

  console.log(plan.map((l) => "  " + l).join("\n"));
  if (!apply) { console.log("\nDry run — nothing written. Re-run with --apply."); return; }
  if (!writes.length) { console.log("\nNothing to write."); return; }

  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/before-client-content-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nBackup saved: ${file}`);
  for (const w of writes) await w();
  console.log("Done. Redeploy (or save a page in /admin) to clear the cache.");
}

/* the services block as it was, for the "was N" count in the plan */
function blocksOld(raw: unknown, i: number): unknown[] {
  const b = (raw as Block[])[i];
  return Array.isArray(b?.items) ? (b.items as unknown[]) : [];
}

main().then(() => db.$disconnect()).then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
