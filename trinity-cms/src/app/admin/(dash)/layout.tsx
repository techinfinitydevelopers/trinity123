import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSetting } from "@/lib/settings-server";
import { db } from "@/lib/db";
import Sidebar from "@/components/admin/Sidebar";
import { ToastHost } from "@/components/admin/ui";

export default async function DashLayout({ children }: { children: ReactNode }) {
  const me = await getSession();
  if (!me) redirect("/admin/login");
  const [site, unread] = await Promise.all([getSetting("site"), db.lead.count({ where: { isRead: false } })]);
  return (
    <div className="flex min-h-screen">
      <Sidebar user={me} logo={site.logo} unread={unread} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </div>
      <ToastHost />
    </div>
  );
}
