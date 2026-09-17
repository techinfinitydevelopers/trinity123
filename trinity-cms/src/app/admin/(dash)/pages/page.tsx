import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import PagesList from "@/components/admin/PagesList";

export const metadata = { title: "Pages" };

export default async function PagesPage() {
  const rows = await db.page.findMany({ orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }] });
  const pages = rows.map((p) => ({ slug: p.slug, title: p.title, navLabel: p.navLabel, isSystem: p.isSystem, updatedAt: p.updatedAt.toISOString(), blockCount: Array.isArray(p.blocks) ? (p.blocks as unknown[]).length : 0 }));
  return (
    <>
      <PageHeader title="Pages" sub="Every page on the website. Click a page to edit its sections, text, images and SEO." />
      <PagesList pages={pages} />
    </>
  );
}
