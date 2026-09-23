"use client";
import { useEffect, useRef, useState } from "react";
import type { ThemeSettings } from "@/lib/settings";
import { DEFAULTS } from "@/lib/settings";
import { saveSettingsAction } from "@/lib/actions";
import { Field, toast } from "./ui";

const FONTS = ["Poppins", "Inter", "Manrope", "DM Sans", "Plus Jakarta Sans", "Outfit", "Sora", "Urbanist", "Montserrat", "Nunito", "Raleway", "Lato", "Open Sans", "Roboto", "Work Sans", "Space Grotesk", "Playfair Display", "Lora", "Merriweather"];
const COLORS: { k: keyof ThemeSettings; l: string; d: string }[] = [
  { k: "primary", l: "Trinity Blue", d: "Buttons, links, accents" }, { k: "primary2", l: "Sky Blue", d: "Gradients and hover" },
  { k: "navy", l: "Deep Blue", d: "Headings, dark panels" }, { k: "navy2", l: "Deep Blue 2", d: "Cards on dark" }, { k: "navy3", l: "Deep Blue 3", d: "Footer" },
  { k: "cream", l: "Cream", d: "Hero and soft backgrounds" }, { k: "teal", l: "Teal", d: "Success and fresh accents" },
  { k: "gold", l: "Gold", d: "Highlights, badges" }, { k: "gold2", l: "Gold hover", d: "" },
  { k: "text", l: "Body text", d: "Charcoal" }, { k: "muted", l: "Muted text", d: "" }, { k: "grey", l: "Light grey background", d: "Alternate sections" }, { k: "line", l: "Borders", d: "" },
];

export const themeCss = (t: ThemeSettings) =>
  `:root{--primary:${t.primary};--primary-2:${t.primary2};--navy:${t.navy};--navy-2:${t.navy2};--navy-3:${t.navy3};--gold:${t.gold};--gold-2:${t.gold2};--text:${t.text};--muted:${t.muted};--grey:${t.grey};--line:${t.line};--cream:${t.cream ?? "#FFE8BE"};--teal:${t.teal ?? "#1ABC9C"};--font-h:${t.fontHeading},sans-serif;--font-b:${t.fontBody},sans-serif;--r-card:${t.radiusCard}px;--r-pill:${t.radiusPill}px;--container:${t.container}px}`;

export default function ThemeForm({ initial }: { initial: ThemeSettings }) {
  const [t, setT] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const frame = useRef<HTMLIFrameElement>(null);
  const set = (p: Partial<ThemeSettings>) => setT((s) => ({ ...s, ...p }));

  // push tokens into the preview iframe live (see SiteScripts message listener)
  useEffect(() => {
    const fonts = Array.from(new Set([t.fontHeading, t.fontBody]));
    frame.current?.contentWindow?.postMessage({ type: "trinity:theme", css: themeCss(t), fonts }, "*");
  }, [t]);

  const save = async () => { setSaving(true); const r = await saveSettingsAction("theme", t); setSaving(false); r.ok ? toast("Theme saved · live on the site") : toast(r.error, "err"); };

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="mb-3 text-[15px] font-bold text-navy">Colours</h3>
          <div className="space-y-3">
            {COLORS.map((c) => (
              <div key={c.k} className="flex items-center gap-3">
                <label className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-line shadow-inner" style={{ background: t[c.k] as string }}>
                  <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={t[c.k] as string} onChange={(e) => set({ [c.k]: e.target.value } as Partial<ThemeSettings>)} />
                </label>
                <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-ink">{c.l}</p>{c.d ? <p className="text-[11px] text-ink-3">{c.d}</p> : null}</div>
                <input className="inp inp-sm w-28 font-mono uppercase" value={t[c.k] as string} onChange={(e) => set({ [c.k]: e.target.value } as Partial<ThemeSettings>)} />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-navy">Typography</h3>
          <Field label="Heading font"><select className="inp inp-sm" value={t.fontHeading} onChange={(e) => set({ fontHeading: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></Field>
          <Field label="Body font"><select className="inp inp-sm" value={t.fontBody} onChange={(e) => set({ fontBody: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></Field>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-navy">Shape & layout</h3>
          <Field label={`Card radius · ${t.radiusCard}px`}><input type="range" min={0} max={40} className="w-full accent-brand" value={t.radiusCard} onChange={(e) => set({ radiusCard: Number(e.target.value) })} /></Field>
          <Field label={`Button radius · ${t.radiusPill}px`}><input type="range" min={0} max={50} className="w-full accent-brand" value={t.radiusPill} onChange={(e) => set({ radiusPill: Number(e.target.value) })} /></Field>
          <Field label={`Content width · ${t.container}px`}><input type="range" min={1100} max={1500} step={10} className="w-full accent-brand" value={t.container} onChange={(e) => set({ container: Number(e.target.value) })} /></Field>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save theme"}</button>
          <button className="btn-ghost" onClick={() => setT(DEFAULTS.theme)}>Reset defaults</button>
        </div>
      </div>

      <div className="card flex min-h-[70vh] flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-[12px]">
          <span className="font-semibold text-ink-2">Live preview</span><span className="text-ink-3">· changes apply instantly, save to publish</span>
          <div className="ml-auto flex rounded-lg bg-canvas p-0.5">
            <button className={`rounded-md px-2 py-1 ${device === "desktop" ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setDevice("desktop")}>Desktop</button>
            <button className={`rounded-md px-2 py-1 ${device === "mobile" ? "bg-white shadow-card" : "text-ink-3"}`} onClick={() => setDevice("mobile")}>Mobile</button>
          </div>
        </div>
        <div className="flex flex-1 justify-center overflow-hidden bg-[#e9eaf3] p-3">
          <iframe ref={frame} title="Theme preview" src="/?_theme=1" onLoad={() => frame.current?.contentWindow?.postMessage({ type: "trinity:theme", css: themeCss(t), fonts: [t.fontHeading, t.fontBody] }, "*")}
            className={`rounded-xl border border-line bg-white shadow-card ${device === "mobile" ? "h-[760px] w-[390px]" : "h-full w-full"}`} />
        </div>
      </div>
    </div>
  );
}
