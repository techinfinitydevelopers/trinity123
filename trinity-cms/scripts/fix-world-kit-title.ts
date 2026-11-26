/* Client (26/11): the home page's "Document Checklist" heading must read "Visa Document Checklist".
   The heading is content: it lives in the `world` setting (`text.kitTitle`, Admin → Home page → "Your file — heading") and overrides the code default,
   which already says "Visa Document<br>Checklist". Sets it to the new heading when it still holds the old one. Idempotent; backs up first.

     DATABASE_URL="<url>" npx tsx scripts/fix-world-kit-title.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-world-kit-title.ts --apply    # write

   A direct DB write never reaches revalidateSite(): redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const WANT = "Visa Document<br>Checklist";
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "world" } });
  const value = row?.value as { text?: Record<string, string> } | undefined;
  if (!value) { console.log("no world setting — nothing to do"); return; }
  const cur = value.text?.kitTitle;
  console.log(`kitTitle is currently: ${JSON.stringify(cur)}`);
  if (cur === WANT) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/world-kit-title-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row!.value, null, 2));
  await db.setting.update({ where: { key: "world" }, data: { value: { ...value, text: { ...(value.text ?? {}), kitTitle: WANT } } as unknown as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
