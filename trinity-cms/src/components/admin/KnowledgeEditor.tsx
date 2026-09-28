"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveKnowledgeAction, deleteKnowledgeAction } from "@/lib/actions";
import { Confirm, Toggle, toast, Field } from "./ui";

export type KItem = { id: string; question: string; answer: string; keywords: string; category: string; relatedQuestions: string[]; isActive: boolean };
const blank: KItem = { id: "", question: "", answer: "", keywords: "", category: "General", relatedQuestions: [], isActive: true };

export default function KnowledgeEditor({ items, prefillQuestion }: { items: KItem[]; prefillQuestion?: string }) {
  const r = useRouter();
  const [edit, setEdit] = useState<KItem | null>(prefillQuestion ? { ...blank, question: prefillQuestion } : null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort(), [items]);
  const rows = items.filter((i) => {
    if (category && i.category !== category) return false;
    if (!q) return true;
    return `${i.question} ${i.answer} ${i.keywords} ${i.relatedQuestions.join(" ")}`.toLowerCase().includes(q.toLowerCase());
  });

  const save = async () => {
    if (!edit) return;
    const res = await saveKnowledgeAction({ id: edit.id || undefined, question: edit.question, answer: edit.answer, keywords: edit.keywords, category: edit.category, relatedQuestions: edit.relatedQuestions, isActive: edit.isActive });
    if (res.ok) { toast("Saved"); setEdit(null); r.refresh(); } else toast(res.error, "err");
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        <div><h3 className="text-[15px] font-bold text-navy">Knowledge base</h3><p className="text-[12px] text-ink-3">Questions the assistant matches on. Destination FAQs are included automatically.</p></div>
        <input className="inp inp-sm ml-auto max-w-[160px]" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp inp-sm max-w-[140px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn-primary btn-sm" onClick={() => setEdit(blank)}>+ Add question</button>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((i) => (
          <li key={i.id} className="flex items-start gap-3 px-4 py-3 hover:bg-canvas/60">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${i.isActive ? "bg-emerald-500" : "bg-line"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-navy">{i.question}</p>
              <p className="line-clamp-2 text-[13px] text-ink-2">{i.answer}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-ink-3">
                <span className="rounded-full bg-canvas px-2 py-0.5">{i.category}</span>
                {i.keywords ? <span>{i.keywords}</span> : null}
              </p>
            </div>
            <button className="btn-ghost btn-xs" onClick={() => setEdit(i)}>Edit</button>
            <Confirm className="btn-ghost btn-xs" onConfirm={async () => { await deleteKnowledgeAction(i.id); r.refresh(); toast("Deleted"); }}>Delete</Confirm>
          </li>
        ))}
        {!rows.length ? <li className="px-4 py-10 text-center text-[13px] text-ink-3">No questions yet.</li> : null}
      </ul>
      {edit ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" onClick={() => setEdit(null)}>
          <div className="card max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-5 fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-navy">{edit.id ? "Edit question" : "New question"}</h3>
            <Field label="Question"><input className="inp" value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} placeholder="e.g. What is the admission last date?" /></Field>
            <Field label="Answer"><textarea className="inp" rows={5} value={edit.answer} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" hint="Groups questions in the list"><input className="inp inp-sm" list="kb-categories" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
              <Field label="Keywords" hint="Comma separated"><input className="inp inp-sm" value={edit.keywords} onChange={(e) => setEdit({ ...edit, keywords: e.target.value })} placeholder="admission, last date, apply" /></Field>
            </div>
            <datalist id="kb-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            <Field label="Related questions" hint="One per line, optional — other ways students might ask this">
              <textarea className="inp" rows={3} value={edit.relatedQuestions.join("\n")} onChange={(e) => setEdit({ ...edit, relatedQuestions: e.target.value.split("\n") })} />
            </Field>
            <Toggle checked={edit.isActive} onChange={(v) => setEdit({ ...edit, isActive: v })} label="Active" />
            <div className="flex justify-end gap-2"><button className="btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary btn-sm" disabled={!edit.question.trim() || !edit.answer.trim()} onClick={save}>Save</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
