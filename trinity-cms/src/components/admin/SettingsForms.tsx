"use client";
import { useState } from "react";
import type { SettingsMap } from "@/lib/settings";
import { saveSettingsAction, changePasswordAction } from "@/lib/actions";
import ImagePicker from "./ImagePicker";
import { CHAT_MODELS } from "@/lib/chat";
import { Field, Toggle, toast } from "./ui";

type Tab = "site" | "contact" | "nav" | "security";

export default function SettingsForms({ initial }: { initial: SettingsMap }) {
  const [tab, setTab] = useState<Tab>("site");
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async <K extends keyof SettingsMap>(k: K) => { setSaving(true); const r = await saveSettingsAction(k, s[k]); setSaving(false); r.ok ? toast("Saved · live") : toast(r.error, "err"); };

  const tabs: [Tab, string][] = [["site", "General"], ["contact", "Contact & social"], ["nav", "Navigation"], ["security", "Security"]];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="card h-fit p-2">
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`block w-full rounded-xl px-3 py-2.5 text-left text-[14px] font-medium ${tab === k ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-canvas"}`}>{l}</button>)}
      </nav>

      <div className="space-y-5">
        {tab === "site" ? (
          <div className="card space-y-4 p-5">
            <h3 className="text-[15px] font-bold text-navy">General</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Site name"><input className="inp" value={s.site.siteName} onChange={(e) => setS({ ...s, site: { ...s.site, siteName: e.target.value } })} /></Field>
              <Field label="Tagline"><input className="inp" value={s.site.tagline} onChange={(e) => setS({ ...s, site: { ...s.site, tagline: e.target.value } })} /></Field>
            </div>
            <ImagePicker label="Logo" value={s.site.logo} onChange={(v) => setS({ ...s, site: { ...s.site, logo: v } })} />
            <Field label="Footer description"><textarea className="inp" rows={3} value={s.site.footerText} onChange={(e) => setS({ ...s, site: { ...s.site, footerText: e.target.value } })} /></Field>
            <Field label="Copyright line"><input className="inp" value={s.site.copyright} onChange={(e) => setS({ ...s, site: { ...s.site, copyright: e.target.value } })} /></Field>
            <Field label="Google Analytics ID" hint="Optional, e.g. G-XXXXXXX"><input className="inp inp-sm" value={s.site.gaId} onChange={(e) => setS({ ...s, site: { ...s.site, gaId: e.target.value } })} /></Field>
            <button className="btn-primary" onClick={() => save("site")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "contact" ? (
          <div className="card space-y-4 p-5">
            <h3 className="text-[15px] font-bold text-navy">Contact details</h3>
            <p className="text-[13px] text-ink-2">Used everywhere on the site — header, footer, contact page, buttons.</p>
            <Field label="Phone numbers" hint="One per line. The first one is the main number shown on buttons.">
              <textarea className="inp" rows={3} value={s.contact.phones.join("\n")} onChange={(e) => setS({ ...s, contact: { ...s.contact, phones: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Landline"><input className="inp inp-sm" value={s.contact.landline} onChange={(e) => setS({ ...s, contact: { ...s.contact, landline: e.target.value } })} /></Field>
              <Field label="WhatsApp number" hint="Digits only with country code, e.g. 918453045304"><input className="inp inp-sm" value={s.contact.whatsapp} onChange={(e) => setS({ ...s, contact: { ...s.contact, whatsapp: e.target.value.replace(/\D/g, "") } })} /></Field>
              <Field label="Email"><input className="inp inp-sm" value={s.contact.email} onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })} /></Field>
              <Field label="Office hours"><input className="inp inp-sm" value={s.contact.hours} onChange={(e) => setS({ ...s, contact: { ...s.contact, hours: e.target.value } })} /></Field>
            </div>
            <Field label="Address"><textarea className="inp" rows={2} value={s.contact.address} onChange={(e) => setS({ ...s, contact: { ...s.contact, address: e.target.value } })} /></Field>
            <Field label="Google Maps embed URL" hint="Optional. Leave empty to auto-generate from the address."><input className="inp inp-sm" value={s.contact.mapEmbed} onChange={(e) => setS({ ...s, contact: { ...s.contact, mapEmbed: e.target.value } })} /></Field>
            <h3 className="pt-2 text-[15px] font-bold text-navy">Social links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(s.contact.socials) as (keyof typeof s.contact.socials)[]).map((k) => (
                <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><input className="inp inp-sm" value={s.contact.socials[k]} onChange={(e) => setS({ ...s, contact: { ...s.contact, socials: { ...s.contact.socials, [k]: e.target.value } } })} placeholder="https://… (empty = hidden)" /></Field>
              ))}
            </div>
            <button className="btn-primary" onClick={() => save("contact")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "nav" ? (
          <div className="card space-y-4 p-5">
            <h3 className="text-[15px] font-bold text-navy">Menu</h3>
            <div className="space-y-2">
              {s.nav.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col"><button className="text-ink-3 hover:text-ink disabled:opacity-30" disabled={i === 0} onClick={() => { const n = [...s.nav.items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setS({ ...s, nav: { ...s.nav, items: n } }); }}>▲</button><button className="text-ink-3 hover:text-ink disabled:opacity-30" disabled={i === s.nav.items.length - 1} onClick={() => { const n = [...s.nav.items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setS({ ...s, nav: { ...s.nav, items: n } }); }}>▼</button></div>
                  <input className="inp inp-sm" placeholder="Label" value={it.label} onChange={(e) => setS({ ...s, nav: { ...s.nav, items: s.nav.items.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) } })} />
                  <input className="inp inp-sm font-mono" placeholder="/path" value={it.href} onChange={(e) => setS({ ...s, nav: { ...s.nav, items: s.nav.items.map((x, k) => (k === i ? { ...x, href: e.target.value } : x)) } })} />
                  <button className="btn-ghost btn-xs" onClick={() => setS({ ...s, nav: { ...s.nav, items: s.nav.items.filter((_, k) => k !== i) } })}>✕</button>
                </div>
              ))}
              <button className="btn-ghost btn-xs" onClick={() => setS({ ...s, nav: { ...s.nav, items: [...s.nav.items, { label: "New page", href: "/" }] } })}>+ Add menu item</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Header button label"><input className="inp inp-sm" value={s.nav.ctaLabel} onChange={(e) => setS({ ...s, nav: { ...s.nav, ctaLabel: e.target.value } })} /></Field>
              <Field label="Header button link"><input className="inp inp-sm font-mono" value={s.nav.ctaHref} onChange={(e) => setS({ ...s, nav: { ...s.nav, ctaHref: e.target.value } })} /></Field>
            </div>
            <button className="btn-primary" onClick={() => save("nav")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "security" ? <PasswordForm /> : null}
      </div>
    </div>
  );
}

