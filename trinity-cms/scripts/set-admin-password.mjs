/* Sets the admin password. The seed only ever *creates* the admin user — its upsert leaves an
   existing row alone — so this is the way to change or recover it.

     DATABASE_URL="<url>" ADMIN_PASSWORD="<new password>" node scripts/set-admin-password.mjs

   Optionally ADMIN_EMAIL to target a different account; it defaults to the seeded one. The
   password is read from the environment and never printed. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const email = (process.env.ADMIN_EMAIL ?? "admin@trinitystudyabroad.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 10) {
  console.error("Set ADMIN_PASSWORD to at least 10 characters. It is the only login to the dashboard.");
  process.exit(1);
}

const db = new PrismaClient();
const user = await db.user.update({
  where: { email },
  data: { password: await bcrypt.hash(password, 12) },
}).catch(() => null);

if (!user) {
  console.error(`No user with email ${email}. Check ADMIN_EMAIL, or run the seed first.`);
  process.exit(1);
}

console.log(`Password updated for ${email}.`);
await db.$disconnect();
