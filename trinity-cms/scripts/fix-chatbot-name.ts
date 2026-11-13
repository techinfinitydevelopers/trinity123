/* The chat launcher read "Chat with Hi, I am Tisa": the assistant's name setting (chatbot.name) had been saved as a
   greeting. The name is used verbatim in "Chat with {name}", the panel title and the aria labels, so it must be just the
   name. Sets chatbot.name to "Tisa" (the client wants "Chat with Tisa").

     DATABASE_URL="<url>" npx tsx scripts/fix-chatbot-name.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-chatbot-name.ts --apply    # write

   Only touches `name`; the rest of the chatbot setting is kept. The old value is saved to scripts/backups/ first.
   Idempotent. Settings are cached by the site: redeploy (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const WANT = "Tisa";
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "chatbot" } });
  if (!row) { console.log("no chatbot setting saved: the code default (TISA) is in use — nothing to do"); return; }
  const v = row.value as Record<string, unknown>;
  console.log(`chatbot.name is currently: ${JSON.stringify(v.name)}`);
  if (v.name === WANT) { console.log("already correct — nothing to do"); return; }
  console.log(`-> will set it to ${JSON.stringify(WANT)}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/chatbot-name-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  await db.setting.update({ where: { key: "chatbot" }, data: { value: { ...v, name: WANT } as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
