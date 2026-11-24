/* Client sheet (24/11), footer "Get in touch": the address now reads "301, 3rd Floor, Kumar Plaza, Kalina Kurla Road, Above HDFC Bank, Kalina,
   Santacruz East, Mumbai – 400029", the numbers are spaced "+91-22-69-655-855" / "+91-84-5304-5304", and the contact-page map is pinned to the
   Trinity Study Abroad Google Business listing (cid) so it cannot show Trinity Air Travel. These live in the database (contact setting).

     DATABASE_URL="<url>" npx tsx scripts/fix-contact-details.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-contact-details.ts --apply    # write

   Only address, landline, phones[0] and mapEmbed are touched; the other phones, email, hours and socials are kept. The old value is backed up to
   scripts/backups/ first. Idempotent. Settings are cached: redeploy (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const ADDRESS = "301, 3rd Floor, Kumar Plaza, Kalina Kurla Road, Above HDFC Bank, Kalina, Santacruz East, Mumbai – 400029";
const LANDLINE = "+91-22-69-655-855";
const MOBILE = "+91-84-5304-5304";
const MAP = "https://www.google.com/maps?cid=5400192786684215025&output=embed";
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "contact" } });
  if (!row) { console.log("no contact setting saved: the code defaults are in use — nothing to do"); return; }
  const v = row.value as Record<string, unknown>;
  const phones = Array.isArray(v.phones) ? [...(v.phones as string[])] : [];
  phones[0] = MOBILE;
  const next = { ...v, address: ADDRESS, landline: LANDLINE, phones, mapEmbed: MAP };
  console.log("address :", JSON.stringify(v.address), "->", JSON.stringify(ADDRESS));
  console.log("landline:", JSON.stringify(v.landline), "->", JSON.stringify(LANDLINE));
  console.log("phone[0]:", JSON.stringify((v.phones as string[] | undefined)?.[0]), "->", JSON.stringify(MOBILE));
  console.log("mapEmbed:", JSON.stringify(v.mapEmbed), "->", JSON.stringify(MAP));
  if (JSON.stringify(next) === JSON.stringify(v)) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/contact-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  await db.setting.update({ where: { key: "contact" }, data: { value: next as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
