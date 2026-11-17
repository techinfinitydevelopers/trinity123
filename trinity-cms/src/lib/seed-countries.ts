/* Study-destination content — ported verbatim from the design canvas (countryInfo + countryDetail). */
const IMG = "/assets/img";
const pair = (rows: [string, string][]) => rows.map(([label, value]) => ({ label, value }));
const qa = (rows: [string, string][]) => rows.map(([q, a]) => ({ q, a }));
const named = (rows: [string, string][]) => rows.map(([name, text]) => ({ name, text }));
const stepList = (rows: [string, string][]) => rows.map(([title, text]) => ({ title, text }));
const stat = (rows: [string, string][]) => rows.map(([v, l]) => ({ v, l }));
const uni = (rows: [string, string][]) => rows.map(([name, z]) => ({ name, img: `${IMG}/unversity/${z}.jpg` }));

export type CountrySeed = {
  code: string; slug: string; name: string; tag: string; img: string; hero: string; intro: string;
  stats: { v: string; l: string }[]; why: string[]; courses: string[]; unis: { name: string; img: string }[];
  visa: string; intakes: string; cost: { label: string; value: string }[]; req: { label: string; value: string }[];
  sch: { name: string; text: string }[]; steps: { title: string; text: string }[]; work: string; workPoints: string[]; faq: { q: string; a: string }[];
  order: number;
  seoTitle?: string; seoDesc?: string;
};

