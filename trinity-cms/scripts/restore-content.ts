/* Loads a scripts/backup-content.ts export into DATABASE_URL, replacing matching rows.

     DATABASE_URL="<url>" npx tsx scripts/restore-content.ts <backup-file.json>

   Counterpart to backup-content.ts: restores Page, Post, Setting, Country, KnowledgeItem.
   Page/Post/Setting/Country are upserted by their natural key (slug/slug/key/code) so local-only
   rows not present in the backup are left alone. KnowledgeItem has no natural key, and its 293
   rows are a single imported set (see scripts/import-chatbot-kb.ts), so it is replaced wholesale:
   delete all, then recreate with the backup's own ids. Post.authorId is dropped on restore — the
   export never carries User rows (see backup-content.ts), so a production author id would be a
   dangling foreign key against a local database. */
import { PrismaClient, Prisma } from "../src/generated/prisma/index.js";
import { readFileSync } from "node:fs";

const db = new PrismaClient();

const file = process.argv[2];
if (!file) throw new Error("usage: restore-content.ts <backup-file.json>");

function describeDatabase(url: string | undefined): string {
  if (!url) return "(DATABASE_URL is not set)";
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || "5432"}/${u.pathname.replace(/^\//, "")} as ${u.username || "(no user)"}`;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

async function main() {
  console.log(`Restoring into: ${describeDatabase(process.env.DATABASE_URL)}`);
  const backup = JSON.parse(readFileSync(file, "utf8")) as {
    exportedAt: string;
    database: string;
    data: {
      page: Array<Record<string, unknown>>;
      post: Array<Record<string, unknown>>;
      setting: Array<Record<string, unknown>>;
      country: Array<Record<string, unknown>>;
      knowledgeItem: Array<Record<string, unknown>>;
    };
  };
  console.log(`Backup from ${backup.database} taken at ${backup.exportedAt}`);

  for (const p of backup.data.page) {
    const { id, slug, title, navLabel, seoTitle, seoDesc, ogImage, blocks, isSystem } = p as {
      id: string; slug: string; title: string; navLabel: string; seoTitle: string | null;
      seoDesc: string | null; ogImage: string | null; blocks: Prisma.InputJsonValue; isSystem: boolean;
    };
    const fields = { title, navLabel, seoTitle, seoDesc, ogImage, blocks, isSystem };
    await db.page.upsert({ where: { slug }, create: { id, slug, ...fields }, update: fields });
  }
  console.log(`page: ${backup.data.page.length} rows upserted`);

  for (const p of backup.data.post) {
    const {
      id, slug, title, excerpt, coverImage, category, readMins, body, faqs, takeaways,
      sources, tags, seoTitle, seoDesc, status, publishedAt,
    } = p as {
      id: string; slug: string; title: string; excerpt: string; coverImage: string | null;
      category: string; readMins: number; body: string; faqs: Prisma.InputJsonValue;
      takeaways: Prisma.InputJsonValue; sources: Prisma.InputJsonValue; tags: string[];
      seoTitle: string | null; seoDesc: string | null; status: "DRAFT" | "PUBLISHED";
      publishedAt: string | null;
    };
    const fields = {
      title, excerpt, coverImage, category, readMins, body, faqs, takeaways, sources, tags,
      seoTitle, seoDesc, status, publishedAt: publishedAt ? new Date(publishedAt) : null,
      authorId: null,
    };
    await db.post.upsert({ where: { slug }, create: { id, slug, ...fields }, update: fields });
  }
  console.log(`post: ${backup.data.post.length} rows upserted`);

  for (const s of backup.data.setting) {
    const { key, value } = s as { key: string; value: Prisma.InputJsonValue };
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  console.log(`setting: ${backup.data.setting.length} rows upserted`);

  for (const c of backup.data.country) {
    const {
      id, code, slug, name, tag, img, hero, intro, stats, why, courses, unis, visa, intakes,
      cost, req, sch, steps, work, workPoints, faq, seoTitle, seoDesc, isActive, order,
    } = c as Record<string, any>;
    const fields = {
      slug, name, tag, img, hero, intro, stats, why, courses, unis, visa, intakes, cost, req,
      sch, steps, work, workPoints, faq, seoTitle, seoDesc, isActive, order,
    };
    await db.country.upsert({ where: { code }, create: { id, code, ...fields }, update: fields });
  }
  console.log(`country: ${backup.data.country.length} rows upserted`);

  await db.knowledgeItem.deleteMany({});
  if (backup.data.knowledgeItem.length > 0) {
    await db.knowledgeItem.createMany({
      data: backup.data.knowledgeItem.map((k) => {
        const {
          id, question, answer, followUp, tags, keywords, category, relatedQuestions, isActive,
        } = k as Record<string, any>;
        return { id, question, answer, followUp, tags, keywords, category, relatedQuestions, isActive };
      }),
    });
  }
  console.log(`knowledgeItem: ${backup.data.knowledgeItem.length} rows replaced`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
