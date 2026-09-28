"use server";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { signIn, signOut, requireSession, requireAdminRole, hashPassword } from "./auth";
import { rateLimit, clientIp } from "./chat";
import { headers } from "next/headers";
import { revalidateSite } from "./content";
import { type SettingsKey, type SettingsMap } from "./settings";
import { saveSetting } from "./settings-server";
import { seedPages } from "./seed-content";
import { slugify, type Block } from "./blocks";
import { removeFile } from "./storage";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  const msg = e instanceof Error ? e.message : "";
  if (msg === "UNAUTHORIZED") return { ok: false, error: "Your session expired. Sign in again in another tab, then press Save — your work is still here." };
  if (msg.includes("Unique constraint")) return { ok: false, error: "Something with that name or URL already exists. Try a different one." };
  if (msg.includes("Record to update not found") || msg.includes("P2025")) return { ok: false, error: "That item no longer exists — it may have been deleted in another tab." };
  if (msg.startsWith("This action requires")) return { ok: false, error: msg };
  console.error("[action]", e);
  return { ok: false, error: "Something went wrong. Please try again." };
}

/* ---------- auth ---------- */
export async function loginAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") ?? ""), password = String(fd.get("password") ?? "");
  // Throttle on IP and on the account, so neither one host nor a distributed attempt
  // can brute-force the single admin account.
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000) || !rateLimit(`login:${email.toLowerCase().trim()}`, 8, 15 * 60_000)) {
    return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
  }
  const user = await signIn(email, password);
  if (!user) return { ok: false, error: "Invalid email or password" };
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

/* ---------- pages ---------- */
export async function savePageAction(input: { slug: string; title: string; navLabel: string; seoTitle: string; seoDesc: string; ogImage: string; blocks: Block[] }): Promise<ActionResult> {
  try {
    await requireSession();
    const s = z.object({ slug: z.string().min(1), title: z.string().min(1).max(200), navLabel: z.string().max(60), seoTitle: z.string().max(200), seoDesc: z.string().max(400), ogImage: z.string().max(500) }).parse(input);
    await db.page.update({ where: { slug: s.slug }, data: { ...s, seoTitle: s.seoTitle || null, seoDesc: s.seoDesc || null, ogImage: s.ogImage || null, blocks: input.blocks as object[] } });
    revalidateSite();
    return { ok: true, message: "Page saved" };
  } catch (e) { return fail(e); }
}

export async function createPageAction(input: { title: string; slug?: string }): Promise<ActionResult> {
  try {
    await requireSession();
    const slug = slugify(input.slug || input.title);
    if (!slug || ["admin", "api", "blog", "home", "destinations"].includes(slug)) return { ok: false, error: "That URL is reserved. Please choose another." };
    if (await db.page.findUnique({ where: { slug }, select: { slug: true } })) return { ok: false, error: `A page already uses /${slug}. Choose a different URL.` };
    const blocks: Block[] = [
      { type: "pageHero", ghost: input.title.toUpperCase(), crumb: input.title, words: input.title.split(" ").map((t, i, a) => ({ t, s: i === a.length - 1 ? "gold" : undefined })), sub: "", aside: { kind: "none" } },
      { type: "richText", html: `<h2>${input.title}</h2><p>Start writing…</p>`, grey: false },
    ];
    await db.page.create({ data: { slug, title: input.title, navLabel: input.title, blocks: blocks as object[] } });
    revalidateSite();
    return { ok: true, id: slug };
  } catch (e) { return fail(e); }
}