export const seedCountries: CountrySeed[] = [
  {
    code: "us", slug: "usa", name: "USA", tag: "Top-ranked universities", img: `${IMG}/countries/usa.png`, hero: "Study in the United States", order: 110,
    intro: "The USA hosts more top-200 universities than any other country, with unmatched research funding, flexible curricula and the option to switch majors. For Indian students it remains the first choice for STEM, business and research-heavy master’s programmes.",
    stats: stat([["4,000+", "Universities"], ["3 yrs", "STEM OPT"], ["Fall / Spring", "Intakes"], ["$25k–55k", "Tuition / year"]]),
    why: ["Largest choice of universities and specialisations", "Assistantships, fellowships and merit scholarships", "STEM graduates get up to 3 years of OPT work authorisation", "Strong campus research and industry linkage"],
    courses: ["Computer Science & Data Science", "Business Analytics & MBA", "Engineering (all branches)", "Health & Biomedical Sciences", "Economics & Finance"],
    unis: uni([["University of Dayton", "z4"], ["Florida International University", "z5"]]),
    visa: "F-1 student visa. You need an I-20 from your university, SEVIS fee payment, proof of funds for year one and a visa interview at the consulate. Our team runs document checks and mock interviews before your appointment.",
    intakes: "Fall (August–September) is the main intake with the widest course and funding choice. Spring (January) is smaller. Start 10–12 months ahead for GRE/GMAT, TOEFL/IELTS and applications.",
    cost: pair([["Tuition (master’s)", "$25,000 – $55,000 / year"], ["Living expenses", "$12,000 – $18,000 / year"], ["Health insurance", "$1,200 – $2,500 / year"], ["Visa + SEVIS fees", "$535 one-time"], ["Total year one", "$40,000 – $75,000"]]),
    req: pair([["Academics", "65%+ in bachelor’s (16 years of education preferred for master’s)"], ["English test", "IELTS 6.5 / TOEFL 90 / PTE 65"], ["Aptitude test", "GRE for STEM, GMAT for MBA (waivers available)"], ["Documents", "SOP, 2–3 LORs, resume, transcripts, passport, funds proof"]]),
    sch: named([["University merit scholarships", "Partial to full tuition waivers based on academics and test scores"], ["Graduate assistantships", "Teaching or research roles covering tuition plus a stipend"], ["External scholarships", "Fulbright-Nehru, Inlaks, Tata Scholarships for Indian students"]]),
    steps: stepList([["Receive I-20", "University issues your I-20 after admission and financial documents"], ["Pay SEVIS fee", "Pay I-901 SEVIS fee and keep the receipt"], ["Fill DS-160", "Complete the online visa form and pay the MRV fee"], ["Book appointments", "Biometrics (VAC) followed by the consular interview"], ["Interview", "Answer on course, funding and post-study plans — we run mock interviews"]]),
    work: "You may work 20 hours a week on campus during terms and full time in vacations. After graduation, OPT gives 12 months of work authorisation, extended to 36 months for STEM degrees — then H-1B sponsorship.",
    workPoints: ["20 hrs/week on-campus during study", "12 months OPT (36 for STEM)", "H-1B sponsorship route after OPT"],
    faq: qa([["Is GRE mandatory for the USA?", "Many universities have made GRE optional, but a good score still strengthens funding chances for STEM programmes."], ["How much funds proof is needed?", "Typically one year of tuition plus living costs as shown on your I-20."], ["Can my spouse join me?", "Yes, on an F-2 dependent visa, though F-2 holders cannot work."], ["What is the visa success rate with Trinity?", "Our counsellors screen documents and run mock interviews, which is where most refusals are prevented."]]),
  },
  {
    code: "gb", slug: "uk", name: "UK", tag: "1-year master’s", img: `${IMG}/countries/uk.png`, hero: "Study in the United Kingdom", order: 10,
    intro: "The UK offers one-year master’s degrees that cut both tuition and living costs, with globally respected universities and a two-year Graduate Route work visa after graduation.",
    stats: stat([["160+", "Universities"], ["2 yrs", "Graduate Route"], ["Sept / Jan", "Intakes"], ["£16k–30k", "Tuition / year"]]),
    why: ["One-year master’s — faster return on investment", "Graduate Route lets you work for 2 years after the degree", "Strong in business, law, media, design and engineering", "No entrance exam required for most programmes"],
    courses: ["Business & Management", "Finance & Accounting", "Law (LLM)", "Data Science & AI", "Media & Design"],
    unis: uni([["University College London", "z1"], ["University of Warwick", "z2"], ["University of Edinburgh", "z3"]]),
    visa: "Student Route visa. You apply with your CAS letter, financial proof held for 28 days, and TB test where applicable. Most decisions arrive within three weeks.",
    intakes: "September is the primary intake; January is a strong secondary intake. Apply 8–10 months ahead — popular courses close early.",
    cost: pair([["Tuition (master’s)", "£16,000 – £30,000 / year"], ["Living (outside London)", "£9,207 / year (as per UKVI)"], ["Living (London)", "£12,006 / year (as per UKVI)"], ["IHS health surcharge", "£776 / year"], ["Total year one", "£27,000 – £45,000"]]),
    req: pair([["Academics", "55–65%+ in bachelor’s; 2:1 equivalent for top universities"], ["English test", "IELTS UKVI 6.5 overall (6.0 in each band typical)"], ["Work experience", "Preferred for MBA and executive programmes"], ["Documents", "SOP, 2 LORs, CV, transcripts, passport, 28-day bank statement"]]),
    sch: named([["Chevening Scholarships", "Fully funded UK master’s for future leaders"], ["Commonwealth Scholarships", "Tuition, stipend and airfare for developing Commonwealth students"], ["University bursaries", "£2,000 – £10,000 India-specific awards at most universities"]]),
    steps: stepList([["Accept offer", "Pay the deposit and receive your CAS letter"], ["Hold funds 28 days", "Maintain tuition + living costs in the account for 28 consecutive days"], ["TB test", "Complete TB screening at an approved clinic"], ["Apply online", "Submit the Student Route application and pay IHS"], ["Biometrics", "Attend the visa centre; decisions typically in 3 weeks"]]),
    work: "Students can work 20 hours a week during terms. The Graduate Route then allows you to stay and work for 2 years (3 for PhD) without employer sponsorship — ideal for finding a Skilled Worker role.",
    workPoints: ["20 hrs/week during term time", "2-year Graduate Route visa", "Skilled Worker route for long-term stay"],
    faq: qa([["Is a one-year master’s valid in India?", "Yes — UK master’s degrees are widely recognised by employers and for further study."], ["Do I need IELTS for the UK?", "Most universities require IELTS UKVI, though some accept MOI letters for Indian students."], ["How much does the Graduate Route cost?", "There is an application fee plus IHS; it is applied for from within the UK after graduation."], ["Are January intakes worth it?", "Yes — January offers less competition and a wider scholarship window at many universities."]]),
  },
  {
    code: "ca", slug: "canada", name: "Canada", tag: "PR-friendly pathways", img: `${IMG}/countries/canada.png`, hero: "Study in Canada", order: 120,
    intro: "Canada combines affordable, high-quality education with generous post-graduation work permits and a well-defined permanent residency pathway — the reason it is the most PR-friendly destination for Indian students.",
    stats: stat([["100+", "Universities"], ["3 yrs", "PGWP"], ["Sep / Jan / May", "Intakes"], ["CAD 18k–35k", "Tuition / year"]]),
    why: ["Post-Graduation Work Permit up to 3 years", "Express Entry and PNP pathways to permanent residency", "Lower tuition than the USA, UK and Australia", "Safe, multicultural cities with large Indian communities"],
    courses: ["Computer Science & IT", "Healthcare & Nursing", "Supply Chain & Business", "Engineering Technology", "Hospitality Management"],
    unis: uni([["University of Waterloo", "z7"], ["University of Alberta", "z6"]]),
    visa: "Study Permit, usually via SDS-style documentation: acceptance letter, GIC, first-year tuition payment, IELTS and medical examination.",
    intakes: "Three intakes — September (largest), January and May. Apply 6–9 months ahead; GIC and medicals take time.",
    cost: pair([["Tuition (master’s)", "CAD 18,000 – 35,000 / year"], ["Living expenses", "CAD 12,000 – 15,000 / year"], ["GIC (proof of funds)", "CAD 20,635 one-time"], ["Health insurance", "CAD 600 – 900 / year"], ["Total year one", "CAD 32,000 – 52,000"]]),
    req: pair([["Academics", "65%+ in bachelor’s; 3-year degrees accepted for many programmes"], ["English test", "IELTS 6.5 with no band below 6.0 (SDS requirement)"], ["Funds", "GIC of CAD 20,635 plus first-year tuition payment"], ["Documents", "SOP, LORs, transcripts, passport, medicals, PAL/TAL letter"]]),
    sch: named([["University entrance awards", "Automatic merit awards on admission at many institutions"], ["Ontario Graduate Scholarship", "Merit-based funding for graduate research students"], ["Vanier CGS", "Doctoral-level scholarship worth CAD 50,000/year"]]),
    steps: stepList([["Get the LOA", "Accept the offer and pay first-year tuition"], ["Buy GIC", "Purchase a Guaranteed Investment Certificate from an approved bank"], ["Secure PAL/TAL", "Province issues the attestation letter needed for the permit"], ["Medicals + application", "Complete upfront medical exam and submit the study permit application"], ["Biometrics", "Give biometrics; SDS decisions are usually quick"]]),
    work: "You may work 24 hours a week off campus during terms and full time in scheduled breaks. A Post-Graduation Work Permit of up to 3 years follows, feeding directly into Express Entry and Provincial Nominee PR pathways.",
    workPoints: ["24 hrs/week off-campus work", "PGWP up to 3 years", "Express Entry / PNP route to PR"],
    faq: qa([["Is a 3-year degree accepted in Canada?", "Yes, most Canadian universities and colleges accept 3-year Indian bachelor’s degrees for master’s and PG diplomas."], ["What is the GIC used for?", "It is your proof of living expenses; the bank releases it to you in instalments after arrival."], ["Which intake is best?", "September has the widest course choice; January and May are good for faster starts."], ["Does college study qualify for PGWP?", "Yes, when the programme and institution are PGWP-eligible — we verify this before you apply."]]),
  },
  {
    code: "ie", slug: "ireland", name: "Ireland", tag: "Tech & pharma hub", img: `${IMG}/countries/ireland.png`, hero: "Study in Ireland", order: 20,
    intro: "Ireland is the European base for global technology and pharmaceutical companies, which makes internships and graduate hiring unusually accessible for international students.",
    stats: stat([["20+", "Universities"], ["2 yrs", "Stay-back (master’s)"], ["Sept / Jan", "Intakes"], ["€12k–25k", "Tuition / year"]]),
    why: ["European HQs of major tech and pharma employers", "Two-year stay-back for master’s graduates", "English-speaking, EU-member destination", "Strong scholarship support for Indian students"],
    courses: ["Data Analytics & Computing", "Pharmaceutical & Biotech", "Business & Fintech", "Construction & Engineering", "Agri & Food Science"],
    unis: uni([["University College Dublin", "z8"], ["University of Galway", "z9"]]),
    visa: "Irish Study Visa (Stamp 2) — offer letter, fee payment, €10,000 proof of funds and private medical insurance.",
    intakes: "September is the main intake, January is secondary. Apply 7–9 months ahead.",
    cost: pair([["Tuition (master’s)", "€12,000 – €25,000 / year"], ["Living expenses", "€10,000 – €12,000 / year"], ["Proof of funds", "€10,000 one-time"], ["Health insurance", "€150 – €500 / year"], ["Total year one", "€23,000 – €38,000"]]),
    req: pair([["Academics", "60%+ in bachelor’s (2:1 equivalent for top programmes)"], ["English test", "IELTS 6.5 overall with 6.0 in each band"], ["Funds", "€10,000 available for the first year of living costs"], ["Documents", "SOP, 2 LORs, CV, transcripts, passport, insurance"]]),
    sch: named([["Government of Ireland Scholarships", "€10,000 stipend plus full tuition waiver for one year"], ["University merit awards", "€2,000 – €5,000 India-specific scholarships"], ["Walsh / Faculty awards", "Programme-specific funding for research students"]]),
    steps: stepList([["Accept offer", "Pay tuition deposit and receive the acceptance letter"], ["Arrange insurance", "Purchase private medical insurance valid in Ireland"], ["Show funds", "Evidence €10,000 in your or your sponsor’s account"], ["Apply for visa", "Submit the AVATS online application with supporting documents"], ["Submit documents", "Courier documents to the embassy; decisions in 4–8 weeks"]]),
    work: "Stamp 2 permission allows 20 hours a week during term and 40 hours in holiday periods. Master’s graduates get a 2-year Third Level Graduate Programme stay-back to find skilled employment.",
    workPoints: ["20 hrs/week term, 40 in holidays", "2-year stay-back for master’s", "Critical Skills permit for long-term stay"],
    faq: qa([["Why is Ireland popular for tech?", "Google, Meta, Microsoft, Apple, Pfizer and many others run European operations from Ireland, creating graduate demand."], ["Is IELTS mandatory?", "Most universities require it, though some accept English-medium instruction letters."], ["How long does the visa take?", "Typically 4–8 weeks, so apply as soon as you have paid the deposit."], ["Can I bring dependants?", "Spouses may accompany you but usually cannot work on a student dependant stamp."]]),
  },
  {
    code: "de", slug: "germany", name: "Germany", tag: "Low-tuition engineering", img: `${IMG}/countries/germany.png`, hero: "Study in Germany", order: 40,
    intro: "Most public universities in Germany charge no tuition fee — you fund living costs through a blocked account. For engineering and applied sciences it is the best value destination in Europe.",
    stats: stat([["400+", "Institutions"], ["18 mo", "Job-seeker visa"], ["Winter / Summer", "Intakes"], ["€0–1.5k", "Tuition / semester"]]),
    why: ["No or very low tuition at public universities", "18-month post-study job-seeking permit", "Europe’s largest engineering job market", "English-taught master’s programmes widely available"],
    courses: ["Mechanical & Automotive Engineering", "Electrical & Embedded Systems", "Computer Science", "Renewable Energy", "Data Engineering"],
    unis: uni([["Berlin School of Business and Innovation", "z10"]]),
    visa: "German National Student Visa — admission letter, blocked account of roughly €11,900, health insurance and APS certificate for Indian students.",
    intakes: "Winter (October) is the major intake, Summer (April) is smaller.\nStart 10–12 months ahead — APS and blocked account add lead time.",
    cost: pair([["Tuition (public universities)", "€0 – €500 / semester"], ["Semester contribution", "€150 – €350 / semester"], ["Blocked account", "€11,904 one-time"], ["Health insurance", "€120 / month"], ["Total year one", "€13,000 – €16,000"]]),
    req: pair([["Academics", "70%+ in bachelor’s; APS certificate mandatory for Indian students"], ["English test", "IELTS 6.5 for English-taught programmes"], ["German", "A1–B1 for some courses; B2/C1 for German-taught degrees"], ["Documents", "APS, SOP, LORs, CV, transcripts, blocked account proof"]]),
    sch: named([["DAAD Scholarships", "Monthly stipend plus travel and insurance for master’s students"], ["Deutschlandstipendium", "€300/month merit scholarship at participating universities"], ["Erasmus+ funding", "Mobility grants for eligible European study periods"]]),
    steps: stepList([["Get APS certificate", "Apply to the APS India office — takes about 4 weeks"], ["Secure admission", "Apply via uni-assist or directly to the university"], ["Open blocked account", "Deposit approximately €11,904 with an approved provider"], ["Book visa appointment", "Slots fill fast — book as soon as admission arrives"], ["Visa interview", "Attend with APS, admission letter, blocked account and insurance"]]),
    work: "You can work 120 full days or 240 half days a year. After graduating you get an\n18-month job-seeker residence permit, and an EU Blue Card follows once you have a qualifying salary offer.",
    workPoints: ["120 full days / 240 half days per year", "18-month job-seeker permit", "EU Blue Card and PR pathway"],
    faq: qa([["Is German necessary?", "Not for English-taught master’s, but B1 German significantly improves part-time work and hiring prospects."], ["What is APS?", "A mandatory academic evaluation certificate for Indian students applying to German universities."], ["Are public universities really free?", "Yes — most charge no tuition, only a semester contribution of €150–€350."], ["How early should I start?", "10–12 months ahead: APS and blocked account add significant lead time."]]),
  },
  {
    code: "au", slug: "australia", name: "Australia", tag: "Post-study work visa", img: `${IMG}/countries/australia.png`, hero: "Study in Australia", order: 80,
    intro: "Australia pairs globally ranked universities with generous post-study work rights and strong part-time work allowances — a practical, well-supported destination for Indian students.",
    stats: stat([["40+", "Universities"], ["2–4 yrs", "Post-study work"], ["Feb / July", "Intakes"], ["AUD 25k–45k", "Tuition / year"]]),
    why: ["Temporary Graduate visa of 2–4 years", "High part-time earning potential during study", "8 universities in the global top 150", "Regional study bonuses add extra stay-back time"],
    courses: ["Nursing & Healthcare", "Information Technology", "Accounting & Business", "Engineering", "Hospitality & Tourism"],
    unis: [],
    visa: "Subclass 500 Student visa — CoE, Genuine Student requirement, OSHC health cover and financial capacity evidence.",
    intakes: "February and July are the two main intakes, with some November starts. Apply 6–9 months ahead.",
    cost: pair([["Tuition (master’s)", "AUD 25,000 – 45,000 / year"], ["Living expenses", "AUD 29,710 / year (visa min)"], ["OSHC health cover", "AUD 600 – 800 / year"], ["Visa fee", "AUD 1,600 one-time"], ["Total year one", "AUD 55,000 – 78,000"]]),
    req: pair([["Academics", "60%+ in bachelor’s; some programmes accept 55%"], ["English test", "IELTS 6.5 overall with no band below 6.0"], ["GS requirement", "Genuine Student statement explaining course choice and plans"], ["Documents", "SOP/GS, LORs, transcripts, passport, OSHC, funds proof"]]),
    sch: named([["Australia Awards", "Fully funded scholarships including tuition and living allowance"], ["University international awards", "15–50% tuition reductions for strong academics"], ["Destination Australia", "Support for study in regional campuses"]]),
    steps: stepList([["Accept offer", "Pay deposit and receive your Confirmation of Enrolment (CoE)"], ["Buy OSHC", "Arrange overseas student health cover for the visa period"], ["Prepare GS", "Draft the Genuine Student statement with your counsellor"], ["Apply subclass 500", "Lodge the online application with CoE, GS and funds evidence"], ["Health + biometrics", "Complete medicals and biometrics; decisions in 4–12 weeks"]]),
    work: "Student visa holders can work 48 hours a fortnight during study and unrestricted hours in breaks. The Temporary Graduate visa (subclass 485) gives 2–3 years of post-study work rights, with extra time for regional study.",
    workPoints: ["48 hrs/fortnight during study", "485 visa: 2–3 years post-study work", "Regional study adds 1–2 extra years"],
    faq: qa([["What replaced the GTE requirement?", "The Genuine Student (GS) requirement — a structured set of questions about your course and plans."], ["Is regional study better?", "It can be: lower living costs, extra post-study work time and additional PR points."], ["Can I work full time after the course ends?", "Yes, once your course is complete and until your student visa expires."], ["How much funds must I show?", "Tuition plus AUD 29,710 living costs, as required for subclass 500."]]),
  },
  {
    code: "nz", slug: "new-zealand", name: "New Zealand", tag: "Safe & scenic study", img: `${IMG}/countries/new-zealand.png`, hero: "Study in New Zealand", order: 50,
    intro: "All eight New Zealand universities rank in the global top 3%, with small class sizes, strong pastoral care and a three-year post-study work visa for degree graduates.",
    stats: stat([["8", "Universities"], ["3 yrs", "Post-study work"], ["Feb / July", "Intakes"], ["NZD 22k–38k", "Tuition / year"]]),
    why: ["Every university globally ranked", "Up to 3 years post-study work for degree holders", "Safe, English-speaking, outdoor lifestyle", "Lower cost of living than Australia"],
    courses: ["Agriculture & Environment", "IT & Software Engineering", "Construction Management", "Business", "Tourism & Hospitality"],
    unis: [],
    visa: "Fee Paying Student visa — offer of place, proof of funds, insurance and medical certificates where required.",
    intakes: "February and July intakes. Apply 6–8 months ahead.",
    cost: pair([["Tuition (master’s)", "NZD 22,000 – 38,000 / year"], ["Living expenses", "NZD 20,000 / year (visa min)"], ["Health insurance", "NZD 600 – 900 / year"], ["Visa fee", "NZD 375 one-time"], ["Total year one", "NZD 43,000 – 60,000"]]),
    req: pair([["Academics", "60%+ in bachelor’s; 3-year degrees accepted for PG diplomas"], ["English test", "IELTS 6.5 overall with no band below 6.0"], ["Funds", "NZD 20,000 per year of living costs plus tuition"], ["Documents", "SOP, LORs, transcripts, passport, medicals, insurance"]]),
    sch: named([["New Zealand Excellence Awards", "NZD 5,000 – 10,000 for Indian students across all eight universities"], ["University international scholarships", "Merit-based tuition reductions on admission"], ["Manaaki New Zealand Scholarships", "Fully funded government awards including living allowance"]]),
    steps: stepList([["Accept the offer", "Pay tuition and receive your Offer of Place"], ["Arrange insurance", "Buy approved travel and medical insurance"], ["Complete medicals", "Chest x-ray and general medical with a panel physician"], ["Apply online", "Lodge the Fee Paying Student visa with funds evidence"], ["Decision", "Processing usually takes 4–8 weeks"]]),
    work: "Students can work 20 hours a week during study and full time in scheduled breaks. Degree graduates receive a Post Study Work visa of up to 3 years, and Green List occupations offer a fast track to residence.",
    workPoints: ["20 hrs/week during study", "Post Study Work visa up to 3 years", "Green List roles fast-track residence"],
    faq: qa([["Is New Zealand affordable?", "Living costs are lower than Australia, and tuition sits in the mid range for English-speaking destinations."], ["Are all universities recognised?", "Yes — all eight New Zealand universities rank in the global top 3%."], ["Which intakes exist?", "February and July, with some November starts for select programmes."], ["Can my partner work?", "Partners of master’s and doctoral students can often apply for an open work visa."]]),
  },
  {
    code: "fr", slug: "france", name: "France", tag: "Business & fashion", img: `${IMG}/countries/france.png`, hero: "Study in France", order: 30,
    intro: "France hosts Europe’s leading business schools alongside strong public universities, with low public tuition and generous scholarships for Indian students.",
    stats: stat([["3,500+", "Institutions"], ["2 yrs", "APS stay-back"], ["Sept / Jan", "Intakes"], ["€3k–20k", "Tuition / year"]]),
    why: ["Top-tier grandes écoles for business and management", "Low public-university tuition", "Two-year job search permit after master’s", "Fashion, luxury and culinary programmes unmatched in Europe"],
    courses: ["International Business & MIM", "Luxury & Fashion Management", "Culinary Arts", "Engineering", "Data Science"],
    unis: [],
    visa: "VLS-TS long-stay student visa via Campus France — Études en France registration, admission proof and €615/month funds evidence.",
    intakes: "September is the main intake; January is available for many business programmes. Apply 8–10 months ahead.",
    cost: pair([["Tuition (public university)", "€2,770 – €3,770 / year"], ["Tuition (business school)", "€12,000 – €25,000 / year"], ["Living expenses", "€9,000 – €14,000 / year"], ["Visa + Campus France fees", "€350 one-time"], ["Total year one", "€13,000 – €38,000"]]),
    req: pair([["Academics", "60%+ in bachelor’s; GMAT/GRE for top business schools"], ["English test", "IELTS 6.5 for English-taught programmes"], ["French", "B2 required for French-taught degrees; A1–A2 useful otherwise"], ["Documents", "Campus France registration, SOP, LORs, CV, transcripts"]]),
    sch: named([["Eiffel Excellence Scholarship", "Monthly allowance plus travel and insurance for master’s students"], ["Charpak Scholarship", "India-specific programme with tuition waiver and living support"], ["School merit awards", "10–50% tuition reductions at grandes écoles"]]),
    steps: stepList([["Register on Campus France", "Create your Études en France account and pay the fee"], ["Attend the interview", "Campus France academic interview at your regional office"], ["Accept admission", "Confirm the place and pay the tuition deposit"], ["Apply for VLS-TS", "Book the VFS appointment with funds and accommodation proof"], ["Validate on arrival", "Validate the long-stay visa online within three months"]]),
    work: "Students may work up to 964 hours a year (about 20 hours a week). After a master’s you can apply for the APS permit to stay two years and search for work, leading to the Talent Passport.",
    workPoints: ["964 work hours permitted per year", "2-year APS job-search permit", "Talent Passport for skilled roles"],
    faq: qa([["Do I need French?", "Not for English-taught programmes, but basic French helps with part-time work and daily life."], ["Are public universities cheap?", "Yes — public tuition is a few thousand euros a year, far below business-school fees."], ["What is Campus France?", "The mandatory application platform and interview process for students applying from India."], ["Which fields are strongest?", "Management, luxury and fashion, culinary arts, engineering and aerospace."]]),
  },
  {
    /* Italy — updated from the client's "destination page" document, tab "Italy" (2026-11-17). Changes from the
       earlier copy: hero tagline, the 4th stat (the document gives two ranges, public €161–€4,000 and private
       €3,800–€38,000+, which overflow the stat card — so it shows the two ends, €161 – €38,000+; the detail is in the
       cost cards), "Fashion" in the second reason, the
       Medicine & Health course, private-school tuition up to €30,000+ and living expenses €13,000+, the MAECI
       scholarship, the total's "+", and reworded answers on learning Italian and on Italy's fields. The note on the
       visa and permit fees sits in the visa paragraph (the cost cards have no room for a sentence). Run
       scripts/update-italy-page.ts to bring a database up to this. */
    code: "it", slug: "italy", name: "Italy", tag: "Arts & architecture; Fashion & Design", img: `${IMG}/unversity/z9.jpg`, hero: "Study in Italy", order: 160,
    intro: "Italy offers historic universities, exceptional design and architecture schools, and some of the lowest tuition in Western Europe — with income-based fee reductions for international students.",
    stats: stat([["90+", "Universities, public state-funded institutions, private universities, polytechnics, and specialized postgraduate schools"], ["1 yr", "Job-search permit"], ["Sept / Feb", "Intakes"], ["€161 – €38,000+", "Tuition / year, public to private universities"]]),
    why: ["Very low tuition with income-linked fee waivers", "World-leading Fashion, design, architecture and fine arts schools", "Regional scholarships cover fees plus living costs", "Affordable cost of living in student cities"],
    courses: ["Architecture & Design", "Fashion & Luxury", "Mechanical & Automotive Engineering", "Art History & Conservation", "Food Technology", "Medicine & Health"],
    unis: [],
    visa: "Italian Study Visa (Type D) — pre-enrolment on Universitaly, accommodation proof, funds and health insurance. The total cost for an Italy Type D student visa and the post-arrival residence permit (permesso di soggiorno) is approximately €166.46 to €176.46 (about ₹17,650 to ₹18,700).",
    intakes: "September is the main intake, February is secondary. Pre-enrolment opens early — start 9–11 months ahead.",
    cost: pair([["Tuition (public university)", "€900 – €4,000+ / year"], ["Tuition (private/design school)", "€8,000 – €30,000+ / year"], ["Living expenses", "€13,000+ / year"], ["Visa + permit fees", "€200 one-time"], ["Total year one", "€9,000 – €30,000+"]]),
    req: pair([["Academics", "55%+ in bachelor’s; portfolio for design and architecture"], ["English test", "IELTS 6.0 – 6.5 for English-taught programmes"], ["Declaration of Value", "DoV or CIMEA statement for your Indian qualification"], ["Documents", "University pre-enrolment, SOP, LORs, transcripts, portfolio"]]),
    sch: named([["Invest Your Talent in Italy", "Scholarship plus internship programme for Indian students"], ["Regional scholarships (DSU)", "Fee waiver plus accommodation and meals based on family income"], ["University merit awards", "Tuition reductions for high-scoring international applicants"], ["MAECI Scholarship (Italian Government Scholarship)", "Offered by the Italian Ministry of Foreign Affairs and International Cooperation, this scholarship supports master’s and PhD students. It provides a full tuition fee waiver, health insurance coverage, and a monthly stipend of €900 (for up to 9 months). Applicants must generally be under 28 years old for master’s programs and under 30 for PhD programs."]]),
    steps: stepList([["Pre-enrol on Universitaly", "Register your chosen programme for the academic year"], ["Get DoV / CIMEA", "Have your Indian degree validated for Italian recognition"], ["Book the visa slot", "Appointment with funds, accommodation and insurance proof"], ["Attend appointment", "Submit documents and biometrics at the consulate"], ["Apply for permit", "Apply for the residence permit within 8 days of arrival"]]),
    work: "Students may work up to 20 hours a week (1,040 hours a year). Graduates can convert to a 12-month job-search permit, then to a work permit once employed.",
    workPoints: ["20 hrs/week (1,040 hrs a year)", "12-month job-search permit", "Convert to work permit on hiring"],
    faq: qa([["Is Italy cheap for Indian students?", "Yes — public tuition is income-linked and among the lowest in Western Europe."], ["Do I need Italian?", "English-taught masters are common, but learning Italian language helps with part-time work and internships."], ["Which fields is Italy known for?", "Design, architecture, fashion, automotive engineering, health and food technology."], ["What is a Declaration of Value?", "A consulate-issued statement confirming your Indian degree’s equivalence in Italy."]]),
  },
  {
    code: "se", slug: "sweden", name: "Sweden", tag: "Sustainability leaders", img: `${IMG}/unversity/z5.jpg`, hero: "Study in Sweden", order: 175,
    intro: "Sweden is built around innovation, sustainability and flat, discussion-led teaching — ideal if you want research-grade master’s programmes in engineering, design or environmental science.",
    stats: stat([["40+", "Universities"], ["12 mo", "Job-search permit"], ["Aug / Jan", "Intakes"], ["SEK 80k–150k", "Tuition / year"]]),
    why: ["Global leader in sustainability and clean tech", "Independent, project-based learning style", "Scholarships from the Swedish Institute and universities", "English-taught master’s across most disciplines"],
    courses: ["Sustainable Energy", "Industrial & Product Design", "Computer Science", "Environmental Engineering", "Innovation Management"],
    unis: [],
    visa: "Swedish residence permit for studies — admission proof, comprehensive insurance and maintenance funds of roughly SEK 10,000/month.",
    intakes: "Autumn (August) is the main intake via universityadmissions.se; January is limited. Apply 10–12 months ahead.",
    cost: pair([["Tuition (master’s)", "SEK 80,000 – 150,000 / year"], ["Living expenses", "SEK 10,314 / month (permit minimum)"], ["Application fee", "SEK 900 one-time"], ["Residence permit fee", "SEK 1,500 one-time"], ["Total year one", "SEK 210,000 – 280,000"]]),
    req: pair([["Academics", "A bachelor’s degree with 60%+ and relevant prerequisite courses"], ["English test", "IELTS 6.5 with no band below 5.5"], ["Funds", "Approximately SEK 10,314 per month for the study period"], ["Documents", "SOP, CV, LORs, transcripts, passport, insurance"]]),
    sch: named([["Swedish Institute Scholarships", "Full tuition, living allowance, insurance and travel grant"], ["University tuition-fee waivers", "Partial or full waivers for high-merit international students"], ["Programme scholarships", "Faculty-level awards in engineering and sustainability fields"]]),
    steps: stepList([["Apply via universityadmissions.se", "One national application for up to four programmes"], ["Accept your place", "Pay the first tuition instalment"], ["Apply for residence permit", "Online application with funds and insurance evidence"], ["Submit biometrics", "At the embassy or VFS centre"], ["Decision", "Processing typically 1–3 months — apply early"]]),
    work: "There is no formal hour limit for student work in Sweden, though studies must remain your main activity. After graduation you can apply for a 12-month permit to look for work or start a business.",
    workPoints: ["No fixed work-hour cap during study", "12-month job-search permit", "Work permit and PR pathway after employment"],
    faq: qa([["Is Sweden expensive?", "Tuition is mid-range and living costs are high, but scholarships and tuition waivers are widely available."], ["Do I need Swedish?", "No for English-taught master’s; Swedish helps with local hiring outside tech."], ["When do I apply?", "The autumn intake application window opens roughly a year ahead — mid-October to mid-January."], ["What is Sweden strong in?", "Sustainability, clean energy, product design, computer science and innovation management."]]),
  },
  {
    code: "dk", slug: "denmark", name: "Denmark", tag: "Innovation & design", img: `${IMG}/unversity/z7.jpg`, hero: "Study in Denmark", order: 170,
    intro: "Denmark blends design thinking with strong engineering and life-science research, taught in small, collaborative cohorts with close industry links.",
    stats: stat([["8", "Universities"], ["3 yrs", "Establishment card"], ["Sept / Feb", "Intakes"], ["€6k–16k", "Tuition / year"]]),
    why: ["Three-year establishment card to work after graduation", "Project- and teamwork-based teaching", "Strengths in design, engineering and life sciences", "High quality of life and safety"],
    courses: ["Industrial Design", "Engineering & Robotics", "Life Sciences & Biotech", "Sustainable Architecture", "Business Innovation"],
    unis: [],
    visa: "Danish student residence permit — admission letter, tuition payment proof and funds evidence for living costs.",
    intakes: "September is the main intake, February is limited. Apply 9–11 months ahead.",
    cost: pair([["Tuition (master’s)", "€6,000 – €16,000 / year"], ["Living expenses", "€9,000 – €12,000 / year"], ["Proof of funds", "DKK 6,397 per month"], ["Permit fee", "€255 one-time"], ["Total year one", "€16,000 – €29,000"]]),
    req: pair([["Academics", "A relevant bachelor’s degree with 65%+ and matching prerequisites"], ["English test", "IELTS 6.5 overall (7.0 for some programmes)"], ["Funds", "Documented funds of roughly DKK 6,397 per month"], ["Documents", "SOP, CV, LORs, transcripts, passport, insurance"]]),
    sch: named([["Danish Government Scholarships", "Tuition waivers and grants for non-EU master’s students"], ["University talent scholarships", "Merit awards covering part of the tuition fee"], ["Erasmus Mundus joint master’s", "Fully funded multi-country programmes with Danish partners"]]),
    steps: stepList([["Accept admission", "Confirm the place and pay the tuition deposit"], ["Document funds", "Evidence living costs for the study period"], ["Apply for ST1 permit", "Submit the student residence permit application online"], ["Give biometrics", "At the Danish embassy or an accredited centre"], ["Register on arrival", "Get your CPR number and residence card in Denmark"]]),
    work: "Students can work 20 hours a week during term and full time in June, July and August. After graduating you receive a 3-year establishment card to work or start a business in Denmark.",
    workPoints: ["20 hrs/week; full time in summer", "3-year establishment card", "Positive List and Pay Limit work schemes"],
    faq: qa([["Why study in Denmark?", "Project-based teaching, close industry links and strong design, engineering and life-science faculties."], ["Is Danish required?", "No for English-taught programmes; Danish supports local job hunting."], ["What is the establishment card?", "A 3-year permit allowing graduates to work or start a business in Denmark."], ["Which intakes exist?", "September is the main intake; a limited February intake exists for some programmes."]]),
  },
  {
    /* South Korea — copy supplied by the client in the "destination page" document (2026-11-17). The wording is
       theirs; only this site's layout conventions were applied so it reads like the other pages: periods written
       as "/ year" so the cost cards keep their one-line amount, tuition split into its UG and PG rows, and stray
       trailing punctuation and spaces removed. The hero tagline "Sustainability leaders" is what the document
       says, but it is also Sweden's tagline — probably carried over by mistake; to be confirmed with the client. */
    code: "kr", slug: "south-korea", name: "South Korea", tag: "Sustainability leaders", img: `${IMG}/countries/south-korea.png`, hero: "Study in South Korea", order: 120,
    /* No "| Trinity Study Abroad": the site layout appends it to every title. */
    seoTitle: "Study in South Korea — Cost, Requirements, Visa & Scholarships",
    seoDesc: "Study in South Korea from India: tuition and living costs, admission requirements, scholarships, visa process and post-study work options — guided by Trinity Study Abroad.",
    intro: "South Korea is a country with a rich cultural heritage, technological advancements, culinary delights and stunning natural beauty.\n\nIt is currently the strongest economy in Eastern Asia, internationally recognised for its high academic standards, disciplined learning environment.\n\nIt is famous for K-pop, delicious Korean foods, ancient temples, and dynamic festivals, experience Korean culture, history, and modern lifestyle.",
    stats: stat([["10 (200+)", "Universities"], ["Upto 3 years", "Job-search permit"], ["Mar / Sep", "Intakes"], ["$ 7500 - $ 25000", "Tuition / year"]]),
    why: ["Internationally recognised for its high academic standards, disciplined learning environment.", "Korea ranks 8th globally for safety, making it one of the most student-friendly countries in the world.", "Affordable Tuition fees with Scholarships for International Students.", "One of the leaders in technology and innovation", "Job opportunities with global companies"],
    courses: ["Business Administration & Global Management", "Artificial Intelligence, Data Science & Big Data", "Culinary Arts & Global Hotel Management", "K-Beauty Design & K-Pop Arts Management", "Media and Communication Arts", "Restaurant and Entrepreneurship", "MBA & International Business Management", "Marketing and Technology and Entrepreneurship", "Hospitality management", "PhD in Global Management", "PhD in Hospitality and Tourism Management", "PhD in Design / Management Studies", "PhD in AI"],
    unis: [],
    visa: "The length of a student visa in South Korea is aligned with the academic program in which the student is enrolled. Documents required - COA issued by the president/dean of your host South Korean university, Apostille or Embassy Verification, Financial documents like bank statements and ITRs of sponsors, academic documents and covering letters.",
    intakes: "Jan / Mar / Sep",
    cost: pair([["Tuition (UG)", "$ 25000 / year"], ["Tuition (PG)", "$ 9500 - $ 27500 / year"], ["Living expenses", "$13000 to 18000 USD per year"], ["Visa processing fee", "$ 60 - 80"], ["Insurance", "$ 67 per month"], ["Total year one (approximately)", "$ 8500 - 50500 / year"]]),
    req: pair([["Academics", "A bachelor’s degree with 70%+ and above or GPA of 3.0 or higher"], ["English test", "IELTS 5.5 and above"], ["Documents", "SOP, CV, LORs, transcripts, passport, insurance"]]),
    sch: named([["University scholarships", "Merit based scholarships from 30% to 100%"]]),
    steps: stepList([["Application & approval", "Universities send Certificate of Admission documents to the student confirming acceptance and after payment of deposit."], ["Funds Prep", "Gets all the academic & financial document apostilled"], ["VISA filing", "Applies to Korean Embassy for D2 student visa with the COA and other documentation."], ["Time", "10 to 15 working days"]]),
    work: "Post study work visa is for 3 years.\n\nThe D-10 visa allows international students who have completed their studies in South Korea to stay and search for work or start a business.\n\nThis visa provides an opportunity to transition from student status to full-time employment in South Korea.\n\nIf the student secures employment, the student can switch to a long-term work visa(E-5 or other work visas).",
    workPoints: ["Students must apply for work permission through the Korean Immigration Service or their university’s international office.", "Students can work at stores, cafes, on-campus positions, retail, tutoring, and freelance translation—all typically paying between ₩9,860/hr to ₩40,000/hr.", "Monthly earnings usually range from ₩800K–₩1.2M", "Students are generally allowed to work 20 hours per week during academic term and 40 hours per week during school vacations."],
    faq: qa([["Can I study in South Korea without knowing Korean?", "Yes. Several universities offer programmes taught in English, particularly at postgraduate level. However, learning Korean can help with everyday communication, internships and employment opportunities. Also some universities teach Korean language as a part of their curriculum."], ["Are there job opportunities in South Korea after graduation?", "Daejeon is known as the Silicon Valley of South Korea and is a Technology and Research Hub. There are good job opportunities available. Also there are global companies like Samsung, Hyundai, LG and others in SK that offer internships, part time and full time jobs."]]),
  },
  {
    /* Netherlands — copy supplied by the client in the "destination page" document (2026-11-17), same conventions
       as South Korea: periods as "/ year" where the cost card can read them, list numbering and bullets from the
       document dropped, stray trailing punctuation removed.
       Two things in the document are probably mistakes and were handled, not hidden:
       - the first intro sentence is spliced with the third paragraph ("…the highest English Educational
         opportunities of the highest standards and a multicultural population. speaking population in Europe…");
         it is restored to the evident sentence, "…one of the highest English speaking population in Europe (above 90%)";
       - the hero tagline "PR-friendly pathways" is Canada's tagline, as "Sustainability leaders" was Sweden's on the
         South Korea tab — kept as written, to be confirmed with the client.
       The scholarship table is empty in the document, so the funding section is simply not shown. */
    code: "nl", slug: "netherlands", name: "Netherlands", tag: "PR-friendly pathways", img: `${IMG}/countries/netherlands.png`, hero: "Study in Netherlands", order: 130,
    seoTitle: "Study in Netherlands — Cost, Requirements, Visa & Scholarships",
    seoDesc: "Study in Netherlands from India: tuition and living costs, admission requirements, scholarships, visa process and post-study work options — guided by Trinity Study Abroad.",
    intro: "Country with one of the highest English speaking population in Europe (above 90%).\n\nCountry has a long history of international trade having forged links with countries around the world, bringing together knowledge, skills, business and ideas.\n\nNetherlands offers educational opportunities of the highest standards and a multicultural population.",
    stats: stat([["10+", "Universities"], ["1 year", "PGWP"], ["Sep / Oct / Feb", "Intakes"], ["Euro 20k–25k", "Tuition / year"]]),
    why: ["One of the most industrialised countries of the world", "Low tuition fees and programs taught in English", "Upto 16 hours of part time work opportunities available", "Post-Graduation Work Permit for 1 year"],
    courses: ["Electrical & Electronic Engineering", "MBA and Business Management", "Finance & Accounting", "Hospitality & Tourism Management", "Mechanical, Civil and Chemical Engineering", "Law and Psychology"],
    unis: [],
    visa: "The study programme has to be recognised by the Accreditation Organisation of the Netherlands and Flanders or NVAO (in the Netherlands) or the European Quality Assurance Register for Higher Education or EQAR (Europe). The university or the education institution has to be a recognised sponsor with the IND. Universities apply for temporary stay visa (MVV) on behalf of the students. On arriving in the Netherlands, the University will apply for a residence permit on behalf of the student. Visa fee and resident permit fees included in the tuition fees package.",
    intakes: "Three intakes — September, October and Feb. Apply 6–9 months ahead.",
    cost: pair([["Tuition (master’s)", "Euro 20000 to 25000"], ["Living expenses", "Euro 15,000 / year (updated: €17,000 / year)"], ["Visa fee & Resident permit", "Approximately Euro 254"], ["Total year one", "Euro 35,000 – 42000 (€36000 - €43000)"]]),
    req: pair([["Academics", "60%+ in bachelor’s; 15 years of education accepted for MS"], ["English test", "IELTS 6.5 with no band below 6.0"], ["Documents", "SOP, LORs, transcripts, passport"]]),
    sch: [],
    steps: stepList([["Application", "Educational institution collects all documents needed for visa including income requirements."], ["MVV", "The university submits the application and applies for your MVV and student residence permit at the same time."], ["Turn around time", "Visa shall be received in around 4-8 weeks. Student needs to go for Biometrics at the local Embassy/Consulate. MVV valid 90 days."], ["Resident permit", "On arriving in the Netherlands, the University will apply for a residence permit on behalf of the student."]]),
    work: "Part time Jobs- Students can work up to 16 hours/week. Typical part time earning are €10 to €15 per hour.\n\nPost study work Visa of 1 year is offered to the students to take up a job and gain international exposure after completion of their studies.",
    workPoints: [],
    faq: qa([["Do Institutions accept a 3 years Bachelor’s or 15 years of education for a Master’s?", "Yes, Netherlands universities accept 3-year Indian bachelor’s degrees for master’s."], ["What is the turnaround time for Offer letters from Institutions?", "The turnaround time is around 3 to 6 weeks."], ["Are backlogs accepted by Dutch universities?", "No, backlogs are not accepted."], ["A student completed his Bachelor’s degree in 2010 and has been working since then. He has a total work experience of 9 years. Can the student apply for a Masters’ course?", "Yes, the student can apply."], ["Can IELTS be waived off in the Netherlands?", "No, IELTS is a mandatory requirement."], ["If a student has already completed a Master’s and would like to pursue a second Master’s program in Netherlands, is it possible?", "Yes, a student can apply for a second Master’s in Netherlands"]]),
  },
  {
    /* Japan — copy supplied by the client in the "destination page" document, tab "Japan" (2026-11-17); same
       conventions as South Korea and the Netherlands: list markers dropped, periods as "/ year" or "per month" where
       the cost cards can read them, the visa bullets folded into the visa paragraph (that field is one paragraph),
       stray spaces and a doubled space removed.
       Handled, not hidden:
       - the visa-fee row ends "¥30,000 (" — an unfinished bracket; shown as "¥30,000";
       - the total's bracketed second range "(21,00,000 to 47,00,000 annually)" has no currency sign in the document;
         kept as written except for "annually", which the card's "/ year" already says and which was cut off at the
         card's edge;
       - the hero tagline "Sustainability leaders" is Sweden's (it was also on the South Korea tab) — kept, to be
         confirmed with the client. */
    code: "jp", slug: "japan", name: "Japan", tag: "Sustainability leaders", img: `${IMG}/countries/japan.png`, hero: "Study in Japan", order: 140,
    seoTitle: "Study in Japan — Cost, Requirements, Visa & Scholarships",
    seoDesc: "Study in Japan from India: tuition and living costs, admission requirements, scholarships, visa process and post-study work options — guided by Trinity Study Abroad.",
    intro: "Japan is an increasingly attractive study abroad destination for students looking for high-quality education, advanced technology, research opportunities and international exposure. It offers a unique combination of academic excellence, innovation, rich culture and career opportunities.\n\nJapan is experiencing an aging society and declining birth rates, which has led to a growing openness to foreign talent and international students.",
    stats: stat([["5", "Universities"], ["12 months", "Job-search permit"], ["Sep / April", "Intakes"], ["¥10,00,000 - ¥18,00,000", "Tuition / year"]]),
    why: ["World-Class Education with advanced research infrastructure", "Strong Career Prospects including post-study work and industry exposure", "Affordable Tuition and low living costs", "English-Taught Programs available across disciplines", "Student-friendly cities & excellent healthcare and public services", "Welcoming Immigration Policies and growing demand for global talent", "Opportunity to Learn Japanese, enhancing global career value"],
    courses: ["Digital Business & Innovation", "Business Finance & Economics", "Data Science, AI & Engineering", "Liberal Arts, Music, Visual Arts", "Business Administration & MBA", "Japanese conversation course"],
    unis: [],
    visa: "The length of a student visa in Japan is aligned with the academic program in which the student is enrolled. Undergraduate programs – Typically valid for up to 4 years. Master’s programs- Typically valid up to 2 years. Japanese language schools – Usually 6 months to 1 year. Documents required - COE from the Immigration Services Bureau of Japan. Financial documents like bank statements and ITRs of sponsors, academic documents and covering letter.",
    intakes: "September and April",
    cost: pair([["Tuition", "¥10,00,000 - ¥18,00,000 / year"], ["Living expenses", "¥80,000 - ¥1,60,000 per month"], ["Visa processing fee", "¥30,000"], ["Insurance", "¥10,000 / year"], ["Total year one (approximately)", "¥11,00,000 - ¥25,00,000 / year (21,00,000 to 47,00,000)"]]),
    req: pair([["Academics", "A bachelor’s degree with 55%+ and above, differs from university to university"], ["English test", "IELTS 6.0 and above"], ["Funds", "Approximately ¥ 120000 per month during the study period"], ["Documents", "SOP, CV, LORs, transcripts, passport, insurance"]]),
    sch: named([["JASSO (Japan Student Services Organization)", "Living stipend of ¥48000 per month for 6 months."], ["University scholarships", "Merit based scholarships from 30% to 100%"]]),
    steps: stepList([["Application & approval", "Educational institutions send admission approval letters."], ["Education Institute", "Submits application for COE to Immigration Bureau"], ["Immigration Bureau", "Sends COE to educational institute / university"], ["Student", "Receives COE from university and applies for permission to land to the Japanese Embassy"], ["Regional Immigration Bureau", "Receive residence card when you land"]]),
    work: "Students are generally given 90 days time to apply for a change in residency status after their course.\n\nThey need to apply for a Job Hunting or Designated Activities visa with the Immigration Bureau. The visa will be valid for 6 months, extendable up to 1 year maximum.\n\nWhen the student receives the job offer they can directly switch to a Work visa which is valid as long as the student is employed.",
    workPoints: ["Part-Time Work: Student visa holders can work up to 28 hours/week and up to 40 hours a week over vacations."],
    faq: qa([["Can I study in Japan without knowing Japanese?", "Yes. Several Japanese universities offer programmes taught entirely in English. However, learning basic Japanese is helpful for daily life and employment opportunities."], ["Can international students find job opportunities in Japan after graduation?", "Japan is the world’s 5th largest economy, known for leading companies in business, technology, automotive, and manufacturing. Its ageing and shrinking population is creating new opportunities for international students."]]),
  },
  {
    /* Malaysia — copy supplied by the client in the "destination page" document, tab "Malaysia" (2026-11-17); same
       conventions as the earlier tabs: numbering dropped, periods as "/ year" where a cost card can read them,
       double spaces collapsed, the work paragraphs separated. Spelling is the document's own ("criterias").
       Handled, not hidden:
       - the document has an "FAQs" heading but no questions, so `faq` is empty and the page omits that section;
       - tuition is two lines (UG / PG, in "Malaysian Ringgit") and the visa cost two lines (SEV, eVAL): each is
         its own cost row, and "Malaysian Ringgit" is written "MR", the document's own abbreviation everywhere else,
         so the amounts do not shrink to fit the card;
       - the stat "PGWP / 3 yrs" disagrees with the work section ("1-year Graduate pass") — kept as written;
       - the hero tagline "PR-friendly pathways" is Canada's — kept, to be confirmed with the client. */
    code: "my", slug: "malaysia", name: "Malaysia", tag: "PR-friendly pathways", img: `${IMG}/countries/malaysia.png`, hero: "Study in Malaysia", order: 150,
    seoTitle: "Study in Malaysia — Cost, Requirements, Visa & Scholarships",
    seoDesc: "Study in Malaysia from India: tuition and living costs, admission requirements, scholarships, visa process and post-study work options — guided by Trinity Study Abroad.",
    intro: "Malaysia is a good study abroad destination that offers international education, global exposure and good value for money, especially for students who may find studying in the UK, USA or Australia financially challenging.\n\nMalaysia hosts international branch campuses of universities from the UK and Australia, allowing students to earn degrees from established foreign universities while studying in Malaysia.\n\nMalaysia's biggest advantages are its affordability, multicultural environment, English-medium education, international university campuses and proximity to India.",
    stats: stat([["45+", "Universities"], ["3 yrs", "PGWP"], ["Sep / Jan / May", "Intakes"], ["MR 13K - 56K", "Tuition / year"]]),
    why: ["Quality Education at affordable fees & cost of living", "International campuses from UK and Australia", "Medium of instruction accepted by many universities", "Programs taught in English", "Minimum entry criterias", "Simplified visa process, No visa interview, spouse friendly"],
    courses: ["Hospitality and Tourism / Digital Media / Culinary", "Business and Commerce / Logistics", "Information Technology", "Finance / Psychology", "Computer Science & AI / Data Science", "Biotechnology & Pharmaceutical Science", "Mechanical, Chemical, Electric and Electronic Engineering"],
    unis: [],
    visa: "An Indian student applying for a Malaysian Student Pass generally needs both eVAL and SEV before travelling to Malaysia. eVAL (Electronic Visa Approval Letter) - Immigration approval for the student to enter Malaysia for education. SEV (Single Entry Visa) - Pre-arrival visa required for Indian students under the student visa route.",
    intakes: "Rolling intakes throughout the year.",
    cost: pair([["Tuition (UG)", "MR 13000 to 34000"], ["Tuition (PG)", "MR 17000 to 52000"], ["Living expenses", "MR 13,000 – 17,000 / year"], ["Visa cost — SEV (Single entry visa)", "MR 130"], ["Visa cost — eVAL (Electronic Visa Approval Letter)", "MR 3445"], ["Total year one", "MR 52,000 – 1,09,165"]]),
    req: pair([["Academics", "For UG - 60%+ / For PG - 63%+ in bachelor’s; 3-year degrees accepted for many programmes"], ["English test", "IELTS 5.5 and above for UG & IELTS 6.5 and above for PG"], ["Documents", "SOP, LORs, transcripts, passport, Resume, Grading scale, Language proficiency, Marksheets"]]),
    sch: named([["By the University", "Students are eligible to get merit based only if student has 70% and above CGPA in their last education."]]),
    steps: stepList([["Get the LOA", "Receive university admission offer."], ["Student application", "University submits student pass application through EMGS"], ["EMGS", "EMGS processes the application and obtains Immigration approval. eVAL is issued."], ["SEV", "Student applies for SEV using the eVAL."], ["Student Pass", "Student travels to Malaysia, completes post-arrival medical screening and student pass endorsement."]]),
    work: "Part time & Internship: Students can work part time when they have more than 7 days of holidays. Internships are allowed in Malaysia.\n\nDegree seeking students get 1-year Graduate pass after completing their degree.\n\nDependents and Spouse friendly - Dependents can travel once a student has enrolled at the university and gets the Student Pass stamping and can stay on Dependent Pass till the time of study. If dependents get job opportunities their dependent pass can be converted to Employee pass.",
    workPoints: [],
    faq: [],
  },
];

