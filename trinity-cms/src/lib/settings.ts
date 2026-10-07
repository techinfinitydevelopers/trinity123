
/* ---------- Typed settings ---------- */

export type ThemeSettings = {
  primary: string; primary2: string; navy: string; navy2: string; navy3: string;
  gold: string; gold2: string; text: string; muted: string; grey: string; line: string;
  cream: string; teal: string;
  fontHeading: string; fontBody: string; radiusCard: number; radiusPill: number; container: number;
};

/** One icon in the header, footer and contact rail. `href` may be the sentinel "whatsapp",
    which resolves against the WhatsApp number below. */
export type SocialLink = { label: string; icon: string; href: string };

export type ContactSettings = {
  phones: string[]; landline: string; email: string; whatsapp: string;
  address: string; mapEmbed: string; hours: string;
  /** The editable list. Add, rename, reorder or remove any platform. */
  socialLinks: SocialLink[];
  /** Superseded by `socialLinks`. Kept so settings rows written before the change still load,
      and so `scripts/apply-social-links.mjs` can carry old edits across. */
  socials: { facebook: string; twitter: string; instagram: string; linkedin: string; youtube: string };
};

export type NavItem = { label: string; href: string };
export type NavSettings = { items: NavItem[]; ctaLabel: string; ctaHref: string };

export type ChatbotSettings = {
  enabled: boolean; name: string; greeting: string;
  /** 0–1. Below this, the matcher treats the question as unanswered instead of guessing. */
  matchThreshold: number;
  unmatchedMessage: string;
  urgentMessage: string;
  /** Where urgent-query email alerts go. Falls back to contact.email when empty. */
  notifyEmail: string;
  /** Everything the widget paints besides the messages themselves. */
  ui: {
    nudgeTitle: string; nudgeText: string; status: string;
    gateIntro: string; gateName: string; gateNamePlaceholder: string;
    gateEmail: string; gateEmailPlaceholder: string; gatePhone: string; gatePhonePlaceholder: string;
    gateFoot: string; inputPlaceholder: string; disclaimer: string;
    callButton: string; messageButton: string;
  };
};

/* The footer strings that used to be hard-coded in `Footer.tsx`. The rest of the footer already
   came from `site`, `nav` and `contact`; these are the last pieces, so the owner can reword the
   whole band without a deploy. */
export type FooterSettings = {
  ctaKicker: string; ctaTitle: string;
  ctaPrimaryLabel: string; ctaPrimaryHref: string; ctaSecondaryLabel: string;
  linksTitle: string; destinationsTitle: string; contactTitle: string;
  marqueeWord: string;
  poweredByText: string; poweredByUrl: string;
};

/* Every remaining word the site paints that does not come from a page block, a post or a country
   record: button captions, form labels, breadcrumbs, the destination template's section headings,
   the blog furniture and the two error screens. They used to be literals inside components, which
   meant the owner had to call us to change "Enroll Now". `{country}` in a destination string is
   replaced with the country's name; [square brackets] mark the accent-coloured words. */
export type LabelSettings = {
  header: { destinations: string; searchPlaceholder: string; callLabel: string };
  common: {
    home: string; scrollLabel: string; scrollHint: string; explore: string; enrollNow: string;
    getStarted: string; readArticle: string; ghostWord: string; duration: string; strongestIn: string;
    backToTop: string; whatsappLabel: string; ratingLabel: string; reviews: string;
    quickWhatsappSmall: string; quickWhatsappStrong: string; quickCallSmall: string; quickEmailSmall: string;
    avatarImage1: string; avatarImage2: string;
    heroPhotoAlt: string; asideImageAlt: string; ctaImageAlt: string;
  };
  contactCards: { phone: string; email: string; office: string; mapTitle: string };
  forms: {
    name: string; email: string; phone: string; subject: string; message: string;
    namePlaceholder: string; emailPlaceholder: string; phonePlaceholder: string;
    subjectPlaceholder: string; messagePlaceholder: string;
    leadName: string; leadEmail: string; leadPhone: string; leadCity: string; leadDestination: string;
  };
  blog: {
    allTag: string; blogCrumb: string; empty: string; onThisPage: string; published: string; share: string; topics: string;
    keyTakeaways: string; asideTitle: string; asideText: string; asideButton: string;
    profileTitle: string; profileText: string; profileButton: string; faqTitle: string;
    destinationsTitle: string; destinationsText: string; sourcesTitle: string; sourcesNote: string;
    previous: string; next: string; reviewedBy: string; aboutLink: string;
    relatedKicker: string; relatedTitle: string;
  };
  search: {
    kicker: string; heading: string; lead: string; placeholder: string; submit: string;
    emptyPrompt: string; noMatchText: string; counsellorButton: string;
    destinationsKicker: string; articlesKicker: string;
  };
  errors: {
    notFoundBadge: string; notFoundTitle: string; notFoundText: string;
    errorBadge: string; errorTitle: string; errorText: string; tryAgain: string; goHome: string;
  };
  destination: {
    crumbDestinations: string; heroButton: string; onThisPage: string;
    jumpWhy: string; jumpCosts: string; jumpRequirements: string; jumpScholarships: string;
    jumpVisa: string; jumpWork: string; jumpFaq: string;
    whyTitle: string; popularCourses: string; visaRequirements: string; intakes: string;
    costKicker: string; costTitle: string; costNote: string;
    admissionTitle: string; fundingTitle: string; fundingButton: string;
    visaKicker: string; visaTitle: string; workTitle: string;
    universitiesKicker: string; universitiesTitle: string;
    faqNote: string; faqButton: string;
    otherKicker: string; otherTitle: string;
    ctaBadge: string; ctaTitle: string; ctaText: string; ctaPrimary: string; ctaSecondary: string;
  };
};

