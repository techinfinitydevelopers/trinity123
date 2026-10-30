"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePostAction, deletePostAction, type PostInput } from "@/lib/actions";
import { slugify } from "@/lib/blocks";
import RichEditor, { ensureHeadingIds } from "./RichEditor";
import ImagePicker from "./ImagePicker";
import { Field, toast, Confirm } from "./ui";

const CATS = ["Country Guide", "Visa", "Applications", "Scholarships", "Test Prep", "Guides", "News"];

/* Preview devices. The preview sits in a fixed-width rail next to the form (the page editor does
   the same), so anything wider than the rail is scaled down rather than scrolled sideways — the
   owner is checking that the layout holds, not reading the article in here. */
const PANE = 434; // the 460px rail minus its 12px of padding each side and the iframe's border
const DEVICES = {
  desktop: { label: "Desktop", w: 1280 },
  tablet: { label: "Tablet", w: 834 },
  mobile: { label: "Mobile", w: 390 },
} as const;
type Device = keyof typeof DEVICES;

export default function PostForm({ initial, categories }: { initial: PostInput; categories: string[] }) {
  const r = useRouter();
  const [p, setP] = useState<PostInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  /* A post has two very different jobs — writing it and making it findable — and mixing them in one
     long scroll is what made this form hard to read. Same two tabs, same strip, as the page editor. */
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [preview, setPreview] = useState(true);
  const [device, setDevice] = useState<Device>("desktop");
  /* The iframe is only ever refreshed deliberately: the post is rendered from the database, so until
     a save lands a reload would just show the old copy. 0 on the first render so the server and
     client markup agree — Date.now() in the initial state would differ across the hydration seam. */
  const [stamp, setStamp] = useState(0);
  const set = (x: Partial<PostInput>) => { setP((s) => { const n = { ...s, ...x }; if (x.title !== undefined && !slugTouched) n.slug = slugify(x.title); return n; }); setDirty(true); };
  const cats = Array.from(new Set([...CATS, ...categories]));
  const words = p.body.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const path = `/blog/${p.slug}`;
  const frameW = DEVICES[device].w;
  const scale = Math.min(1, PANE / frameW);

  const save = async (status?: PostInput["status"]) => {
    setSaving(true);
    const res = await savePostAction({ ...p, status: status ?? p.status, body: ensureHeadingIds(p.body), readMins: p.readMins || Math.max(1, Math.round(words / 200)) });
    setSaving(false);
    if (!res.ok) { toast(res.error, "err"); return; }
    toast(status === "PUBLISHED" ? "Published" : "Saved");
    setDirty(false);
    setStamp(Date.now()); // the saved copy is now the one the preview should be showing
    if (!p.id && res.id) r.replace(`/admin/posts/${res.id}`);
    else r.refresh();
  };

  return (
    <>
      {/* Always-reachable save controls — the per-tab ones scroll away on a long post. */}
      <div className="sticky-bar top-3 mb-5 flex flex-wrap items-center gap-3 px-4 py-2.5 lg:top-4">
        <span className={p.status === "PUBLISHED" ? "chip-live" : "chip-draft"}>{p.status === "PUBLISHED" ? "Published" : "Draft"}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-navy">{p.title || "Untitled post"}</span>
        {dirty ? <span className="hidden items-center gap-1.5 text-[12px] font-medium text-amber-600 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Unsaved</span> : null}
        <div className="flex items-center gap-1 rounded-xl bg-canvas p-1 text-[13px] font-semibold">
          <button className={`rounded-lg px-3 py-1.5 transition ${tab === "content" ? "bg-white text-navy shadow-card" : "text-ink-3 hover:text-ink"}`} onClick={() => setTab("content")}>Content</button>
          <button className={`rounded-lg px-3 py-1.5 transition ${tab === "seo" ? "bg-white text-navy shadow-card" : "text-ink-3 hover:text-ink"}`} onClick={() => setTab("seo")}>SEO</button>
        </div>
        <button className="btn-ghost btn-sm hidden xl:inline-flex" onClick={() => setPreview((v) => !v)}>{preview ? "Hide preview" : "Show preview"}</button>
        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm" onClick={() => save("DRAFT")} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button>
          <button className="btn-primary btn-sm" onClick={() => save("PUBLISHED")} disabled={saving}>{p.status === "PUBLISHED" ? "Update" : "Publish"}</button>
        </div>
      </div>

      {/* The preview is a second column rather than an overlay, and only from xl up: below that the
          form itself already needs the whole width, so it stays the single stacked column it was. */}
      <div className={`grid gap-6 ${preview ? "xl:grid-cols-[minmax(0,1fr)_460px]" : ""}`}>
        <div className="min-w-0 space-y-5">
          {tab === "content" ? (
            <>
              <div className="card p-5">
                <input className="w-full border-0 bg-transparent px-0 text-[26px] font-bold tracking-tight text-navy outline-none placeholder:text-ink-3" placeholder="Post title" value={p.title} onChange={(e) => set({ title: e.target.value })} />
                {/* The slug is the post's address, so it is edited on the SEO tab with the rest of
                    the search settings; here it is only shown, so the writer can see where it lands. */}
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-3">
                  <span className="font-mono text-[12px] text-ink-2">{path}</span>
                  <button className="text-[12px] text-brand hover:underline" onClick={() => setTab("seo")}>Edit URL</button>
                </p>
              </div>
              <div className="card p-5">
                <ImagePicker label="Cover image" value={p.coverImage} onChange={(v) => set({ coverImage: v })} />
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
            </>
          ) : (
            <>
              <div className="card space-y-4 p-5">
                <h2 className="text-[17px] font-bold text-navy">Search engine settings</h2>
                <Field label="URL" hint="Changing this after publishing breaks existing links to the post.">
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-[13px] text-ink-3">/blog/</span>
                    <input className="inp inp-sm font-mono text-[12px]" value={p.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) || e.target.value }); }} />
                  </div>
                </Field>
                <Field label="SEO title" hint={`${(p.seoTitle || p.title).length}/60 · shown in Google & the browser tab. Leave empty to use the post title.`}><input className="inp" value={p.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} placeholder={p.title} /></Field>
                <Field label="Meta description" hint={`${(p.seoDesc || p.excerpt).length}/160`}><textarea className="inp" rows={2} value={p.seoDesc} onChange={(e) => set({ seoDesc: e.target.value })} placeholder={p.excerpt} /></Field>
                <Field label="Excerpt" hint="Shown on the blog list, and used as the meta description when the field above is empty."><textarea className="inp" rows={3} value={p.excerpt} onChange={(e) => set({ excerpt: e.target.value })} /></Field>
                <div className="rounded-xl border border-line bg-canvas p-4">
                  <p className="lbl">Google preview</p>
                  <p className="text-[18px] text-[#1a0dab]">{p.seoTitle || p.title}</p>
                  <p className="text-[13px] text-[#006621]">{process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trinitystudyabroad.com"}{path}</p>
                  <p className="text-[13px] text-ink-2">{p.seoDesc || p.excerpt || "—"}</p>
                </div>
              </div>

              <div className="card space-y-4 p-5">
                <h2 className="text-[17px] font-bold text-navy">Filing</h2>
                <Field label="Category"><input className="inp inp-sm" list="cats" value={p.category} onChange={(e) => set({ category: e.target.value })} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></Field>
                <Field label="Topics / tags" hint="Comma separated"><input className="inp inp-sm" value={p.tags.join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trimStart()) })} /></Field>
                <Field label="Read time (minutes)" hint="0 = auto from word count"><input type="number" min={0} className="inp inp-sm" value={p.readMins} onChange={(e) => set({ readMins: Number(e.target.value) })} /></Field>
              </div>

              <div className="card space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className={`chip ${p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status === "PUBLISHED" ? "Published" : "Draft"}</span>
                  {p.id && p.status === "PUBLISHED" ? <a className="text-[12px] text-brand hover:underline" href={path} target="_blank" rel="noopener">View ↗</a> : null}
                </div>
                <Field label="Publish date"><input type="date" className="inp inp-sm" value={p.publishedAt?.slice(0, 10) ?? ""} onChange={(e) => set({ publishedAt: e.target.value })} /></Field>
                {/* Status is not a field of its own: it is whichever button you press, so that the
                    chip can never claim something the saved row does not say. */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button className="btn-ghost btn-sm" onClick={() => save("DRAFT")} disabled={saving}>Save draft</button>
                  <button className="btn-primary btn-sm" onClick={() => save("PUBLISHED")} disabled={saving}>{p.status === "PUBLISHED" ? "Update" : "Publish"}</button>
                </div>
                {dirty ? <p className="text-center text-[11px] text-amber-600">Unsaved changes</p> : null}
              </div>

              {p.id ? <div className="card p-5"><Confirm onConfirm={async () => { const res = await deletePostAction(p.id!); if (res.ok) { toast("Post deleted"); r.push("/admin/posts"); } else toast(res.error, "err"); }}>Delete post</Confirm></div> : null}
            </>
          )}
        </div>

        {/* live preview */}
        {preview ? (
          <aside className="hidden xl:block">
            <div className="sticky top-24 flex h-[calc(100vh-150px)] flex-col overflow-hidden rounded-2xl border border-line bg-[#e9eaf3]">
              <div className="flex items-center gap-2 border-b border-line bg-white px-3 py-2 text-[12px]">
                <span className="font-semibold text-ink-2">Live preview</span>
                <span className="text-ink-3">{dirty ? "· save to refresh" : ""}</span>
                <div className="ml-auto flex rounded-lg bg-canvas p-0.5">
                  {(Object.keys(DEVICES) as Device[]).map((d) => (
                    <button key={d} className={`rounded-md px-2 py-1 ${device === d ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setDevice(d)}>{DEVICES[d].label}</button>
                  ))}
                </div>
                <button className="rounded-md px-2 py-1 text-ink-3 hover:text-brand" onClick={() => setStamp(Date.now())} title="Reload">↻</button>
              </div>
              <div className="flex flex-1 items-start justify-center overflow-hidden p-3">
                {/* An unsaved post has no page to render yet, so say so rather than framing a 404. */}
                {p.id && p.slug ? (
                  <iframe
                    key={stamp}
                    title="Preview"
                    src={stamp ? `${path}?_p=${stamp}` : path}
                    className="rounded-xl border border-line bg-white shadow-card transition-all"
                    style={{
                      width: `${frameW}px`,
                      height: `calc((100vh - 200px) / ${scale})`,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      // The scaled frame still takes its unscaled width in the layout, so pull the
                      // leftover back in or it pushes the rail's own padding off-centre.
                      marginRight: `calc(-${frameW}px * ${1 - scale})`,
                    }}
                  />
                ) : (
                  <p className="mt-10 max-w-[240px] text-center text-[13px] text-ink-3">Save the post once and its page appears here.</p>
                )}
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}
