"use client";
import { useEffect, useState, type ReactNode } from "react";

/* ---------- toasts (tiny event bus) ---------- */
type Toast = { id: number; text: string; kind: "ok" | "err" };
const listeners = new Set<(t: Toast) => void>();
let seq = 0;
export function toast(text: string, kind: "ok" | "err" = "ok") { listeners.forEach((l) => l({ id: ++seq, text, kind })); }

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const on = (t: Toast) => { setItems((s) => [...s, t]); setTimeout(() => setItems((s) => s.filter((x) => x.id !== t.id)), 3200); };
    listeners.add(on); return () => { listeners.delete(on); };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className={`fade-up pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white shadow-pop ${t.kind === "ok" ? "bg-navy" : "bg-red-600"}`}>
          <span className={`h-2 w-2 rounded-full ${t.kind === "ok" ? "bg-gold" : "bg-white"}`} />{t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- layout bits ---------- */
export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-[26px] font-bold text-navy">{title}</h1>{sub ? <p className="mt-1 text-[14px] text-ink-2">{sub}</p> : null}</div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <div className={className}><label className="lbl">{label}</label>{children}{hint ? <p className="mt-1 text-[12px] text-ink-3">{hint}</p> : null}</div>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-2">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand" : "bg-line"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} /></span>
      {label}
    </button>
  );
}

export function Empty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg></div>
      <h3 className="text-[16px] font-bold text-navy">{title}</h3>
      {sub ? <p className="mt-1 max-w-sm text-[13px] text-ink-2">{sub}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Confirm({ onConfirm, children, message = "Are you sure? This cannot be undone." , className = "btn-danger btn-sm" }: { onConfirm: () => void | Promise<void>; children: ReactNode; message?: string; className?: string }) {
  const [arm, setArm] = useState(false);
  useEffect(() => { if (!arm) return; const t = setTimeout(() => setArm(false), 3500); return () => clearTimeout(t); }, [arm]);
  if (arm) return <button type="button" className="btn-danger btn-sm" onClick={() => { setArm(false); void onConfirm(); }} title={message}>Confirm delete</button>;
  return <button type="button" className={className} onClick={() => setArm(true)}>{children}</button>;
}

export { fmt } from "@/lib/format";
