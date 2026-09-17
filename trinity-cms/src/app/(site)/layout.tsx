import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/styles/site.css";
import "@/styles/canvas.css";
import "@/styles/chat.css";
import { getAllSettings } from "@/lib/settings-server";
import { getCountries } from "@/lib/content";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SiteScripts from "@/components/site/SiteScripts";
import ThemeStyle, { fontHref } from "@/components/site/ThemeStyle";
import ChatWidget from "@/components/site/ChatWidget";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: `${s.site.siteName} - ${s.site.tagline}`, template: `%s | ${s.site.siteName}` },
    icons: { icon: s.site.logo },
    openGraph: { type: "website", siteName: s.site.siteName },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, destinations] = await Promise.all([getAllSettings(), getCountries().catch(() => [])]);
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontHref(settings.theme)} rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <ThemeStyle t={settings.theme} />
      <Header nav={settings.nav} contact={settings.contact} site={settings.site} destinations={destinations} />
      <main id="main">{children}</main>
      <Footer nav={settings.nav} contact={settings.contact} site={settings.site} destinations={destinations} />
      {settings.chatbot.enabled ? <ChatWidget cfg={settings.chatbot} /> : null}
      <SiteScripts />
    </>
  );
}
