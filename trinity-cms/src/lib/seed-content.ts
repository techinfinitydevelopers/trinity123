/* Default site content — mirrors the original static export exactly.
   Used by `prisma db seed` and by the admin "Reset to default" action. */
import type { Block, BandBlock, StatsBlock, CountriesBlock, OfferBlock } from "./blocks";

const IMG = "/assets/img";
const C = "/contact-us";

export const band: BandBlock = {
  type: "band",
  items: [
    { text: "Dream Big. Make It Happen.", strong: true }, { text: "33+ Countries" }, { text: "1100 Universities" },
    { text: "100,000+ Courses" }, { text: "Free Counselling" }, { text: "Visa Support" },
  ],
};

export const stats: StatsBlock = {
  type: "stats",
  items: [
    { count: 30, suffix: "+", label: "Years of Experience" }, { count: 33, suffix: "+", label: "Countries" },
    { count: 1100, suffix: "", label: "Universities" }, { count: 100000, suffix: "+", label: "Courses" },
  ],
};

const countryItems: CountriesBlock["items"] = [
  { flag: "us", name: "USA", tag: "Top-ranked universities", href: "/destinations/usa" },
  { flag: "au", name: "Australia", tag: "Post-study work visa", href: "/destinations/australia" },
  { flag: "ca", name: "Canada", tag: "PR-friendly pathways", href: "/destinations/canada" },
  { flag: "dk", name: "Denmark", tag: "Innovation & design", href: "/destinations/denmark" },
  { flag: "fr", name: "France", tag: "Business & fashion", href: "/destinations/france" },
  { flag: "de", name: "Germany", tag: "Low-tuition engineering", href: "/destinations/germany" },
  { flag: "ie", name: "Ireland", tag: "Tech & pharma hub", href: "/destinations/ireland" },
  { flag: "it", name: "Italy", tag: "Arts & architecture", href: "/destinations/italy" },
  { flag: "se", name: "Sweden", tag: "Sustainability leaders", href: "/destinations/sweden" },
  { flag: "gb", name: "UK", tag: "1-year master’s", href: "/destinations/uk" },
  { flag: "nz", name: "New Zealand", tag: "Safe & scenic study", href: "/destinations/new-zealand" },
];
const darkCountry = { num: "33", text: "Countries & counting", small: "Ask us about yours", href: C };

export const offer: OfferBlock = {
  type: "offer", kicker: "What We Offer", title: "Discover Our Comprehensive [Study Abroad] Solutions",
  cards: [
    { img: `${IMG}/unversity/z2.jpg`, icon: `${IMG}/icons/h2_features_icon01.svg`, metric: "1100+", metricLabel: "Universities", title: "Expert Universities", text: "Access top-ranked global universities tailored to your goals.", href: C },
    { img: `${IMG}/unversity/z5.jpg`, icon: `${IMG}/icons/h2_features_icon02.svg`, metric: "100,000+", metricLabel: "Courses", title: "Effective Courses", text: "Choose from a wide range of courses designed to enhance your skills.", href: C },
    { img: `${IMG}/unversity/z9.jpg`, icon: `${IMG}/icons/h2_features_icon03.svg`, metric: "33+", metricLabel: "Countries", title: "Certificates", text: "Gain valuable certifications to boost your career prospects.", href: C },
  ],
};

