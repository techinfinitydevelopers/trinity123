import { requireAdminPage } from "@/lib/auth";
import { getSetting } from "@/lib/settings-server";
import { PageHeader } from "@/components/admin/ui";
import ThemeForm from "@/components/admin/ThemeForm";

export const metadata = { title: "Theme & UI" };

export default async function ThemePage() {
  await requireAdminPage();
  const theme = await getSetting("theme");
  return (
    <>
      <PageHeader title="Theme & UI" sub="Colours, fonts and shapes for the whole website. Preview updates live; save to publish." />
      <ThemeForm initial={theme} />
    </>
  );
}
