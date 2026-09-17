import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCountry, getCountries } from "@/lib/content";
import { getSetting } from "@/lib/settings-server";
import CountryPage from "@/components/site/CountryPage";

type Props = { params: Promise<{ slug: string }> };
const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateStaticParams() {
  const all = await getCountries().catch(() => []);
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCountry(slug);
  if (!c) return {};
  const title = c.seoTitle || `Study in ${c.name} — Cost, Requirements, Visa & Scholarships`;
  const description = c.seoDesc || `Study in ${c.name} from India: tuition and living costs, admission requirements, scholarships, visa process and post-study work options — guided by Trinity Study Abroad.`;
  return { title, description, alternates: { canonical: `${base()}/destinations/${c.slug}` }, openGraph: { title, description, images: c.img ? [c.img] : undefined } };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const [c, all, contact] = await Promise.all([getCountry(slug), getCountries(), getSetting("contact")]);
  if (!c || !c.isActive) notFound();
  const others = all.filter((x) => x.code !== c.code).slice(0, 6);
  const url = `${base()}/destinations/${c.slug}`;
  const faq = c.faq as { q: string; a: string }[];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: `Study in ${c.name}`, description: c.intro, url, inLanguage: "en-IN" },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base()}/` },
        { "@type": "ListItem", position: 2, name: "Study Destinations", item: `${base()}/why-study-abroad` },
        { "@type": "ListItem", position: 3, name: `Study in ${c.name}`, item: url },
      ] },
      ...(faq.length ? [{ "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <CountryPage c={c} others={others} contact={contact} />
    </>
  );
}