const homeBlocks: Block[] = [
  {
    type: "hero",
    badge: "Your Gateway to Global Education", badgeIcon: "fas fa-globe-asia", sideText: "Est. 1982 · Mumbai · Trinity Group",
    words: [{ t: "Transform" }, { t: "Your", br: true }, { t: "Future", s: "gold", br: true }, { t: "with" }, { t: "TSA", s: "grad" }],
    capsuleImg: `${IMG}/unversity/z1.jpg`,
    text: "Studying abroad is a transformative journey that opens doors to world-class education, new skills, and a global mindset. Let Trinity Study Abroad help you with end-to-end solutions for your international education journey.",
    primary: { label: "Learn More", href: C }, ghost: { label: "Chat with us", href: "whatsapp" },
    stats: [{ value: "33+", label: "Countries" }, { value: "1100+", label: "Universities" }, { value: "100k+", label: "Courses" }],
    flags: ["us", "gb", "ca", "au", "de", "ie"], centerImg: `${IMG}/home/home-page.png`, centerLabel: "Think Global",
    chipA: { icon: "fas fa-university", strong: "1100+", small: "Partner Universities" },
    chipB: { icon: "fas fa-passport", strong: "Visa Success", small: "End-to-end support" },
    chipCText: "Trusted by students",
  },
  band,
  {
    type: "about",
    mainImg: `${IMG}/home/inner_about_img-1.jpg`, mainAlt: "Trinity Study Abroad team", capSmall: "Since 1982", capStrong: "A unit of Trinity Air Travel & Tours Pvt. Ltd.",
    sideImg: `${IMG}/unversity/z8.jpg`, sideAlt: "University campus", statNum: "42", statText: "Years of legacy in travel, visas & global education",
    chip: { strong: "Trusted Consultants", small: "Mumbai · Est. 1982" },
    kicker: "About Trinity", title: "Transform Your Future [with TSA]",
    paragraphs: [
      "Looking to study abroad? Studying abroad is a transformative journey that opens doors to world-class education, new skills, and a global mindset. It's your chance to enhance your employability and explore the world through an international lens.",
      "We're a solution-oriented company dedicated to crafting personalized career paths that fit your unique educational, financial, and personal needs. Let us help you navigate your overseas education journey with tailored solutions just for you!",
    ],
    tags: [
      { icon: "fas fa-globe-europe", text: "Your Global Education, Our Expertise." },
      { icon: "fas fa-rocket", text: "Study Globally, Succeed Anywhere." },
      { icon: "fas fa-heart", text: "Your Future, Our Priority." },
    ],
    primary: { label: "Learn More", href: C }, showPhone: true,
  },
  offer,
  {
    type: "steps", kicker: "How It Works", title: "Your Journey, [Step by Step]",
    steps: [
      { icon: "fas fa-compass", title: "Career Counselling", text: "Our expert counsellors evaluate your interests, academic background and aspirations to craft a clear, strategic roadmap for your higher education goals.", checks: ["Profile Evaluation", "Country Selection", "Course Shortlist", "Budget Planning"], img: `${IMG}/home/inner_about_img-1.jpg`, chipIcon: "fas fa-user-graduate", chipStrong: "1:1", chipSmall: "Personal counsellor", live: "Free first consultation", href: C },
      { icon: "fas fa-university", title: "University Admissions", text: "From shortlisting universities to application submission, we ensure accuracy, compliance and competitive positioning across UK, Ireland, Germany, USA, Australia and more.", checks: ["SOP & LOR Drafting", "Applications", "Offer Letters", "Deadline Tracking"], img: `${IMG}/unversity/z1.jpg`, chipIcon: "fas fa-university", chipStrong: "1100+", chipSmall: "Partner universities", live: "Applications in progress", href: C },
      { icon: "fas fa-passport", title: "Visa & Financial Aid", text: "Document preparation, mock interviews, scholarship identification and education loan support — a confident, well-prepared application every time.", checks: ["Visa Interview Prep", "Scholarships", "Education Loans", "Financial Proof"], img: `${IMG}/unversity/z8.jpg`, chipIcon: "fas fa-passport", chipStrong: "33+", chipSmall: "Countries covered", live: "Mock interviews weekly", href: C },
      { icon: "fas fa-plane-departure", title: "Departure & Beyond", text: "Accommodation, forex, travel checklist, insurance and settlement guidance. Our support continues even after you arrive.", checks: ["Accommodation", "Forex & Travel", "Health Insurance", "Post-arrival Help"], img: `${IMG}/unversity/z4.jpg`, chipIcon: "fas fa-plane", chipStrong: "42+", chipSmall: "Years in travel", live: "Support after you land", href: C },
    ],
  },
  {
    type: "countries", kicker: "Trending Categories", title: "Explore Educational Opportunities [Across the Globe]",
    lead: "We connect students with world-class education in 33+ countries, giving you access to some of the best universities and courses internationally. Whether you're looking to study in the USA, Canada, UK, or any of the major education destinations, we have you covered.",
    layout: "split", marquee: true, items: countryItems, dark: darkCountry,
  },
  {
    type: "universities", kicker: "1100 Universities", title: "Explore Our World's {Best Courses}", ghost: "UNIVERSITIES · WORLDWIDE · 1100+",
    lead: "Choose from over 1,100 renowned universities worldwide, ranging from Ivy League institutions to globally recognized universities in every field of study.",
    items: [
      { img: `${IMG}/unversity/z1.jpg`, name: "University College London", flag: "gb", city: "London", rating: "4.8", href: C },
      { img: `${IMG}/unversity/z2.jpg`, name: "University of Warwick", flag: "gb", city: "Warwick", rating: "4.5", href: C },
      { img: `${IMG}/unversity/z3.jpg`, name: "University of Edinburgh", flag: "gb", city: "Edinburgh", rating: "4.3", href: C },
      { img: `${IMG}/unversity/z4.jpg`, name: "University of Dayton", flag: "us", city: "Dayton", rating: "4.8", href: C },
      { img: `${IMG}/unversity/z5.jpg`, name: "Florida International University", flag: "us", city: "Florida", rating: "4.5", href: C },
      { img: `${IMG}/unversity/z6.jpg`, name: "University Of Alberta", flag: "ca", city: "USA", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z7.jpg`, name: "University of Waterloo", flag: "ca", city: "Waterloo", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z8.jpg`, name: "University College Dublin", flag: "ie", city: "Dublin", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z9.jpg`, name: "University of Galway, Ireland", flag: "ie", city: "Galway", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z10.jpg`, name: "Berlin School of Business and Innovation", flag: "de", city: "Berlin", rating: "4.7", href: C },
    ],
  },
  stats,
  {
    type: "cta", layout: "split", badgeIcon: "fas fa-star", badge: "Dream Big. Make It Happen.", title: "Start Your Learning Journey {Today!}",
    text: "Take the first step toward global education with Trinity Study Abroad. We'll guide you through every stage to make your international study dreams come true!",
    checks: ["Free first consultation", "End-to-end visa support", "1100+ universities"],
    primary: { label: "Register Now", href: C }, secondary: { label: "Call us now", href: "phone" }, secondaryKind: "phone",
    img: `${IMG}/home/home-page-2.png`,
    chipA: { icon: "fas fa-envelope-open-text", strong: "Offer Letter", small: "Received · Fall intake" },
    chipB: { icon: "fas fa-passport", strong: "Visa Approved", small: "Ready to fly" },
  },
  {
    type: "faq", kicker: "FAQ'S", title: "Frequently Asked [Questions]", lead: "Find concise answers to common questions about our services and study abroad process.",
    chat: {
      name: "Trinity Counsellor", status: "Online · replies within minutes",
      msgs: [
        { dir: "in", text: "Hi! Planning to study abroad? Which country are you considering?" },
        { dir: "out", text: "UK or Ireland — Master's in IT. Confused about visa & loans." },
        { dir: "in", text: "We handle both — shortlist, SOP, visa interview prep and education loan support. Free counselling call?" },
        { dir: "out", text: "Yes, book it!", gold: true },
      ],
      btn: "Ask your question on WhatsApp",
    },
    items: [
      { q: "What services do you offer?", a: "We provide guidance on country and course selection, admission assistance, documentation support, language coaching, visa preparation, Entrance Exam Coaching, Education Loan Assistance, Accommodation Assistance." },
      { q: "How do you help with choosing a country?", a: "We offer personalized advice based on your preferences and goals to help you select the best country for your studies." },
      { q: "What assistance do you provide for courses and universities?", a: "We guide you through course and university options and help you make informed decisions." },
      { q: "How do you assist with admission and documentation?", a: "We help with university applications and ensure all documentation is correctly completed." },
    ],
  },
];

