"use client";
/* Schema-less recursive editor: renders the right control for every property of a block. */
import { useState, type ReactNode } from "react";
import ImagePicker from "./ImagePicker";
import RichEditor from "./RichEditor";
import { Toggle } from "./ui";
import { humanize, deepClone } from "@/lib/block-defaults";

type Obj = Record<string, unknown>;
const IMG_KEY = /(img|image|logo|cover|capsule|icon$)/i;
const LONG_KEY = /^(text|sub|lead|paragraph|a|answer|noteText|excerpt|okMsg|statText|greeting|systemPrompt|footerText|handoffMessage)$/;
const isImgVal = (v: string) => /^(\/|https?:).*\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(v) || v.startsWith("/uploads/");
const isFa = (v: string) => /^fa[srb]? fa-/.test(v);

const ASIDE_TEMPLATES: Record<string, Obj> = {
  none: { kind: "none" },
  statchips: { kind: "statchips", items: [{ strong: "42", suffix: "+", small: "Years legacy", style: "glass" }] },
  visual: { kind: "visual", img: "/assets/img/home/banner-1.png", chipA: { big: "3–5 Yrs", small: "Stay-back options" }, chipB: { icon: "fas fa-briefcase", strong: "Work Globally", small: "International experience" } },
  svcchips: { kind: "svcchips", items: [{ icon: "fas fa-user-graduate", label: "Career Counselling" }] },
  quick: { kind: "quick" },
};

function emptyLike(v: unknown): unknown {
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Obj).map(([k, x]) => [k, k === "type" || k === "kind" ? x : emptyLike(x)]));
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  return "";
}

export function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <div><label className="lbl">{label}</label>{children}{hint ? <p className="mt-1 text-[11px] text-ink-3">{hint}</p> : null}</div>;
}

