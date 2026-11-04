/* Our Services page: drop the hero ("At TSA." with the four service chips) and the sentence under the
   "Our Services" heading, so the page starts at the list of services.

     DATABASE_URL="<url>" npx tsx scripts/remove-services-hero.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/remove-services-hero.ts --apply    # write

   Changes only the "our-service" page: removes its `pageHero` block and empties the `lead` of its
   `services` block (src/lib/seed-content.ts says the same). The old blocks are saved to scripts/backups/
   first. Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy (or save any
   page in /admin) afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();
type Block = Record<string, unknown>;

async function main() {
  const page = await db.page.findUnique({ where: { slug: "our-service" } });
  if (!page) throw new Error("our-service page not found");
  const blocks = page.blocks as unknown as Block[];
  const hasHero = blocks.some((b) => b.type === "pageHero");
  const s = blocks.findIndex((b) => b.type === "services");
  const hasLead = s >= 0 && !!blocks[s].lead;
  if (!hasHero && !hasLead) { console.log("our-service: no hero and no lead — nothing to do"); return; }
  console.log(`our-service: ${hasHero ? "drop the hero" : "no hero"}; ${hasLead ? "empty the services lead" : "lead already empty"}`);
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/services-hero-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(page.blocks, null, 2));
  const next = blocks.filter((b) => b.type !== "pageHero").map((b) => (b.type === "services" ? { ...b, lead: "" } : b));
  await db.page.update({ where: { slug: "our-service" }, data: { blocks: next as unknown as object[] } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