const aboutBlocks: Block[] = [
  {
    type: "pageHero", ghost: "ABOUT US", crumb: "About Us",
    words: [{ t: "Empowering" }, { t: "Global", br: true }, { t: "Education", s: "gold" }, { t: "Since" }, { t: "1982" }],
    sub: "A unit of Trinity Air Travel & Tours Pvt. Ltd. — a well-established 42-year-old company in travel & tourism, now guiding students to universities worldwide.",
    aside: { kind: "statchips", items: [
      { strong: "42", suffix: "+", small: "Years legacy", style: "glass" },
      { strong: "33", suffix: "+", small: "Countries", style: "gold" },
      { strong: "1100", small: "Partner universities", style: "purple", icon: "fas fa-university" },
    ] },
  },
  band,
  {
    type: "about",
    mainImg: `${IMG}/home/inner_about_img-1.jpg`, mainAlt: "Trinity Study Abroad", capSmall: "Our Founder", capStrong: "Mr Baby John", capSpan: "Industry veteran & visionary",
    sideImg: `${IMG}/unversity/z3.jpg`, sideAlt: "University of Edinburgh", statNum: "42", statText: "Years in travel, visas & global education", chip: null,
    kicker: "Our Story", title: "Empowering Global Education [with Decades of Expertise.]",
    paragraphs: [
      "Trinity Study Abroad is a unit of Trinity Air Travel & Tours Pvt. Ltd. which is a well-established 42-year-old company in the field of travel & tourism.",
      "Our Founder, Mr Baby John is a well-known industry veteran who has taken the company to great heights by his vision, determination, courage & hard work. His vision to provide students a platform to study abroad led him to start this venture.",
    ],
    tags: [
      { icon: "fas fa-globe-europe", text: "Your Global Education, Our Expertise." },
      { icon: "fas fa-rocket", text: "Study Globally, Succeed Anywhere." },
      { icon: "fas fa-heart", text: "Your Future, Our Priority." },
    ],
    primary: { label: "Learn More", href: C }, showPhone: false,
  },
  offer,
  {
    type: "journey", kicker: "Start Today", title: "Start your Learning {Journey Today!}",
    lead: "Take the first step toward global education with Trinity Study Abroad. We'll guide you through every stage to make your international study dreams come true!",
    cards: [
      { icon: `${IMG}/icons/features_icon01.svg`, title: "Learn from Global Experts", text: "Get personalized guidance from international education specialists for your study abroad journey." },
      { icon: `${IMG}/icons/features_icon02.svg`, title: "Explore Global Programs", text: "Find courses and programs tailored to your career goals at top universities worldwide." },
      { icon: `${IMG}/icons/features_icon03.svg`, title: "Earn International Certification", text: "Gain recognized qualifications to boost your global career prospects." },
      { icon: `${IMG}/icons/features_icon04.svg`, title: "Stay Informed", text: "Get expert advice on visas, applications, and studying abroad with ease." },
    ],
  },
  {
    type: "testimonials", kicker: "Testimonials", title: "Stories of [Success]", lead: "Real students. Real admits. Hear from those who made it.",
    items: [
      { img: `${IMG}/home/client-2.png`, name: "Rohan Nair – Mumbai", course: "Master's in IT · Arizona State University", text: "I am extremely grateful to Trinity Study Abroad for their invaluable support during my journey to pursue my Master's degree in IT at Arizona State University, from which I graduated in December 2023. They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals. Their guidance throughout the application process, the documentation preparation, and the overall journey was exceptional. I would highly recommend Trinity Study Abroad if you are planning to pursue overseas education." },
      { img: `${IMG}/home/client-1.png`, name: "Sharanya Santosh – Mumbai", course: "Master's · Maynooth University, Ireland", text: "I am thankful to Trinity Study Abroad in helping me with the admission and visa process for pursuing my Master's degree in Ireland. Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview process. I am joining Maynooth University in Ireland for the Fall 2024 intake. Thank you Trinity Study Abroad for making this possible." },
    ],
  },
];

