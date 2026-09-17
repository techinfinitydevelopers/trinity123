import type { MetadataRoute } from "next";
import { getPageSlugs, getPublishedPostSlugs } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [pages, posts] = await Promise.all([getPageSlugs().catch(() => []), getPublishedPostSlugs().catch(() => [])]);
  return [
    ...pages.map((p) => ({ url: p.slug === "home" ? `${base}/` : `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const })),
  ];
}
