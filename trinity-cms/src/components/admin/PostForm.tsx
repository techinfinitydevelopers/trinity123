"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePostAction, deletePostAction, type PostInput } from "@/lib/actions";
import { slugify } from "@/lib/blocks";
import RichEditor, { ensureHeadingIds } from "./RichEditor";
import ImagePicker from "./ImagePicker";
import { Field, toast, Confirm } from "./ui";

const CATS = ["Country Guide", "Visa", "Applications", "Scholarships", "Test Prep", "Guides", "News"];

export default function PostForm({ initial, categories }: { initial: PostInput; categories: string[] }) {
  const r = useRouter();
  const [p, setP] = useState<PostInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const set = (x: Partial<PostInput>) => { setP((s) => { const n = { ...s, ...x }; if (x.title !== undefined && !slugTouched) n.slug = slugify(x.title); return n; }); setDirty(true); };
  const cats = Array.from(new Set([...CATS, ...categories]));
  const words = p.body.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  const save = async (status?: PostInput["status"]) => {
    setSaving(true);
    const res = await savePostAction({ ...p, status: status ?? p.status, body: ensureHeadingIds(p.body), readMins: p.readMins || Math.max(1, Math.round(words / 200)) });
    setSaving(false);
    if (!res.ok) { toast(res.error, "err"); return; }
    toast(status === "PUBLISHED" ? "Published" : "Saved");
    setDirty(false);
    if (!p.id && res.id) r.replace(`/admin/posts/${res.id}`);
    else r.refresh();
  };

  return (
    <>
      {/* Always-reachable save controls — the sidebar ones scroll away on a long post. */}
      <div className="sticky-bar top-3 mb-5 flex flex-wrap items-center gap-3 px-4 py-2.5 lg:top-4">
        <span className={p.status === "PUBLISHED" ? "chip-live" : "chip-draft"}>{p.status === "PUBLISHED" ? "Published" : "Draft"}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-navy">{p.title || "Untitled post"}</span>
        {dirty ? <span className="hidden items-center gap-1.5 text-[12px] font-medium text-amber-600 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Unsaved</span> : null}
        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm" onClick={() => save("DRAFT")} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button>
          <button className="btn-primary btn-sm" onClick={() => save("PUBLISHED")} disabled={saving}>{p.status === "PUBLISHED" ? "Update" : "Publish"}</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <div className="card p-5">
          <input className="w-full border-0 bg-transparent px-0 text-[26px] font-bold tracking-tight text-navy outline-none placeholder:text-ink-3" placeholder="Post title" value={p.title} onChange={(e) => set({ title: e.target.value })} />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
            <span>/blog/</span>
            <input className="min-w-[200px] flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 font-mono text-[12px] text-ink-2 outline-none transition hover:border-line hover:bg-canvas focus:border-brand focus:bg-white" value={p.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) || e.target.value }); }} />
          </div>
        </div>
        <div className="card p-5">
          <Field label="Excerpt" hint="Shown on the blog list and in search results."><textarea className="inp" rows={3} value={p.excerpt} onChange={(e) => set({ excerpt: e.target.value })} /></Field>
        </div>
        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between"><label className="lbl mb-0">Body</label><span className="text-[12px] text-ink-3">{words} words · ~{Math.max(1, Math.round(words / 200))} min</span></div>
          <RichEditor value={p.body} onChange={(html) => set({ body: html })} />
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">Key takeaways</label><button className="btn-ghost btn-xs" onClick={() => set({ takeaways: [...p.takeaways, ""] })}>+ Add</button></div>
          <div className="space-y-2">
            {p.takeaways.map((t, i) => <div key={i} className="flex gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-[12px] font-bold text-white">{String(i + 1).padStart(2, "0")}</span><input className="inp inp-sm" value={t} onChange={(e) => set({ takeaways: p.takeaways.map((x, k) => (k === i ? e.target.value : x)) })} /><button className="btn-ghost btn-xs" onClick={() => set({ takeaways: p.takeaways.filter((_, k) => k !== i) })}>x</button></div>)}
            {!p.takeaways.length ? <p className="text-[13px] text-ink-3">Shown as a highlighted summary box at the top of the article.</p> : null}
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">Sources &amp; further reading</label><button className="btn-ghost btn-xs" onClick={() => set({ sources: [...p.sources, { label: "", href: "" }] })}>+ Add</button></div>
          <div className="space-y-2">
            {p.sources.map((sr, i) => <div key={i} className="flex flex-col gap-2 sm:flex-row"><input className="inp inp-sm" placeholder="Label" value={sr.label} onChange={(e) => set({ sources: p.sources.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} /><input className="inp inp-sm font-mono text-[12px]" placeholder="https://" value={sr.href} onChange={(e) => set({ sources: p.sources.map((x, k) => (k === i ? { ...x, href: e.target.value } : x)) })} /><button className="btn-ghost btn-xs" onClick={() => set({ sources: p.sources.filter((_, k) => k !== i) })}>x</button></div>)}
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">FAQ (schema.org rich results)</label><button className="btn-ghost btn-xs" onClick={() => set({ faqs: [...p.faqs, { q: "", a: "" }] })}>+ Add question</button></div>
          <div className="space-y-3">
            {p.faqs.map((f, i) => (
              <div key={i} className="rounded-xl border border-line p-3">
                <div className="flex gap-2"><input className="inp inp-sm" placeholder="Question" value={f.q} onChange={(e) => set({ faqs: p.faqs.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)) })} /><button className="btn-ghost btn-xs" onClick={() => set({ faqs: p.faqs.filter((_, k) => k !== i) })}>✕</button></div>
                <textarea className="inp mt-2" rows={2} placeholder="Answer" value={f.a} onChange={(e) => set({ faqs: p.faqs.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)) })} />
              </div>
            ))}
            {!p.faqs.length ? <p className="text-[13px] text-ink-3">No FAQs. Adding 2–3 helps Google show rich results.</p> : null}
          </div>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-navy">SEO</h3>
          <Field label="SEO title" hint={`${(p.seoTitle || p.title).length}/60`}><input className="inp" value={p.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} placeholder={p.title} /></Field>
          <Field label="Meta description" hint={`${(p.seoDesc || p.excerpt).length}/160`}><textarea className="inp" rows={2} value={p.seoDesc} onChange={(e) => set({ seoDesc: e.target.value })} placeholder={p.excerpt} /></Field>
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between"><span className={`chip ${p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status === "PUBLISHED" ? "Published" : "Draft"}</span>{p.id && p.status === "PUBLISHED" ? <a className="text-[12px] text-brand hover:underline" href={`/blog/${p.slug}`} target="_blank" rel="noopener">View ↗</a> : null}</div>
          <Field label="Publish date"><input type="date" className="inp inp-sm" value={p.publishedAt?.slice(0, 10) ?? ""} onChange={(e) => set({ publishedAt: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button className="btn-ghost btn-sm" onClick={() => save("DRAFT")} disabled={saving}>Save draft</button>
            <button className="btn-primary btn-sm" onClick={() => save("PUBLISHED")} disabled={saving}>{p.status === "PUBLISHED" ? "Update" : "Publish"}</button>
          </div>
          {dirty ? <p className="text-center text-[11px] text-amber-600">Unsaved changes</p> : null}
        </div>
        <div className="card p-5 space-y-4">
          <ImagePicker label="Cover image" value={p.coverImage} onChange={(v) => set({ coverImage: v })} />
          <Field label="Category"><input className="inp inp-sm" list="cats" value={p.category} onChange={(e) => set({ category: e.target.value })} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></Field>
          <Field label="Topics / tags" hint="Comma separated"><input className="inp inp-sm" value={p.tags.join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trimStart()) })} /></Field>
          <Field label="Read time (minutes)" hint="0 = auto from word count"><input type="number" min={0} className="inp inp-sm" value={p.readMins} onChange={(e) => set({ readMins: Number(e.target.value) })} /></Field>
        </div>
        {p.id ? <div className="card p-5"><Confirm onConfirm={async () => { const res = await deletePostAction(p.id!); if (res.ok) { toast("Post deleted"); r.push("/admin/posts"); } else toast(res.error, "err"); }}>Delete post</Confirm></div> : null}
      </aside>
      </div>
    </>
  );
}