const whyBlocks: Block[] = [
  {
    type: "pageHero", ghost: "WHY STUDY ABROAD", crumb: "Why Study Abroad",
    words: [{ t: "Your" }, { t: "Global", br: true }, { t: "Education", s: "gold" }, { t: "Partner" }],
    sub: "Top-ranking universities, 3–5 year stay-back options and a single-window team that walks with you from counselling to arrival.",
    aside: { kind: "visual", img: `${IMG}/home/banner-1.png`, chipA: { big: "3–5 Yrs", small: "Stay-back options" }, chipB: { icon: "fas fa-briefcase", strong: "Work Globally", small: "International experience" } },
  },
  band,
  {
    type: "intro", kicker: "One-Stop Solution", title: "TRINITY Study Abroad — Your [Global Education Partner]",
    paragraph: "At TRINITY Study Abroad, we are more than just an overseas education consultancy, we are your trusted advisors on the path to international success. With deep expertise in global admissions and student support, we empower aspiring students from India to confidently pursue their academic dreams in top universities around the world.",
    noteIcon: "fas fa-lightbulb", noteStrong: "Trinity Study Abroad is a one-stop solution for all your study abroad needs.",
    noteText: "Studying abroad gives you the chance to attend top-ranking global universities, enhancing your skills and broadening your horizons. With stay-back options ranging from 3 to 5 years, you can gain valuable work experience at international companies, boosting your career prospects on a global scale.",
    wideImg: `${IMG}/unversity/z6.jpg`, wideAlt: "University of Alberta", sqImg: `${IMG}/unversity/z7.jpg`, sqAlt: "University of Waterloo", statNum: "100k", statText: "Courses across every field of study",
  },
  {
    type: "featureCards", kicker: "Why Choose Us", title: "Why Choose [TRINITY Study Abroad?]",
    lead: "We combine personalized guidance with global insights to make your study abroad journey smooth and successful. Our experienced team works closely with you, understanding your strengths, ambitions, and unique academic profile to craft a clear, strategic roadmap for your higher education goals.",
    cards: [
      { icon: "fas fa-compass", title: "Personalized Roadmap", text: "A clear, strategic plan built around your strengths, ambitions and academic profile." },
      { icon: "fas fa-university", title: "Top-Ranking Universities", text: "Access to 1100+ institutions across the UK, Ireland, France, Germany, Dubai, USA, Australia, Canada & Europe." },
      { icon: "fas fa-briefcase", title: "3–5 Year Stay-back", text: "Gain valuable work experience at international companies after graduation." },
      { icon: "fas fa-hands-helping", title: "Single-Window Support", text: "Admissions, documentation, visa, loans, forex, travel and accommodation — all under one roof." },
    ],
  },
  stats,
  {
    type: "countries", kicker: "Study Worldwide", title: "Our Global [Destinations]",
    lead: "We assist you in choosing the most suitable destination based on academic goals, career prospects, scholarships, and lifestyle preferences.",
    layout: "center", marquee: false, items: countryItems, dark: darkCountry,
  },
];

