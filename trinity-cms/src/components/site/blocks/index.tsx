import type { Block } from "@/lib/blocks";
import type { SettingsMap } from "@/lib/settings";
import { Hero, PageHero } from "./Hero";
import { Band, Stats, Cta, Countries, Offer, RichText } from "./Common";
import { About, Steps, Universities } from "./Home";
import { Journey, Testimonials, Intro, FeatureCards, Services, Contact } from "./Pages";
import { Faq } from "./Faq";
import { BlogList } from "./BlogList";

export type RenderCtx = { settings: SettingsMap; searchParams?: Record<string, string | undefined> };

function renderBlock(b: Block, ctx: RenderCtx) {
  const contact = ctx.settings.contact;
  switch (b.type) {
    case "hero": return <Hero b={b} contact={contact} />;
    case "pageHero": return <PageHero b={b} contact={contact} />;
    case "band": return <Band b={b} />;
    case "about": return <About b={b} contact={contact} site={ctx.settings.site} />;
    case "offer": return <Offer b={b} contact={contact} />;
    case "steps": return <Steps b={b} contact={contact} />;
    case "countries": return <Countries b={b} contact={contact} />;
    case "universities": return <Universities b={b} contact={contact} />;
    case "stats": return <Stats b={b} />;
    case "cta": return <Cta b={b} contact={contact} />;
    case "faq": return <Faq b={b} contact={contact} />;
    case "journey": return <Journey b={b} />;
    case "testimonials": return <Testimonials b={b} />;
    case "intro": return <Intro b={b} />;
    case "featureCards": return <FeatureCards b={b} />;
    case "services": return <Services b={b} contact={contact} />;
    case "contact": return <Contact b={b} contact={contact} />;
    case "blogList": return <BlogList b={b} tag={ctx.searchParams?.tag} />;
    case "richText": return <RichText b={b} />;
    default: return null;
  }
}

export function BlockRenderer({ blocks, ctx }: { blocks: Block[]; ctx: RenderCtx }) {
  return (
    <>
      {(Array.isArray(blocks) ? blocks : []).map((b, i) => {
        // One malformed section — e.g. an array the owner emptied in the editor — must not
        // blank the entire page. Skip it and keep the rest of the site rendering.
        if (!b || typeof b !== "object" || !b.type) return null;
        try {
          return <BlockBoundary key={`${b.type}-${i}`}>{renderBlock(b, ctx)}</BlockBoundary>;
        } catch (err) {
          console.error(`[block] "${b.type}" at index ${i} failed to render`, err);
          return null;
        }
      })}
    </>
  );
}

/** Async blocks (BlogList) throw during streaming, not during the synchronous call above,
    so they get a Suspense-compatible boundary of their own. */
function BlockBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
