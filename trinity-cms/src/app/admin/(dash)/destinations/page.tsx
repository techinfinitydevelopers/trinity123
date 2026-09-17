import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { fmt } from "@/lib/format";

export const metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  await requireAdminPage();
  const rows = await db.country.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader title="Study destinations" sub="Each destination has its own page with costs, requirements, scholarships, visa steps and FAQs. They also power the Study Destinations menu."><Link href="/admin/destinations/new" className="btn-primary btn-sm">+ Add destination</Link></PageHeader>
      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {rows.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-canvas/60">
              <img src={`/assets/img/flags/${c.code}.png`} alt="" className="h-8 w-8 rounded-full object-cover shadow" onError={undefined} />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/destinations/${c.id}`} className="block truncate text-[15px] font-semibold text-navy hover:text-brand">{c.name} <span className="font-normal text-ink-3">· {c.tag}</span></Link>
                <p className="truncate text-[12px] text-ink-3">/destinations/{c.slug} · updated {fmt(c.updatedAt)}</p>
              </div>
              <span className={`chip ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-canvas text-ink-3"}`}>{c.isActive ? "Live" : "Hidden"}</span>
              <a className="btn-ghost btn-xs" href={`/destinations/${c.slug}`} target="_blank" rel="noopener">View</a>
              <Link className="btn-dark btn-xs" href={`/admin/destinations/${c.id}`}>Edit</Link>
            </li>
          ))}
          {!rows.length ? <li className="px-4 py-14 text-center text-[13px] text-ink-3">No destinations yet.</li> : null}
        </ul>
      </div>
    </>
  );
}