function PasswordForm() {
  const [cur, setCur] = useState(""); const [nx, setNx] = useState(""); const [busy, setBusy] = useState(false);
  return (
    <div className="card max-w-md space-y-4 p-5">
      <h3 className="text-[15px] font-bold text-navy">Change password</h3>
      <Field label="Current password"><input type="password" className="inp" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
      <Field label="New password" hint="Minimum 8 characters"><input type="password" className="inp" value={nx} onChange={(e) => setNx(e.target.value)} /></Field>
      <button className="btn-primary" disabled={busy || !cur || nx.length < 8} onClick={async () => { setBusy(true); const r = await changePasswordAction(cur, nx); setBusy(false); if (r.ok) { toast(r.message ?? "Updated"); setCur(""); setNx(""); } else toast(r.error, "err"); }}>Update password</button>
    </div>
  );
}

export function ChatbotSettingsForm({ initial }: { initial: SettingsMap["chatbot"] }) {
  const [c, setC] = useState(initial);
  const [saving, setSaving] = useState(false);
  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between"><h3 className="text-[15px] font-bold text-navy">Assistant settings</h3><Toggle checked={c.enabled} onChange={(v) => setC({ ...c, enabled: v })} label={c.enabled ? "Enabled on site" : "Disabled"} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Assistant name"><input className="inp inp-sm" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} /></Field>
        <Field label="Model"><select className="inp inp-sm" value={c.model} onChange={(e) => setC({ ...c, model: e.target.value })}>{CHAT_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></Field>
      </div>
      <Field label="Greeting message"><textarea className="inp" rows={2} value={c.greeting} onChange={(e) => setC({ ...c, greeting: e.target.value })} /></Field>
      <Field label="Extra instructions (optional)" hint="Tone, what to avoid, promotions to mention. The knowledge base below is always included automatically."><textarea className="inp" rows={4} value={c.systemPrompt} onChange={(e) => setC({ ...c, systemPrompt: e.target.value })} placeholder="e.g. Always answer in the language the student writes in. Mention our free first consultation." /></Field>
      <Field label="Hand-off message" hint="Shown when the assistant collects contact details for a counsellor."><input className="inp inp-sm" value={c.handoffMessage} onChange={(e) => setC({ ...c, handoffMessage: e.target.value })} /></Field>
      <Toggle checked={c.collectLead} onChange={(v) => setC({ ...c, collectLead: v })} label="Ask for name & phone to save as a lead" />
      <button className="btn-primary" disabled={saving} onClick={async () => { setSaving(true); const r = await saveSettingsAction("chatbot", c); setSaving(false); r.ok ? toast("Saved") : toast(r.error, "err"); }}>Save</button>
    </div>
  );
}
