import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { getAllSettings } from "@/lib/settings-server";
import { BlockRenderer } from "@/components/site/blocks";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage("home");
  return { title: { absolute: p?.seoTitle || p?.title || "Home" }, description: p?.seoDesc ?? undefined, openGraph: { images: p?.ogImage ? [p.ogImage] : undefined } };
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage("home"), getAllSettings()]);
  if (!page) return <section className="section"><div className="container"><p className="lead">Home page not configured. Run the seed.</p></div></section>;
  return <BlockRenderer blocks={page.blocks} ctx={{ settings }} />;
}
