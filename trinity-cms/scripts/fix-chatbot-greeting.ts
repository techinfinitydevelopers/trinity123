/* Client sheet (24/11): the chat's opening line must read "Hi, I am TISA – your Trinity Study Abroad Guide" instead of using
   the word "assistant". The saved greeting lives in the database (chatbot.greeting), so the code default alone does not change it.

     DATABASE_URL="<url>" npx tsx scripts/fix-chatbot-greeting.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-chatbot-greeting.ts --apply    # write

   Only touches `greeting`; the rest of the chatbot setting is kept and the old value is backed up to scripts/backups/ first.
   Idempotent. Settings are cached: redeploy (or save any setting in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const WANT = "Hi! 👋 I am TISA – your Trinity Study Abroad Guide. Share a few details and I'll help with countries, courses, visas, fees or intakes. Please ask your questions in English.";
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "chatbot" } });
  if (!row) { console.log("no chatbot setting saved: the code default is in use — nothing to do"); return; }
  const v = row.value as Record<string, unknown>;
  console.log(`chatbot.greeting is currently: ${JSON.stringify(v.greeting)}`);
  if (v.greeting === WANT) { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/chatbot-greeting-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row.value, null, 2));
  await db.setting.update({ where: { key: "chatbot" }, data: { value: { ...v, greeting: WANT } as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
