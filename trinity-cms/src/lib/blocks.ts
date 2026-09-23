/* Block content model. Every page = ordered Block[] stored as JSON on Page.blocks.
   The admin editor renders a form per block type; the site renders the matching component. */

export type Word = { t: string; s?: "gold" | "grad"; br?: boolean };
export type Btn = { label: string; href: string; icon?: string; external?: boolean };
export type Chip = { icon?: string; strong: string; small: string };

export type HeroBlock = {
  type: "hero";
  sideText: string;
  words: Word[]; capsuleImg: string; text: string;
  primary: Btn; ghost: Btn;
  stats: { value: string; label: string }[];
  photo: string; chipCText: string;
  hive: { img: string; value: string; label: string }[];
};

export type PageHeroBlock = {
  type: "pageHero";
  ghost: string; crumb: string; words: Word[]; sub: string; short?: boolean;
  aside:
    | { kind: "none" }
    | { kind: "statchips"; items: { strong: string; suffix?: string; small: string; style: "glass" | "gold" | "purple"; icon?: string }[] }
    | { kind: "visual"; img: string; chipA: { big: string; small: string }; chipB: Chip }
    | { kind: "svcchips"; items: { icon: string; label: string }[] }
    | { kind: "quick" };
};

export type BandBlock = { type: "band"; items: { text: string; strong?: boolean }[] };

export type AboutBlock = {
  type: "about";
  mainImg: string; mainAlt: string; capSmall: string; capStrong: string; capSpan?: string;
  sideImg: string; sideAlt: string; statNum: string; statText: string;
  chip?: { strong: string; small: string } | null;
  kicker: string; title: string; paragraphs: string[];
  tags: { icon: string; text: string }[];
  primary: Btn; showPhone: boolean;
};

export type OfferBlock = {
  type: "offer"; kicker: string; title: string;
  cards: { img: string; icon: string; metric: string; metricLabel: string; title: string; text: string; href: string }[];
};

export type StepsBlock = {
  type: "steps"; kicker: string; title: string;
  steps: { icon: string; title: string; text: string; checks: string[]; img: string; chipIcon: string; chipStrong: string; chipSmall: string; live: string; href: string }[];
};

export type CountriesBlock = {
  type: "countries"; kicker: string; title: string; lead: string; layout: "split" | "center"; marquee: boolean;
  items: { flag: string; name: string; tag: string; href: string }[];
  dark: { num: string; text: string; small: string; href: string };
};

export type UniversitiesBlock = {
  type: "universities"; kicker: string; title: string; lead: string; ghost: string;
  items: { img: string; name: string; flag: string; city: string; rating: string; href: string }[];
};

export type StatsBlock = { type: "stats"; items: { count: number; suffix: string; label: string }[] };

export type CtaBlock = {
  type: "cta"; layout: "split" | "center";
  badgeIcon: string; badge: string; title: string; text: string;
  checks: string[]; primary: Btn; secondary: Btn; secondaryKind: "phone" | "whatsapp";
  img: string; chipA: Chip; chipB: Chip;
};

export type FaqBlock = {
  type: "faq"; kicker: string; title: string; lead: string;
  chat: { name: string; status: string; msgs: { dir: "in" | "out"; text: string; gold?: boolean }[]; btn: string };
  items: { q: string; a: string }[];
};

export type JourneyBlock = {
  type: "journey"; kicker: string; title: string; lead: string;
  cards: { icon: string; title: string; text: string }[];
};

export type TestimonialsBlock = {
  type: "testimonials"; kicker: string; title: string; lead: string;
  items: { img: string; name: string; course: string; text: string }[];
};

export type IntroBlock = {
  type: "intro"; kicker: string; title: string; paragraph: string; noteIcon: string; noteStrong: string; noteText: string;
  wideImg: string; wideAlt: string; sqImg: string; sqAlt: string; statNum: string; statText: string;
};

export type FeatureCardsBlock = {
  type: "featureCards"; kicker: string; title: string; lead: string;
  cards: { icon: string; title: string; text: string }[];
};

export type ServicesBlock = {
  type: "services"; kicker: string; title: string; lead: string;
  items: { icon: string; title: string; text: string; checks: string[]; wide: boolean; href: string; linkLabel: string }[];
};

export type ContactBlock = {
  type: "contact"; kicker: string; title: string; lead: string; okMsg: string; mapChipStrong: string; mapChipSmall: string; joinStrong: string; joinSmall: string;
};

export type BlogListBlock = { type: "blogList"; tags: string[] };

export type RichTextBlock = { type: "richText"; html: string; grey: boolean };

export type Block =
  | HeroBlock | PageHeroBlock | BandBlock | AboutBlock | OfferBlock | StepsBlock | CountriesBlock
  | UniversitiesBlock | StatsBlock | CtaBlock | FaqBlock | JourneyBlock | TestimonialsBlock
  | IntroBlock | FeatureCardsBlock | ServicesBlock | ContactBlock | BlogListBlock | RichTextBlock;

export type BlockType = Block["type"];

export const BLOCK_META: Record<BlockType, { label: string; desc: string }> = {
  hero: { label: "Home Hero", desc: "Animated headline, student photo, honeycomb stats" },
  pageHero: { label: "Page Hero", desc: "Inner page banner with breadcrumb" },
  band: { label: "Marquee Band", desc: "Scrolling ticker strip" },
  about: { label: "About Split", desc: "Bento images + story text" },
  offer: { label: "Offer Cards", desc: "3 image cards with metrics" },
  steps: { label: "Journey Steps", desc: "Stacked step cards" },
  countries: { label: "Countries Grid", desc: "Flag cards" },
  universities: { label: "Universities Scroller", desc: "Pinned horizontal scroller" },
  stats: { label: "Stats Counters", desc: "4 animated numbers" },
  cta: { label: "Call to Action", desc: "Dark CTA banner" },
  faq: { label: "FAQ", desc: "Accordion + chat preview" },
  journey: { label: "Dark Feature Grid", desc: "4 numbered cards on dark" },
  testimonials: { label: "Testimonials", desc: "Student stories" },
  intro: { label: "Intro Split", desc: "Text + note + bento images" },
  featureCards: { label: "Feature Cards", desc: "4 icon cards on grey" },
  services: { label: "Services Grid", desc: "Numbered service cards" },
  contact: { label: "Contact Section", desc: "Info cards, form, map" },
  blogList: { label: "Blog List", desc: "Latest posts from the blog" },
  richText: { label: "Rich Text", desc: "Free HTML content" },
};

/** Parse `[accent]` and `{gold}` markers inside headings. */
export function splitTitle(s: string): { t: string; cls?: string }[] {
  const out: { t: string; cls?: string }[] = [];
  const re = /\[([^\]]+)\]|\{([^}]+)\}/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    if (m[1] != null) out.push({ t: m[1], cls: "accent" });
    else out.push({ t: m[2], cls: "gold" });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  return out;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 96);
