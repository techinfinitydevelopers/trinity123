import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPageSlugs } from "@/lib/content";
import { getAllSettings } from "@/lib/settings-server";
import { BlockRenderer } from "@/components/site/blocks";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateStaticParams() {
  const slugs = await getPageSlugs().catch(() => []);
  return slugs.filter((s) => s.slug !== "home").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [p, s] = await Promise.all([getPage(slug), getAllSettings()]);
  if (!p) return {};
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const image = `${base}${p.ogImage || s.site.logo}`;
  return {
    title: { absolute: p.seoTitle || p.title },
    description: p.seoDesc ?? undefined,
    // Self-canonical ignoring the query string, so /blog?tag=Visa does not compete with /blog.
    alternates: { canonical: `${base}/${slug}` },
    openGraph: { images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  if (slug === "home") notFound();
  const [page, settings] = await Promise.all([getPage(slug), getAllSettings()]);
  if (!page) notFound();
  return <BlockRenderer blocks={page.blocks} ctx={{ settings, searchParams: sp }} />;
}
