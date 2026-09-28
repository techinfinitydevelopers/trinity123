"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateChatStatusAction, addChatNoteAction } from "@/lib/actions";
import { toast } from "./ui";
import { fmt } from "@/lib/format";

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type Msg = { id: string; role: string; content: string; flagged: boolean; createdAt: Date; matchedQuestion: string | null; confidence: number | null; fromKnowledgeBase: boolean; unmatched: boolean };
type Note = { id: string; authorName: string; body: string; createdAt: Date };
export type ActiveSession = {
  id: string; name: string | null; email: string | null; phone: string | null; visitorId: string;
  status: Status; isUrgent: boolean; urgentQuestion: string | null; createdAt: Date;
  messages: Msg[]; notes: Note[];
};

const STATUS_LABEL: Record<Status, string> = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" };
const STATUS_CLS: Record<Status, string> = { OPEN: "bg-brand-soft text-brand", IN_PROGRESS: "bg-amber-50 text-amber-700", RESOLVED: "bg-emerald-50 text-emerald-700" };

export default function ChatDetail({ session }: { session: ActiveSession }) {
  const r = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const setStatus = async (status: Status) => {
    const res = await updateChatStatusAction(session.id, status);
    if (res.ok) { toast(`Marked ${STATUS_LABEL[status]}`); r.refresh(); } else toast(res.error, "err");
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    const res = await addChatNoteAction(session.id, note);
    setBusy(false);
    if (res.ok) { setNote(""); toast("Note added"); r.refresh(); } else toast(res.error, "err");
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-[16px] font-bold text-navy">{session.name ?? `Visitor ${session.visitorId.slice(0, 8)}`}</h2>
          <p className="text-[12px] text-ink-3">{fmt(session.createdAt)}{session.email ? ` · ${session.email}` : ""}</p>
        </div>
        {session.isUrgent ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">🚩 Urgent</span> : null}
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_CLS[session.status]}`}>{STATUS_LABEL[session.status]}</span>
        {session.phone ? <a className="btn-primary btn-xs" href={`tel:${session.phone.replace(/[^\d+]/g, "")}`}>Call {session.phone}</a> : null}
        {session.phone ? <a className="btn-ghost btn-xs" href={`https://wa.me/${session.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener">WhatsApp</a> : null}
        {session.email ? <a className="btn-ghost btn-xs" href={`mailto:${session.email}`}>Email</a> : null}
        <div className="ml-auto flex gap-1.5">
          {(["OPEN", "IN_PROGRESS", "RESOLVED"] as Status[]).map((s) => (
            <button key={s} disabled={s === session.status} className="btn-ghost btn-xs disabled:opacity-40" onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
          ))}
        </div>
      </div>

      {session.isUrgent && session.urgentQuestion ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
          <b>Urgent question:</b> {session.urgentQuestion}
        </div>
      ) : null}

      <div className="max-h-[46vh] space-y-3 overflow-auto nice-scroll pr-1">
        {session.messages.map((m) => (
          <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${m.role === "user" ? "ml-auto bg-brand text-white" : `bg-canvas text-ink ${m.flagged ? "border border-amber-300" : ""}`}`}>
            <p className="whitespace-pre-wrap">{m.content}</p>
            <p className={`mt-1 flex flex-wrap items-center gap-2 text-[10px] ${m.role === "user" ? "text-white/60" : "text-ink-3"}`}>
              <span>{fmt(m.createdAt)}</span>
              {m.flagged ? <span>· error</span> : null}
              {m.fromKnowledgeBase ? <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700">KB match{m.confidence != null ? ` · ${Math.round(m.confidence * 100)}%` : ""}</span> : null}
              {m.unmatched ? <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">Unmatched</span> : null}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h3 className="mb-2 text-[13px] font-bold text-navy">Internal notes</h3>
        <ul className="mb-3 space-y-2">
          {session.notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-canvas px-3 py-2 text-[12.5px]"><span className="font-semibold text-navy">{n.authorName}</span> <span className="text-ink-3">· {fmt(n.createdAt)}</span><p className="mt-0.5 text-ink-2">{n.body}</p></li>
          ))}
          {!session.notes.length ? <li className="text-[12.5px] text-ink-3">No notes yet.</li> : null}
        </ul>
        <div className="flex gap-2">
          <input className="inp inp-sm flex-1" placeholder="Add an internal note…" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addNote(); }} />
          <button className="btn-primary btn-sm" disabled={busy || !note.trim()} onClick={addNote}>Add</button>
        </div>
      </div>
    </>
  );
}