export default function FieldEditor({ value, onChange, name, depth = 0 }: { value: unknown; onChange: (v: unknown) => void; name: string; depth?: number }) {
  const label = humanize(name);

  if (typeof value === "boolean") return <div className="pt-1"><Toggle checked={value} onChange={onChange} label={label} /></div>;
  if (typeof value === "number") return <Row label={label}><input type="number" className="inp inp-sm" value={value} onChange={(e) => onChange(Number(e.target.value))} /></Row>;

  if (typeof value === "string") {
    if (name === "html") return <Row label="Content"><RichEditor value={value} onChange={onChange} compact /></Row>;
    if (name === "s") return (
      <Row label="Style"><select className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value || undefined)}><option value="">Normal</option><option value="gold">Gold</option><option value="grad">Gradient</option></select></Row>
    );
    if (name === "dir") return <Row label="Direction"><select className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)}><option value="in">Incoming</option><option value="out">Outgoing</option></select></Row>;
    if (name === "style" && /^(glass|gold|purple)$/.test(value)) return <Row label="Style"><select className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)}><option value="glass">Glass</option><option value="gold">Gold</option><option value="purple">Purple</option></select></Row>;
    if (name === "layout") return <Row label="Layout"><select className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)}><option value="split">Split (text + visual)</option><option value="center">Centered</option></select></Row>;
    if (name === "secondaryKind") return <Row label="Secondary button"><select className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)}><option value="phone">Phone pill</option><option value="whatsapp">WhatsApp button</option></select></Row>;
    if (name === "flag" || name === "flags") return <Row label={label} hint="ISO country code, e.g. us, gb, de"><input className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value.toLowerCase())} /></Row>;
    if ((IMG_KEY.test(name) && !isFa(value)) || isImgVal(value)) return <ImagePicker label={label} value={value} onChange={onChange} />;
    if (isFa(value) || /icon/i.test(name)) return (
      <Row label={label} hint="Font Awesome 5 class, e.g. fas fa-star">
        <div className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><i className={value} /></span><input className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)} /></div>
      </Row>
    );
    if (name === "href") return <Row label="Link" hint='Use "whatsapp", "phone" or "email" to link to contact settings'><input className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)} /></Row>;
    if (name === "title" && /[\[{]/.test(value) || /^(title)$/.test(name) && depth === 0) return <Row label={label} hint="Wrap words in [brackets] for purple accent or {braces} for gold"><input className="inp" value={value} onChange={(e) => onChange(e.target.value)} /></Row>;
    if (LONG_KEY.test(name) || value.length > 90) return <Row label={label}><textarea className="inp" rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))} value={value} onChange={(e) => onChange(e.target.value)} /></Row>;
    return <Row label={label}><input className="inp inp-sm" value={value} onChange={(e) => onChange(e.target.value)} /></Row>;
  }

  if (Array.isArray(value)) {
    const arr = value as unknown[];
    const set = (i: number, v: unknown) => { const n = [...arr]; n[i] = v; onChange(n); };
    const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= arr.length) return; const n = [...arr]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
    const remove = (i: number) => onChange(arr.filter((_, k) => k !== i));
    const add = () => onChange([...arr, arr.length ? (typeof arr[arr.length - 1] === "object" ? deepClone(arr[arr.length - 1]) : "") : ""]);
    const primitive = arr.length === 0 || typeof arr[0] !== "object";

    return (
      <div className="rounded-xl border border-line bg-canvas/60 p-3">
        <div className="mb-2 flex items-center justify-between"><span className="lbl mb-0">{label} <span className="text-ink-3">({arr.length})</span></span><button type="button" className="btn-ghost btn-xs" onClick={add}>+ Add</button></div>
        <div className="space-y-2">
          {arr.map((item, i) => (
            <div key={i} className="group rounded-xl border border-line bg-white p-2.5">
              <div className="flex items-start gap-2">
                <div className="flex shrink-0 flex-col gap-0.5 pt-1">
                  <button type="button" className="rounded p-0.5 text-ink-3 hover:bg-canvas hover:text-ink disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">▲</button>
                  <button type="button" className="rounded p-0.5 text-ink-3 hover:bg-canvas hover:text-ink disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === arr.length - 1} aria-label="Move down">▼</button>
                </div>
                <div className="min-w-0 flex-1">
                  {primitive
                    ? <input className="inp inp-sm" value={String(item)} onChange={(e) => set(i, e.target.value)} />
                    : <ObjectFields value={item as Obj} onChange={(v) => set(i, v)} depth={depth + 1} collapsible index={i} />}
                </div>
                <button type="button" className="shrink-0 rounded-lg px-2 py-1 text-[12px] text-ink-3 hover:bg-red-50 hover:text-red-600" onClick={() => remove(i)} aria-label="Remove">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (value && typeof value === "object") {
    const obj = value as Obj;
    if (name === "aside") {
      return (
        <div className="rounded-xl border border-line bg-canvas/60 p-3">
          <Row label="Hero side content">
            <select className="inp inp-sm" value={String(obj.kind)} onChange={(e) => onChange(deepClone(ASIDE_TEMPLATES[e.target.value]))}>
              <option value="none">None</option><option value="statchips">Stat chips</option><option value="visual">Image + chips</option><option value="svcchips">Service chips</option><option value="quick">Quick contact (WhatsApp / call / email)</option>
            </select>
          </Row>
          <div className="mt-3"><ObjectFields value={obj} onChange={onChange} depth={depth + 1} skip={["kind"]} /></div>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-line bg-canvas/60 p-3">
        <span className="lbl">{label}</span>
        <ObjectFields value={obj} onChange={onChange} depth={depth + 1} />
      </div>
    );
  }

  if (value == null) return <Row label={label}><button type="button" className="btn-ghost btn-xs" onClick={() => onChange({ strong: "", small: "" })}>Enable</button></Row>;
  return null;
}

export function ObjectFields({ value, onChange, depth = 0, skip = [], collapsible, index }: { value: Obj; onChange: (v: Obj) => void; depth?: number; skip?: string[]; collapsible?: boolean; index?: number }) {
  const [open, setOpen] = useState(!collapsible || depth < 2);
  const keys = Object.keys(value).filter((k) => k !== "type" && !skip.includes(k));
  const summary = String(value.title ?? value.name ?? value.label ?? value.q ?? value.question ?? value.strong ?? value.text ?? value.t ?? `Item ${(index ?? 0) + 1}`).slice(0, 60);
  if (collapsible && !open) return <button type="button" className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[13px] font-medium text-ink hover:bg-canvas" onClick={() => setOpen(true)}><span className="truncate">{summary}</span><span className="text-ink-3">Edit ›</span></button>;
  return (
    <div className="space-y-3">
      {collapsible ? <button type="button" className="text-[12px] font-semibold text-brand" onClick={() => setOpen(false)}>‹ Collapse</button> : null}
      <div className={depth > 0 ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {keys.map((k) => {
          const v = value[k];
          const wide = Array.isArray(v) || (v && typeof v === "object") || k === "html" || (typeof v === "string" && (LONG_KEY.test(k) || v.length > 90));
          return <div key={k} className={wide ? "sm:col-span-2" : ""}><FieldEditor name={k} value={v} depth={depth} onChange={(nv) => onChange({ ...value, [k]: nv })} /></div>;
        })}
        {value.chip === null ? <div><FieldEditor name="chip" value={null} onChange={(nv) => onChange({ ...value, chip: nv })} /></div> : null}
      </div>
    </div>
  );
}

export const emptyItemLike = emptyLike;
