/* Writes the `visaList` field (the full-width "Australia visa requirements" checklist) of the "australia"
   country. The summary-card `visa` field is left alone. Idempotent; backs up the old value first.
     DATABASE_URL="<url>" npx tsx scripts/set-australia-visa-list.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/set-australia-visa-list.ts --apply    # write */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
const LIST = [
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
  const c = await db.country.findUnique({ where: { slug: "australia" }, select: { visaList: true } });
  if (!c) throw new Error("australia not found");
  if (c.visaList === LIST) { console.log("already up to date — nothing to do"); return; }
  console.log("old visaList:", JSON.stringify(c.visaList.slice(0, 120)));
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/australia-visalist-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ visaList: c.visaList }, null, 2));
  await db.country.update({ where: { slug: "australia" }, data: { visaList: LIST } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
