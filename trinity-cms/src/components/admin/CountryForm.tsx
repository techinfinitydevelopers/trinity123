"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCountryAction, deleteCountryAction, type CountryInput } from "@/lib/actions";
import { slugify } from "@/lib/blocks";
import { ObjectFields } from "./FieldEditor";
import ImagePicker from "./ImagePicker";
import { Field, Toggle, toast, Confirm } from "./ui";

export default function CountryForm({ initial }: { initial: CountryInput }) {
  const r = useRouter();
  const [c, setC] = useState<CountryInput>(initial);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"basics" | "content" | "seo">("basics");
  const set = (p: Partial<CountryInput>) => setC((s) => ({ ...s, ...p }));

  const save = async () => {
    setSaving(true);
    const res = await saveCountryAction(c);
    setSaving(false);
    if (!res.ok) { toast(res.error, "err"); return; }
    toast("Destination saved · live");
    if (!c.id && res.id) r.replace(`/admin/destinations/${res.id}`); else r.refresh();
  };

  // everything that is a list is edited with the generic recursive editor
  const lists = { stats: c.stats, why: c.why, courses: c.courses, unis: c.unis, cost: c.cost, req: c.req, sch: c.sch, steps: c.steps, workPoints: c.workPoints, faq: c.faq } as Record<string, unknown>;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="inline-flex rounded-xl bg-white p-1 text-[13px] font-semibold shadow-card">
          {(["basics", "content", "seo"] as const).map((t) => <button key={t} className={`rounded-lg px-4 py-2 capitalize ${tab === t ? "bg-brand-soft text-brand" : "text-ink-3"}`} onClick={() => setTab(t)}>{t === "basics" ? "Basics" : t === "content" ? "Page content" : "SEO"}</button>)}
        </div>

        {tab === "basics" ? (
          <div className="card space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Country name"><input className="inp" value={c.name} onChange={(e) => set({ name: e.target.value, slug: c.id ? c.slug : slugify(e.target.value) })} /></Field>
              <Field label="Flag code" hint="2-letter ISO, e.g. us, gb, de"><input className="inp font-mono" value={c.code} onChange={(e) => set({ code: e.target.value.toLowerCase() })} maxLength={3} /></Field>
              <Field label="URL" hint="/destinations/…"><input className="inp font-mono" value={c.slug} onChange={(e) => set({ slug: slugify(e.target.value) || e.target.value })} /></Field>
            </div>
            <Field label="Short tagline" hint="Shown under the name in menus and cards"><input className="inp" value={c.tag} onChange={(e) => set({ tag: e.target.value })} /></Field>
            <Field label="Hero headline"><input className="inp" value={c.hero} onChange={(e) => set({ hero: e.target.value })} placeholder={`Study in ${c.name}`} /></Field>
            <Field label="Intro paragraph"><textarea className="inp" rows={4} value={c.intro} onChange={(e) => set({ intro: e.target.value })} /></Field>
            <ImagePicker label="Hero image" value={c.img} onChange={(v) => set({ img: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Visa requirements (summary card)"><textarea className="inp" rows={4} value={c.visa} onChange={(e) => set({ visa: e.target.value })} /></Field>
              <Field label="Intakes & timeline"><textarea className="inp" rows={4} value={c.intakes} onChange={(e) => set({ intakes: e.target.value })} /></Field>
            </div>
            <Field label="Work & settlement paragraph"><textarea className="inp" rows={3} value={c.work} onChange={(e) => set({ work: e.target.value })} /></Field>
          </div>
        ) : null}

        {tab === "content" ? (
          <div className="card space-y-4 p-5">
            <p className="text-[13px] text-ink-2">Each list below is one section of the page. Reorder with the arrows, add or remove items freely.</p>
            <ObjectFields value={lists} onChange={(v) => set(v as Partial<CountryInput>)} />
          </div>
        ) : null}

        {tab === "seo" ? (
          <div className="card space-y-4 p-5">
            <Field label="SEO title" hint="Leave empty for the automatic “Study in … — Cost, Requirements, Visa & Scholarships”"><input className="inp" value={c.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} /></Field>
            <Field label="Meta description"><textarea className="inp" rows={3} value={c.seoDesc} onChange={(e) => set({ seoDesc: e.target.value })} /></Field>
          </div>
        ) : null}
      </div>

      <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
        <div className="card space-y-4 p-5">
          <Toggle checked={c.isActive} onChange={(v) => set({ isActive: v })} label={c.isActive ? "Visible on site" : "Hidden"} />
          <Field label="Menu order"><input type="number" className="inp inp-sm" value={c.order} onChange={(e) => set({ order: Number(e.target.value) })} /></Field>
          <button className="btn-primary w-full" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save destination"}</button>
          {c.id ? <a className="btn-ghost w-full" href={`/destinations/${c.slug}`} target="_blank" rel="noopener">View page ↗</a> : null}
        </div>
        {c.id ? <div className="card p-5"><Confirm onConfirm={async () => { const res = await deleteCountryAction(c.id!); if (res.ok) { toast("Deleted"); r.push("/admin/destinations"); } else toast(res.error, "err"); }}>Delete destination</Confirm></div> : null}
      </aside>
    </div>
  );
}