const serviceBlocks: Block[] = [
  {
    type: "pageHero", ghost: "OUR SERVICES", crumb: "Our Services",
    words: [{ t: "End-to-End", br: true }, { t: "Guidance", s: "gold" }, { t: "for" }, { t: "Your", br: true }, { t: "Journey" }],
    sub: "Eight comprehensive services covering everything from career counselling to post-study work visas — all under one roof.",
    aside: { kind: "svcchips", items: [
      { icon: "fas fa-user-graduate", label: "Career Counselling" }, { icon: "fas fa-university", label: "University Admissions" },
      { icon: "fas fa-passport", label: "Visa Counselling" }, { icon: "fas fa-plane-departure", label: "Post-departure Support" },
    ] },
  },
  band,
  {
    type: "services", kicker: "What We Do", title: "Our Comprehensive [Services]", lead: "End-to-end guidance for your international education journey.",
    items: [
      { icon: "fas fa-user-graduate", title: "Career Counselling & Personalized Guidance", text: "Choosing the right career path is the first and most important step in your academic journey. Our expert counsellors provide tailored advice after carefully evaluating your interests, academic background, and future aspirations — helping you make informed decisions that align with your professional goals.", checks: [], wide: false, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-globe-americas", title: "Overseas University Admissions", text: "We guide you through every step of the admissions process for undergraduate, graduate, and Post Graduate programs across leading study abroad destinations like UK, Ireland, France, Germany, Dubai, Australia, New Zealand. From shortlisting universities to application submission, we ensure accuracy, compliance, and competitive positioning.", checks: [], wide: false, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-file-alt", title: "Study Abroad Documentation Support", text: "From writing an impactful Statement of Purpose (SOP) to preparing your Resume and Recommendation Letters, our team helps you present your strongest candidature to global universities.", checks: [], wide: false, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-pen-alt", title: "Test Preparation & Academic Readiness", text: "Achieving high scores in standardized tests is key to unlocking top university offers. TRINITY Study Abroad supports students with guidance and resources for exams such as IELTS, TOEFL, GMAT, GRE, SAT, and more — setting you up for success on paper and beyond.", checks: [], wide: false, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-passport", title: "Student Visa Counselling & Compliance Assistance", text: "Securing your student visa can be overwhelming without the right guidance. Our visa counselling experts walk you through each requirement — from document preparation to interview readiness — ensuring a confident and well-prepared application.", checks: [], wide: false, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-coins", title: "Scholarships, Loans & Financial Aid", text: "Studying abroad is an investment — and we help you maximise it. TRINITY assists in identifying scholarship opportunities and financial aid options to make international education more accessible.", checks: [], wide: false, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-plane-departure", title: "Pre- and Post-departure Assistance", text: "At Trinity Study Abroad, we don't stop once your admission is confirmed.", checks: ["University & Course Briefing", "Education Loan Support", "Accommodation Support", "Financial Planning & Forex Advice", "Visa & Immigration Guidance", "Packing & Travel Checklist", "Medical/Health Insurance Assistance", "Cultural & Lifestyle Orientation"], wide: true, href: C, linkLabel: "Talk to an expert" },
      { icon: "fas fa-building", title: "Post-study Work Visa and PR Guidance", text: "Support that continues even after you arrive.", checks: ["Bank Account & SIM Setup Guidance", "Part-Time Work & Student Rights Awareness", "Arrival & Settlement Guidance", "Financial Planning & Forex Advice", "Local Registration & Compliance Help"], wide: true, href: C, linkLabel: "Talk to an expert" },
    ],
  },
  {
    type: "cta", layout: "center", badgeIcon: "fas fa-star", badge: "Free Consultation", title: "Start Your Global Education Journey {Today}",
    text: "Get expert guidance for admissions, visas, scholarships, and documentation. TRINITY Study Abroad helps you reach top universities across the world.",
    checks: [], primary: { label: "Book Free Consultation", href: C }, secondary: { label: "Call with Us", href: "whatsapp" }, secondaryKind: "whatsapp",
    img: "", chipA: { strong: "", small: "" }, chipB: { strong: "", small: "" },
  },
];

