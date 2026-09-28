"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resolveUnmatchedAction } from "@/lib/actions";
import { toast } from "./ui";
import { fmt } from "@/lib/format";

export type UnansweredRow = { id: string; content: string; createdAt: Date; sessionId: string; studentName: string | null; studentEmail: string | null; studentPhone: string | null };

export default function UnansweredList({ rows, onCreateFaq }: { rows: UnansweredRow[]; onCreateFaq: (question: string) => void }) {
  const r = useRouter();
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line p-3">
        <h3 className="text-[15px] font-bold text-navy">Unanswered questions</h3>
        <p className="text-[12px] text-ink-3">Questions the assistant couldn&apos;t confidently answer. Turn the useful ones into FAQs to improve it over time.</p>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-navy">{row.content}</p>
              <p className="mt-1 text-[12px] text-ink-3">
                {row.studentName ?? "Unknown student"}{row.studentEmail ? ` · ${row.studentEmail}` : ""}{row.studentPhone ? ` · ${row.studentPhone}` : ""} · {fmt(row.createdAt)}
              </p>
              <Link href={`/admin/chats?id=${row.sessionId}`} className="mt-1 inline-block text-[12px] font-medium text-brand hover:underline">View conversation →</Link>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <button className="btn-primary btn-xs" onClick={() => onCreateFaq(row.content)}>Create FAQ</button>
              <button className="btn-ghost btn-xs" onClick={async () => { const res = await resolveUnmatchedAction(row.id); if (res.ok) { toast("Marked resolved"); r.refresh(); } else toast(res.error, "err"); }}>Mark resolved</button>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="px-4 py-10 text-center text-[13px] text-ink-3">Nothing unanswered right now 🎉</li> : null}
      </ul>
    </div>
  );
}