export type SiteSettings = {
  siteName: string; tagline: string; logo: string; footerText: string; copyright: string;
  gaId: string;
};

export const DEFAULTS: SettingsMap = {
  /* Trinity brand palette (client brand sheet, 2026): Trinity Blue #232F70 · Sky #5B84C4 ·
     Teal #1ABC9C · Gold #F7DD7D · Cream #FFE8BE · Charcoal #333 · Grey #6B7280 · Light grey #F5F7FA */
  theme: {
    primary: "#232F70", primary2: "#5B84C4", navy: "#232F70", navy2: "#2E3D8C", navy3: "#1A2456",
    gold: "#F7DD7D", gold2: "#F0D064", text: "#333333", muted: "#6B7280", grey: "#F5F7FA", line: "#E4E8F0",
    cream: "#FFE8BE", teal: "#1ABC9C",
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
    socialLinks: [
      { label: "Facebook", icon: "fab fa-facebook-f", href: "https://www.facebook.com/profile.php?id=61565625483023" },
      { label: "X (Twitter)", icon: "fab fa-twitter", href: "https://x.com/study96945" },
      { label: "Instagram", icon: "fab fa-instagram", href: "https://www.instagram.com/trinity.study.abroad" },
      { label: "WhatsApp", icon: "fab fa-whatsapp", href: "whatsapp" },
      { label: "LinkedIn", icon: "fab fa-linkedin-in", href: "https://www.linkedin.com/company/105107420/" },
      { label: "YouTube", icon: "fab fa-youtube", href: "https://www.youtube.com/channel/UCcPkrTigM5QARLpFqgEXxVg" },
    ],
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
    greeting: "Hi! 👋 I'm the Trinity Study Abroad assistant. Share a few details and I'll help with countries, courses, visas, fees or intakes. Please ask your questions in English.",
    matchThreshold: 0.55,
    unmatchedMessage: "I couldn't find a suitable answer to your question. Would you like to contact our support team?",
    urgentMessage: "Thanks — I've flagged this as urgent for our team. Someone will reach out to you shortly, or call us right away for immediate help.",
    notifyEmail: "",
    ui: {
      nudgeTitle: "Planning to study abroad?",
      nudgeText: "Ask me about countries, fees, visas or intakes.",
      status: "Online \u00b7 usually replies instantly",
      gateIntro: "Before we chat, tell us a little about you. Please ask your questions in English.",
      gateName: "Full name", gateNamePlaceholder: "e.g. Rahul Sharma",
      gateEmail: "Email address", gateEmailPlaceholder: "e.g. rahul@gmail.com",
      gatePhone: "Phone number", gatePhonePlaceholder: "e.g. 9876543210",
      gateFoot: "We\u2019ll only use these details to help with your enquiry.",
      inputPlaceholder: "Ask your question in English\u2026",
      disclaimer: "AI assistant \u2014 please confirm fees and visa rules with a counsellor.",
      callButton: "Call Support", messageButton: "Send Message",
    },
  } satisfies ChatbotSettings,
  site: {
    siteName: "Trinity Study Abroad",
    tagline: "Every Dream Needs a Direction",
    logo: "/assets/img/logo/logo.png",
    footerText: "Trinity Study Abroad guides Indian students to top universities across 50+ countries — counselling, admissions, visas and beyond.",
    copyright: "Copyright © Trinity Study Abroad Private Limited. All Rights Reserved.",
    gaId: "",
  } satisfies SiteSettings,
  labels: {
    header: { destinations: "Study Destinations", searchPlaceholder: "Search universities or courses…", callLabel: "Call us" },
    common: {
      home: "Home", scrollLabel: "Scroll", scrollHint: "Scroll to explore", explore: "Explore", enrollNow: "Enroll Now",
      getStarted: "Get started", readArticle: "Read article", ghostWord: "GO GLOBAL", duration: "Duration", strongestIn: "Strongest in",
      backToTop: "Back to top", whatsappLabel: "Chat on WhatsApp", ratingLabel: "5 star rating", reviews: "Reviews",
      quickWhatsappSmall: "Fastest reply", quickWhatsappStrong: "Chat on WhatsApp", quickCallSmall: "Call us", quickEmailSmall: "Email",
      avatarImage1: "/assets/img/home/client-1.png", avatarImage2: "/assets/img/home/client-2.png",
      heroPhotoAlt: "Student ready to study abroad", asideImageAlt: "Students abroad", ctaImageAlt: "Student holding folder",
    },
    contactCards: { phone: "Phone", email: "E-mail Address", office: "Head Office", mapTitle: "Office location" },
    forms: {
      name: "Full Name", email: "Email", phone: "Phone Number", subject: "Subject", message: "Message",
      namePlaceholder: "Your full name", emailPlaceholder: "you@example.com", phonePlaceholder: "+91",
      subjectPlaceholder: "Country / course / visa", messagePlaceholder: "Tell us about your plans",
      leadName: "Name", leadEmail: "Email ID", leadPhone: "Mobile No",
      leadCity: "Choose Nearest City", leadDestination: "Destination(s) of Interest",
    },
    blog: {
      allTag: "All", blogCrumb: "Blog", empty: "No articles yet.", onThisPage: "On this page", published: "Published",
      share: "Share", topics: "Topics", keyTakeaways: "Key takeaways",
      asideTitle: "Need help with this?", asideText: "Free 1:1 counselling with a Trinity expert.", asideButton: "Book a call",
      profileTitle: "Want this mapped to your profile?",
      profileText: "A counsellor will review your academics, budget and target intake — free of charge.",
      profileButton: "Book free counselling", faqTitle: "Frequently asked questions",
      destinationsTitle: "Explore destinations mentioned in this guide",
      destinationsText: "Country-wise costs, entry requirements, visa steps and stay-back rules.",
      sourcesTitle: "Sources & further reading",
      sourcesNote: "Visa rules, fees and stay-back periods change frequently. Always confirm current requirements with the official source or with a Trinity counsellor before applying.",
      previous: "Previous", next: "Next",
      reviewedBy: "Reviewed by Trinity’s senior counselling desk · 42+ years of student placements",
      aboutLink: "About us", relatedKicker: "Keep reading", relatedTitle: "Related [articles]",
    },
    search: {
      kicker: "Search", heading: "Find a destination or a guide",
      lead: "Search our study destinations, courses and counselling guides.",
      placeholder: "Try “Canada”, “MBA” or “student visa”", submit: "Search",
      emptyPrompt: "Type something above to get started.",
      noMatchText: "Try a country name, a course, or a topic like “scholarships”. Our counsellors can also answer directly.",
      counsellorButton: "Ask a counsellor", destinationsKicker: "Study destinations", articlesKicker: "Guides & articles",
    },
    errors: {
      notFoundBadge: "404", notFoundTitle: "Page [not found]",
      notFoundText: "The page you’re looking for doesn’t exist or was moved.",
      errorBadge: "Something went wrong", errorTitle: "We hit a [snag]",
      errorText: "This page didn’t load properly. Please try again — or just call us, we’re happy to help right away.",
      tryAgain: "Try again", goHome: "Go home",
    },
    destination: {
      crumbDestinations: "Destinations", heroButton: "Get free counselling", onThisPage: "On this page",
      jumpWhy: "Why {country}", jumpCosts: "Costs", jumpRequirements: "Requirements", jumpScholarships: "Scholarships",
      jumpVisa: "Visa process", jumpWork: "Work & PR", jumpFaq: "FAQs",
      whyTitle: "Why study in [{country}]", popularCourses: "Popular courses",
      visaRequirements: "Visa requirements", intakes: "Intakes & timeline",
      costKicker: "Money matters", costTitle: "Cost of studying in [{country}]",
      costNote: "Indicative figures for a one-year budget. Your counsellor prepares a written estimate for your exact course and city.",
      admissionTitle: "Admission requirements", fundingTitle: "Scholarships & financial aid",
      fundingButton: "Check what you qualify for",
      visaKicker: "Step by step", visaTitle: "The visa process, simplified", workTitle: "Work & settlement options",
      universitiesKicker: "Partner institutions", universitiesTitle: "Universities we place students in",
      faqNote: "Still unsure about something? Our counsellors answer profile-specific questions free of charge.",
      faqButton: "Ask a counsellor",
      otherKicker: "Compare destinations", otherTitle: "Other [study destinations]",
      ctaBadge: "Free counselling", ctaTitle: "Ready to apply to [{country}]?",
      ctaText: "42 years of experience, 1200+ partner universities and end-to-end support — from shortlisting to your first week on campus.",
      ctaPrimary: "Book free consultation", ctaSecondary: "Chat on WhatsApp",
    },
  } satisfies LabelSettings,
  footer: {
    ctaKicker: "Dream Big · Make It Happen",
    ctaTitle: "Ready to start your study abroad journey?",
    ctaPrimaryLabel: "Book Free Consultation",
    ctaPrimaryHref: "/contact-us",
    ctaSecondaryLabel: "WhatsApp",
    linksTitle: "Quick Links",
    destinationsTitle: "Destinations",
    contactTitle: "Get in Touch",
    marqueeWord: "Think Global",
    poweredByText: "Itarsia India Limited",
    poweredByUrl: "https://www.itarsia.com/",
  } satisfies FooterSettings,
};

export type SettingsMap = { theme: ThemeSettings; contact: ContactSettings; nav: NavSettings; chatbot: ChatbotSettings; site: SiteSettings; footer: FooterSettings; labels: LabelSettings };
export type SettingsKey = keyof SettingsMap;
