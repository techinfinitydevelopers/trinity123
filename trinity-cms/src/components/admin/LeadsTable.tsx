"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleLeadAction, deleteLeadAction } from "@/lib/actions";
import { Confirm, fmt, toast, Empty } from "./ui";

export type LeadRow = { id: string; name: string; email: string; phone: string; subject: string; message: string; source: string; isRead: boolean; createdAt: string };

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const r = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const rows = useMemo(() => leads.filter((l) => (filter === "all" || !l.isRead) && (!q || `${l.name} ${l.email} ${l.phone} ${l.subject} ${l.message}`.toLowerCase().includes(q.toLowerCase()))), [leads, filter, q]);

  const csv = () => {
    const esc = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const body = [["Date", "Name", "Email", "Phone", "Subject", "Message", "Source"].join(","), ...rows.map((l) => [fmt(l.createdAt), l.name, l.email, l.phone, l.subject, l.message, l.source].map(esc).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" })); a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  if (!leads.length) return <Empty title="No leads yet" sub="Submissions from the contact form and the chatbot will appear here." />;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        <div className="flex rounded-lg bg-canvas p-0.5 text-[13px] font-semibold">
          <button className={`rounded-md px-3 py-1.5 ${filter === "all" ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setFilter("all")}>All ({leads.length})</button>
          <button className={`rounded-md px-3 py-1.5 ${filter === "unread" ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setFilter("unread")}>Unread ({leads.filter((l) => !l.isRead).length})</button>
        </div>
        <input className="inp inp-sm max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-ghost btn-sm ml-auto" onClick={csv}>Export CSV</button>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((l) => (
          <li key={l.id} className={`${l.isRead ? "" : "bg-brand-soft/30"}`}>
            <button className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-canvas/60" onClick={async () => { setOpen(open === l.id ? null : l.id); if (!l.isRead) { await toggleLeadAction(l.id, true); r.refresh(); } }}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${l.isRead ? "bg-line" : "bg-brand"}`} />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-[13px] font-bold text-white">{l.name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2"><span className={`text-[14px] ${l.isRead ? "font-medium" : "font-bold"} text-navy`}>{l.name}</span><span className="text-[12px] text-ink-3">{l.email} · {l.phone}</span></span>
                <span className="block truncate text-[13px] text-ink-2">{l.subject ? <b className="font-semibold">{l.subject} — </b> : null}{l.message || "(no message)"}</span>
              </span>
              <span className="shrink-0 text-right text-[11px] text-ink-3"><span className="block">{fmt(l.createdAt)}</span><span className="chip mt-1 bg-canvas text-ink-3">{l.source}</span></span>
            </button>
            {open === l.id ? (
              <div className="fade-up border-t border-line bg-canvas/50 px-4 py-3 pl-[76px]">
                <p className="whitespace-pre-wrap text-[14px] text-ink">{l.message || "—"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="btn-primary btn-xs" href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>Call</a>
                  <a className="btn-ghost btn-xs" href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener">WhatsApp</a>
                  <a className="btn-ghost btn-xs" href={`mailto:${l.email}?subject=Re: ${encodeURIComponent(l.subject || "Your enquiry")}`}>Email</a>
                  <button className="btn-ghost btn-xs" onClick={async () => { await toggleLeadAction(l.id, false); r.refresh(); toast("Marked unread"); }}>Mark unread</button>
                  <Confirm className="btn-ghost btn-xs" onConfirm={async () => { await deleteLeadAction(l.id); r.refresh(); toast("Lead deleted"); }}>Delete</Confirm>
                </div>
              </div>
            ) : null}
          </li>
        ))}
        {!rows.length ? <li className="px-4 py-10 text-center text-[13px] text-ink-3">Nothing matches.</li> : null}
      </ul>
    </div>
  );
}
