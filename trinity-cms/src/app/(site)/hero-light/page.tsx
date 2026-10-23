import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getPage } from "@/lib/content";
import type { UniversitiesBlock } from "@/lib/blocks";
import HeroStage from "./HeroStage";
import "@/styles/hero-light.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

/* A concept page, not one for search to send people to. */
export const metadata: Metadata = { title: { absolute: "Hero — light" }, robots: { index: false, follow: false } };

/* A light-theme hero with a scroll sequence: headline, then the photograph, then the home page's
   university cards rising over it. The cards are read from the home page's own Universities block,
   so the dashboard still owns them. */
export default async function HeroLight() {
  const page = await getPage("home");
  const unis = page?.blocks.find((b) => b?.type === "universities") as UniversitiesBlock | undefined;
  return (
    <div className={`hlx ${inter.className}`}>
      <HeroStage items={unis?.items.slice(0, 8) ?? []} />
      <div className="hlx__after" />
    </div>
  );
}
