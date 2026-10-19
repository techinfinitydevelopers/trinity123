/* Default site content — mirrors the original static export exactly.
   Used by `prisma db seed` and by the admin "Reset to default" action. */
import type { Block, BandBlock, UspBlock, LeadFormBlock, WorldMapBlock, CoursesBlock, TestimonialsBlock, StatsBlock, CountriesBlock, OfferBlock, CampusBlock, WebinarBlock, VisionBlock} from "./blocks";

const IMG = "/assets/img";
const C = "/contact-us";

export const band: BandBlock = {
  type: "band",
  items: [
    { text: "Dream Big. Make It Happen.", strong: true }, { text: "50+ Countries" }, { text: "1200 Universities" },
    { text: "1 lakh+ Courses" }, { text: "Free Counselling" }, { text: "Visa Support" },
  ],
};

/* Client's USP list, in their order. `center` is pinned over the middle of the rail. */
export const usp: UspBlock = {
  type: "usp",
  center: "One Stop Solution",
  /* The brief lists the services twice — a bold arrow flow and a highlighted numbered list — and
     its editorial note [e] says "do not use the highlighted content, use the content in Bold".
     So this is the bold flow, in its order. The numbered list's extras are deliberately gone. */
  items: [
    "Personalized Guidance", "Profile Evaluation", "Test Preps", "University Shortlisting",
    "SOP & LOR Assistance", "University Application Support", "Scholarship Assistance",
    "Education Loan Guidance", "Student Visa Assistance", "Accommodation Assistance",
    "Pre-Departure Support",
  ],
};

/* Client's sample enquiry card (feedback 23/09/2026 item 6), beside the picture + tagline. */
export const leadForm: LeadFormBlock = {
  type: "leadForm",
  kicker: "Talk to a counsellor",
  tagline: "Every Dream Needs [a Direction]",
  text: "Tell us where you want to study and a Trinity counsellor will call you back — no cost, no obligation.",
  image: `${IMG}/home/home-page-2.png`,
  imageAlt: "Student ready to study abroad",
  formTitle: "Get in touch with us",
  submitLabel: "Contact me",
  okMsg: "Thank you — a counsellor will call you within one working day.",
  cities: ["Mumbai", "Navi Mumbai", "Thane", "Pune", "Other"],
  /* Keep in step with the destinations table — scripts/sync-form-destinations-2026-10-16.ts
     rebuilds this from it on a live database. */
  destinations: ["USA", "UK", "Canada", "Ireland", "Germany", "Australia", "New Zealand", "France", "Italy", "Sweden", "Denmark", "Dubai", "Singapore", "Not decided yet"],
};

/* Study destinations on a world map (client brief 29/09). The pins themselves are generated —
   see scripts/build-world-map.mjs. */
export const campus: CampusBlock = {
  type: "campus",
  kicker: "What we offer",
  title: "Find your [Campus]",
  lead: "Our counsellors help students look beyond rankings to understand academic fit, location, employability, affordability and student experience.",
  prompt: "Select one of the two below",
  options: [
    {
      id: "public", label: "Public Universities", sub: "State-funded, and the entry bar is fixed",
      img: `${IMG}/campus/public.webp`, imgAlt: "A public university quadrangle",
      criteriaTitle: "Criteria to apply",
      criteria: [
        "CGPA of more than 75%",
        "No academic backlogs or failed subjects",
        "No education gaps",
        "Past research, internships or work experience",
      ],
      logosTitle: "Public universities we place students in",
      logosNote: "", logos: [],
      href: "/contact-us", linkLabel: "Check if you qualify",
    },
    {
      id: "private", label: "Private Universities", sub: "Wider intake, and more courses to choose from",
      img: `${IMG}/campus/private.webp`, imgAlt: "Students walking through a private university campus",
      criteriaTitle: "", criteria: [],
      logosTitle: "Private universities we place students in",
      logosNote: "", logos: [],
      href: "/why-study-abroad", linkLabel: "See study destinations",
    },
  ],
};

export const webinar: WebinarBlock = {
  type: "webinar",
  kicker: "Be updated",
  title: "Knowledge [Hub]",
  lead: "Live sessions with our counsellors on countries, courses, visas and funding \u2014 free to attend, and open to parents too.",
  currentTitle: "Coming up",
  /* Empty until the client sends the dates. Saying so beats inventing a webinar. */
  currentNote: "The next session will be announced here. Register your interest and we will email you the date.",
  ctaLabel: "Register now",
  ctaHref: "/contact-us",
  current: [],
  pastTitle: "From our past webinars",
  pastNote: "Snippets from recent sessions are on their way.",
  /* The client's own photographs from their most recent webinar. They came without captions, so
     the strip shows the pictures alone until someone adds a title or a date in the editor. */
  past: [1, 2, 3, 4, 5, 6].map((n) => ({ title: "", when: "", img: `${IMG}/webinar/snippet-${n}.webp`, href: "" })),
};

