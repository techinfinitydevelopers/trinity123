"use client";
import { useEffect, useRef, useState } from "react";
import { useMedia, type MediaItem } from "./ImagePicker";
import { updateMediaAction, deleteMediaAction } from "@/lib/actions";
import { toast, Confirm, fmt } from "./ui";

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaGrid() {
  const { items, loading, load, upload, setItems } = useMedia();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [drag, setDrag] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => { void load(); }, []);
  useEffect(() => { const t = setTimeout(() => void load(q), 250); return () => clearTimeout(t); }, [q]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        <div className={`card mb-4 flex flex-wrap items-center gap-3 p-3 transition ${drag ? "ring-4 ring-brand/20" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={async (e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) await upload(e.dataTransfer.files); }}>
          <input className="inp inp-sm max-w-xs" placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} />
          <p className="text-[13px] text-ink-3">{items.length} files · drag & drop anywhere here</p>
          <button className="btn-primary btn-sm ml-auto" onClick={() => inp.current?.click()}>Upload images</button>
          <input ref={inp} type="file" accept="image/*" multiple hidden onChange={async (e) => { if (e.target.files?.length) await upload(e.target.files); e.target.value = ""; }} />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
          {loading && !items.length ? <p className="col-span-full py-10 text-center text-[13px] text-ink-3">Loading…</p> : null}
          {items.map((m) => (
            <button key={m.id} onClick={() => setSel(m)} className={`overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-card ${sel?.id === m.id ? "border-brand ring-4 ring-brand/15" : "border-line"}`}>
              <div className="aspect-square bg-canvas"><img src={m.url} alt={m.alt} className="h-full w-full object-cover" loading="lazy" /></div>
              <p className="truncate px-2 py-1.5 text-[11px] text-ink-2">{m.filename}</p>
            </button>
          ))}
          {!loading && !items.length ? <p className="col-span-full py-16 text-center text-[13px] text-ink-3">No uploads yet.</p> : null}
        </div>
      </div>
      <aside className="card h-fit p-4 lg:sticky lg:top-8">
        {sel ? (
          <div className="space-y-3 fade-up">
            <div className="overflow-hidden rounded-xl border border-line bg-canvas"><img src={sel.url} alt={sel.alt} className="max-h-56 w-full object-contain" /></div>
            <p className="truncate text-[13px] font-semibold text-navy" title={sel.filename}>{sel.filename}</p>
            <p className="text-[12px] text-ink-3">{kb(sel.bytes)} · {fmt(sel.createdAt)}</p>
            <div><label className="lbl">Alt text</label><input className="inp inp-sm" defaultValue={sel.alt} key={sel.id} onBlur={async (e) => { const alt = e.target.value; const r = await updateMediaAction(sel.id, alt); if (r.ok) { setItems((s) => s.map((x) => (x.id === sel.id ? { ...x, alt } : x))); toast("Alt text saved"); } }} /></div>
            <div><label className="lbl">URL</label><div className="flex gap-2"><input className="inp inp-sm font-mono text-[11px]" readOnly value={sel.url} /><button className="btn-ghost btn-xs" onClick={() => { navigator.clipboard.writeText(sel.url); toast("Copied"); }}>Copy</button></div></div>
            <Confirm onConfirm={async () => { const r = await deleteMediaAction(sel.id); if (r.ok) { setItems((s) => s.filter((x) => x.id !== sel.id)); setSel(null); toast("Deleted"); } else toast(r.error, "err"); }}>Delete file</Confirm>
          </div>
        ) : <p className="py-10 text-center text-[13px] text-ink-3">Select a file to see details.</p>}
      </aside>
    </div>
  );
}
