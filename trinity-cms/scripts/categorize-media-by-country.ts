/* Media library: sort the uploaded photos into categories named after their country (client, 26/11). The category is Media.folder, so the
   admin Media page shows one chip per country. Only files still in the default "uploads" category are touched; anything not listed here stays
   put. Countries the site has no page for go to "Other countries"; logos and the settlement photo go to "General". Idempotent.

     DATABASE_URL="<url>" npx tsx scripts/categorize-media-by-country.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/categorize-media-by-country.ts --apply    # write

   Direct DB write: the admin media page reads live, no redeploy needed. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

const MAP: Record<string, string[]> = {
  "UK": ["UK.png", "warwick.jpg.jpeg", "University of Birmingham.webp", "Heriot-Watt University.webp"],
  "USA": ["University of Pennsylvania.webp", "Johns Hopkins University.webp", "Northwestern University.webp", "Carnegie Mellon University.jpg", "New York University.webp", "University of Texas at Austin.webp", "University of California, Los Angeles.jpg", "Fordham University.jpg", "University of Massachusetts Amherst.jpg"],
  "Canada": ["CANADA.png", "McGill University.webp", "University of Waterloo.webp", "McMaster University.avif", "University of Calgary.webp", "Simon Fraser University.webp", "University of British Columbia.JPG"],
  "Australia": ["University of Wollongong.webp", "Curtin University.webp", "The University of New South Wales.webp", "University of Melbourne.webp", "University of Sydney.webp", "Australian National University.webp", "Monash University.jpg", "University of Queensland.webp", "University of Western Australia.webp"],
  "New Zealand": ["NEW ZEALAND.png", "University of Auckland.webp", "Otago.webp", "Massey University.jpg", "Victoria University of Wellington.jpeg", "University of Canterbury.webp"],
  "Germany": ["GERMANY.png", "Technical University of Berlin.webp", "Ludwig-Maximilians-Universität München.webp", "Munich.jpg.jpeg", "Universität Heidelberg.webp", "RWTH Aachen University.webp"],
  "France": ["em-lyon-business-school-hero.avif", "Siences PO.jpg.jpeg", "INSEAD.jpg.jpeg", "EM Normandie.jpg.jpeg"],
  "Ireland": ["IRELAND.png"],
  "Japan": ["JAPAN.png", "International College of Liberal Arts.webp", "Tokyo International University.webp", "Lakeland University Japan.webp", "University of Idaho.webp", "Kudan Institute of Japanese Language & Culture.jpeg"],
  "South Korea": ["SOUTH KOREA.png", "Kangwon.jpg.jpeg", "Namseoul.jpg.jpeg", "Daegu.jpg.jpeg", "Le Cordon Bleu-Sookmyung Academy.webp", "Woosong University.webp"],
  "Netherlands": ["netherlands.png", "Delft University of Technology.webp", "University of Twente.webp", "Radboud University.webp", "Wittenborg University of Applied Sciences.webp", "University of Amsterdam.webp"],
  "Italy": ["Politecnico di Milano.jpg", "Bocconi University.jpeg", "Sapienza University of Rome.webp", "University of Bologna.webp", "University of Padua.webp", "Politecnico di Torino.jpeg"],
  "Singapore": ["National University of Singapore.webp", "Nanyang Technological University.webp", "Nanyang Institute of Management.webp", "Singapore University of Technology and Design.webp"],
  "Malaysia": ["University of Southampton Malaysia.webp", "Universiti Sains Malaysia.webp", "Tunku Abdul Rahman University of Management and Technology.webp", "Universiti Teknologi Malaysia.webp", "Taylor's University.webp"],
  "Denmark": ["University of Copenhagen.webp", "University of Southern Denmark.jpg", "International Business Academy.webp", "VIA University College.jpg", "Copenhagen Academy of Digital Arts.webp"],
  "Sweden": ["Lund University.webp", "Uppsala University.webp", "Stockholm School of Economics.webp", "KTH Royal Institute of Technology.jpeg", "University of Gothenburg.webp"],
  "Other countries": ["KU Leuven.jpeg", "ETH Zurich.webp", "University of Vienna.webp", "Charles University.webp"],
  "General": ["Logos (TSA).png", "LAND SETTLE ACCOMMONDATION.png"],
};
const where = new Map<string, string>();
for (const [cat, files] of Object.entries(MAP)) for (const f of files) if (!where.has(f)) where.set(f, cat);

async function main() {
  const files = await db.media.findMany({ where: { folder: "uploads" } });
  const plan = files.filter((m) => where.has(m.filename)).map((m) => ({ id: m.id, filename: m.filename, cat: where.get(m.filename)! }));
  const left = files.filter((m) => !where.has(m.filename)).map((m) => m.filename);
  const by: Record<string, number> = {};
  for (const p of plan) by[p.cat] = (by[p.cat] ?? 0) + 1;
  console.log(`${files.length} files in "uploads": ${plan.length} will move`, by);
  console.log(`left as they are (${left.length}):`, left);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  for (const p of plan) await db.media.update({ where: { id: p.id }, data: { folder: p.cat } });
  console.log("done");
}
main().finally(() => db.$disconnect());
