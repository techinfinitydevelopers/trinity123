
/* ---------- Typed settings ---------- */

export type ThemeSettings = {
  primary: string; primary2: string; navy: string; navy2: string; navy3: string;
  gold: string; gold2: string; text: string; muted: string; grey: string; line: string;
  fontHeading: string; fontBody: string; radiusCard: number; radiusPill: number; container: number;
};

export type ContactSettings = {
  phones: string[]; landline: string; email: string; whatsapp: string;
  address: string; mapEmbed: string; hours: string;
  socials: { facebook: string; twitter: string; instagram: string; linkedin: string; youtube: string };
};

export type NavItem = { label: string; href: string };
export type NavSettings = { items: NavItem[]; ctaLabel: string; ctaHref: string };

export type ChatbotSettings = {
  enabled: boolean; name: string; greeting: string; systemPrompt: string;
  model: string; collectLead: boolean; handoffMessage: string;
};

export type SiteSettings = {
  siteName: string; tagline: string; logo: string; footerText: string; copyright: string;
  gaId: string;
};

export const DEFAULTS: SettingsMap = {
  theme: {
    primary: "#5751E1", primary2: "#4640c9", navy: "#161439", navy2: "#1C1A4A", navy3: "#0f0e2b",
    gold: "#FFC224", gold2: "#F8BC24", text: "#6D6C80", muted: "#7F7E97", grey: "#EFEFF2", line: "#E6EAEF",
    fontHeading: "Poppins", fontBody: "Inter", radiusCard: 28, radiusPill: 50, container: 1320,
  } satisfies ThemeSettings,
  contact: {
    phones: ["+91-8453045304", "+91-8828800367", "+91-8828800368"],
    landline: "+91-22-69655855",
    email: "helpdesk@trinitystudyabroad.com",
    whatsapp: "918453045304",
    address: "301- 3rd Floor, Kumar Plaza, Kalina-Kurla Road, Kalina, Santacruz-(E), Mumbai- 400029",
    mapEmbed: "",
    hours: "Mon – Sat · 10:00 AM – 7:00 PM",
    socials: {
      facebook: "https://www.facebook.com/profile.php?id=61565625483023",
      twitter: "https://x.com/study96945",
      instagram: "https://www.instagram.com/trinity.study.abroad",
      linkedin: "https://www.linkedin.com/company/105107420/",
      youtube: "https://www.youtube.com/channel/UCcPkrTigM5QARLpFqgEXxVg",
    },
  } satisfies ContactSettings,
  nav: {
    items: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
      { label: "Why Study Abroad", href: "/why-study-abroad" },
      { label: "Our Services", href: "/our-service" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact-us" },
    ],
    ctaLabel: "Free Counselling",
    ctaHref: "/contact-us",
  } satisfies NavSettings,
  chatbot: {
    enabled: true,
    name: "Trinity Assistant",
    greeting: "Hi! 👋 I'm the Trinity Study Abroad assistant. Ask me about countries, courses, visas, fees or intakes.",
    systemPrompt: "",
    model: "claude-opus-5",
    collectLead: true,
    handoffMessage: "I'll connect you with a counsellor. Please share your name and phone number.",
  } satisfies ChatbotSettings,
  site: {
    siteName: "Trinity Study Abroad",
    tagline: "Your Gateway to Global Education",
    logo: "/assets/img/logo/logo.png",
    footerText: "Trinity Study Abroad guides Indian students to top universities across 11 countries — counselling, admissions, visas and beyond.",
    copyright: "Copyright © Trinity Study Abroad Private Limited. All Rights Reserved.",
    gaId: "",
  } satisfies SiteSettings,
};

export type SettingsMap = { theme: ThemeSettings; contact: ContactSettings; nav: NavSettings; chatbot: ChatbotSettings; site: SiteSettings };
export type SettingsKey = keyof SettingsMap;