const contactBlocks: Block[] = [
  {
    type: "pageHero", ghost: "CONTACT US", crumb: "Contact Us",
    words: [{ t: "Let's" }, { t: "Plan" }, { t: "Your", br: true }, { t: "Future", s: "gold" }, { t: "Together" }],
    sub: "We're here to help you every step of the way on your study abroad journey. Whether you have questions about countries, universities, or our services, feel free to reach out!",
    aside: { kind: "quick" },
  },
  {
    type: "contact", kicker: "Enquire Now", title: "Want to Know [More Details?]", lead: "Talk to our experts — we'll get back to you quickly.",
    okMsg: "Message received! Our team will confirm your slot shortly.",
    mapChipStrong: "Kumar Plaza, Kalina", mapChipSmall: "Santacruz (E), Mumbai",
    joinStrong: "Join students who made it", joinSmall: "Free first consultation · Reply within minutes",
  },
];

const blogBlocks: Block[] = [
  {
    type: "pageHero", ghost: "BLOG", crumb: "Blog", short: true,
    words: [{ t: "Study Abroad", br: true }, { t: "Insights", s: "gold" }, { t: "& Guides" }],
    sub: "Practical advice from our counsellors on countries, visas, applications and life abroad — written for Indian students and parents.",
    aside: { kind: "none" },
  },
  { type: "blogList", tags: ["Country Guide", "Visa", "Applications", "Scholarships", "Test Prep"] },
  {
    type: "cta", layout: "center", badgeIcon: "fas fa-envelope", badge: "Have a question?", title: "Get personalised answers, {not generic advice}",
    text: "Every profile is different. Book a free counselling session and get a roadmap built for yours.",
    checks: [], primary: { label: "Book Free Consultation", href: C }, secondary: { label: "WhatsApp", href: "whatsapp" }, secondaryKind: "whatsapp",
    img: "", chipA: { strong: "", small: "" }, chipB: { strong: "", small: "" },
  },
];

export const seedPages = [
  { slug: "home", title: "Trinity Study Abroad - Your Gateway to Global Education", navLabel: "Home", seoDesc: "Welcome to Trinity Study Abroad, your trusted partner in unlocking global opportunities for higher education. Tailored guidance and complete support for students aiming to study in 33+ countries, including the USA, UK, Canada, and Australia.", blocks: homeBlocks, isSystem: true },
  { slug: "about-us", title: "About Us - Trinity Study Abroad", navLabel: "About Us", seoDesc: "Trinity Study Abroad is a unit of Trinity Air Travel & Tours Pvt. Ltd., a 42-year-old Mumbai company guiding students to 1100+ universities in 33+ countries.", blocks: aboutBlocks, isSystem: true },
  { slug: "why-study-abroad", title: "Why Study Abroad - Trinity Study Abroad", navLabel: "Why Study Abroad", seoDesc: "Top-ranking universities, 3–5 year stay-back options and single-window support — why Indian students choose Trinity Study Abroad.", blocks: whyBlocks, isSystem: true },
  { slug: "our-service", title: "Our Services - Trinity Study Abroad", navLabel: "Our Services", seoDesc: "Eight comprehensive services covering everything from career counselling to post-study work visas — all under one roof.", blocks: serviceBlocks, isSystem: true },
  { slug: "contact-us", title: "Contact Us - Trinity Study Abroad", navLabel: "Contact Us", seoDesc: "Get in touch with Trinity Study Abroad in Mumbai for free study abroad counselling. Call +91-8453045304 or email helpdesk@trinitystudyabroad.com.", blocks: contactBlocks, isSystem: true },
  { slug: "blog", title: "Study Abroad Blog - Guides, Visa Tips & University Advice | Trinity Study Abroad", navLabel: "Blog", seoDesc: "Practical advice from our counsellors on countries, visas, applications and life abroad — written for Indian students and parents.", blocks: blogBlocks, isSystem: true },
];

