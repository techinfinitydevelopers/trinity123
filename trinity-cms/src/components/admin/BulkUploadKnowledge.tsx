"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkImportKnowledgeAction, type BulkReport } from "@/lib/actions";
import { toast } from "./ui";

function normalizeRow(raw: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const k of Object.keys(raw)) {
      if (keys.includes(k.trim().toLowerCase())) return String(raw[k] ?? "").trim();
    }
    return "";
  };
  return {
    question: get("question", "q"),
    answer: get("answer", "a"),
    keywords: get("keywords", "keyword", "tags"),
    category: get("category", "cat"),
  };
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
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const rows = raw.map(normalizeRow);
      if (!rows.length) { toast("No rows found in that file.", "err"); return; }
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
          Upload a CSV or Excel file with columns <b>Question</b>, <b>Answer</b>, and optionally <b>Keywords</b> and <b>Category</b>.
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
