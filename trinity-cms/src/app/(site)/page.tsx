import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { getAllSettings } from "@/lib/settings-server";
import { BlockRenderer } from "@/components/site/blocks";
import TrinityWorldHost from "@/components/tw/TrinityWorldHost";
import "@/styles/tw-site.css";

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
  /* Settings → Home page → "Use the Trinity World home page". On, the globe-and-flight
     experience replaces the blocks entirely. The header and footer come from the layout, the
     same two every other page gets — they wear the drop-in's design site-wide now, so there is
     nothing for this page to bring of its own. Off, none of it is loaded. */
  if (settings.world.enabled) {
    return (
      <>
        {/* The drop-in's CSS names Sora; the site's heading face is Poppins, so without this
            every heading in it falls back. */}
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <TrinityWorldHost world={settings.world} />
      </>
    );
  }

  if (!page) return <section className="section"><div className="container"><p className="lead">Home page not configured. Run the seed.</p></div></section>;
  return <BlockRenderer blocks={page.blocks} ctx={{ settings }} />;
}
