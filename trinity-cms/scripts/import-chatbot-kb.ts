/* Loads src/lib/chatbot-kb.ts (generated from the client's workbook) into KnowledgeItem.
 *
 *   npx tsx scripts/import-chatbot-kb.ts              # add what's missing, leave the rest alone
 *   npx tsx scripts/import-chatbot-kb.ts --overwrite  # also push answer/category/keywords changes
 *   npx tsx scripts/import-chatbot-kb.ts --dry-run    # report only
 *
 * Idempotent: questions are matched on a normalised form, so re-running after a workbook update
 * adds the new rows rather than duplicating the old ones. Without --overwrite an existing entry
 * is never touched, because by then a counsellor may have edited the answer in the admin and
 * their wording should win over the spreadsheet's.
 */
import { db } from "../src/lib/db";
import { chatbotKb } from "../src/lib/chatbot-kb";

const overwrite = process.argv.includes("--overwrite");
const dryRun = process.argv.includes("--dry-run");

/** Same normalisation the generator uses to merge duplicate rows, so "Do I need IELTS?" and
    "Do I need IELTS" are one entry rather than two. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();

async function main() {
  const existing = await db.knowledgeItem.findMany({
    select: { id: true, question: true, answer: true, category: true, keywords: true, followUp: true, relatedQuestions: true },
  });
  const byQuestion = new Map(existing.map((e) => [norm(e.question), e]));

  const toCreate: typeof chatbotKb = [];
  const toUpdate: { id: string; item: (typeof chatbotKb)[number] }[] = [];
  let unchanged = 0;

  for (const item of chatbotKb) {
    const match = byQuestion.get(norm(item.question));
    if (!match) {
      toCreate.push(item);
      continue;
    }
    if (!overwrite) {
      unchanged++;
      continue;
    }
    const same =
      match.answer === item.answer &&
      match.category === item.category &&
      match.keywords === item.keywords &&
      match.followUp === (item.followUp ?? "") &&
      match.relatedQuestions.join("\u0000") === (item.relatedQuestions ?? []).join("\u0000");
    if (same) unchanged++;
    else toUpdate.push({ id: match.id, item });
  }

  console.log(
    `${chatbotKb.length} in the workbook, ${existing.length} already in the database → ` +
      `create ${toCreate.length}, update ${toUpdate.length}, leave ${unchanged}`,
  );
  if (dryRun) {
    for (const c of toCreate.slice(0, 10)) console.log(`  + ${c.question}`);
    if (toCreate.length > 10) console.log(`  … and ${toCreate.length - 10} more`);
    return;
  }

  if (toCreate.length) {
    await db.knowledgeItem.createMany({
      data: toCreate.map((i) => ({
        question: i.question,
        answer: i.answer,
        followUp: i.followUp ?? "",
        relatedQuestions: i.relatedQuestions ?? [],
        category: i.category,
        keywords: i.keywords,
      })),
    });
  }
  for (const { id, item } of toUpdate) {
    await db.knowledgeItem.update({
      where: { id },
      data: {
        answer: item.answer,
        followUp: item.followUp ?? "",
        relatedQuestions: item.relatedQuestions ?? [],
        category: item.category,
        keywords: item.keywords,
      },
    });
  }

  const total = await db.knowledgeItem.count();
  console.log(`Done. The assistant now has ${total} entries.`);
  console.log("Open /admin/chatbot to review them — the cache clears on the next page load.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