export async function deletePageAction(slug: string): Promise<ActionResult> {
  try {
    await requireAdminRole();
    const p = await db.page.findUnique({ where: { slug } });
    if (!p) return { ok: false, error: "Not found" };
    if (p.isSystem) return { ok: false, error: "System pages cannot be deleted" };
    await db.page.delete({ where: { slug } });
    revalidateSite();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function resetPageAction(slug: string): Promise<ActionResult> {
  try {
    await requireSession();
    const d = seedPages.find((p) => p.slug === slug);
    if (!d) return { ok: false, error: "No default content for this page" };
    await db.page.update({ where: { slug }, data: { blocks: d.blocks as object[] } });
    revalidateSite();
    return { ok: true, message: "Reset to default content" };
  } catch (e) { return fail(e); }
}

/* ---------- posts ---------- */
const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().max(120),
  excerpt: z.string().max(600),
  coverImage: z.string().max(500),
  category: z.string().max(60),
  readMins: z.coerce.number().int().min(1).max(60),
  body: z.string(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  takeaways: z.array(z.string()),
  sources: z.array(z.object({ label: z.string(), href: z.string() })),
  tags: z.array(z.string()),
  seoTitle: z.string().max(200),
  seoDesc: z.string().max(400),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().optional(),
});
export type PostInput = z.infer<typeof postSchema>;

export async function savePostAction(input: PostInput): Promise<ActionResult> {
  try {
    const me = await requireSession();
    const p = postSchema.parse(input);
    const slug = slugify(p.slug || p.title);
    const data = {
      title: p.title, slug, excerpt: p.excerpt, coverImage: p.coverImage || null, category: p.category || "Guides", readMins: p.readMins,
      body: p.body, faqs: p.faqs, takeaways: p.takeaways, sources: p.sources, tags: p.tags.map((t) => t.trim()).filter(Boolean), seoTitle: p.seoTitle || null, seoDesc: p.seoDesc || null, status: p.status,
      publishedAt: p.status === "PUBLISHED" ? (p.publishedAt ? new Date(p.publishedAt) : new Date()) : null,
    };
    let id = p.id;
    if (id) await db.post.update({ where: { id }, data });
    else id = (await db.post.create({ data: { ...data, authorId: me.id } })).id;
    revalidateSite();
    return { ok: true, id, message: "Post saved" };
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) return { ok: false, error: "A post with this slug already exists" };
    return fail(e);
  }
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  try { await requireSession(); await db.post.delete({ where: { id } }); revalidateSite(); return { ok: true }; } catch (e) { return fail(e); }
}

/* ---------- settings ---------- */
export async function saveSettingsAction<K extends SettingsKey>(key: K, value: SettingsMap[K]): Promise<ActionResult> {
  try { await requireAdminRole(); await saveSetting(key, value); revalidateSite(); return { ok: true, message: "Saved" }; } catch (e) { return fail(e); }
}

/* ---------- leads ---------- */
export async function toggleLeadAction(id: string, isRead: boolean): Promise<ActionResult> {
  try { await requireSession(); await db.lead.update({ where: { id }, data: { isRead } }); revalidatePath("/admin/leads"); return { ok: true }; } catch (e) { return fail(e); }
}
export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try { await requireAdminRole(); await db.lead.delete({ where: { id } }); revalidatePath("/admin/leads"); return { ok: true }; } catch (e) { return fail(e); }
}

/* ---------- media ---------- */
export async function updateMediaAction(id: string, alt: string): Promise<ActionResult> {
  try { await requireSession(); await db.media.update({ where: { id }, data: { alt } }); revalidatePath("/admin/media"); return { ok: true }; } catch (e) { return fail(e); }
}
export async function deleteMediaAction(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const m = await db.media.delete({ where: { id } });
    await removeFile(m.url);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ---------- users ---------- */
export async function changePasswordAction(current: string, next: string): Promise<ActionResult> {
  try {
    const me = await requireSession();
    const u = await db.user.findUnique({ where: { id: me.id } });
    if (!u) return { ok: false, error: "User not found" };
    const bcrypt = (await import("bcryptjs")).default;
    if (!(await bcrypt.compare(current, u.password))) return { ok: false, error: "Current password is incorrect" };
    if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters" };
    await db.user.update({ where: { id: me.id }, data: { password: await hashPassword(next), tokenVersion: { increment: 1 } } });
    return { ok: true, message: "Password updated. Other devices have been signed out." };
  } catch (e) { return fail(e); }
}

/* ---------- knowledge (chatbot) ---------- */
const knowledgeSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(1).max(400),
  answer: z.string().trim().min(1).max(4000),
  keywords: z.string().trim().max(500).default(""),
  category: z.string().trim().max(80).default("General"),
  relatedQuestions: z.array(z.string().trim().max(400)).default([]),
  isActive: z.boolean().default(true),
});
export async function saveKnowledgeAction(input: z.infer<typeof knowledgeSchema>): Promise<ActionResult> {
  try {
    await requireSession();
    const { id, ...data } = knowledgeSchema.parse(input);
    if (id) await db.knowledgeItem.update({ where: { id }, data });
    else await db.knowledgeItem.create({ data });
    revalidateTag("knowledge", "max");
    revalidatePath("/admin/chatbot");
    return { ok: true, message: "Saved" };
  } catch (e) { return fail(e); }
}
export async function deleteKnowledgeAction(id: string): Promise<ActionResult> {
  try { await requireSession(); await db.knowledgeItem.delete({ where: { id } }); revalidateTag("knowledge", "max"); revalidatePath("/admin/chatbot"); return { ok: true }; } catch (e) { return fail(e); }
}

