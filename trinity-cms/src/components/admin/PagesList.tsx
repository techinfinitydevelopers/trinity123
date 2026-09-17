"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPageAction, deletePageAction } from "@/lib/actions";
import { slugify } from "@/lib/blocks";
import { Confirm, fmt, toast, Field } from "./ui";

export type PageRow = { slug: string; title: string; navLabel: string; isSystem: boolean; updatedAt: string; blockCount: number };

export default function PagesList({ pages }: { pages: PageRow[] }) {
  const r = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    const res = await createPageAction({ title, slug: slug || slugify(title) });
    setBusy(false);
    if (res.ok) { toast("Page created"); r.push(`/admin/pages/${res.id}`); } else toast(res.error, "err");
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><button className="btn-primary btn-sm" onClick={() => setOpen(true)}>+ New page</button></div>
      <div className="card overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-canvas text-[11px] uppercase tracking-wide text-ink-3"><tr><th className="px-4 py-3 font-semibold">Page</th><th className="hidden px-4 py-3 font-semibold sm:table-cell">URL</th><th className="hidden px-4 py-3 font-semibold md:table-cell">Sections</th><th className="hidden px-4 py-3 font-semibold lg:table-cell">Updated</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-line">
            {pages.map((p) => {
              const path = p.slug === "home" ? "/" : `/${p.slug}`;
              return (
                <tr key={p.slug} className="hover:bg-canvas/60">
                  <td className="px-4 py-3"><Link href={`/admin/pages/${p.slug}`} className="font-semibold text-navy hover:text-brand">{p.navLabel || p.title}</Link>{p.isSystem ? <span className="chip ml-2 bg-canvas text-ink-3">system</span> : null}</td>
                  <td className="hidden px-4 py-3 font-mono text-[12px] text-ink-2 sm:table-cell">{path}</td>
                  <td className="hidden px-4 py-3 text-ink-2 md:table-cell">{p.blockCount}</td>
                  <td className="hidden px-4 py-3 text-[12px] text-ink-3 lg:table-cell">{fmt(p.updatedAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <a className="btn-ghost btn-xs mr-1" href={path} target="_blank" rel="noopener">View</a>
                    <Link className="btn-dark btn-xs mr-1" href={`/admin/pages/${p.slug}`}>Edit</Link>
                    {!p.isSystem ? <Confirm className="btn-ghost btn-xs" onConfirm={async () => { const res = await deletePageAction(p.slug); if (res.ok) { toast("Deleted"); r.refresh(); } else toast(res.error, "err"); }}>Delete</Confirm> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-md space-y-4 p-5 fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-navy">New page</h3>
            <Field label="Title"><input className="inp" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Study in Germany" /></Field>
            <Field label="URL" hint="Letters, numbers and dashes"><div className="flex items-center gap-1"><span className="text-[13px] text-ink-3">/</span><input className="inp inp-sm font-mono" value={slug || slugify(title)} onChange={(e) => setSlug(slugify(e.target.value))} /></div></Field>
            <p className="text-[12px] text-ink-3">The page starts with a hero and a text section. Add more sections in the editor, then add it to the menu under Settings → Navigation.</p>
            <div className="flex justify-end gap-2"><button className="btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary btn-sm" disabled={!title.trim() || busy} onClick={create}>Create & edit</button></div>
          </div>
        </div>
      ) : null}
    </>
  );
}
