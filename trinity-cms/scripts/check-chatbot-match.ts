/* Does the assistant still find the right answer?
 *
 *   npx tsx scripts/check-chatbot-match.ts
 *
 * Runs the fast (keyword) matcher over the generated knowledge base — no database and no API
 * key — with questions phrased the way a student would type them rather than the way the
 * workbook writes them. It is a check on the knowledge base, not on the chat route: the semantic
 * pass that catches what this misses needs ANTHROPIC_API_KEY and a live conversation.
 *
 * Re-run it after editing the workbook, the category rules or the scoring weights. A question
 * that drops to LOW is not a failure on its own — it just means that one now depends on the
 * semantic pass. A MISS is: the fast pass answered confidently with the wrong entry.
 */
import { keywordMatch, shortlist, type MatchCandidate } from "../src/lib/chat-match";
import { chatbotKb } from "../src/lib/chatbot-kb";

/* Matches the default in src/lib/settings.ts; the admin can change it per site. */
const THRESHOLD = 0.55;
/* Same gate matchKnowledgeBase applies: a score only counts when the runner-up is clearly
   behind, so the numbers below are what the live bot would actually do. */
const DECISIVE = 0.08;

const corpus: MatchCandidate[] = chatbotKb.map((i, n) => ({
  id: String(n),
  question: i.question,
  answer: i.answer,
  followUp: i.followUp ?? "",
  related: (i.relatedQuestions ?? []).join(" "),
  relatedList: i.relatedQuestions ?? [],
  keywords: i.keywords,
  category: i.category,
}));

/** Each case is a student's phrasing and a pattern the matched question must satisfy. */
const cases: [string, RegExp][] = [
  ["Can I study abroad after 12th?", /after 12th/i],
  ["how much money do i need to study abroad", /cost to study|does it cost/i],
  ["do i need ielts", /ielts/i],
  ["what documents do i need for a student visa", /document/i],
  ["can i work part time while studying", /work/i],
  ["what are the intakes for Canada", /canada/i],
  ["how many universities are in the USA", /usa/i],
  ["is there any scholarship for me", /scholarship/i],
  ["my percentage is low can i still go", /low|percentage|score|marks/i],
  ["what is the stay back in Ireland", /ireland/i],
  ["which country is cheapest", /cheap|afford/i],
  ["can you help with my SOP", /sop/i],
];

let resolved = 0;
let wrong = 0;
for (const [q, want] of cases) {
  const m = keywordMatch(q, corpus);
  const confident = Boolean(m && m.score >= THRESHOLD && (m.score >= 0.95 || m.score - m.runnerUp >= DECISIVE));
  const right = confident && want.test(m!.candidate.question);
  if (right) resolved++;
  else if (confident) wrong++;
  const tag = right ? "OK  " : confident ? "MISS" : "LOW ";
  console.log(`${tag} ${m ? m.score.toFixed(2) : "----"}  "${q}"\n          → ${m?.candidate.question ?? "(none)"}  [${m?.candidate.category ?? "-"}]`);
}

console.log(`\n${resolved}/${cases.length} answered by the fast pass, ${wrong} answered wrongly, ${cases.length - resolved - wrong} left to the semantic pass.`);

const sizes = cases.map(([q]) => shortlist(q, corpus).length);
console.log(`Shortlist sent to Claude: ${Math.min(...sizes)}–${Math.max(...sizes)} of ${corpus.length} entries.`);

/* Nothing off-topic may come back as a confident match — the unmatched flow has to take over. */
let falseMatches = 0;
for (const junk of ["asdf qwer zxcv", "what is the weather in mumbai today", "pizza delivery near me"]) {
  const m = keywordMatch(junk, corpus);
  if (m && m.score >= THRESHOLD && (m.score >= 0.95 || m.score - m.runnerUp >= DECISIVE)) {
    falseMatches++;
    console.log(`FALSE MATCH  ${m.score.toFixed(2)}  "${junk}" → ${m.candidate.question}`);
  }
}
console.log(falseMatches ? `${falseMatches} off-topic question(s) matched — raise matchThreshold.` : "No off-topic question matched.");

if (wrong || falseMatches) process.exitCode = 1;
