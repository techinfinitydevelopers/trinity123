import { requireAdminPage } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Block } from "@/lib/blocks";
import BlockEditor from "@/components/admin/BlockEditor";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.page.findUnique({ where: { slug }, select: { navLabel: true } });
  return { title: p ? `Edit · ${p.navLabel}` : "Page" };
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const p = await db.page.findUnique({ where: { slug } });
  if (!p) notFound();
  return (
    <BlockEditor initial={{ slug: p.slug, title: p.title, navLabel: p.navLabel, seoTitle: p.seoTitle ?? "", seoDesc: p.seoDesc ?? "", ogImage: p.ogImage ?? "", blocks: (p.blocks as unknown as Block[]) ?? [], isSystem: p.isSystem }} />
  );
}
