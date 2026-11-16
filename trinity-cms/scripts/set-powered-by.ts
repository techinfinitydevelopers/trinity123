/* Brings the footer's "Powered by" credit in a database into line with the code default in
   src/lib/settings.ts. The credit is a stored setting, so an old database keeps whatever was saved into it
   — which is how localhost ended up still crediting "Itarsia India Limited" after production had moved on.

   The default is empty at the client's request, so running this now REMOVES the line (the footer renders it
   only when the text is set). Put a name and a URL back in `settings.ts` and run it again to restore one.

     DATABASE_URL="<url>" npx tsx scripts/set-powered-by.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/set-powered-by.ts --apply    # write

   The old value is saved to scripts/backups/ first. Idempotent. Settings are cached by the site: redeploy
   (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { DEFAULTS } from "../src/lib/settings";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const { poweredByText: TEXT, poweredByUrl: URL } = DEFAULTS.footer;
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "footer" } });
  if (!row) { console.log("no footer setting saved: the code default is in use — nothing to do"); return; }
  const v = row.value as Record<string, unknown>;
  console.log(`currently: ${JSON.stringify(v.poweredByText)} -> ${JSON.stringify(v.poweredByUrl)}`);
  if (v.poweredByText === TEXT && v.poweredByUrl === URL) { console.log("already as the default — nothing to do"); return; }
  console.log(`will set:  ${JSON.stringify(TEXT)} -> ${JSON.stringify(URL)}${TEXT ? "" : "  (empty: the line is removed)"}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/powered-by-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  await db.setting.update({ where: { key: "footer" }, data: { value: { ...v, poweredByText: TEXT, poweredByUrl: URL } as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
