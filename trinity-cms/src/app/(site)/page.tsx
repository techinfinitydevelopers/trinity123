import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { getAllSettings } from "@/lib/settings-server";
import { BlockRenderer } from "@/components/site/blocks";

export async function generateMetadata(): Promise<Metadata> {
  const [p, s] = await Promise.all([getPage("home"), getAllSettings()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // og:image must be absolute — WhatsApp and Facebook will not resolve a relative path.
  const image = `${base}${p?.ogImage || s.site.logo}`;
  return {
    title: { absolute: p?.seoTitle || p?.title || "Home" },
    description: p?.seoDesc ?? undefined,
    alternates: { canonical: `${base}/` },
    openGraph: { images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage("home"), getAllSettings()]);
  if (!page) return <section className="section"><div className="container"><p className="lead">Home page not configured. Run the seed.</p></div></section>;
  return <BlockRenderer blocks={page.blocks} ctx={{ settings }} />;
}