export const vision: VisionBlock = {
  type: "vision",
  kicker: "In their words",
  title: "Our Vision to [their Journey]",
  lead: "Our counsellors, and the students who went through it \u2014 in their own words rather than ours.",
  videos: [
    { title: "Management speaks", name: "Trinity Study Abroad", youtube: "", poster: `${IMG}/unversity/z6.jpg`, note: "" },
    { title: "A student's journey", name: "Sushant", youtube: "https://youtube.com/shorts/LwHzS7EqjhA", poster: `${IMG}/campus/private.webp`, note: "" },
    { title: "Getting the visa", name: "Vaibhavi", youtube: "", poster: `${IMG}/unversity/z8.jpg`, note: "" },
  ],
  href: "/success-stories", linkLabel: "Know more",
};

export const worldMap: WorldMapBlock = {
  type: "worldMap",
  kicker: "Explore · Learn · Grow",
  title: "Study Abroad, [Across the World]",
  lead: "Fourteen destinations, one counsellor who knows all of them. Follow the cap to see where Trinity places students.",
  note: "Your global future awaits.",
};

/* The fields Indian students actually apply for, in rough order of volume. Durations are the
   common range across our destinations; fees are left out on purpose — they vary too much by
   country and university for a single figure on a card to be honest. */
export const courses: CoursesBlock = {
  type: "courses",
  kicker: "What you can study",
  /* Section 5 of the brief: "add the above tagline instead of Courses". */
  title: "Choose a [Course]",
  lead: "Whatever you want to study, there is a route to it. These are the fields our students apply for most — tell us yours and we will shortlist the universities that fit.",
  items: [
    { icon: "fas fa-briefcase", name: "MBA & Management", text: "General and specialised MBAs, plus one-year management master's for students with work experience.", duration: "1 – 2 years", where: "UK, USA, Ireland" },
    { icon: "fas fa-laptop-code", name: "Computer Science & IT", text: "Software engineering, cybersecurity, cloud and networks — the largest intake across every destination we cover.", duration: "1 – 2 years", where: "USA, Canada, Germany" },
    { icon: "fas fa-chart-line", name: "Data Science & AI", text: "Machine learning, analytics and applied statistics, with strong post-study work demand.", duration: "1 – 2 years", where: "USA, UK, Canada" },
    { icon: "fas fa-cogs", name: "Engineering", text: "Mechanical, civil, electrical and automotive, including Germany's low-tuition public universities.", duration: "1.5 – 2 years", where: "Germany, Canada, Australia" },
    { icon: "fas fa-chart-pie", name: "Business Analytics", text: "A business degree with a quantitative core — popular with commerce and engineering graduates alike.", duration: "1 – 2 years", where: "UK, USA, Ireland" },
    { icon: "fas fa-heartbeat", name: "Nursing & Healthcare", text: "Nursing, public health and allied health, with registration pathways in the destination country.", duration: "2 – 4 years", where: "Australia, UK, New Zealand" },
    { icon: "fas fa-concierge-bell", name: "Hospitality & Tourism", text: "Hotel and tourism management with paid internships built into the course.", duration: "1 – 3 years", where: "Switzerland, Australia, UAE" },
    { icon: "fas fa-coins", name: "Finance & Accounting", text: "Finance, accounting and fintech, including courses aligned to ACCA and CFA.", duration: "1 – 2 years", where: "UK, Ireland, Canada" },
  ],
};

/* The two genuine student quotes we have. The client has asked for three more on the home
   page — a management message and two named students — but has not sent the words yet, and
   testimonials are not something to write on their behalf. They add them in the editor. */
export const testimonials: TestimonialsBlock = {
  type: "testimonials", kicker: "Testimonials", title: "Stories of [Success]",
  lead: "Real students. Real admits. Hear from those who made it.",
  items: [
    { img: `${IMG}/home/client-2.png`, name: "Rohan Nair – Mumbai", course: "Master's in IT · Arizona State University", text: "I am extremely grateful to Trinity Study Abroad for their invaluable support during my journey to pursue my Master's degree in IT at Arizona State University, from which I graduated in December 2023. They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals. Their guidance throughout the application process, the documentation preparation, and the overall journey was exceptional. I would highly recommend Trinity Study Abroad if you are planning to pursue overseas education." },
    { img: `${IMG}/home/client-1.png`, name: "Sharanya Santosh – Mumbai", course: "Master's · Maynooth University, Ireland", text: "I am thankful to Trinity Study Abroad in helping me with the admission and visa process for pursuing my Master's degree in Ireland. Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview process. I am joining Maynooth University in Ireland for the Fall 2024 intake. Thank you Trinity Study Abroad for making this possible." },
  ],
};

export const stats: StatsBlock = {
  type: "stats",
  items: [
    { count: 42, suffix: "+", label: "Years of Experience" }, { count: 50, suffix: "+", label: "Countries" },
    /* The hero strip and the honeycomb both say "1200+"; this one said a flat "1200", so the
       same claim appeared on one page two different ways. */
    { count: 1200, suffix: "+", label: "Universities" }, { count: 100000, suffix: "+", label: "Courses" },
  ],
};

