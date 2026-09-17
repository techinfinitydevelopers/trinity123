import { getAllSettings } from "@/lib/settings-server";
import { PageHeader } from "@/components/admin/ui";
import SettingsForms from "@/components/admin/SettingsForms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getAllSettings();
  return (
    <>
      <PageHeader title="Settings" sub="Site identity, contact details, menu and account security." />
      <SettingsForms initial={s} />
    </>
  );
}
