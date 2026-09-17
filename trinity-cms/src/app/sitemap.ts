import type { MetadataRoute } from "next";
import { getPageSlugs, getPublishedPostSlugs, getCountries } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [pages, posts, countries] = await Promise.all([
    getPageSlugs().catch(() => []),
    getPublishedPostSlugs().catch(() => []),
    getCountries().catch(() => []),
  ]);
  return [
    ...pages.map((p) => ({
      url: p.slug === "home" ? `${base}/` : `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: p.slug === "home" ? 1 : 0.8,
    })),
    // The destination pages are the commercial landing pages ("study in canada from india"),
    // so they get the highest non-home priority.
    ...countries.map((c) => ({
      url: `${base}/destinations/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
