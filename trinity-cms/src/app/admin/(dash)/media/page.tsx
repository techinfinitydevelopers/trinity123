import { PageHeader } from "@/components/admin/ui";
import MediaGrid from "@/components/admin/MediaGrid";

export const metadata = { title: "Media" };

export default function MediaPage() {
  return (
    <>
      <PageHeader title="Media library" sub="Upload images once, use them anywhere — pages, blog posts, logo." />
      <MediaGrid />
    </>
  );
}