export const seedPosts = [
  {
    slug: "how-to-choose-the-right-country-to-study-abroad", title: "How to Choose the Right Country to Study Abroad in 2026", category: "Country Guide", readMins: 8,
    coverImage: `${IMG}/unversity/z1.jpg`, publishedAt: new Date("2026-08-12"), authorName: "Trinity Counselling Team",
    excerpt: "A practical framework for Indian students to compare the USA, UK, Canada, Australia, Ireland and Germany on cost, stay-back visas, intake timelines and career outcomes.",
    body: `<p class="post__intro">Choosing where to study is the single biggest decision in your study-abroad journey — it decides your budget, your visa route and the job market you graduate into. Here is the framework our counsellors use in every first consultation.</p>
<h2 id="budget">1. Start with your total budget</h2>
<p>Tuition is only part of the picture. Add living costs, health insurance, visa fees, flights and a safety buffer for one full year. As a rough guide for Indian students:</p>
<ul><li><strong>USA</strong> – highest tuition band, strong scholarships and assistantships for master's students.</li><li><strong>UK &amp; Ireland</strong> – one-year master's programmes reduce total living cost significantly.</li><li><strong>Germany</strong> – many public universities charge no or very low tuition; you fund living costs via a blocked account.</li><li><strong>Canada &amp; Australia</strong> – mid-to-high tuition, balanced by generous part-time work allowances.</li></ul>
<h2 id="stayback">2. Compare post-study work (stay-back) rules</h2>
<p>Stay-back options range from <strong>2 to 5 years</strong> depending on country and qualification level. If working abroad after graduation matters to you, weigh this as heavily as university rank. Rules change often — always confirm the current policy before applying.</p>
<blockquote>“Rank the country first, the university second. A great university in a country with no work route rarely delivers the career outcome students expect.” — Trinity Counsellor</blockquote>
<h2 id="courses">3. Match the course to the country</h2>
<p>Every destination has strengths: Germany for engineering, Ireland for technology and pharma, the UK for business and law, Canada for healthcare and IT, Australia for hospitality and nursing, the USA for research-heavy STEM. Shortlist the country where your field has the deepest employer base.</p>
<h2 id="intakes">4. Understand intake timelines</h2>
<p>Most countries run a major <strong>Fall (September)</strong> intake and a smaller <strong>Spring (January)</strong> intake. Work backwards 10–12 months: tests, SOP and LORs, applications, offer, finances, visa. Starting late is the most common reason students defer a year.</p>
<h2 id="checklist">5. Quick decision checklist</h2>
<ol><li>Can I fund year one fully, including a buffer?</li><li>Does the country offer a stay-back route for my degree level?</li><li>Is my field hiring strongly there?</li><li>Do I meet the language / test requirements in time for the intake?</li><li>Do I have a realistic backup country?</li></ol>
<p>Still unsure? Book a free counselling session and we will map all five points to your profile in under an hour.</p>`,
    faqs: [
      { q: "Which country is cheapest for Indian students?", a: "Germany is typically the lowest-cost option because most public universities charge little or no tuition; Ireland and the UK reduce total cost through one-year master’s programmes." },
      { q: "How early should I start planning?", a: "Ideally 10–12 months before the intake to leave time for tests, documentation and visa processing." },
    ],
  },
  {
    slug: "student-visa-interview-tips-for-indian-students", title: "Student Visa Interview: 12 Questions You Must Prepare For", category: "Visa", readMins: 6,
    coverImage: `${IMG}/unversity/z8.jpg`, publishedAt: new Date("2026-07-28"), authorName: "Trinity Visa Desk",
    excerpt: "The most common student visa interview questions for the USA, UK, Canada and Ireland — with the answers visa officers actually want to hear, from Trinity’s visa counsellors.",
    body: `<p class="post__intro">A visa interview is less about your grades and more about three things: genuine intent to study, ability to pay, and intent to comply with visa rules. Every question below tests one of those.</p>
<h2 id="why">Why the interview matters</h2>
<p>Officers spend only a few minutes per applicant. Clear, consistent, confident answers backed by documents win; memorised speeches and vague finances lose.</p>
<h2 id="questions">The 12 questions</h2>
<ol><li>Why did you choose this university?</li><li>Why this course, and how does it connect to your background?</li><li>Why not study this course in India?</li><li>Who is sponsoring your education?</li><li>What is your sponsor’s annual income and occupation?</li><li>Have you taken an education loan? From which bank?</li><li>What are your plans after graduation?</li><li>Do you have relatives in the destination country?</li><li>What was your test score (IELTS / TOEFL / GRE)?</li><li>How many universities did you apply to, and where else were you accepted?</li><li>Where will you stay?</li><li>What do you know about the city / campus?</li></ol>
<h2 id="documents">Documents to carry</h2>
<ul><li>Offer / acceptance letter and fee receipts</li><li>Passport and appointment confirmation</li><li>Financial proof: bank statements, loan sanction letter, sponsor ITRs</li><li>Academic transcripts and test score reports</li><li>Statement of Purpose copy</li></ul>
<h2 id="mistakes">Mistakes that cause refusals</h2>
<p>Inconsistent finances, unclear course-to-career logic, over-rehearsed answers and hinting at permanent settlement are the top four. Our mock interviews target exactly these gaps before the real appointment.</p>`,
    faqs: [
      { q: "How long is a student visa interview?", a: "Usually 3–5 minutes for the USA; UK, Canada and Ireland decisions are largely document-based with interviews only in specific cases." },
      { q: "Can Trinity help with mock interviews?", a: "Yes — visa counselling includes document review and mock interviews as part of our services." },
    ],
  },
  {
    slug: "how-to-write-a-statement-of-purpose-sop", title: "How to Write a Statement of Purpose (SOP) That Gets Admits", category: "Applications", readMins: 7,
    coverImage: `${IMG}/unversity/z2.jpg`, publishedAt: new Date("2026-07-10"), authorName: "Trinity Documentation Team",
    excerpt: "A step-by-step SOP structure used by Trinity Study Abroad documentation experts — with paragraph-by-paragraph guidance, word counts and common mistakes to avoid.",
    body: `<p class="post__intro">Admissions committees read hundreds of SOPs. Yours needs a clear story: where you come from, what you want to study, why here, and where it leads. Here is the structure we refine with every student.</p>
<h2 id="structure">The 5-paragraph structure (800–1000 words)</h2>
<ol><li><strong>Hook &amp; motivation</strong> – a specific moment that sparked your interest (120 words)</li><li><strong>Academic background</strong> – relevant courses, projects, results (200 words)</li><li><strong>Professional / project experience</strong> – what you built, learned, led (200 words)</li><li><strong>Why this programme &amp; university</strong> – modules, labs, professors, industry links (250 words)</li><li><strong>Career goals &amp; closing</strong> – short and long-term plan, contribution back home (150 words)</li></ol>
<h2 id="hook">Opening: a specific hook</h2>
<p>Avoid “Since childhood I have been fascinated by…”. Start with a concrete problem you tried to solve, a dataset you analysed or a product you shipped. Specific beats poetic.</p>
<h2 id="fit">Proving university fit</h2>
<p>Name two or three modules, a research group or a placement programme and say exactly how each connects to your goal. This paragraph is where most SOPs are generic — and where yours can stand out.</p>
<h2 id="mistakes">Common mistakes</h2>
<ul><li>Repeating your CV line by line</li><li>Copying templates found online (universities run plagiarism checks)</li><li>Exceeding the word limit</li><li>No mention of career plans after the degree</li></ul>
<h2 id="checklist">Final checklist</h2>
<p>Read it aloud, ask a mentor to review it, tailor the fit paragraph for every university, and keep a master version. Our team reviews SOPs, LORs and resumes as part of documentation support.</p>`,
    faqs: [
      { q: "How long should an SOP be?", a: "Most universities expect 800–1000 words unless they specify otherwise; always follow the university’s stated limit." },
      { q: "Should I use the same SOP for every university?", a: "Keep the core story but rewrite the “why this university” paragraph for each application." },
    ],
  },
];

