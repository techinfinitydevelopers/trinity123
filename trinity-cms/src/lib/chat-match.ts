/* Two-level FAQ matcher for the student chatbot.
   Level 1 (always available, free): keyword/substring overlap against the knowledge base.
   Level 2 (needs ANTHROPIC_API_KEY): one cheap Claude Haiku classification call that picks the
   best-matching FAQ by meaning + recent conversation context. Below `threshold`, callers must
   treat the question as unanswered — this module never guesses. */
import { unstable_cache } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

export type MatchCandidate = { id: string; question: string; answer: string; keywords: string; category: string };

/** The full matchable corpus: admin-curated FAQs + each destination's own admin-authored FAQ
    entries (already used by the old prompt-stuffed bot) — so existing country content still
    answers questions without being retyped into the knowledge base. */
export const getMatchCorpus = unstable_cache(
  async (): Promise<MatchCandidate[]> => {
    const [items, countries] = await Promise.all([
      db.knowledgeItem.findMany({
        where: { isActive: true },
        select: { id: true, question: true, answer: true, keywords: true, category: true, relatedQuestions: true },
      }),
      db.country.findMany({ where: { isActive: true }, select: { code: true, name: true, faq: true } }),
    ]);
    const fromItems: MatchCandidate[] = items.map((i) => ({
      id: i.id,
      question: i.question,
      answer: i.answer,
      keywords: [i.keywords, i.relatedQuestions.join(" ")].filter(Boolean).join(" "),
      category: i.category,
    }));
    const fromCountries: MatchCandidate[] = countries.flatMap((c) =>
      (c.faq as { q: string; a: string }[]).map((f, idx) => ({
        id: `country:${c.code}:${idx}`,
        question: f.q,
        answer: f.a,
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
]);

function tokenize(s: string): string[] {
  // ऀ-ॿ covers Devanagari so Hindi-script questions still tokenize sensibly.
  return s.toLowerCase().split(/[^a-z0-9ऀ-ॿ]+/).filter((w) => w.length > 2 && !STOP.has(w));
}

/** Fast pass: fraction of the question's significant words found in each candidate's text. */
export function keywordMatch(question: string, corpus: MatchCandidate[]): { candidate: MatchCandidate; score: number } | null {
  const words = tokenize(question);
  if (!words.length || !corpus.length) return null;
  let best: { candidate: MatchCandidate; score: number } | null = null;
  for (const c of corpus) {
    const hay = `${c.question} ${c.answer} ${c.keywords}`.toLowerCase();
    let hits = 0;
    for (const w of words) if (hay.includes(w)) hits++;
    const score = hits / words.length;
    if (!best || score > best.score) best = { candidate: c, score };
  }
  return best;
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
  const list = corpus.map((c, i) => `${i}. ${c.question}${c.keywords ? ` (keywords: ${c.keywords})` : ""}`).join("\n");
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

export type Matched = { id: string; question: string; answer: string; confidence: number; method: "keyword" | "semantic" };

/** Two-level matcher. Never returns a match below `threshold` — the caller must show the
    unmatched flow instead of guessing. */
export async function matchKnowledgeBase(
  question: string,
  history: { role: string; content: string }[],
  threshold: number,
): Promise<Matched | null> {
  const corpus = await getMatchCorpus();

  const kw = keywordMatch(question, corpus);
  if (kw && kw.score >= threshold) {
    return { id: kw.candidate.id, question: kw.candidate.question, answer: kw.candidate.answer, confidence: kw.score, method: "keyword" };
  }

  const sem = await semanticMatch(question, history, corpus);
  if (sem && sem.score >= threshold) {
    return { id: sem.candidate.id, question: sem.candidate.question, answer: sem.candidate.answer, confidence: sem.score, method: "semantic" };
  }

  return null;
}
