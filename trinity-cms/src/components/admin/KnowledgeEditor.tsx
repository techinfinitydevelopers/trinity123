"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveKnowledgeAction, deleteKnowledgeAction } from "@/lib/actions";
import { Confirm, Toggle, toast, Field } from "./ui";

export type KItem = { id: string; question: string; answer: string; tags: string; isActive: boolean };
const blank: KItem = { id: "", question: "", answer: "", tags: "", isActive: true };

export default function KnowledgeEditor({ items }: { items: KItem[] }) {
  const r = useRouter();
  const [edit, setEdit] = useState<KItem | null>(null);
  const [q, setQ] = useState("");
  const rows = items.filter((i) => !q || `${i.question} ${i.answer} ${i.tags}`.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!edit) return;
    const res = await saveKnowledgeAction({ id: edit.id || undefined, question: edit.question, answer: edit.answer, tags: edit.tags, isActive: edit.isActive });
    if (res.ok) { toast("Saved"); setEdit(null); r.refresh(); } else toast(res.error, "err");
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        <div><h3 className="text-[15px] font-bold text-navy">Knowledge base</h3><p className="text-[12px] text-ink-3">Facts the assistant answers from. Site pages and blog posts are included automatically.</p></div>
        <input className="inp inp-sm ml-auto max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary btn-sm" onClick={() => setEdit(blank)}>+ Add fact</button>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((i) => (
          <li key={i.id} className="flex items-start gap-3 px-4 py-3 hover:bg-canvas/60">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${i.isActive ? "bg-emerald-500" : "bg-line"}`} />
            <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-navy">{i.question}</p><p className="line-clamp-2 text-[13px] text-ink-2">{i.answer}</p>{i.tags ? <p className="mt-1 text-[11px] text-ink-3">{i.tags}</p> : null}</div>
            <button className="btn-ghost btn-xs" onClick={() => setEdit(i)}>Edit</button>
            <Confirm className="btn-ghost btn-xs" onConfirm={async () => { await deleteKnowledgeAction(i.id); r.refresh(); toast("Deleted"); }}>Delete</Confirm>
          </li>
        ))}
        {!rows.length ? <li className="px-4 py-10 text-center text-[13px] text-ink-3">No facts yet.</li> : null}
      </ul>
      {edit ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" onClick={() => setEdit(null)}>
          <div className="card w-full max-w-lg space-y-4 p-5 fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-navy">{edit.id ? "Edit fact" : "New fact"}</h3>
            <Field label="Question / topic"><input className="inp" value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} placeholder="e.g. Do you help with education loans?" /></Field>
            <Field label="Answer"><textarea className="inp" rows={5} value={edit.answer} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} /></Field>
            <Field label="Tags" hint="Comma separated, optional"><input className="inp inp-sm" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} /></Field>
            <Toggle checked={edit.isActive} onChange={(v) => setEdit({ ...edit, isActive: v })} label="Active" />
            <div className="flex justify-end gap-2"><button className="btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary btn-sm" disabled={!edit.question.trim() || !edit.answer.trim()} onClick={save}>Save</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
