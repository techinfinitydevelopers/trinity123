/* Puts the client's Our Services copy, extracted from their brief, onto the Services page.

     DATABASE_URL="<url>" npx tsx scripts/apply-services-content.ts <services.json>

   The brief lists thirteen services with their own names and paragraphs; the page carried eight
   written earlier. Those are replaced wholesale — this is the client's own copy, not an edit of
   ours.

   `wide` is set for a service that carries a bullet list, because the card needs the room; the
   rest stay in the normal grid. Every card links to the contact page, which is what the previous
   set did.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("Pass the path to services.json."); process.exit(1); }

type Services = {
  kicker?: string; title?: string; lead?: string;
  items: { title: string; text: string; icon: string; checks?: string[] }[];
};
const src = JSON.parse(readFileSync(file, "utf8")) as Services;
if (!src.items?.length) throw new Error("services.json has no items.");

const db = new PrismaClient();

async function main() {
  const page = await db.page.findUnique({ where: { slug: "our-service" } });
  if (!page) throw new Error("No our-service page in this database.");

  const blocks = page.blocks as Record<string, unknown>[];
  const at = blocks.findIndex((b) => b.type === "services");
  if (at < 0) throw new Error("The Services page has no services block.");

  const was = blocks[at] as Record<string, unknown>;
  blocks[at] = {
    type: "services",
    kicker: src.kicker ?? (was.kicker as string) ?? "What we do",
    title: src.title ?? (was.title as string),
    lead: src.lead ?? (was.lead as string),
    items: src.items.map((i) => ({
      icon: i.icon,
      title: i.title,
      text: i.text,
      checks: i.checks ?? [],
      wide: Boolean(i.checks?.length),
      href: "/contact-us",
      linkLabel: "Talk to an expert",
    })),
  };

  await db.page.update({ where: { slug: "our-service" }, data: { blocks: blocks as unknown as object[] } });
  console.log(`our-service: ${src.items.length} services — ${src.items.map((i) => i.title).join(", ")}`);
  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