/** Extra blog-post fields introduced by the canvas design (key takeaways, sources, tags). Keyed by post slug. */
export const postExtras: Record<string, { tags: string[]; takeaways: string[]; sources: { label: string; href: string }[] }> = {
  "how-to-choose-the-right-country-to-study-abroad": {
    tags: ["Country Selection", "Budget Planning", "Stay-back Visa", "Intakes"],
    takeaways: ["Decide the country before the university — visa and job-market rules matter more than rank.", "Budget a full year: tuition, living, insurance, flights and a safety buffer.", "Germany is the lowest-cost option; the UK and Ireland cut cost through one-year master’s degrees.", "Start 10–12 months before your intake or you will be forced to defer."],
    sources: [{ label: "Study in Germany — tuition at public universities", href: "https://www.study-in-germany.de/" }, { label: "UK Graduate Route visa — GOV.UK", href: "https://www.gov.uk/graduate-visa" }, { label: "Study permits and PGWP — Government of Canada", href: "https://www.canada.ca/en/immigration-refugees-citizenship.html" }],
  },
  "student-visa-interview-tips-for-indian-students": {
    tags: ["Student Visa", "Interview Prep", "Documents", "Refusal Reasons"],
    takeaways: ["Officers test three things: genuine intent, ability to pay, and intent to comply.", "Answer in two clear lines — memorised speeches hurt more than they help.", "Carry finances, offer letter and test scores in one organised folder.", "Inconsistent funding is the single most common refusal reason."],
    sources: [{ label: "U.S. student visa interview guidance — travel.state.gov", href: "https://travel.state.gov/" }, { label: "Student visa subclass 500 — Australian Department of Home Affairs", href: "https://immi.homeaffairs.gov.au/" }],
  },
  "how-to-write-a-statement-of-purpose-sop": {
    tags: ["SOP", "Applications", "Admissions", "Writing Tips"],
    takeaways: ["Use a 5-paragraph structure across 800–1000 words unless the university says otherwise.", "Open with a concrete problem you worked on, never a childhood-dream line.", "The “why this university” paragraph is where most SOPs go generic — make it specific.", "Keep a master SOP and rewrite the fit paragraph for every application."],
    sources: [{ label: "UCAS personal statement guidance", href: "https://www.ucas.com/" }, { label: "Common App guidance for applicants", href: "https://www.commonapp.org/" }],
  },
};