/* The client's list and their order (brief, section 3). UAE, Singapore and the Netherlands have
   no destination page of their own yet, so they point at the destinations overview rather than a
   URL that would 404 — give me the country content and they become proper pages. */
const countryItems: CountriesBlock["items"] = [
  { flag: "gb", name: "UK", tag: "1-year master’s", href: "/destinations/uk" },
  { flag: "ie", name: "Ireland", tag: "Tech & pharma hub", href: "/destinations/ireland" },
  { flag: "fr", name: "France", tag: "Business & fashion", href: "/destinations/france" },
  { flag: "de", name: "Germany", tag: "Low-tuition engineering", href: "/destinations/germany" },
  { flag: "us", name: "USA", tag: "Top-ranked universities", href: "/destinations/usa" },
  { flag: "nz", name: "New Zealand", tag: "Safe & scenic study", href: "/destinations/new-zealand" },
  { flag: "au", name: "Australia", tag: "Post-study work visa", href: "/destinations/australia" },
  { flag: "ca", name: "Canada", tag: "PR-friendly pathways", href: "/destinations/canada" },
  /* Dubai and Singapore have their own pages now, so these point at them rather than the
     overview. The card is named for the page it opens. */
  { flag: "ae", name: "Dubai", tag: "Global campuses, close to home", href: "/destinations/dubai" },
  { flag: "sg", name: "Singapore", tag: "Business & technology hub", href: "/destinations/singapore" },
  { flag: "nl", name: "Netherlands", tag: "English-taught degrees", href: "/why-study-abroad" },
];
/* The card's markup already appends the "+", so `num` is the bare figure — putting it here too
   printed "39++". */
const darkCountry = { num: "39", text: "& counting", small: "Ask us about yours", href: C };

export const offer: OfferBlock = {
  type: "offer", kicker: "What We Offer", title: "Discover Our Comprehensive [Study Abroad] Solutions",
  cards: [
    { img: `${IMG}/unversity/z2.jpg`, icon: `${IMG}/icons/h2_features_icon01.svg`, metric: "1200+", metricLabel: "Universities", title: "Expert Universities", text: "Access top-ranked global universities tailored to your goals.", href: C },
    { img: `${IMG}/unversity/z5.jpg`, icon: `${IMG}/icons/h2_features_icon02.svg`, metric: "1 lakh+", metricLabel: "Courses", title: "Effective Courses", text: "Choose from a wide range of courses designed to enhance your skills.", href: C },
    { img: `${IMG}/unversity/z9.jpg`, icon: `${IMG}/icons/h2_features_icon03.svg`, metric: "50+", metricLabel: "Countries", title: "Certificates", text: "Gain valuable certifications to boost your career prospects.", href: C },
  ],
};

