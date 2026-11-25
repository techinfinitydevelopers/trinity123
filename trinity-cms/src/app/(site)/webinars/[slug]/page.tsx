import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getHomeWebinar } from "@/lib/content";
import { isPastWebinar, webinarSlug } from "@/lib/webinar";
import WebinarDetail from "@/components/site/WebinarDetail";

type Props = { params: Promise<{ slug: string }> };
const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = await getHomeWebinar();
  const w = b.current.find((x) => webinarSlug(x) === slug);
  if (!w || isPastWebinar(w)) return {};
  const description = (w.about || w.text || `Free webinar by Trinity Study Abroad on ${w.when}.`).slice(0, 200);
  return { title: `${w.title} — Free Webinar`, description, alternates: { canonical: `${base()}/webinars/${slug}` }, openGraph: { title: w.title, description, images: w.img ? [w.img] : undefined } };
}

export default async function WebinarPage({ params }: Props) {
  const { slug } = await params;
  const b = await getHomeWebinar();
  const w = b.current.find((x) => webinarSlug(x) === slug);
  if (!w) notFound();
  /* Only upcoming webinars have a page; once the day has passed the recap lives on the Webinars & Events page. */
  if (isPastWebinar(w)) redirect(b.moreHref || "/webinars-events");
  return <WebinarDetail b={b} w={w} />;
}
