/* Client (25/11): Australia's Visa text — the intro line plus the eight key requirements, one per line — so the country page shows it as a checklist section.
   Writes the `visa` field of the "australia" country. Idempotent; backs up the old text first.

     DATABASE_URL="<url>" npx tsx scripts/update-australia-visa.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/update-australia-visa.ts --apply    # write

   A direct DB write never reaches revalidateSite(): redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
const VISA = [
  "International students generally apply for the Student visa (subclass 500). Key requirements include:",
  "Confirmation of Enrolment (CoE) from an eligible institution",
  "Evidence of financial capacity",
  "ITRs of sponsors",
  "English-language requirements, where applicable",
  "Overseas Student Health Cover (OSHC)",
  "Genuine Student assessment requirement",
  "Health and character assessments",
  "Valid passport and supporting documentation",
].join("\n");

async function main() {
  const c = await db.country.findUnique({ where: { slug: "australia" }, select: { visa: true } });
  if (!c) throw new Error("australia not found");
  if (c.visa === VISA) { console.log("already up to date — nothing to do"); return; }
  console.log("old visa text:", JSON.stringify(c.visa.slice(0, 120)));
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/australia-visa-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ visa: c.visa }, null, 2));
  await db.country.update({ where: { slug: "australia" }, data: { visa: VISA } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