export type BulkRow = { question: string; answer: string; keywords?: string; category?: string };
export type BulkReport = { imported: number; skipped: number; errors: { row: number; reason: string }[] };
/** Bulk import from the admin's client-parsed CSV/Excel rows. Validates, de-duplicates against
    existing questions (case-insensitive) and within the batch itself, upserts the rest. */
export async function bulkImportKnowledgeAction(rows: BulkRow[]): Promise<ActionResult & { report?: BulkReport }> {
  try {
    await requireSession();
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "No rows to import." };
    if (rows.length > 2000) return { ok: false, error: "Please upload 2000 rows or fewer at a time." };

    const existing = new Set((await db.knowledgeItem.findMany({ select: { question: true } })).map((r) => r.question.trim().toLowerCase()));
    const seenInBatch = new Set<string>();
    const report: BulkReport = { imported: 0, skipped: 0, errors: [] };
    const toCreate: { question: string; answer: string; keywords: string; category: string }[] = [];

    rows.forEach((raw, i) => {
      const rowNum = i + 2; // header row is line 1 in the source file
      const question = String(raw.question ?? "").trim();
      const answer = String(raw.answer ?? "").trim();
      const keywords = String(raw.keywords ?? "").trim();
      const category = String(raw.category ?? "").trim() || "General";
      if (!question || !answer) { report.errors.push({ row: rowNum, reason: "Question and answer are both required." }); return; }
      if (question.length > 400 || answer.length > 4000) { report.errors.push({ row: rowNum, reason: "Question or answer is too long." }); return; }
      const key = question.toLowerCase();
      if (existing.has(key) || seenInBatch.has(key)) { report.skipped++; return; }
      seenInBatch.add(key);
      toCreate.push({ question, answer, keywords, category });
    });

    if (toCreate.length) await db.knowledgeItem.createMany({ data: toCreate });
    report.imported = toCreate.length;

    revalidateTag("knowledge", "max");
    revalidatePath("/admin/chatbot");
    return { ok: true, report, message: `Imported ${report.imported}, skipped ${report.skipped} duplicate(s), ${report.errors.length} error(s).` };
  } catch (e) { return fail(e); }
}

/* ---------- chat sessions (conversations, notes, urgent, unanswered) ---------- */
export async function updateChatStatusAction(id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED"): Promise<ActionResult> {
  try { await requireSession(); await db.chatSession.update({ where: { id }, data: { status } }); revalidatePath("/admin/chats"); return { ok: true }; } catch (e) { return fail(e); }
}

export async function addChatNoteAction(sessionId: string, body: string): Promise<ActionResult> {
  try {
    const me = await requireSession();
    const text = body.trim();
    if (!text) return { ok: false, error: "Note cannot be empty." };
    await db.chatNote.create({ data: { sessionId, authorName: me.name, body: text.slice(0, 2000) } });
    revalidatePath("/admin/chats");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function resolveUnmatchedAction(messageId: string): Promise<ActionResult> {
  try { await requireSession(); await db.chatMessage.update({ where: { id: messageId }, data: { unmatchedResolved: true } }); revalidatePath("/admin/chatbot"); return { ok: true }; } catch (e) { return fail(e); }
}

/* ---------- destinations ---------- */
export type CountryInput = {
  id?: string; code: string; slug: string; name: string; tag: string; img: string; hero: string; intro: string;
  stats: unknown[]; why: unknown[]; courses: unknown[]; unis: unknown[]; visa: string; intakes: string;
  cost: unknown[]; req: unknown[]; sch: unknown[]; steps: unknown[]; work: string; workPoints: unknown[]; faq: unknown[];
  seoTitle: string; seoDesc: string; isActive: boolean; order: number;
};
export async function saveCountryAction(input: CountryInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { id, seoTitle, seoDesc, ...rest } = input;
    const code = rest.code.toLowerCase().trim();
    const slug = slugify(rest.slug || rest.name);
    if (!code || !slug || !rest.name.trim()) return { ok: false, error: "Code, name and URL are required" };
    const data = { ...rest, code, slug, seoTitle: seoTitle || null, seoDesc: seoDesc || null } as unknown as Parameters<typeof db.country.create>[0]["data"];
    const row = id ? await db.country.update({ where: { id }, data }) : await db.country.create({ data });
    revalidateSite();
    return { ok: true, id: row.id, message: "Destination saved" };
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) return { ok: false, error: "A destination with this code or URL already exists" };
    return fail(e);
  }
}
export async function deleteCountryAction(id: string): Promise<ActionResult> {
  try { await requireAdminRole(); await db.country.delete({ where: { id } }); revalidateSite(); return { ok: true }; } catch (e) { return fail(e); }
}
