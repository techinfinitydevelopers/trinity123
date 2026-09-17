"use server";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { signIn, signOut, requireSession, hashPassword } from "./auth";
import { revalidateSite } from "./content";
import { type SettingsKey, type SettingsMap } from "./settings";
import { saveSetting } from "./settings-server";
import { seedPages } from "./seed-content";
import { slugify, type Block } from "./blocks";
import { removeFile } from "./storage";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const fail = (e: unknown): ActionResult => ({ ok: false, error: e instanceof Error ? e.message : "Something went wrong" });

/* ---------- auth ---------- */
export async function loginAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") ?? ""), password = String(fd.get("password") ?? "");
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
    if (!slug || ["admin", "api", "blog", "home"].includes(slug)) return { ok: false, error: "Invalid slug" };
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
    await requireSession();
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
  try { await requireSession(); await saveSetting(key, value); revalidateSite(); return { ok: true, message: "Saved" }; } catch (e) { return fail(e); }
}

/* ---------- leads ---------- */
export async function toggleLeadAction(id: string, isRead: boolean): Promise<ActionResult> {
  try { await requireSession(); await db.lead.update({ where: { id }, data: { isRead } }); revalidatePath("/admin/leads"); return { ok: true }; } catch (e) { return fail(e); }
}
export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try { await requireSession(); await db.lead.delete({ where: { id } }); revalidatePath("/admin/leads"); return { ok: true }; } catch (e) { return fail(e); }
}

/* ---------- media ---------- */
export async function updateMediaAction(id: string, alt: string): Promise<ActionResult> {
  try { await requireSession(); await db.media.update({ where: { id }, data: { alt } }); return { ok: true }; } catch (e) { return fail(e); }
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
    await db.user.update({ where: { id: me.id }, data: { password: await hashPassword(next) } });
    return { ok: true, message: "Password updated" };
  } catch (e) { return fail(e); }
}

/* ---------- knowledge (chatbot) ---------- */
export async function saveKnowledgeAction(input: { id?: string; question: string; answer: string; tags: string; isActive: boolean }): Promise<ActionResult> {
  try {
    await requireSession();
    const { id, ...data } = input;
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
  try { await requireSession(); await db.country.delete({ where: { id } }); revalidateSite(); return { ok: true }; } catch (e) { return fail(e); }
}
