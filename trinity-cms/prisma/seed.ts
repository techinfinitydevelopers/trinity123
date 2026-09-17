/* Seeds the admin user, the six system pages, three blog posts, settings and chatbot knowledge.
   Idempotent: pages/posts are upserted, existing content is NOT overwritten unless --force. */
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { seedPages, seedPosts, seedKnowledge } from "../src/lib/seed-content";
import { seedCountries, postExtras } from "../src/lib/seed-countries";
import { DEFAULTS } from "../src/lib/settings";

const db = new PrismaClient();
const force = process.argv.includes("--force");

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@trinitystudyabroad.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "Trinity@2026");
  if (!password) throw new Error("ADMIN_PASSWORD must be set when seeding a production database. Pick a strong one — it is the only login to the dashboard.");
  const admin = await db.user.upsert({
    where: { email },
    create: { email, name: "Trinity Admin", role: "ADMIN", password: await bcrypt.hash(password, 12) },
    update: {},
  });

  for (const p of seedPages) {
    const existing = await db.page.findUnique({ where: { slug: p.slug } });
    if (existing && !force) continue;
    await db.page.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, title: p.title, navLabel: p.navLabel, seoDesc: p.seoDesc, blocks: p.blocks as object[], isSystem: p.isSystem },
      update: { title: p.title, navLabel: p.navLabel, seoDesc: p.seoDesc, blocks: p.blocks as object[] },
    });
  }

  for (const p of seedPosts) {
    const existing = await db.post.findUnique({ where: { slug: p.slug } });
    if (existing && !force) continue;
    const { authorName: _a, ...rest } = p;
    void _a;
    const extra = postExtras[p.slug] ?? { tags: [], takeaways: [], sources: [] };
    await db.post.upsert({
      where: { slug: p.slug },
      create: { ...rest, ...extra, status: "PUBLISHED", authorId: admin.id },
      update: { ...rest, ...extra },
    });
  }

  for (const c of seedCountries) {
    const existing = await db.country.findUnique({ where: { code: c.code } });
    if (existing && !force) continue;
    await db.country.upsert({ where: { code: c.code }, create: c, update: c });
  }

  for (const [key, value] of Object.entries(DEFAULTS)) {
    await db.setting.upsert({ where: { key }, create: { key, value }, update: force ? { value } : {} });
  }

  if ((await db.knowledgeItem.count()) === 0 || force) {
    if (force) await db.knowledgeItem.deleteMany();
    await db.knowledgeItem.createMany({ data: seedKnowledge });
  }

  console.log(`seeded. admin login → ${email}` + (process.env.ADMIN_PASSWORD ? "" : " / Trinity@2026  (LOCAL DEV DEFAULT — change it in Settings → Security)"));
}

main().finally(() => db.$disconnect());
