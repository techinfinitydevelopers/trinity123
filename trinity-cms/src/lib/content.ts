import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { db } from "./db";
import type { Block } from "./blocks";

/* `unstable_cache` serialises its result as JSON, so Date columns come back as ISO strings.
   These helpers revive them, letting callers rely on Date methods. */
type DateKeys = "publishedAt" | "updatedAt" | "createdAt";
function revive<T extends Partial<Record<DateKeys, unknown>>>(row: T): T {
  const out = { ...row } as Record<string, unknown>;
  for (const k of ["publishedAt", "updatedAt", "createdAt"]) {
    if (typeof out[k] === "string") out[k] = new Date(out[k] as string);
  }
  return out as T;
}
const reviveAll = <T extends Partial<Record<DateKeys, unknown>>>(rows: T[]) => rows.map(revive);

export const getPage = unstable_cache(
  async (slug: string) => {
    const p = await db.page.findUnique({ where: { slug } });
    if (!p) return null;
    return { ...revive(p), blocks: (p.blocks as unknown as Block[]) ?? [] };
  },
  ["page"],
  { tags: ["pages"] },
);

export const getPageSlugs = unstable_cache(
  async () => reviveAll(await db.page.findMany({ select: { slug: true, updatedAt: true } })),
  ["page-slugs"],
  { tags: ["pages"] },
);

export const getPost = unstable_cache(
  async (slug: string) => {
    const p = await db.post.findUnique({ where: { slug, status: "PUBLISHED" }, include: { author: { select: { name: true } } } });
    return p ? revive(p) : null;
  },
  ["post"],
  { tags: ["posts"] },
);

export const getRelatedPosts = unstable_cache(
  async (slug: string, take = 2) =>
    reviveAll(await db.post.findMany({
      where: { status: "PUBLISHED", slug: { not: slug } },
      orderBy: { publishedAt: "desc" }, take,
      select: { slug: true, title: true, excerpt: true, coverImage: true, category: true, readMins: true, publishedAt: true },
    })),
  ["related"],
  { tags: ["posts"] },
);

export const getPublishedPostSlugs = unstable_cache(
  async () => reviveAll(await db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })),
  ["post-slugs"],
  { tags: ["posts"] },
);

export const getAdjacentPosts = unstable_cache(
  async (slug: string) => {
    const all = await db.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, select: { slug: true, title: true } });
    const i = all.findIndex((p) => p.slug === slug);
    if (i < 0 || all.length < 2) return { prev: null, next: null };
    return { prev: all[(i - 1 + all.length) % all.length], next: all[(i + 1) % all.length] };
  },
  ["adjacent"],
  { tags: ["posts"] },
);

/* ---------- destinations ---------- */
export const getCountries = unstable_cache(
  async () => db.country.findMany({ where: { isActive: true }, orderBy: { order: "asc" }, select: { code: true, slug: true, name: true, tag: true, img: true } }),
  ["countries"],
  { tags: ["countries"] },
);

export const getCountry = unstable_cache(
  async (slug: string) => {
    const c = await db.country.findUnique({ where: { slug } });
    return c ? revive(c) : null;
  },
  ["country"],
  { tags: ["countries"] },
);

export function revalidateSite() {
  revalidateTag("pages", "max");
  revalidateTag("posts", "max");
  revalidateTag("settings", "max");
  revalidateTag("countries", "max");
  revalidateTag("knowledge", "max");
  revalidatePath("/", "layout");
}

/** Extract `<h2 id="…">text</h2>` pairs for the post table of contents. */
export function extractToc(html: string) {
  const out: { id: string; text: string }[] = [];
  const re = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push({ id: m[1], text: m[2].replace(/<[^>]+>/g, "").replace(/^\d+\.\s*/, "") });
  return out;
}
