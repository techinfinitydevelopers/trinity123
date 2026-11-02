/* Two-level FAQ matcher for the student chatbot.
   Level 1 (always available, free): keyword/substring overlap against the knowledge base.
   Level 2 (needs ANTHROPIC_API_KEY): one cheap Claude Haiku classification call that picks the
   best-matching FAQ by meaning + recent conversation context. Below `threshold`, callers must
   treat the question as unanswered — this module never guesses. */
import { unstable_cache } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

export type MatchCandidate = {
  id: string;
  question: string;
  answer: string;
  /** Asked back after the answer, where the client's sheet supplies one. */
  followUp: string;
  /** Alternate phrasings, scored with the question rather than with the answer. `related` is
      the joined form the scorers search; `relatedList` keeps them separable for exact hits. */
  related: string;
  relatedList: string[];
  keywords: string;
  category: string;
};

/** The full matchable corpus: admin-curated FAQs + each destination's own admin-authored FAQ
    entries (already used by the old prompt-stuffed bot) — so existing country content still
    answers questions without being retyped into the knowledge base. */
export const getMatchCorpus = unstable_cache(
  async (): Promise<MatchCandidate[]> => {
    const [items, countries] = await Promise.all([
      db.knowledgeItem.findMany({
        where: { isActive: true },
        select: { id: true, question: true, answer: true, followUp: true, keywords: true, category: true, relatedQuestions: true },
      }),
      db.country.findMany({ where: { isActive: true }, select: { code: true, name: true, faq: true } }),
    ]);
    const fromItems: MatchCandidate[] = items.map((i) => ({
      id: i.id,
      question: i.question,
      answer: i.answer,
      followUp: i.followUp,
      related: i.relatedQuestions.join(" "),
      relatedList: i.relatedQuestions,
      keywords: i.keywords,
      category: i.category,
    }));
    const fromCountries: MatchCandidate[] = countries.flatMap((c) =>
      (c.faq as { q: string; a: string }[]).map((f, idx) => ({
        id: `country:${c.code}:${idx}`,
        question: f.q,
        answer: f.a,
        followUp: "",
        related: "",
        relatedList: [],
        keywords: c.name,
        category: c.name,
      })),
    );
    return [...fromItems, ...fromCountries];
  },
  ["chat-match-corpus"],
  { tags: ["knowledge", "countries"] },
);

/** The client asked for English-only conversations. Devanagari (Hindi/Marathi script) is an
    unambiguous signal; common romanised-Hindi function words catch most Hinglish too. Short
    messages are left alone (a single word like "fees" would false-positive on some of these). */
const HINGLISH_WORDS = new Set([
  "kya", "hai", "hain", "kaise", "kyun", "kyu", "chahiye", "mujhe", "mera", "meri", "mere",
  "kaunsa", "kaunse", "kaunsi", "kab", "kahan", "kitna", "kitne", "hoga", "hogi", "karo", "karna",
  "krna", "paisa", "paise", "rupaye", "abhi", "acha", "accha", "nahi", "nahin", "haan", "bhai",
  "aap", "apka", "apki", "batao", "bataye", "padega", "padenge", "milega", "milegi",
]);
export function isNonEnglish(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 4) return false;
  if (/[ऀ-ॿ]/.test(trimmed)) return true; // Devanagari script
  const words = trimmed.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (words.length < 3) return false;
  const hits = words.filter((w) => HINGLISH_WORDS.has(w)).length;
  return hits >= 2 || hits / words.length > 0.3;
}

const STOP = new Set([
  "what", "when", "where", "which", "how", "does", "do", "is", "are", "the", "for", "and", "with",
  "your", "you", "about", "can", "will", "this", "that", "have", "has", "been", "from", "who", "there",
  // Carry no topic of their own, and appear in a third of the knowledge base: counting them let
  // "what documents do I need for a student visa" score highest on a question about visa money.
  "need", "needs", "needed", "want", "wants", "get", "got", "tell", "know",
]);

