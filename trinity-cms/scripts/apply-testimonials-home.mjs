/* Puts the testimonials section on the home page, after Courses (client brief 29/09).

     DATABASE_URL="<url>" node scripts/apply-testimonials-home.mjs

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards.

   It reuses the two genuine student quotes already on the About page. The client has asked for a
   management message and two more named students on top; those words have to come from them —
   writing testimonials on a client's behalf is not something to do — so they are added in the
   editor once supplied.                                                                         */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

const about = await db.page.findUnique({ where: { slug: "about-us" } });
const source = about?.blocks.find((b) => b.type === "testimonials");
if (!source) { console.log("no testimonials block to copy from — nothing done"); await db.$disconnect(); process.exit(0); }

const home = await db.page.findUnique({ where: { slug: "home" } });
const blocks = home.blocks;
if (blocks.some((b) => b.type === "testimonials")) { console.log("home already has testimonials"); await db.$disconnect(); process.exit(0); }

const after = blocks.findIndex((b) => b.type === "courses");
blocks.splice((after === -1 ? blocks.findIndex((b) => b.type === "universities") : after) + 1, 0, JSON.parse(JSON.stringify(source)));
await db.page.update({ where: { id: home.id }, data: { blocks } });
console.log(`home: ${blocks.map((b) => b.type).join(", ")}`);

await db.$disconnect();
