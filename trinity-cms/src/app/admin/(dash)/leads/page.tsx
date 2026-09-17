import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import LeadsTable from "@/components/admin/LeadsTable";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  await requireAdminPage();
  const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <>
      <PageHeader title="Leads" sub="Enquiries from the contact form and the chatbot. Click a lead to see the full message and reply." />
      <LeadsTable leads={rows.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))} />
    </>
  );
}
