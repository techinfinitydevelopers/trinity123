"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "./ui";

export type MediaItem = { id: string; url: string; filename: string; alt: string; bytes: number; createdAt: string };

export function useMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async (q = "") => {
    setLoading(true);
    const r = await fetch(`/api/media?q=${encodeURIComponent(q)}`);
    if (r.ok) setItems((await r.json()).items);
    setLoading(false);
  };
  const upload = async (files: FileList | File[]) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("file", f));
    const r = await fetch("/api/media", { method: "POST", body: fd });
    const j = await r.json();
    if (!r.ok) { toast(j.error ?? "Upload failed", "err"); return [] as MediaItem[]; }
    setItems((s) => [...j.items, ...s]);
    toast(`${j.items.length} file${j.items.length > 1 ? "s" : ""} uploaded`);
    return j.items as MediaItem[];
  };
  return { items, loading, load, upload, setItems };
}

export function MediaModal({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const { items, loading, load, upload } = useMedia();
  const [q, setQ] = useState("");
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => { void load(); }, []);
  useEffect(() => { const t = setTimeout(() => void load(q), 250); return () => clearTimeout(t); }, [q]);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <h3 className="text-[16px] font-bold text-navy">Media library</h3>
          <input className="inp inp-sm ml-auto max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn-primary btn-sm" onClick={() => inp.current?.click()}>Upload</button>
          <input ref={inp} type="file" accept="image/*" multiple hidden onChange={async (e) => { if (e.target.files?.length) { const r = await upload(e.target.files); if (r[0]) onPick(r[0].url); } }} />
          <button className="btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="nice-scroll grid flex-1 grid-cols-3 gap-3 overflow-auto p-4 sm:grid-cols-4 md:grid-cols-6"
          onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); if (e.dataTransfer.files.length) await upload(e.dataTransfer.files); }}>
          {loading && !items.length ? <p className="col-span-full py-10 text-center text-[13px] text-ink-3">Loading…</p> : null}
          {!loading && !items.length ? <p className="col-span-full py-10 text-center text-[13px] text-ink-3">No images yet. Upload or drag files here.</p> : null}
          {items.map((m) => (
            <button key={m.id} type="button" onClick={() => onPick(m.url)} className="group overflow-hidden rounded-xl border border-line bg-canvas text-left transition hover:border-brand hover:shadow-card" title={m.filename}>
              <div className="aspect-square bg-white"><img src={m.url} alt={m.alt} className="h-full w-full object-cover" loading="lazy" /></div>
              <p className="truncate px-2 py-1.5 text-[11px] text-ink-2">{m.filename}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ImagePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <div className="flex items-start gap-3">
        <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-canvas">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-[11px] text-ink-3">No image</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/assets/img/… or https://…" />
          <div className="flex gap-2">
            <button type="button" className="btn-ghost btn-xs" onClick={() => setOpen(true)}>Choose / upload</button>
            {value ? <button type="button" className="btn-ghost btn-xs" onClick={() => onChange("")}>Clear</button> : null}
          </div>
        </div>
      </div>
      {open ? <MediaModal onPick={(u) => { onChange(u); setOpen(false); }} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