function tokenize(s: string): string[] {
  // ऀ-ॿ covers Devanagari so Hindi-script questions still tokenize sensibly.
  return s.toLowerCase().split(/[^a-z0-9ऀ-ॿ]+/).filter((w) => w.length > 2 && !STOP.has(w));
}

/** Fast pass: how much of the asked question is found in each candidate.
 *
 * What the candidate is ASKING counts for most of the score; what it answers counts for a
 * quarter. The knowledge base went from 10 entries to nearly 300 with the client's workbook, and
 * weighting every word equally meant any entry with a long answer collected stray hits — "work",
 * "course", "budget" and "university" appear in most of them — and beat the entry that was
 * actually about the question. On these weights an entry that only matches through its answer
 * tops out at 0.25, below any sensible threshold, so it falls through to the semantic pass
 * instead of being served as a confident match.
 */
const scoreAgainst = (words: string[], hay: string) => {
  let hits = 0;
  for (const w of words) if (hay.includes(w)) hits++;
  return hits / words.length;
};
export function scoreCandidate(words: string[], c: MatchCandidate): number {
  const asked = `${c.question} ${c.related} ${c.keywords}`.toLowerCase();
  const answered = c.answer.toLowerCase();
  return 0.75 * scoreAgainst(words, asked) + 0.25 * scoreAgainst(words, answered);
}
/** Tie-break: the same score reached through the entry's own wording beats one reached through
    its keyword list. Two entries about money both carry the whole fees vocabulary, so without
    this "how much money do I need to study abroad" was decided by a coin toss. */
const wordingScore = (words: string[], c: MatchCandidate) => scoreAgainst(words, `${c.question} ${c.related}`.toLowerCase());
/** How much of the candidate's own question the student actually said. Both "How much does it
    cost to study abroad?" and "How much can a scholarship reduce my study abroad cost?" contain
    everything in "how much money to study abroad"; only the second one also drags in a subject
    the student never mentioned. */
const coverage = (words: string[], c: MatchCandidate) => {
  const own = tokenize(c.question);
  if (!own.length) return 0;
  const said = new Set(words);
  return own.filter((w) => said.has(w)).length / own.length;
};

/** Normalised question text, so a stray "?" or capital never costs an exact hit. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export type KeywordHit = { candidate: MatchCandidate; score: number; runnerUp: number };

export function keywordMatch(question: string, corpus: MatchCandidate[]): KeywordHit | null {
  const words = tokenize(question);
  if (!words.length || !corpus.length) return null;
  const asked = norm(question);
  let best: { candidate: MatchCandidate; score: number } | null = null;
  /* The best score belonging to a DIFFERENT entry than the winner. Two entries neck and neck
     means word overlap did not actually decide anything, however high the number looks. */
  let runnerUp = 0;
  for (const c of corpus) {
    /* Asked word for word — including through one of the alternate phrasings. No scoring
       needed, and no reason to spend a Claude call on it. */
    if (norm(c.question) === asked || c.relatedList.some((r) => norm(r) === asked)) {
      return { candidate: c, score: 1, runnerUp: 0 };
    }
    const score = scoreCandidate(words, c);
    if (!best || score > best.score) {
      if (best) runnerUp = Math.max(runnerUp, best.score);
      best = { candidate: c, score };
      continue;
    }
    runnerUp = Math.max(runnerUp, score);
    if (score !== best.score) continue;
    /* Equal scores are decided by the entry's own wording, then by how little it asks about
       that the student never mentioned, then by length — the shorter entry is the more
       specific one, and a sprawling answer is what collected the equal score. */
    const rank = (x: MatchCandidate) => [wordingScore(words, x), coverage(words, x), -x.answer.length];
    const mine = rank(c);
    const theirs = rank(best.candidate);
    const firstDifference = mine.findIndex((v, i) => v !== theirs[i]);
    if (firstDifference >= 0 && mine[firstDifference] > theirs[firstDifference]) {
      best = { candidate: c, score };
    }
  }
  return best && { ...best, runnerUp };
}

