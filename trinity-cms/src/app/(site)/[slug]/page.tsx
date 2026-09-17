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
  const p = await getPage(slug);
  if (!p) return {};
  return { title: { absolute: p.seoTitle || p.title }, description: p.seoDesc ?? undefined, openGraph: { images: p.ogImage ? [p.ogImage] : undefined } };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  if (slug === "home") notFound();
  const [page, settings] = await Promise.all([getPage(slug), getAllSettings()]);
  if (!page) notFound();
  return <BlockRenderer blocks={page.blocks} ctx={{ settings, searchParams: sp }} />;
}
