import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import MediaGrid from "@/components/admin/MediaGrid";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  await requireAdminPage();
  return (
    <>
      <PageHeader title="Media library" sub="Upload images once, use them anywhere — pages, blog posts, logo." />
      <MediaGrid />
    </>
  );
}
