"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BLOCK_META, type Block, type BlockType } from "@/lib/blocks";
import { blockTemplates, deepClone } from "@/lib/block-defaults";
import { savePageAction, resetPageAction } from "@/lib/actions";
import { ObjectFields } from "./FieldEditor";
import ImagePicker from "./ImagePicker";
import { toast, Field } from "./ui";

export type PageData = { slug: string; title: string; navLabel: string; seoTitle: string; seoDesc: string; ogImage: string; blocks: Block[]; isSystem: boolean };

export default function BlockEditor({ initial }: { initial: PageData }) {
  const [page, setPage] = useState<PageData>(initial);
  const [sel, setSel] = useState(0);
  const [tab, setTab] = useState<"blocks" | "seo">("blocks");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [adding, setAdding] = useState(false);
  const [stamp, setStamp] = useState(0); // 0 on first render so server & client markup match
  const frame = useRef<HTMLIFrameElement>(null);
  const templates = useMemo(() => blockTemplates(), []);
  const path = page.slug === "home" ? "/" : `/${page.slug}`;

  const update = (p: Partial<PageData>) => { setPage((s) => ({ ...s, ...p })); setDirty(true); };
  const setBlocks = (blocks: Block[]) => update({ blocks });
  const setBlock = (i: number, b: Block) => setBlocks(page.blocks.map((x, k) => (k === i ? b : x)));
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= page.blocks.length) return; const n = [...page.blocks]; [n[i], n[j]] = [n[j], n[i]]; setBlocks(n); setSel(j); };
  const remove = (i: number) => { const n = page.blocks.filter((_, k) => k !== i); setBlocks(n); setSel(Math.min(Math.max(0, i - 1), Math.max(0, n.length - 1))); };
  const duplicate = (i: number) => { const n = [...page.blocks]; n.splice(i + 1, 0, deepClone(page.blocks[i])); setBlocks(n); setSel(i + 1); };
  const add = (t: BlockType) => {
    const n = [...page.blocks];
    const at = n.length ? sel + 1 : 0; // splice(1,…) on an empty list appends at 0, so sel+1 would point past the end
    n.splice(at, 0, deepClone(templates[t]));
    setBlocks(n); setSel(at); setAdding(false);
  };

  const save = useCallback(async () => {
    setSaving(true);
    const r = await savePageAction({ slug: page.slug, title: page.title, navLabel: page.navLabel, seoTitle: page.seoTitle, seoDesc: page.seoDesc, ogImage: page.ogImage, blocks: page.blocks });
    setSaving(false);
    if (r.ok) { setDirty(false); toast("Page saved · live"); setStamp(Date.now()); } else toast(r.error, "err");
  }, [page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); void save(); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [save]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const reset = async () => {
    if (!confirm("Replace this page's content with the original default content? Unsaved edits are lost.")) return;
    const r = await resetPageAction(page.slug);
    if (r.ok) { toast(r.message ?? "Reset"); location.reload(); } else toast(r.error, "err");
  };

  const cur = page.blocks[sel];

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-56px)] flex-col sm:-mx-6 lg:-mx-10 lg:-my-8 lg:h-screen">
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-4 py-3 lg:px-6">
        <Link href="/admin/pages" className="text-[13px] text-ink-3 hover:text-brand" onClick={(e) => { if (dirty && !confirm("You have unsaved changes. Leave without saving?")) e.preventDefault(); }}>‹ Pages</Link>
        <input className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[18px] font-bold text-navy outline-none hover:border-line focus:border-brand" value={page.title} onChange={(e) => update({ title: e.target.value })} />
        <div className="flex items-center gap-1 rounded-xl bg-canvas p-1 text-[13px] font-semibold">
          <button className={`rounded-lg px-3 py-1.5 ${tab === "blocks" ? "bg-white text-navy shadow-card" : "text-ink-3"}`} onClick={() => setTab("blocks")}>Content</button>
          <button className={`rounded-lg px-3 py-1.5 ${tab === "seo" ? "bg-white text-navy shadow-card" : "text-ink-3"}`} onClick={() => setTab("seo")}>SEO</button>
        </div>
        <button className="btn-ghost btn-sm hidden xl:inline-flex" onClick={() => setPreview((p) => !p)}>{preview ? "Hide preview" : "Show preview"}</button>
        <a className="btn-ghost btn-sm" href={path} target="_blank" rel="noopener">View ↗</a>
        {page.isSystem ? <button className="btn-ghost btn-sm" onClick={reset}>Reset</button> : null}
        <button className="btn-primary btn-sm" onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : dirty ? "Save changes" : "Saved"}</button>
      </div>

      <div className="flex min-h-0 flex-1">
        {tab === "blocks" ? (
          <>
            {/* block list */}
            <aside className="nice-scroll hidden w-[250px] shrink-0 overflow-auto border-r border-line bg-white p-3 md:block">
              <p className="lbl px-1">Sections</p>
              <ol className="space-y-1">
                {page.blocks.map((b, i) => (
                  <li key={i}>
                    <button onClick={() => setSel(i)} className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${sel === i ? "bg-brand-soft text-brand" : "hover:bg-canvas"}`}>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold ${sel === i ? "bg-brand text-white" : "bg-canvas text-ink-3"}`}>{i + 1}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{BLOCK_META[b.type]?.label ?? b.type}</span><span className="block truncate text-[11px] text-ink-3">{summary(b)}</span></span>
                    </button>
                  </li>
                ))}
              </ol>
              <button className="btn-ghost mt-3 w-full btn-sm" onClick={() => setAdding(true)}>+ Add section</button>
            </aside>

            {/* editor */}
            <section className="nice-scroll min-w-0 flex-1 overflow-auto bg-canvas p-4 lg:p-6">
              {/* mobile block switcher */}
              <div className="mb-3 flex gap-2 md:hidden">
                <select className="inp inp-sm" value={sel} onChange={(e) => setSel(Number(e.target.value))}>{page.blocks.map((b, i) => <option key={i} value={i}>{i + 1}. {BLOCK_META[b.type]?.label}</option>)}</select>
                <button className="btn-ghost btn-sm" onClick={() => setAdding(true)}>+</button>
              </div>
              {cur ? (
                <div className="card mx-auto max-w-3xl p-5">
                  <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line pb-4">
                    <div className="mr-auto"><h2 className="text-[17px] font-bold text-navy">{BLOCK_META[cur.type]?.label}</h2><p className="text-[12px] text-ink-3">{BLOCK_META[cur.type]?.desc}</p></div>
                    <button className="btn-ghost btn-xs" onClick={() => move(sel, -1)} disabled={sel === 0}>↑ Up</button>
                    <button className="btn-ghost btn-xs" onClick={() => move(sel, 1)} disabled={sel === page.blocks.length - 1}>↓ Down</button>
                    <button className="btn-ghost btn-xs" onClick={() => duplicate(sel)}>Duplicate</button>
                    <button className="btn-danger btn-xs" onClick={() => { if (confirm("Remove this section?")) remove(sel); }}>Remove</button>
                  </div>
                  <ObjectFields value={cur as unknown as Record<string, unknown>} onChange={(v) => setBlock(sel, v as unknown as Block)} />
                </div>
              ) : (
                <div className="card mx-auto max-w-3xl p-10 text-center text-ink-3">No sections yet. <button className="text-brand underline" onClick={() => setAdding(true)}>Add one</button>.</div>
              )}
            </section>
          </>
        ) : (
          <section className="nice-scroll flex-1 overflow-auto bg-canvas p-4 lg:p-6">
            <div className="card mx-auto max-w-2xl space-y-4 p-5">
              <h2 className="text-[17px] font-bold text-navy">Search engine settings</h2>
              <Field label="URL"><input className="inp inp-sm" value={path} readOnly /></Field>
              <Field label="Menu label"><input className="inp inp-sm" value={page.navLabel} onChange={(e) => update({ navLabel: e.target.value })} /></Field>
              <Field label="SEO title" hint={`${(page.seoTitle || page.title).length}/60 · shown in Google & browser tab. Leave empty to use the page title.`}><input className="inp" value={page.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} placeholder={page.title} /></Field>
              <Field label="Meta description" hint={`${page.seoDesc.length}/160`}><textarea className="inp" rows={3} value={page.seoDesc} onChange={(e) => update({ seoDesc: e.target.value })} /></Field>
              <ImagePicker label="Social share image (og:image)" value={page.ogImage} onChange={(v) => update({ ogImage: v })} />
              <div className="rounded-xl border border-line bg-canvas p-4">
                <p className="lbl">Google preview</p>
                <p className="text-[18px] text-[#1a0dab]">{page.seoTitle || page.title}</p>
                <p className="text-[13px] text-[#006621]">{process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trinitystudyabroad.com"}{path}</p>
                <p className="text-[13px] text-ink-2">{page.seoDesc || "—"}</p>
              </div>
            </div>
          </section>
        )}

        {/* live preview */}
        {preview ? (
          <aside className="hidden w-[460px] shrink-0 flex-col border-l border-line bg-[#e9eaf3] xl:flex">
            <div className="flex items-center gap-2 border-b border-line bg-white px-3 py-2 text-[12px]">
              <span className="font-semibold text-ink-2">Live preview</span>
              <span className="text-ink-3">{dirty ? "· save to refresh" : ""}</span>
              <div className="ml-auto flex rounded-lg bg-canvas p-0.5">
                <button className={`rounded-md px-2 py-1 ${device === "desktop" ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setDevice("desktop")}>Desktop</button>
                <button className={`rounded-md px-2 py-1 ${device === "mobile" ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setDevice("mobile")}>Mobile</button>
              </div>
              <button className="rounded-md px-2 py-1 text-ink-3 hover:text-brand" onClick={() => setStamp(Date.now())} title="Reload">↻</button>
            </div>
            <div className="flex flex-1 items-start justify-center overflow-hidden p-3">
              <iframe ref={frame} key={stamp} title="Preview" src={stamp ? `${path}?_p=${stamp}` : path}
                className={`rounded-xl border border-line bg-white shadow-card transition-all ${device === "mobile" ? "h-[760px] w-[390px]" : "h-full w-full"}`}
                style={device === "desktop" ? { width: "1280px", height: "calc((100vh - 90px) / 0.34)", transform: "scale(0.34)", transformOrigin: "top left", marginRight: "calc(-1280px * 0.66)" } : undefined} />
            </div>
          </aside>
        ) : null}
      </div>

      {adding ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" onClick={() => setAdding(false)}>
          <div className="card w-full max-w-2xl p-5 fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-[16px] font-bold text-navy">Add a section</h3><button className="btn-ghost btn-xs" onClick={() => setAdding(false)}>Close</button></div>
            <div className="nice-scroll grid max-h-[60vh] gap-2 overflow-auto sm:grid-cols-2">
              {(Object.keys(BLOCK_META) as BlockType[]).map((t) => (
                <button key={t} onClick={() => add(t)} className="rounded-xl border border-line p-3 text-left transition hover:border-brand hover:bg-brand-soft/40">
                  <p className="text-[14px] font-semibold text-navy">{BLOCK_META[t].label}</p><p className="text-[12px] text-ink-3">{BLOCK_META[t].desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function summary(b: Block): string {
  const o = b as unknown as Record<string, unknown>;
  const s = (o.title ?? o.kicker ?? o.badge ?? o.crumb ?? (Array.isArray(o.items) ? `${o.items.length} items` : "")) as string;
  return String(s).replace(/[\[\]{}]/g, "");
}