export const seedKnowledge = [
  { question: "What services does Trinity Study Abroad offer?", answer: "Career counselling, university admissions (UG/PG), SOP/LOR/resume documentation, test prep guidance (IELTS, TOEFL, GMAT, GRE, SAT), student visa counselling and mock interviews, scholarships and education loan assistance, pre-departure (accommodation, forex, insurance, travel checklist) and post-arrival support, plus post-study work visa and PR guidance.", tags: "services" },
  { question: "Which countries do you cover?", answer: "33+ countries including USA, UK, Canada, Australia, Ireland, Germany, France, Italy, Denmark, Sweden, New Zealand and Dubai, with 1100+ partner universities.", tags: "countries" },
  { question: "Is the first consultation free?", answer: "Yes. The first counselling session is free. Book via the contact form, call +91-8453045304 or WhatsApp the same number.", tags: "pricing,consultation" },
  { question: "Where is your office?", answer: "301, 3rd Floor, Kumar Plaza, Kalina-Kurla Road, Kalina, Santacruz (East), Mumbai 400029. Landline +91-22-69655855.", tags: "contact,office" },
  { question: "How early should I start planning?", answer: "Ideally 10–12 months before the intake. Major intake is Fall (September); a smaller Spring (January) intake exists in most countries.", tags: "timeline,intake" },
  { question: "What stay-back / post-study work options exist?", answer: "Depending on country and degree level, stay-back ranges from 2 to 5 years. Rules change often — our counsellors confirm the current policy for your target country.", tags: "visa,stayback" },
  { question: "Do you help with education loans?", answer: "Yes. We assist with identifying scholarships and arranging education loans, including financial proof documentation for visas.", tags: "loans,finance" },
  { question: "Who founded Trinity Study Abroad?", answer: "Trinity Study Abroad is a unit of Trinity Air Travel & Tours Pvt. Ltd. (est. 1982), founded by Mr Baby John, an industry veteran with 42+ years in travel and visas.", tags: "about" },
];
