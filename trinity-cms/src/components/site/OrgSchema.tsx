import type { ContactSettings, SiteSettings } from "@/lib/settings";

/* One EducationalOrganization entity for the business itself, emitted site-wide.
   Blog posts and destination pages reference it by @id as their publisher, so Google sees a
   single consistent entity rather than a new anonymous organisation per page. */
export default function OrgSchema({ site, contact }: { site: SiteSettings; contact: ContactSettings }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const sameAs = [contact.socials.facebook, contact.socials.twitter, contact.socials.instagram, contact.socials.linkedin, contact.socials.youtube].filter(Boolean);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${base}/#org`,
        name: site.siteName,
        alternateName: "Trinity Study Abroad — a unit of Trinity Air Travel & Tours Pvt. Ltd.",
        url: `${base}/`,
        logo: { "@type": "ImageObject", url: `${base}${site.logo}` },
        description: site.footerText,
        foundingDate: "1982",
        email: contact.email,
        telephone: contact.phones[0],
        address: {
          "@type": "PostalAddress",
          streetAddress: contact.address,
          addressLocality: "Mumbai",
          addressRegion: "Maharashtra",
          postalCode: "400029",
          addressCountry: "IN",
        },
        areaServed: "IN",
        sameAs,
      },
      { "@type": "WebSite", "@id": `${base}/#website`, url: `${base}/`, name: site.siteName, publisher: { "@id": `${base}/#org` }, inLanguage: "en-IN" },
    ],
  };

  // JSON.stringify does not escape "<", so a settings value containing </script> would break out.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />;
}
