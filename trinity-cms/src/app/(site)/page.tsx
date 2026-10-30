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
     experience replaces the blocks entirely — and with them the site's header and footer,
     because the drop-in brings its own and two of each is not a design. Off, none of it is
     loaded. */
  if (settings.world.enabled) {
    const { site, contact, nav, footer } = settings;
    /* Everything the drop-in's chrome prints, out of the dashboard. The prototype ships
       placeholders — hello@example.com, +91 00000 00000, "Your office address" — and these
       are what stop them reaching production. See chrome.ts. */
    const chrome = {
      logo: site.logo,
      siteName: site.siteName,
      blurb: site.footerText,
      /* The header shows the first number; the rest live on /contact-us. */
      phone: contact.phones[0] ?? contact.landline,
      email: contact.email,
      address: contact.address,
      /* `whatsapp` is a sentinel in socialLinks, not a URL — the site's own Socials
         component resolves it the same way. */
      socials: contact.socialLinks.map((s) => ({
        label: s.label,
        href: s.href === "whatsapp" ? `https://wa.me/${contact.whatsapp}` : s.href,
      })),
      copyright: site.copyright,
      ctaLabel: nav.ctaLabel,
      ctaHref: nav.ctaHref,
      /* The same pages the site header lists, in the same order, so the home page is not a
         dead end. Top level only: the drop-in's nav is a pill, and Services alone has
         thirteen children that have nowhere to open into. */
      navItems: nav.items.map((it) => ({ label: it.label, href: it.href })),
      /* The prototype's footer ends in Privacy · Terms. This site has neither page, and its
         own footer carries a build credit in that slot — so that is what goes there, rather
         than two links that would 404. */
      poweredBy: footer.poweredByText
        ? { label: footer.poweredByText, href: footer.poweredByUrl }
        : undefined,
    };
    return (
      <>
        {/* The drop-in's CSS names Sora; the site's heading face is Poppins, so without this
            every heading in it falls back. */}
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
        {/* The layout above this renders the header and footer for every page under it and
            cannot know which page it is wrapping, so they are hidden from here instead. It is
            server-rendered alongside them, so there is no frame in which both are visible.
            `display:none` also takes them out of the accessibility tree, which is the point —
            one nav, not two. The WhatsApp button, the back-to-top and the chat widget are
            deliberately left alone: they are this site's, they sit in the corner on every
            page, and the drop-in has nothing of its own in their place. */}
        <style>{".site-header,.footer{display:none!important}"}</style>
        <TrinityWorldHost world={settings.world} chrome={chrome} />
      </>
    );
  }

  if (!page) return <section className="section"><div className="container"><p className="lead">Home page not configured. Run the seed.</p></div></section>;
  return <BlockRenderer blocks={page.blocks} ctx={{ settings }} />;
}