const homeBlocks: Block[] = [
  {
    type: "hero",
    sideText: "Est. 1982 · Mumbai · Trinity Group",
    /* `br` after "Dream" rather than letting it wrap: `.hero__title` is `white-space:nowrap` on
       desktop, so the two lines have to be set explicitly or the headline runs off the page. */
    words: [{ t: "Because" }, { t: "Every" }, { t: "Dream", s: "gold", br: true }, { t: "Needs" }, { t: "a" }, { t: "Direction", s: "grad" }],
    text: "Let Trinity Study Abroad help you find yours.",
    primary: { label: "Learn More", href: C }, ghost: { label: "Chat with us", href: "whatsapp" },
    stats: [{ value: "50+", label: "Countries" }, { value: "1200+", label: "Universities" }, { value: "1 lakh+", label: "Courses" }],
    photo: `${IMG}/home/hero-student.webp`,
    /* Second row of the hero. The fields and their options are the ones the standalone
       `leadForm` section used to carry, which is why they read the same. */
    form: {
      title: leadForm.formTitle, submitLabel: leadForm.submitLabel, okMsg: leadForm.okMsg,
      cities: leadForm.cities, destinations: leadForm.destinations,
    },
    chipCText: "Trusted by students",
    /* The client supplied a photograph for every cell, so all five carry one now. They are
       resized to 312x360 WebP in `public/assets/img/hive` — the originals were ~330KB PNGs for a
       104px tile. Each sits under a navy scrim, so the label still clears 4.5:1. */
    hive: [
      { value: "42+", label: "Years Experience", img: `${IMG}/hive/years.webp` },
      { value: "50+", label: "Countries", img: `${IMG}/hive/countries.webp` },
      { value: "1200+", label: "Universities", img: `${IMG}/hive/universities.webp` },
      { value: "1 lakh+", label: "Courses", img: `${IMG}/hive/courses.webp` },
      { value: "1", label: "Stop Solution", img: `${IMG}/hive/solution.webp` },
    ],
  },
  usp,
  {
    type: "countries", kicker: "Shape your direction", title: "Choose your [Country]",
    lead: "We connect students with world-class education in 50+ countries, giving you access to some of the best universities and courses internationally.",
    layout: "split", marquee: true, items: countryItems, dark: darkCountry,
  },
  worldMap,
  campus,
  {
    type: "about",
    mainImg: `${IMG}/home/inner_about_img-1.jpg`, mainAlt: "Trinity Study Abroad team", capSmall: "Since 1982", capStrong: "A unit of Trinity Air Travel & Tours Pvt. Ltd.",
    sideImg: `${IMG}/unversity/z8.jpg`, sideAlt: "University campus", statNum: "42", statText: "Years of legacy in travel, visas & global education",
    chip: { strong: "Trusted Consultants", small: "Mumbai · Est. 1982" },
    kicker: "About Trinity", title: "Four Decades of [Guiding Students]",
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
    /* Section 6 of the client's brief: their seven steps, their wording. The block keeps the
       existing "how it works" design, which is what the brief asks for. */
    type: "steps", kicker: "How It Works", title: "How Your Journey [Works]",
    steps: [
      { icon: "fas fa-compass", title: "Tell us your goals", text: "Course, career plans, budget and preferred destinations \u2014 we start by understanding where you want this to take you.", checks: ["Course", "Career plans", "Budget", "Destinations"], img: `${IMG}/home/inner_about_img-1.jpg`, chipIcon: "fas fa-user-graduate", chipStrong: "1:1", chipSmall: "Personal counsellor", live: "Free first consultation", href: C },
      { icon: "fas fa-clipboard-check", title: "Evaluate your profile", text: "Academics, experience, tests and eligibility, read honestly \u2014 so the options we put in front of you are ones you can actually get.", checks: ["Academics", "Experience", "Test scores", "Eligibility"], img: `${IMG}/unversity/z7.jpg`, chipIcon: "fas fa-chart-line", chipStrong: "42+", chipSmall: "Years reading profiles", live: "Profile review", href: C },
      { icon: "fas fa-tasks", title: "Build your shortlist", text: "Countries, courses and universities that fit the profile \u2014 not the ones that merely rank highest.", checks: ["Countries", "Courses", "Universities", "Intakes"], img: `${IMG}/unversity/z1.jpg`, chipIcon: "fas fa-university", chipStrong: "1200", chipSmall: "Partner universities", live: "Shortlists built weekly", href: C },
      { icon: "fas fa-file-signature", title: "Prepare and apply", text: "Documents, SOP and LOR, and the university applications themselves \u2014 prepared, checked and submitted on time.", checks: ["Documents", "SOP & LOR", "Applications", "Deadlines"], img: `${IMG}/unversity/z6.jpg`, chipIcon: "fas fa-file-alt", chipStrong: "100%", chipSmall: "Documents checked", live: "Applications in progress", href: C },
      { icon: "fas fa-coins", title: "Plan your finances and visa", text: "Scholarships, education loans, proof of funds and visa preparation \u2014 the part that most often decides the outcome.", checks: ["Scholarships", "Loans", "Proof of funds", "Visa prep"], img: `${IMG}/unversity/z8.jpg`, chipIcon: "fas fa-passport", chipStrong: "50+", chipSmall: "Countries covered", live: "Mock interviews weekly", href: C },
      { icon: "fas fa-plane-departure", title: "Get departure ready", text: "Accommodation, insurance, forex, flights and a pre-departure briefing, so the first week is not spent guessing.", checks: ["Accommodation", "Insurance", "Forex & flights", "Pre-departure"], img: `${IMG}/unversity/z4.jpg`, chipIcon: "fas fa-plane", chipStrong: "42+", chipSmall: "Years in travel", live: "Briefings before each intake", href: C },
      { icon: "fas fa-hands-helping", title: "Stay supported", text: "Practical post-arrival guidance once you land \u2014 bank account, SIM, registration, part-time work rules and settling in.", checks: ["Bank & SIM", "Registration", "Work rules", "Settling in"], img: `${IMG}/unversity/z9.jpg`, chipIcon: "fas fa-headset", chipStrong: "24/7", chipSmall: "Reachable from abroad", live: "Support after you land", href: C },
    ],
  },
  {
    type: "universities", kicker: "1200 Partner Institutions", title: "Universities", ghost: "UNIVERSITIES · WORLDWIDE · 1200+",
    lead: "Choose from over 1,200 renowned universities worldwide, ranging from Ivy League institutions to globally recognized universities in every field of study.",
    items: [
      { img: `${IMG}/unversity/z1.jpg`, name: "University College London", flag: "gb", city: "London", rating: "4.8", href: C },
      { img: `${IMG}/unversity/z2.jpg`, name: "University of Warwick", flag: "gb", city: "Warwick", rating: "4.5", href: C },
      { img: `${IMG}/unversity/z3.jpg`, name: "University of Edinburgh", flag: "gb", city: "Edinburgh", rating: "4.3", href: C },
      { img: `${IMG}/unversity/z4.jpg`, name: "University of Dayton", flag: "us", city: "Dayton", rating: "4.8", href: C },
      { img: `${IMG}/unversity/z5.jpg`, name: "Florida International University", flag: "us", city: "Florida", rating: "4.5", href: C },
      { img: `${IMG}/unversity/z6.jpg`, name: "University of Alberta", flag: "ca", city: "Edmonton", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z7.jpg`, name: "University of Waterloo", flag: "ca", city: "Waterloo", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z8.jpg`, name: "University College Dublin", flag: "ie", city: "Dublin", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z9.jpg`, name: "University of Galway, Ireland", flag: "ie", city: "Galway", rating: "4.7", href: C },
      { img: `${IMG}/unversity/z10.jpg`, name: "Berlin School of Business and Innovation", flag: "de", city: "Berlin", rating: "4.7", href: C },
    ],
  },
  courses,
  webinar,
  testimonials,
  vision,
  stats,
  {
    type: "cta", layout: "split", badgeIcon: "fas fa-star", badge: "Dream Big. Make It Happen.", title: "Start Your Learning Journey {Today!}",
    text: "Take the first step toward global education with Trinity Study Abroad. We'll guide you through every stage to make your international study dreams come true!",
    checks: ["Free first consultation", "End-to-end visa support", "1200+ universities"],
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
      { strong: "50", suffix: "+", small: "Countries", style: "gold" },
      { strong: "1200", small: "Partner universities", style: "purple", icon: "fas fa-university" },
    ] },
  },
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
  testimonials,
];

const whyBlocks: Block[] = [
  {
    type: "pageHero", ghost: "WHY STUDY ABROAD", crumb: "Why Study Abroad",
    words: [{ t: "Your" }, { t: "Global", br: true }, { t: "Education", s: "gold" }, { t: "Partner" }],
    sub: "Top-ranking universities, 3–5 year stay-back options and a single-window team that walks with you from counselling to arrival.",
    aside: { kind: "visual", img: `${IMG}/home/banner-1.png`, chipA: { big: "3–5 Yrs", small: "Stay-back options" }, chipB: { icon: "fas fa-briefcase", strong: "Work Globally", small: "International experience" } },
  },
  {
    type: "intro", kicker: "One-Stop Solution", title: "TRINITY Study Abroad — Your [Global Education Partner]",
    paragraph: "At TRINITY Study Abroad, we are more than just an overseas education consultancy, we are your trusted advisors on the path to international success. With deep expertise in global admissions and student support, we empower aspiring students from India to confidently pursue their academic dreams in top universities around the world.",
    noteIcon: "fas fa-lightbulb", noteStrong: "Trinity Study Abroad is a one-stop solution for all your study abroad needs.",
    noteText: "Studying abroad gives you the chance to attend top-ranking global universities, enhancing your skills and broadening your horizons. With stay-back options ranging from 3 to 5 years, you can gain valuable work experience at international companies, boosting your career prospects on a global scale.",
    wideImg: `${IMG}/unversity/z6.jpg`, wideAlt: "University of Alberta", sqImg: `${IMG}/unversity/z7.jpg`, sqAlt: "University of Waterloo", statNum: "1 lakh", statText: "Courses across every field of study",
  },
  {
    type: "featureCards", kicker: "Why Choose Us", title: "Why Choose [TRINITY Study Abroad?]",
    lead: "We combine personalized guidance with global insights to make your study abroad journey smooth and successful. Our experienced team works closely with you, understanding your strengths, ambitions, and unique academic profile to craft a clear, strategic roadmap for your higher education goals.",
    cards: [
      { icon: "fas fa-compass", title: "Personalized Roadmap", text: "A clear, strategic plan built around your strengths, ambitions and academic profile." },
      { icon: "fas fa-university", title: "Top-Ranking Universities", text: "Access to 1200+ institutions across the UK, Ireland, France, Germany, Dubai, USA, Australia, Canada & Europe." },
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

const successBlocks: Block[] = [
  {
    type: "pageHero", ghost: "SUCCESS STORIES", crumb: "Success Stories",
    words: [{ t: "Students" }, { t: "Who", br: true }, { t: "Made", s: "gold" }, { t: "It" }],
    sub: "Admits, visas and first semesters abroad \u2014 the students behind our numbers, in their own words.",
    aside: { kind: "statchips", items: [
      { strong: "42", suffix: "+", small: "Years placing students", style: "glass" },
      { strong: "1200", suffix: "", small: "Partner universities", style: "gold" },
      { strong: "50", suffix: "+", small: "Countries", style: "purple" },
    ] },
  },
  stats,
  { ...testimonials, kicker: "In Their Words", title: "Stories of [Success]", lead: "Every one of these started with a free counselling session. Yours can too." },
  {
    type: "journey", kicker: "How It Goes", title: "What a Trinity [Journey Looks Like]",
    lead: "The same five steps behind every story on this page.",
    cards: [
      { icon: "fas fa-comments", title: "Free counselling", text: "A counsellor reads your academics, budget and target intake, then maps the realistic options \u2014 not the expensive ones." },
      { icon: "fas fa-tasks", title: "Shortlist & apply", text: "Universities chosen for your profile, applications prepared and submitted with the documentation checked line by line." },
      { icon: "fas fa-envelope-open-text", title: "Offers in hand", text: "Offers compared on course content, fees, city and stay-back rules so the decision is made on facts." },
      { icon: "fas fa-passport", title: "Visa, cleared", text: "Financial documents, forms and interview preparation handled by the team that files them every week." },
      { icon: "fas fa-plane-departure", title: "Landed and settled", text: "Forex, accommodation, insurance and a pre-departure briefing \u2014 then a first week that is not spent guessing." },
    ],
  },
  {
    type: "cta", layout: "center", badgeIcon: "fas fa-star", badge: "Your story next", title: "Start the story {you will tell}",
    text: "Book a free counselling session. No fee, no obligation \u2014 just a clear reading of where your profile can take you.",
    checks: [], primary: { label: "Book Free Consultation", href: C }, secondary: { label: "WhatsApp", href: "whatsapp" }, secondaryKind: "whatsapp",
    img: "", chipA: { strong: "", small: "" }, chipB: { strong: "", small: "" },
  },
];

const resourcesBlocks: Block[] = [
  {
    type: "pageHero", ghost: "RESOURCES", crumb: "Resources",
    words: [{ t: "Everything" }, { t: "You", br: true }, { t: "Need", s: "gold" }, { t: "to Decide" }],
    sub: "Come and meet us at an event, or take the brochure home and read it with your family first.",
    aside: { kind: "svcchips", items: [
      { icon: "fas fa-calendar-alt", label: "Events & fairs" }, { icon: "fas fa-book-open", label: "Course brochure" },
      { icon: "fas fa-chalkboard-teacher", label: "Visa workshops" }, { icon: "fas fa-users", label: "Parent sessions" },
    ] },
  },
  {
    type: "services", kicker: "Resources", title: "Two Ways to [Start Reading]", lead: "Both are free, and neither commits you to anything.",
    items: [
      { icon: "fas fa-calendar-alt", title: "Events", text: "University fairs, spot-admission days, visa and documentation workshops, test-prep sessions and pre-departure briefings \u2014 held at our Mumbai office and online. Register your interest and we will tell you when the next one relevant to your country is scheduled.", checks: [], wide: false, href: "/events", linkLabel: "See what we run" },
      { icon: "fas fa-book-open", title: "Brochure", text: "Our study abroad brochure: the countries we place students in, what each one costs for a year, entry requirements, intake calendars and stay-back rules \u2014 in one document you can read with your family. Ask for it and we will email it to you.", checks: [], wide: false, href: "/brochure", linkLabel: "Request the brochure" },
    ],
  },
  {
    type: "cta", layout: "center", badgeIcon: "fas fa-question-circle", badge: "Prefer to just ask?", title: "Skip the reading and {talk to a counsellor}",
    text: "One free session answers more than a brochure can \u2014 because the answers are about your profile.",
    checks: [], primary: { label: "Book Free Consultation", href: C }, secondary: { label: "WhatsApp", href: "whatsapp" }, secondaryKind: "whatsapp",
    img: "", chipA: { strong: "", small: "" }, chipB: { strong: "", small: "" },
  },
];

const eventsBlocks: Block[] = [
  {
    type: "pageHero", ghost: "EVENTS", crumb: "Events",
    words: [{ t: "Meet" }, { t: "Us", br: true }, { t: "In Person", s: "gold" }],
    sub: "University fairs, spot-admission days and workshops \u2014 at our Mumbai office and online. Register your interest and we will tell you when the next relevant one is scheduled.",
    aside: { kind: "visual", img: `${IMG}/home/banner-1.png`, chipA: { big: "Mumbai", small: "Kalina, Santacruz (E)" }, chipB: { icon: "fas fa-video", strong: "Online too", small: "Join from anywhere" } },
  },
  {
    type: "featureCards", kicker: "What We Run", title: "The Events We [Hold]",
    lead: "Dates change with the intake calendar, so register your interest and we will write to you when one is confirmed.",
    cards: [
      { icon: "fas fa-university", title: "University fairs", text: "Delegates from partner universities in the UK, Ireland, Canada, Australia and Europe answer course, fee and campus questions directly \u2014 no middle layer." },
      { icon: "fas fa-file-signature", title: "Spot-admission days", text: "Bring your documents and receive a decision on the same day from visiting university representatives, with the application fee often waived." },
      { icon: "fas fa-passport", title: "Visa & documentation workshops", text: "A working session on financial documents, SOPs and the interview \u2014 the three places applications most often come apart." },
      { icon: "fas fa-pen-alt", title: "Test-prep sessions", text: "IELTS, TOEFL, GRE, GMAT and SAT briefings: what each test actually scores, how long to prepare, and which universities will accept what." },
      { icon: "fas fa-users", title: "Parent counselling evenings", text: "For the questions parents ask and students forget to: safety, part-time work rules, total cost over the full course, and what happens after graduation." },
      { icon: "fas fa-plane-departure", title: "Pre-departure briefings", text: "Held before each intake for students already holding a visa \u2014 forex, accommodation, insurance, packing and the first week on campus." },
    ],
  },
  { ...leadForm, kicker: "Register Interest", tagline: "Tell us what you want to [attend]", text: "We will write to you when the next event for your country or course is scheduled. No charge, and no obligation to attend.", formTitle: "Register your interest", submitLabel: "Notify me", okMsg: "Registered. We will email you as soon as the next relevant event is confirmed." },
  {
    type: "cta", layout: "center", badgeIcon: "fas fa-calendar-check", badge: "Cannot wait for the next one?", title: "Book a session {this week}",
    text: "Our counsellors meet students at the Mumbai office six days a week, and online whenever you are.",
    checks: [], primary: { label: "Book Free Consultation", href: C }, secondary: { label: "WhatsApp", href: "whatsapp" }, secondaryKind: "whatsapp",
    img: "", chipA: { strong: "", small: "" }, chipB: { strong: "", small: "" },
  },
];

const brochureBlocks: Block[] = [
  {
    type: "pageHero", ghost: "BROCHURE", crumb: "Brochure",
    words: [{ t: "Read" }, { t: "It", br: true }, { t: "Together", s: "gold" } ],
    sub: "Countries, costs, entry requirements, intakes and stay-back rules \u2014 in one document you can go through with your family before deciding anything.",
    aside: { kind: "statchips", items: [
      { strong: "50", suffix: "+", small: "Countries covered", style: "glass" },
      { strong: "1 lakh", suffix: "+", small: "Courses", style: "gold" },
      { strong: "100", suffix: "%", small: "Free, no obligation", style: "purple" },
    ] },
  },
  {
    type: "featureCards", kicker: "Inside", title: "What the [Brochure Covers]",
    lead: "The questions we are asked in almost every first counselling session, answered in writing.",
    cards: [
      { icon: "fas fa-globe-americas", title: "Country by country", text: "Every destination we place students in, with what it is strongest at academically and who it suits." },
      { icon: "fas fa-rupee-sign", title: "What a year costs", text: "Indicative tuition and living figures for a one-year budget, so the conversation at home starts from real numbers." },
      { icon: "fas fa-clipboard-check", title: "Entry requirements", text: "Academic scores, English tests and documents each country expects \u2014 and the gaps that get applications rejected." },
      { icon: "fas fa-calendar-alt", title: "Intake calendars", text: "When each country's intakes open and close, and how far ahead you need to start to make them." },
      { icon: "fas fa-briefcase", title: "Work & stay-back rules", text: "Part-time work limits while studying, and how long you may stay to work after you graduate." },
      { icon: "fas fa-coins", title: "Scholarships & loans", text: "The funding routes that actually apply to Indian students, and what each one needs from you." },
    ],
  },
  { ...leadForm, kicker: "Free Download", tagline: "Get the brochure in your [inbox]", text: "Tell us where to send it and which destination you are weighing up, and we will email the brochure along with the figures for that country.", formTitle: "Send me the brochure", submitLabel: "Email it to me", okMsg: "On its way. Check your inbox \u2014 and your spam folder, just in case." },
  {
    type: "cta", layout: "center", badgeIcon: "fas fa-comments", badge: "Read it already?", title: "Now get it mapped to {your profile}",
    text: "A brochure describes the options. A counselling session tells you which of them you will actually get into.",
    checks: [], primary: { label: "Book Free Consultation", href: C }, secondary: { label: "WhatsApp", href: "whatsapp" }, secondaryKind: "whatsapp",
    img: "", chipA: { strong: "", small: "" }, chipB: { strong: "", small: "" },
  },
];

export const seedPages = [
  { slug: "home", title: "Trinity Study Abroad — Every Dream Needs a Direction", navLabel: "Home", seoDesc: "Welcome to Trinity Study Abroad, your trusted partner in unlocking global opportunities for higher education. Tailored guidance and complete support for students aiming to study in 50+ countries, including the USA, UK, Canada, and Australia.", blocks: homeBlocks, isSystem: true },
  { slug: "about-us", title: "About Us - Trinity Study Abroad", navLabel: "About Us", seoDesc: "Trinity Study Abroad is a unit of Trinity Air Travel & Tours Pvt. Ltd., a 42-year-old Mumbai company guiding students to 1200+ universities in 50+ countries.", blocks: aboutBlocks, isSystem: true },
  { slug: "why-study-abroad", title: "Why Study Abroad - Trinity Study Abroad", navLabel: "Why Study Abroad", seoDesc: "Top-ranking universities, 3–5 year stay-back options and single-window support — why Indian students choose Trinity Study Abroad.", blocks: whyBlocks, isSystem: true },
  { slug: "our-service", title: "Our Services - Trinity Study Abroad", navLabel: "Our Services", seoDesc: "Eight comprehensive services covering everything from career counselling to post-study work visas — all under one roof.", blocks: serviceBlocks, isSystem: true },
  { slug: "contact-us", title: "Contact Us - Trinity Study Abroad", navLabel: "Contact Us", seoDesc: "Get in touch with Trinity Study Abroad in Mumbai for free study abroad counselling. Call +91-8453045304 or email helpdesk@trinitystudyabroad.com.", blocks: contactBlocks, isSystem: true },
  { slug: "success-stories", title: "Success Stories - Trinity Study Abroad", navLabel: "Success Stories", seoDesc: "Indian students placed by Trinity Study Abroad \u2014 their admits, their universities and the journey in their own words.", blocks: successBlocks, isSystem: true },
  { slug: "resources", title: "Resources - Trinity Study Abroad", navLabel: "Resources", seoDesc: "Events, fairs, workshops and our study abroad brochure \u2014 free resources for students and parents weighing up an overseas education.", blocks: resourcesBlocks, isSystem: true },
  { slug: "events", title: "Events & University Fairs - Trinity Study Abroad", navLabel: "Events", seoDesc: "University fairs, spot-admission days, visa workshops and pre-departure briefings held in Mumbai and online by Trinity Study Abroad.", blocks: eventsBlocks, isSystem: true },
  { slug: "brochure", title: "Study Abroad Brochure - Trinity Study Abroad", navLabel: "Brochure", seoDesc: "Request the Trinity Study Abroad brochure: countries, one-year costs, entry requirements, intake calendars, stay-back rules and funding routes.", blocks: brochureBlocks, isSystem: true },
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
  { question: "What services does Trinity Study Abroad offer?", answer: "Career counselling, university admissions (UG/PG), SOP/LOR/resume documentation, test prep guidance (IELTS, TOEFL, GMAT, GRE, SAT), student visa counselling and mock interviews, scholarships and education loan assistance, pre-departure (accommodation, forex, insurance, travel checklist) and post-arrival support, plus post-study work visa and PR guidance.", tags: "services", keywords: "services, what do you offer, help with", category: "General" },
  { question: "Which countries do you cover?", answer: "50+ countries worldwide. We have detailed guides for USA, UK, Canada, Ireland, Germany, Australia, New Zealand, France, Italy, Sweden and Denmark, and place students well beyond those — ask us about any destination. 1200+ partner universities.", tags: "countries", keywords: "countries, destinations, where can I study", category: "General" },
  { question: "Is the first consultation free?", answer: "Yes. The first counselling session is free. Book via the contact form, call +91-8453045304 or WhatsApp the same number.", tags: "pricing,consultation", keywords: "free consultation, pricing, cost of counselling", category: "Fees" },
  { question: "Where is your office?", answer: "301, 3rd Floor, Kumar Plaza, Kalina-Kurla Road, Kalina, Santacruz (East), Mumbai 400029. Landline +91-22-69655855.", tags: "contact,office", keywords: "office, address, location", category: "General" },
  { question: "How early should I start planning?", answer: "Ideally 10–12 months before the intake. Major intake is Fall (September); a smaller Spring (January) intake exists in most countries.", tags: "timeline,intake", keywords: "admission last date, apply, application deadline, when to start, intake", category: "Admissions" },
  { question: "What stay-back / post-study work options exist?", answer: "Depending on country and degree level, stay-back ranges from 2 to 5 years. Rules change often — our counsellors confirm the current policy for your target country.", tags: "visa,stayback", keywords: "stay back, post study work, PR", category: "Visa" },
  { question: "Do you help with education loans?", answer: "Yes. We assist with identifying scholarships and arranging education loans, including financial proof documentation for visas.", tags: "loans,finance", keywords: "education loan, scholarship, finance, fees", category: "Fees" },
  { question: "Who founded Trinity Study Abroad?", answer: "Trinity Study Abroad is a unit of Trinity Air Travel & Tours Pvt. Ltd. (est. 1982), founded by Mr Baby John, an industry veteran with 42+ years in travel and visas.", tags: "about", keywords: "founder, history, about us", category: "General" },
  { question: "What documents are required for admission?", answer: "Academic transcripts and certificates, passport, English test scores (IELTS/TOEFL), SOP, LORs, updated resume/CV, and financial proof for the visa stage. Exact requirements vary by university and country — your counsellor gives you a checklist for your specific applications.", tags: "documents", keywords: "documents required, admission documents, certificates, what documents", category: "Admissions" },
  { question: "How much does studying abroad typically cost?", answer: "Tuition and living costs vary widely by country and course — typically ₹15–40 lakh per year all-in. Book a free consultation and we'll estimate the cost for your shortlisted countries and courses.", tags: "fees", keywords: "fee, cost, tuition, admission fee, how much", category: "Fees" },
];
