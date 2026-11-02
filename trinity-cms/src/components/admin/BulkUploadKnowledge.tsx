"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkImportKnowledgeAction, type BulkReport } from "@/lib/actions";
import { toast } from "./ui";

type Cell = string | number | boolean | null | undefined;
const text = (v: Cell) => String(v ?? "").replace(/\s+/g, " ").trim();

/* Which column holds what.
 *
 * Named headers are used when they are there. The client's own workbook has none worth the name
 * — one sheet's question column has a blank header and a bare serial number above the rest — so
 * the columns are worked out from the data instead: the question column is the one whose cells
 * most often end in a question mark, the answer is the column to its right, and a follow-up is
 * the column after that when it also reads as a question. A sheet with no question column at all
 * (the destination stats table) yields nothing and is skipped.
 */
function mapColumns(rows: Cell[][]): { question: number; answer: number; followUp: number; keywords: number; category: number; headerRows: number } | null {
  const header = (rows[0] ?? []).map((c) => text(c).toLowerCase());
  const find = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const named = {
    question: find("question", "q", "questions"),
    answer: find("answer", "a", "answers"),
    followUp: find("follow-up", "follow up", "followup"),
    keywords: find("keywords", "keyword", "tags"),
    category: find("category", "cat"),
  };
  if (named.question >= 0 && named.answer >= 0) return { ...named, headerRows: 1 };

  const body = rows.slice(1);
  if (!body.length) return null;
  const width = Math.max(...rows.map((r) => r.length), 0);
  const questionish = (col: number) => {
    const filled = body.filter((r) => text(r[col]));
    if (filled.length < 3) return 0;
    return filled.filter((r) => text(r[col]).endsWith("?")).length / filled.length;
  };
  let question = -1;
  let bestRatio = 0.5; // a real question column is overwhelmingly question marks
  for (let col = 0; col < width; col++) {
    const ratio = questionish(col);
    if (ratio > bestRatio) { bestRatio = ratio; question = col; }
  }
  if (question < 0) return null;
  const answer = question + 1;
  if (!body.some((r) => text(r[answer]))) return null;
  const followUp = questionish(question + 2) > 0.5 ? question + 2 : -1;
  return { question, answer, followUp, keywords: -1, category: -1, headerRows: 1 };
}

function rowsFromSheet(rows: Cell[][]) {
  const cols = mapColumns(rows);
  if (!cols) return [];
  const at = (r: Cell[], i: number) => (i >= 0 ? text(r[i]) : "");
  return rows
    .slice(cols.headerRows)
    .map((r) => ({
      question: at(r, cols.question),
      answer: at(r, cols.answer),
      followUp: at(r, cols.followUp),
      keywords: at(r, cols.keywords),
      category: at(r, cols.category),
    }))
    .filter((r) => r.question && r.answer);
}

export default function BulkUploadKnowledge() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<BulkReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setReport(null);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      /* Every sheet, not just the first: the client sends one workbook with the counselling
         questions on one tab and the marketing ones on another. */
      const rows = wb.SheetNames.flatMap((name) =>
        rowsFromSheet(XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[name], { header: 1, defval: "" })),
      );
      if (!rows.length) { toast("No question-and-answer rows found in that file.", "err"); return; }
      const res = await bulkImportKnowledgeAction(rows);
      if (res.ok) { setReport(res.report ?? null); toast(res.message ?? "Imported"); r.refresh(); }
      else toast(res.error, "err");
    } catch (err) {
      console.error(err);
      toast("Could not read that file. Please check it's a valid CSV or Excel file.", "err");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="card space-y-4 p-5">
      <div>
        <h3 className="text-[15px] font-bold text-navy">Bulk upload questions &amp; answers</h3>
        <p className="mt-1 text-[13px] text-ink-2">
          Upload a CSV or Excel file with columns <b>Question</b>, <b>Answer</b>, and optionally <b>Follow-up</b>, <b>Keywords</b> and <b>Category</b>.
          Every sheet in the workbook is read, and unlabelled columns are worked out from the content.
          Duplicate questions (matched case-insensitively) are skipped automatically.
        </p>
      </div>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-canvas/50 px-6 py-10 text-center transition hover:border-brand/40 hover:bg-brand-soft/20">
        <span className="icon-tile h-11 w-11 bg-brand-soft text-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16" /></svg>
        </span>
        <span className="text-[13.5px] font-semibold text-navy">{busy ? "Importing…" : "Click to choose a .csv, .xlsx or .xls file"}</span>
        <span className="text-[12px] text-ink-3">Up to 2000 rows per upload</span>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
      </label>

      {report ? (
        <div className="rounded-2xl border border-line p-4">
          <div className="flex flex-wrap gap-4 text-[13px]">
            <span className="font-semibold text-emerald-600">{report.imported} imported</span>
            <span className="font-semibold text-amber-600">{report.skipped} duplicate(s) skipped</span>
            <span className="font-semibold text-red-600">{report.errors.length} error(s)</span>
          </div>
          {report.errors.length ? (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-[12px] text-ink-2">
              {report.errors.map((e, i) => <li key={i}>Row {e.row}: {e.reason}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
