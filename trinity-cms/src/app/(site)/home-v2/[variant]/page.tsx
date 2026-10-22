import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { getAllSettings } from "@/lib/settings-server";
import V2Home, { VARIANTS } from "@/components/site/v2/V2Home";
import type { V2Variant } from "@/components/site/v2/motion";
import "@/styles/v2.css";

type Props = { params: Promise<{ variant: string }> };

const isVariant = (v: string): v is V2Variant => VARIANTS.some((x) => x.id === v);

/* A work-in-progress concept, not a page the client's customers should land on from search. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
  return { title: { absolute: `Home V2 — ${variant}` }, robots: { index: false, follow: false } };
}

export default async function HomeV2Variant({ params }: Props) {
  const { variant } = await params;
  if (!isVariant(variant)) notFound();
  const [page, settings] = await Promise.all([getPage("home"), getAllSettings()]);
  if (!page) notFound();
  return <V2Home blocks={page.blocks} settings={settings} variant={variant} />;
}
