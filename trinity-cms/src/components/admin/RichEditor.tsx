"use client";
import { useEffect, useRef, useState } from "react";
import { MediaModal } from "./ImagePicker";

const B = ({ on, title, children, active }: { on: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
  <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); on(); }} className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-[13px] font-semibold transition hover:bg-brand-soft hover:text-brand ${active ? "bg-brand-soft text-brand" : "text-ink-2"}`}>{children}</button>
);

export default function RichEditor({ value, onChange, compact }: { value: string; onChange: (html: string) => void; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState(false);
  const [pick, setPick] = useState(false);
  const last = useRef(value);

  useEffect(() => { if (ref.current && !src && value !== last.current) { ref.current.innerHTML = value; last.current = value; } }, [value, src]);
  useEffect(() => { if (ref.current && !src) ref.current.innerHTML = value; }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = () => { if (!ref.current) return; last.current = ref.current.innerHTML; onChange(last.current); };
  const cmd = (c: string, v?: string) => { ref.current?.focus(); document.execCommand(c, false, v); emit(); };
  const block = (tag: string) => cmd("formatBlock", tag);
  const link = () => { const u = prompt("Link URL (https://…)"); if (u) cmd("createLink", u); };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-xl border border-line bg-white p-1">
        <B on={() => block("p")} title="Paragraph">¶</B>
        <B on={() => block("h2")} title="Heading 2">H2</B>
        <B on={() => block("h3")} title="Heading 3">H3</B>
        <span className="mx-1 h-5 w-px bg-line" />
        <B on={() => cmd("bold")} title="Bold"><b>B</b></B>
        <B on={() => cmd("italic")} title="Italic"><i>I</i></B>
        <B on={() => cmd("underline")} title="Underline"><u>U</u></B>
        <span className="mx-1 h-5 w-px bg-line" />
        <B on={() => cmd("insertUnorderedList")} title="Bullet list">• List</B>
        <B on={() => cmd("insertOrderedList")} title="Numbered list">1. List</B>
        <B on={() => block("blockquote")} title="Quote">❝</B>
        <span className="mx-1 h-5 w-px bg-line" />
        <B on={link} title="Insert link">🔗</B>
        <B on={() => setPick(true)} title="Insert image">🖼</B>
        <B on={() => cmd("removeFormat")} title="Clear formatting">Tx</B>
        <span className="ml-auto" />
        <B on={() => setSrc((s) => !s)} title="Toggle HTML source" active={src}>{"</>"}</B>
      </div>
      {src ? (
        <textarea className="inp min-h-[320px] font-mono text-[12px] leading-5" value={value} onChange={(e) => { last.current = e.target.value; onChange(e.target.value); }} />
      ) : (
        <div ref={ref} className={`rte nice-scroll ${compact ? "min-h-[180px]" : ""}`} contentEditable suppressContentEditableWarning onInput={emit} onBlur={emit}
          onPaste={(e) => { e.preventDefault(); const t = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, t); emit(); }} />
      )}
      {pick ? <MediaModal onPick={(u) => { setPick(false); cmd("insertImage", u); }} onClose={() => setPick(false)} /> : null}
    </div>
  );
}

/** Ensure every <h2> has an id so the post table-of-contents works. */
export function ensureHeadingIds(html: string) {
  const seen = new Set<string>();
  return html.replace(/<h2(?![^>]*\sid=)([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
    let id = inner.replace(/<[^>]+>/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "section";
    let n = 1; const base = id; while (seen.has(id)) id = `${base}-${++n}`; seen.add(id);
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
}
