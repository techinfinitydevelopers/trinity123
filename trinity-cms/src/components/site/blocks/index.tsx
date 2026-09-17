import type { Block } from "@/lib/blocks";
import type { SettingsMap } from "@/lib/settings";
import { Hero, PageHero } from "./Hero";
import { Band, Stats, Cta, Countries, Offer, RichText } from "./Common";
import { About, Steps, Universities } from "./Home";
import { Journey, Testimonials, Intro, FeatureCards, Services, Contact } from "./Pages";
import { Faq } from "./Faq";
import { BlogList } from "./BlogList";

export type RenderCtx = { settings: SettingsMap; searchParams?: Record<string, string | undefined> };

export function BlockRenderer({ blocks, ctx }: { blocks: Block[]; ctx: RenderCtx }) {
  const contact = ctx.settings.contact;
  return (
    <>
      {blocks.map((b, i) => {
        const key = `${b.type}-${i}`;
        switch (b.type) {
          case "hero": return <Hero key={key} b={b} contact={contact} />;
          case "pageHero": return <PageHero key={key} b={b} contact={contact} />;
          case "band": return <Band key={key} b={b} />;
          case "about": return <About key={key} b={b} contact={contact} site={ctx.settings.site} />;
          case "offer": return <Offer key={key} b={b} contact={contact} />;
          case "steps": return <Steps key={key} b={b} contact={contact} />;
          case "countries": return <Countries key={key} b={b} contact={contact} />;
          case "universities": return <Universities key={key} b={b} contact={contact} />;
          case "stats": return <Stats key={key} b={b} />;
          case "cta": return <Cta key={key} b={b} contact={contact} />;
          case "faq": return <Faq key={key} b={b} contact={contact} />;
          case "journey": return <Journey key={key} b={b} />;
          case "testimonials": return <Testimonials key={key} b={b} />;
          case "intro": return <Intro key={key} b={b} />;
          case "featureCards": return <FeatureCards key={key} b={b} />;
          case "services": return <Services key={key} b={b} contact={contact} />;
          case "contact": return <Contact key={key} b={b} contact={contact} />;
          case "blogList": return <BlogList key={key} b={b} tag={ctx.searchParams?.tag} />;
          case "richText": return <RichText key={key} b={b} />;
          default: return null;
        }
      })}
    </>
  );
}
