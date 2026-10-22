/* Home V2 — the page.
   It reads the *same* home blocks the live home page reads, so there is one copy of the
   content and the dashboard still owns it. What changes is the arrangement and the motion:
   the blocks are picked out by type and fed to the V2 sections rather than to BlockRenderer.
   A block the owner deletes simply drops its section rather than breaking the page. */
import type { Block, HeroBlock, StatsBlock, OfferBlock, StepsBlock, CountriesBlock,
  UniversitiesBlock, TestimonialsBlock, WebinarBlock, CampusBlock, CtaBlock } from "@/lib/blocks";
import type { SettingsMap } from "@/lib/settings";
import V2Motion, { type V2Variant } from "./motion";
import {
  V2Hero, V2Numbers, V2Stack, V2Pipeline, V2Bento, V2Voices, V2Events, V2Marquee, V2Centres, V2Boarding,
} from "./sections";

const pick = <T extends Block>(blocks: Block[], type: T["type"]) =>
  blocks.find((b) => b?.type === type) as T | undefined;

export const VARIANTS: { id: V2Variant; name: string; blurb: string }[] = [
  { id: "css", name: "CSS only", blurb: "No library. Reveal on scroll, CSS marquees, hover motion. Lightest and the most robust." },
  { id: "sticky", name: "Sticky panels", blurb: "position:sticky plus a 40-line scroll reader. The pinned feel at almost no weight." },
  { id: "full", name: "Full — GSAP + Lenis + Framer", blurb: "Smooth scroll, two scrubbed pins, parallax rows and spring entrances. Closest to the reference." },
];

export default function V2Home({ blocks, settings, variant }: { blocks: Block[]; settings: SettingsMap; variant: V2Variant }) {
  const contact = settings.contact;
  const hero = pick<HeroBlock>(blocks, "hero");
  const stats = pick<StatsBlock>(blocks, "stats");
  const offer = pick<OfferBlock>(blocks, "offer");
  const steps = pick<StepsBlock>(blocks, "steps");
  const countries = pick<CountriesBlock>(blocks, "countries");
  const unis = pick<UniversitiesBlock>(blocks, "universities");
  const voices = pick<TestimonialsBlock>(blocks, "testimonials");
  const webinar = pick<WebinarBlock>(blocks, "webinar");
  const campus = pick<CampusBlock>(blocks, "campus");
  const cta = pick<CtaBlock>(blocks, "cta");

  return (
    <div className={`v2 v2--${variant}`} data-variant={variant}>
      <V2Motion variant={variant} />
      {hero ? <V2Hero b={hero} contact={contact} labels={settings.labels} /> : null}
      {stats ? <V2Numbers b={stats} /> : null}
      {offer && unis && countries ? <V2Stack offer={offer} unis={unis} countries={countries} contact={contact} /> : null}
      {steps ? <V2Pipeline b={steps} contact={contact} /> : null}
      {offer ? <V2Bento b={offer} contact={contact} /> : null}
      {voices ? <V2Voices b={voices} /> : null}
      {webinar ? <V2Events b={webinar} contact={contact} /> : null}
      <V2Marquee />
      {campus ? <V2Centres b={campus} contact={contact} /> : null}
      {cta ? <V2Boarding b={cta} contact={contact} /> : null}
    </div>
  );
}
