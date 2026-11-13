/* Takes one social icon off the header, footer and contact rail without losing its link, by setting
   `hidden` on that entry in the stored `contact` setting. Clearing the link hides the icon too, but
   then the address has to be found and retyped to bring it back; this way only the flag flips.

     DATABASE_URL="<url>" npx tsx scripts/hide-social-link.ts twitter            # dry run
     DATABASE_URL="<url>" npx tsx scripts/hide-social-link.ts twitter --apply    # write
     DATABASE_URL="<url>" npx tsx scripts/hide-social-link.ts twitter --show --apply   # put it back

   The argument matches against the entry's label, icon class and link, case-insensitively, so
   "twitter", "x.com" and "fa-twitter" all find the same row. Refuses to guess when more than one
   entry matches. The old value is saved to scripts/backups/ first. Idempotent. Settings are cached
   by the site: redeploy (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const show = args.includes("--show");
const needle = args.find((a) => !a.startsWith("--"))?.toLowerCase();
const db = new PrismaClient();

type Social = { label: string; icon: string; href: string; hidden?: boolean };

async function main() {
  if (!needle) {
    console.log('which icon? e.g. npx tsx scripts/hide-social-link.ts twitter');
    process.exitCode = 1;
    return;
  }
  const row = await db.setting.findUnique({ where: { key: "contact" } });
  if (!row) { console.log("no contact setting saved: the code default is in use — edit settings.ts instead"); return; }

  const v = row.value as Record<string, unknown>;
  const links = (v.socialLinks ?? []) as Social[];
  if (!links.length) { console.log("the contact setting has no socialLinks — nothing to do"); return; }

  const hits = links
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => `${s.label} ${s.icon} ${s.href}`.toLowerCase().includes(needle));

  if (!hits.length) {
    console.log(`no social link matches ${JSON.stringify(needle)}. Present: ${links.map((s) => s.label).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  if (hits.length > 1) {
    console.log(`${JSON.stringify(needle)} matches more than one entry — be more specific: ${hits.map((h) => h.s.label).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const { s, i } = hits[0];
  const want = !show;
  console.log(`${s.label} (${s.href}) — hidden is currently ${!!s.hidden}`);
  if (!!s.hidden === want) { console.log("already as asked — nothing to do"); return; }
  console.log(`-> will set hidden: ${want}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }

  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/social-${needle.replace(/\W+/g, "-")}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  const next = links.map((x, k) => (k === i ? { ...x, hidden: want } : x));
  await db.setting.update({ where: { key: "contact" }, data: { value: { ...v, socialLinks: next } as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
