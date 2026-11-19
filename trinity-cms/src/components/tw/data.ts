// @ts-nocheck
export const ORIGIN={name:'Mumbai',lat:19.076,lon:72.878};
export const FIELDS='Business · Data & AI · Engineering · Health';
const BASE=[
/* Each `u` list below is the client's own partner-institution sheet (shared 19 Nov 2026,
   "Website - Countries & University.xlsx") — only universities Trinity can actually place
   students into, not every well-known name for that country. Italy and "Affordable Europe"
   are not in that sheet, so their lists are left as they were. */
{k:'uk',n:'United Kingdom',s:'UK',lat:51.5,lon:-0.12,city:'London',test:'IELTS · UKVI',u:['University College London','King\'s College London','University of Edinburgh','University of Manchester','University of Bristol','University of Glasgow','University of Warwick','University of Birmingham']},
{k:'ireland',n:'Ireland',s:'Ireland',lat:53.35,lon:-6.26,city:'Dublin',test:'IELTS · PTE',u:['Trinity College Dublin','University College Dublin','University College Cork','University of Galway','Dublin City University']},
{k:'france',n:'France',s:'France',lat:48.86,lon:2.35,city:'Paris',test:'IELTS · TCF / DELF',u:['Sciences Po','INSEAD','EM Normandie','ESCP Business School','SKEMA Business School','Emlyon Business School']},
{k:'germany',n:'Germany',s:'Germany',lat:52.52,lon:13.4,city:'Berlin',test:'IELTS · TestDaF',u:['Technical University of Munich','TU Berlin','LMU Munich','Heidelberg University','RWTH Aachen']},
{k:'nz',n:'New Zealand',s:'New Zealand',lat:-36.85,lon:174.76,city:'Auckland',url:'https://trinity123-production.up.railway.app/destinations/new-zealand',test:'IELTS Academic',u:['University of Auckland','University of Otago','Massey University','Victoria University of Wellington','University of Canterbury']},
{k:'uae',n:'UAE',s:'UAE',lat:25.2,lon:55.27,city:'Dubai',url:'',test:'IELTS · EmSAT',u:['University of Birmingham Dubai','University of Wollongong Dubai','Heriot-Watt University Dubai','Curtin University Dubai','De Montfort University Dubai']},
{k:'singapore',n:'Singapore',s:'Singapore',lat:1.29,lon:103.85,city:'Singapore',url:'',test:'IELTS · TOEFL',u:['National University of Singapore','Nanyang Technological University','Nanyang Institute of Management','SUTD']},
{k:'australia',n:'Australia',s:'Australia',lat:-33.87,lon:151.21,city:'Sydney',test:'IELTS · PTE',u:['UNSW Sydney','University of Melbourne','University of Sydney','Australian National University','Monash University','University of Queensland','University of Western Australia']},
{k:'japan',n:'Japan',s:'Japan',lat:35.68,lon:139.69,city:'Tokyo',url:'',test:'JLPT · EJU · IELTS',u:['International College of Liberal Arts','Tokyo International University','Lakeland University Japan','University of Idaho (Japan)','Kudan Institute of Japanese Language & Culture']},
{k:'korea',n:'South Korea',s:'Korea',lat:37.57,lon:126.98,city:'Seoul',url:'',test:'TOPIK · IELTS',u:['Kangwon National University','Namseoul University','Daegu University','Le Cordon Bleu-Sookmyung Academy','Woosong University']},
{k:'usa',n:'USA',s:'USA',lat:40.71,lon:-74.0,city:'New York',test:'TOEFL · IELTS · GRE / SAT',u:['University of Pennsylvania','Johns Hopkins University','Northwestern University','Carnegie Mellon University','New York University','University of Texas at Austin','UCLA','Fordham University','University of Massachusetts Amherst']},
{k:'canada',n:'Canada',s:'Canada',lat:43.65,lon:-79.38,city:'Toronto',test:'IELTS Academic',u:['McGill University','University of Waterloo','McMaster University','University of Calgary','Simon Fraser University','University of British Columbia']},
{k:'netherlands',n:'Netherlands',s:'Netherlands',lat:52.37,lon:4.9,city:'Amsterdam',url:'',test:'IELTS · TOEFL',u:['TU Delft','University of Twente','Radboud University','Wittenborg University of Applied Sciences','University of Amsterdam']},
{k:'italy',n:'Italy',s:'Italy',lat:41.9,lon:12.5,city:'Rome',url:'',test:'IELTS · PTE',u:['Politecnico di Milano','Bocconi University','Sapienza University of Rome','University of Bologna','University of Padua','Politecnico di Torino']},
{k:'malaysia',n:'Malaysia',s:'Malaysia',lat:3.14,lon:101.69,city:'Kuala Lumpur',url:'',test:'IELTS · MUET',u:['University of Southampton Malaysia','Universiti Sains Malaysia','Tunku Abdul Rahman University of Management and Technology','Universiti Teknologi Malaysia','Taylor\'s University']},
{k:'europe',n:'Affordable Europe',s:'Europe',lat:50.08,lon:14.43,city:'Prague',url:'',test:'IELTS · Local language',u:['KU Leuven','ETH Zurich','Politecnico di Milano','University of Copenhagen','University of Vienna','Charles University']},
{k:'denmark',n:'Denmark',s:'Denmark',lat:55.68,lon:12.57,city:'Copenhagen',url:'',test:'IELTS · TOEFL',u:['University of Southern Denmark','International Business Academy','VIA University College','Copenhagen Academy of Digital Arts']},
{k:'sweden',n:'Sweden',s:'Sweden',lat:59.33,lon:18.07,city:'Stockholm',url:'',test:'IELTS · TOEFL',u:['Lund University','Uppsala University','Stockholm School of Economics','KTH Royal Institute of Technology','University of Gothenburg']}
];

/* ---- added by this site, not part of the drop-in -------------------------------------------
   The dashboard owns the *content* of each country — its name, short name, city, test list
   and universities. It does not own lat/lon: those place the pin on the globe and define the
   flight arc, so they stay here and are merged under whatever the dashboard supplies. An
   editor can rewrite every word on the page without being able to break the geometry.

   TrinityWorldHost writes this global while it renders, which is before the child effect that
   imports the engine — and importing the engine is what evaluates this module. */
export const COUNTRIES = BASE.map((c) => {
  const o = (globalThis as any).__TW_CONTENT__?.[c.k];
  return o ? { ...c, ...o, k: c.k, lat: c.lat, lon: c.lon } : c;
});