/** The slice of the corpus worth showing Claude.
 *
 * Sending all ~300 entries costs about 5k tokens on every message, and a longer list makes the
 * model's job harder, not easier. The shortlist is what the fast pass found at all plausible.
 * When almost nothing overlaps — a paraphrase sharing no vocabulary, which is exactly the case
 * the semantic pass exists for — the whole corpus goes instead, since a shortlist built on word
 * overlap would be arbitrary. */
const SHORTLIST = 80;
export function shortlist(question: string, corpus: MatchCandidate[]): MatchCandidate[] {
  const words = tokenize(question);
  if (!words.length) return corpus;
  const scored = corpus
    .map((c) => ({ c, s: scoreCandidate(words, c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  if (scored.length < 30) return corpus;
  return scored.slice(0, SHORTLIST).map((x) => x.c);
}

/** Slow, precise pass: ask Claude which candidate the question means, given recent turns for
    context (so a follow-up like "isme scholarship available hai?" resolves against the prior
    topic). Returns null on any failure so callers fall through to the unmatched flow, never an
    invented answer. */
export async function semanticMatch(
  question: string,
  history: { role: string; content: string }[],
  corpus: MatchCandidate[],
): Promise<{ candidate: MatchCandidate; score: number } | null> {
  if (!process.env.ANTHROPIC_API_KEY || !corpus.length) return null;
  const list = corpus
    .map((c, i) => {
      const hints = [c.related, c.keywords].filter(Boolean).join(" ");
      return `${i}. ${c.question}${hints ? ` (also asked as / keywords: ${hints})` : ""}`;
    })
    .join("\n");
  const recent = history.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n");
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 60,
      system:
        'Match a student\'s question to the single best FAQ from a numbered list, using meaning and the conversation context, not just shared words. Reply with ONLY compact JSON: {"index": <number or -1>, "confidence": <0 to 1>}. Use -1 if nothing in the list is genuinely relevant — never force a match.',
      messages: [{ role: "user", content: `Recent conversation:\n${recent || "(none)"}\n\nFAQ list:\n${list}\n\nStudent's new question: "${question}"` }],
    });
    const text = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as { index?: number; confidence?: number };
    if (typeof parsed.index !== "number" || parsed.index < 0 || parsed.index >= corpus.length) return null;
    return { candidate: corpus[parsed.index], score: Math.max(0, Math.min(1, parsed.confidence ?? 0)) };
  } catch (err) {
    console.error("[chat-match] semantic", err);
    return null;
  }
}

export type Matched = { id: string; question: string; answer: string; followUp: string; confidence: number; method: "keyword" | "semantic" };

/** Two-level matcher. Never returns a match below `threshold` — the caller must show the
    unmatched flow instead of guessing. */
export async function matchKnowledgeBase(
  question: string,
  history: { role: string; content: string }[],
  threshold: number,
): Promise<Matched | null> {
  const corpus = await getMatchCorpus();

  const as = (m: { candidate: MatchCandidate; score: number }, method: Matched["method"]): Matched => ({
    id: m.candidate.id,
    question: m.candidate.question,
    answer: m.candidate.answer,
    followUp: m.candidate.followUp,
    confidence: m.score,
    method,
  });

  const kw = keywordMatch(question, corpus);
  /* A high score only means something when the next-best entry scored clearly lower. On nearly
     300 entries, "is there any scholarship for me" cleared the threshold against four different
     scholarship questions at once — picking one of them on a hair's breadth is guessing, and
     Claude reads the conversation and can tell them apart. */
  const DECISIVE = 0.08;
  if (kw && kw.score >= threshold && (kw.score >= 0.95 || kw.score - kw.runnerUp >= DECISIVE)) {
    return as(kw, "keyword");
  }

  const sem = await semanticMatch(question, history, shortlist(question, corpus));
  if (sem && sem.score >= threshold) return as(sem, "semantic");

  /* Claude was unavailable or unsure. A close keyword call is still better than telling the
     student we have nothing — it is above the threshold, just not decisively. */
  if (kw && kw.score >= threshold) return as(kw, "keyword");

  return null;
}
