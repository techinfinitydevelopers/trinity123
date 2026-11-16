/* The footer's "Powered by" credit. It is a stored setting, so a database that has not been touched since
   October still says "Itarsia India Limited" while production says "Techinfinity" — that mismatch is what
   this fixes. The code default in src/lib/settings.ts is updated too, so a fresh seed starts correct.

     DATABASE_URL="<url>" npx tsx scripts/set-powered-by.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/set-powered-by.ts --apply    # write

   The old value is saved to scripts/backups/ first. Idempotent. Settings are cached by the site: redeploy
   (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const TEXT = "Techinfinity";
const URL = "https://www.techinfinity.io/";
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "footer" } });
  if (!row) { console.log("no footer setting saved: the code default is in use — nothing to do"); return; }
  const v = row.value as Record<string, unknown>;
  console.log(`currently: ${JSON.stringify(v.poweredByText)} -> ${JSON.stringify(v.poweredByUrl)}`);
  if (v.poweredByText === TEXT && v.poweredByUrl === URL) { console.log("already correct — nothing to do"); return; }
  console.log(`will set:  ${JSON.stringify(TEXT)} -> ${JSON.stringify(URL)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/powered-by-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  await db.setting.update({ where: { key: "footer" }, data: { value: { ...v, poweredByText: TEXT, poweredByUrl: URL } as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
