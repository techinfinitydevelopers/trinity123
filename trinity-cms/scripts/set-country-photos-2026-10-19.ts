/* Puts the client's student-in-city photos on the destination pages.

     DATABASE_URL="<production url>" npx tsx scripts/set-country-photos-2026-10-19.ts

   Only touches Country.img, and only for the ten countries below. Idempotent. The image files
   ship with the deploy (public/assets/img/countries), so push first, then run this, then redeploy
   — a direct database write never reaches `revalidateSite()`. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

const PHOTOS: Record<string, string> = {
  us: "usa", gb: "uk", ca: "canada", ie: "ireland", de: "germany",
  au: "australia", nz: "new-zealand", fr: "france", ae: "dubai", sg: "singapore",
};

async function main() {
  for (const [code, file] of Object.entries(PHOTOS)) {
    const r = await db.country.updateMany({ where: { code }, data: { img: `/assets/img/countries/${file}.png` } });
    console.log(`${code}: ${r.count ? "updated" : "no such country"}`);
  }
}

main().finally(() => db.$disconnect());
