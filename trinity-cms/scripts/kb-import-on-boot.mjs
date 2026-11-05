/* Runs the chatbot knowledge-base importer during a deploy, when asked to.
 *
 * Why this exists: the admin's Bulk Upload cannot carry everything an entry needs. Its row type
 * has no `relatedQuestions` field at all, and the client's workbook has no usable headers, so
 * the column sniffer gives up on keywords and category too. A knowledge base loaded that way
 * answers a question asked word for word and little else — on 5 Nov 2026 production had 212
 * entries against the file's 283, all but six filed under "General", none of them carrying the
 * alternate phrasings that make a paraphrase match.
 *
 * `scripts/import-chatbot-kb.ts` carries all of it, but it needs DATABASE_URL, which only the
 * deploy has. So the deploy runs it — but only when told to, because the importer's --overwrite
 * would otherwise rewrite every answer on every restart and throw away counsellors' edits.
 *
 *   KB_IMPORT=add        create the entries the file has and the database doesn't; touch nothing else
 *   KB_IMPORT=overwrite  also push the file's answers, keywords, categories and phrasings onto
 *                        entries that already exist
 *   unset                do nothing (the normal state — set it, deploy, then unset it again)
 *
 * Never fails the boot. A knowledge base that did not import is a chatbot with yesterday's
 * answers; a start command that exits non-zero is a website that is down.
 */
import { spawnSync } from "node:child_process";

const mode = (process.env.KB_IMPORT ?? "").trim().toLowerCase();
if (!mode) process.exit(0);

if (mode !== "add" && mode !== "overwrite") {
  console.error(`[kb-import] KB_IMPORT="${mode}" is not "add" or "overwrite" — skipping.`);
  process.exit(0);
}

console.log(`[kb-import] KB_IMPORT=${mode} — importing the knowledge base.`);
const args = ["tsx", "scripts/import-chatbot-kb.ts", ...(mode === "overwrite" ? ["--overwrite"] : [])];
const run = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });

if (run.status !== 0) console.error(`[kb-import] importer exited ${run.status} — starting the site anyway.`);
else console.log("[kb-import] done. Unset KB_IMPORT so the next restart does not repeat it.");
process.exit(0);
