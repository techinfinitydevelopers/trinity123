/* Carries a stored `contact.socials` object into the editable `contact.socialLinks` list.

     DATABASE_URL="<url>" node scripts/apply-social-links.mjs

   Settings rows written before the list existed hold only the five fixed keys. `getSetting`
   spreads DEFAULTS underneath the stored row, so such an installation would quietly fall back to
   the default links and lose any URL the owner had edited. This copies them across once.

   Idempotent: a row that already has `socialLinks` is left alone. A direct database write never
   reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";

const ICONS = {
  facebook: ["Facebook", "fab fa-facebook-f"],
  twitter: ["X (Twitter)", "fab fa-twitter"],
  instagram: ["Instagram", "fab fa-instagram"],
  linkedin: ["LinkedIn", "fab fa-linkedin-in"],
  youtube: ["YouTube", "fab fa-youtube"],
};

const db = new PrismaClient();
const row = await db.setting.findUnique({ where: { key: "contact" } });

if (!row) {
  console.log("No stored contact settings — the defaults already carry the list.");
} else if (Array.isArray(row.value.socialLinks)) {
  console.log("socialLinks already present — nothing to do.");
} else {
  const s = row.value.socials ?? {};
  const links = [];
  for (const key of ["facebook", "twitter", "instagram"]) {
    if (s[key]) links.push({ label: ICONS[key][0], icon: ICONS[key][1], href: s[key] });
  }
  /* WhatsApp sat between Instagram and LinkedIn in the old fixed order, and its link is the
     number rather than a URL — hence the sentinel. */
  links.push({ label: "WhatsApp", icon: "fab fa-whatsapp", href: "whatsapp" });
  for (const key of ["linkedin", "youtube"]) {
    if (s[key]) links.push({ label: ICONS[key][0], icon: ICONS[key][1], href: s[key] });
  }

  await db.setting.update({ where: { key: "contact" }, data: { value: { ...row.value, socialLinks: links } } });
  console.log(`socialLinks written: ${links.map((l) => l.label).join(", ")}`);
}

await db.$disconnect();
