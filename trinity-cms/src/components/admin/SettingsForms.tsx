"use client";
import { useState } from "react";
import type { SettingsMap, WorldSettings } from "@/lib/settings";
import { saveSettingsAction, changePasswordAction } from "@/lib/actions";
import ImagePicker from "./ImagePicker";
import { Field, Toggle, toast } from "./ui";
import { ObjectFields } from "./FieldEditor";
import { UNI } from "@/components/tw/uni";

type Tab = "site" | "contact" | "nav" | "world" | "footer" | "labels" | "security";

/* The fifteen editable strings on the Trinity World page, with the wording the dashboard
   shows for each. The keys match WorldSettings["text"]; the selectors they map to live in
   TrinityWorldHost. */
type WorldTextKey = keyof SettingsMap["world"]["text"];
const WORLD_TEXT: [WorldTextKey, string][] = [
  ["heroTag", "Hero — small label"], ["heroTitle", "Hero — headline"], ["heroSub", "Hero — line under it"],
  ["unisTitle", "Universities — heading"], ["unisOutro", "Universities — closing card"],
  ["ieltsTitle", "IELTS — heading"], ["ieltsLead", "IELTS — paragraph"],
  ["processTitle", "How it works — heading"],
  ["pathTitle", "Your year — heading"], ["lifeTitle", "Student life — heading"], ["kitTitle", "Your file — heading"],
  ["statsTitle", "Numbers — heading"], ["voicesTitle", "Stories — heading"],
  ["ctaTitle", "Enquiry — heading"], ["ctaLead", "Enquiry — paragraph"],
];
/* The ones that need a full-width textarea rather than a single line. */
const LONG = new Set<WorldTextKey>(["heroSub", "ieltsLead", "ctaLead"]);

/* Where the drop-in ships its own assets. The engine builds every url as `/tw/…` and only
   looks at `world.images` for the ones the owner has actually replaced, so the dashboard
   shows the shipped path as the hint: the owner can see what they are about to swap out
   instead of guessing from a blank box. */
const TW = "/tw";

/* The four globe textures, in the order TrinityWorldHost loads them, with the file each one
   replaces. Kept here rather than inline so the warning card stays readable. */
type EarthKey = "map" | "bump" | "spec" | "clouds";
const EARTH_TEX: [EarthKey, string, string][] = [
  ["map", "Surface map", `${TW}/earth/2_no_clouds_4k.jpg`],
  ["bump", "Elevation (bump)", `${TW}/earth/elev_bump_4k.jpg`],
  ["spec", "Water mask (shine)", `${TW}/earth/water_4k.png`],
  ["clouds", "Cloud layer", `${TW}/earth/earth_clouds_1024.png`],
];

/* `world.images` has to stay sparse. The engine falls back to the shipped file for anything
   it cannot find, so an empty string would technically still work — but a form with ninety
   pickers that each write "" would turn a two-key settings row into a wall of dead keys, and
   nobody could then tell at a glance which pictures have really been replaced. So: writing a
   value sets the key, clearing it DELETES the key, and a group that empties out is dropped
   entirely. These three helpers are the only place that invariant lives. */
function setWorldImage(w: WorldSettings, group: "city" | "uni" | "stu", key: string, url: string): WorldSettings {
  const images = { ...(w.images ?? {}) };
  const map = { ...(images[group] ?? {}) };
  const v = url.trim();
  if (v) map[key] = v; else delete map[key];
  if (Object.keys(map).length) images[group] = map; else delete images[group];
  return { ...w, images };
}
function setWorldEarth(w: WorldSettings, key: EarthKey, url: string): WorldSettings {
  const images = { ...(w.images ?? {}) };
  const earth = { ...(images.earth ?? {}) };
  const v = url.trim();
  if (v) earth[key] = v; else delete earth[key];
  if (Object.keys(earth).length) images.earth = earth; else delete images.earth;
  return { ...w, images };
}
function setWorldPlane(w: WorldSettings, url: string): WorldSettings {
  const images = { ...(w.images ?? {}) };
  const v = url.trim();
  if (v) images.plane = v; else delete images.plane;
  return { ...w, images };
}

export default function SettingsForms({ initial }: { initial: SettingsMap }) {
  const [tab, setTab] = useState<Tab>("site");
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async <K extends keyof SettingsMap>(k: K) => { setSaving(true); const r = await saveSettingsAction(k, s[k]); setSaving(false); r.ok ? toast("Saved · live") : toast(r.error, "err"); };

  const tabs: [Tab, string][] = [["site", "General"], ["contact", "Contact & social"], ["nav", "Navigation"], ["world", "Home page"], ["footer", "Footer"], ["labels", "Text & labels"], ["security", "Security"]];

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
            <p className="text-[13px] text-ink-2">Shown in the header, the footer and the contact rail, in this order. The icon is a Font Awesome 5 class &mdash; <code>fab fa-facebook-f</code>, <code>fab fa-telegram</code>, <code>fab fa-pinterest</code> and so on. Use <code>whatsapp</code> as the link to reuse the WhatsApp number above; leave a link empty to hide that icon without losing the row.</p>
            <div className="space-y-2">
              {s.contact.socialLinks.map((it, i) => {
                const setAt = (v: Partial<typeof it>) => setS({ ...s, contact: { ...s.contact, socialLinks: s.contact.socialLinks.map((x, k) => (k === i ? { ...x, ...v } : x)) } });
                const swap = (j: number) => { if (j < 0 || j >= s.contact.socialLinks.length) return; const n = [...s.contact.socialLinks]; [n[i], n[j]] = [n[j], n[i]]; setS({ ...s, contact: { ...s.contact, socialLinks: n } }); };
                return (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-canvas/60 p-2">
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <button className="rounded px-1 text-[10px] text-ink-3 hover:bg-white disabled:opacity-30" onClick={() => swap(i - 1)} disabled={i === 0} aria-label="Move up">&#9650;</button>
                      <button className="rounded px-1 text-[10px] text-ink-3 hover:bg-white disabled:opacity-30" onClick={() => swap(i + 1)} disabled={i === s.contact.socialLinks.length - 1} aria-label="Move down">&#9660;</button>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><i className={it.icon} /></span>
                    <input className="inp inp-sm w-28 shrink-0" placeholder="Name" value={it.label} onChange={(e) => setAt({ label: e.target.value })} />
                    <input className="inp inp-sm w-44 shrink-0 font-mono" placeholder="fab fa-facebook-f" value={it.icon} onChange={(e) => setAt({ icon: e.target.value })} />
                    <input className="inp inp-sm min-w-[180px] flex-1" placeholder="https://…" value={it.href} onChange={(e) => setAt({ href: e.target.value })} />
                    <button className="btn-ghost btn-xs shrink-0" onClick={() => setS({ ...s, contact: { ...s.contact, socialLinks: s.contact.socialLinks.filter((_, k) => k !== i) } })} aria-label="Remove">&#10005;</button>
                  </div>
                );
              })}
              <button className="btn-ghost btn-xs" onClick={() => setS({ ...s, contact: { ...s.contact, socialLinks: [...s.contact.socialLinks, { label: "New", icon: "fab fa-link", href: "" }] } })}>+ Add social link</button>
            </div>
            <button className="btn-primary" onClick={() => save("contact")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "nav" ? (
          <div className="card space-y-4 p-5">
            <h3 className="text-[15px] font-bold text-navy">Menu</h3>
            <p className="text-[13px] text-ink-2">The order here is the order in the header. A <strong>Dropdown</strong> item shows its sub-pages in a menu; the <strong>Study Destinations menu</strong> builds itself from the destinations table, so it needs no sub-pages &mdash; its own link is the &ldquo;View all&rdquo; row at the bottom.</p>
            <div className="space-y-2">
              {s.nav.items.map((it, i) => {
                const setItems = (f: (n: typeof s.nav.items) => typeof s.nav.items) => setS({ ...s, nav: { ...s.nav, items: f([...s.nav.items]) } });
                const setAt = (v: Partial<(typeof s.nav.items)[number]>) => setItems((n) => n.map((x, k) => (k === i ? { ...x, ...v } : x)));
                const kind = it.kind === "destinations" ? "destinations" : it.children ? "dropdown" : "link";
                return (
                  <div key={i} className="rounded-xl border border-line bg-canvas/60 p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button className="text-ink-3 hover:text-ink disabled:opacity-30" disabled={i === 0} onClick={() => setItems((n) => { [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })} aria-label="Move up">&#9650;</button>
                        <button className="text-ink-3 hover:text-ink disabled:opacity-30" disabled={i === s.nav.items.length - 1} onClick={() => setItems((n) => { [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })} aria-label="Move down">&#9660;</button>
                      </div>
                      <input className="inp inp-sm w-40 shrink-0" placeholder="Label" value={it.label} onChange={(e) => setAt({ label: e.target.value })} />
                      <input className="inp inp-sm min-w-[140px] flex-1 font-mono" placeholder="/path" value={it.href} onChange={(e) => setAt({ href: e.target.value })} />
                      <select
                        className="inp inp-sm w-[170px] shrink-0"
                        value={kind}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "link") setAt({ kind: undefined, children: undefined });
                          else if (v === "dropdown") setAt({ kind: undefined, children: it.children ?? [{ label: "Sub-page", href: "/" }] });
                          else setAt({ kind: "destinations", children: undefined });
                        }}
                      >
                        <option value="link">Link</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="destinations">Study Destinations menu</option>
                      </select>
                      <button className="btn-ghost btn-xs shrink-0" onClick={() => setItems((n) => n.filter((_, k) => k !== i))} aria-label="Remove">&#10005;</button>
                    </div>
                    {kind === "dropdown" ? (
                      <div className="mt-2 space-y-1.5 border-l-2 border-line pl-3">
                        {(it.children ?? []).map((c, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <i className="fas fa-chevron-right text-[9px] text-ink-3" />
                            <input className="inp inp-sm w-40 shrink-0" placeholder="Label" value={c.label} onChange={(e) => setAt({ children: (it.children ?? []).map((x, k) => (k === j ? { ...x, label: e.target.value } : x)) })} />
                            <input className="inp inp-sm min-w-[140px] flex-1 font-mono" placeholder="/path" value={c.href} onChange={(e) => setAt({ children: (it.children ?? []).map((x, k) => (k === j ? { ...x, href: e.target.value } : x)) })} />
                            <button className="btn-ghost btn-xs shrink-0" onClick={() => setAt({ children: (it.children ?? []).filter((_, k) => k !== j) })} aria-label="Remove">&#10005;</button>
                          </div>
                        ))}
                        <button className="btn-ghost btn-xs" onClick={() => setAt({ children: [...(it.children ?? []), { label: "Sub-page", href: "/" }] })}>+ Add sub-page</button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <button className="btn-ghost btn-xs" onClick={() => setS({ ...s, nav: { ...s.nav, items: [...s.nav.items, { label: "New page", href: "/" }] } })}>+ Add menu item</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Header button label"><input className="inp inp-sm" value={s.nav.ctaLabel} onChange={(e) => setS({ ...s, nav: { ...s.nav, ctaLabel: e.target.value } })} /></Field>
              <Field label="Header button link"><input className="inp inp-sm font-mono" value={s.nav.ctaHref} onChange={(e) => setS({ ...s, nav: { ...s.nav, ctaHref: e.target.value } })} /></Field>
            </div>
            <button className="btn-primary" onClick={() => save("nav")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "footer" ? (
          <div className="card space-y-4 p-5">
            <h3 className="text-[15px] font-bold text-navy">Footer</h3>
            <p className="text-[13px] text-ink-2">The logo, description and copyright live under General; the link list under Navigation; the address, phones and social icons under Contact &amp; social.</p>

            <h4 className="pt-1 text-[14px] font-bold text-navy">Call-to-action band</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Small line above"><input className="inp inp-sm" value={s.footer.ctaKicker} onChange={(e) => setS({ ...s, footer: { ...s.footer, ctaKicker: e.target.value } })} /></Field>
              <Field label="Heading"><input className="inp inp-sm" value={s.footer.ctaTitle} onChange={(e) => setS({ ...s, footer: { ...s.footer, ctaTitle: e.target.value } })} /></Field>
              <Field label="Button label"><input className="inp inp-sm" value={s.footer.ctaPrimaryLabel} onChange={(e) => setS({ ...s, footer: { ...s.footer, ctaPrimaryLabel: e.target.value } })} /></Field>
              <Field label="Button link"><input className="inp inp-sm font-mono" value={s.footer.ctaPrimaryHref} onChange={(e) => setS({ ...s, footer: { ...s.footer, ctaPrimaryHref: e.target.value } })} /></Field>
              <Field label="WhatsApp button label" hint="The number itself is under Contact &amp; social."><input className="inp inp-sm" value={s.footer.ctaSecondaryLabel} onChange={(e) => setS({ ...s, footer: { ...s.footer, ctaSecondaryLabel: e.target.value } })} /></Field>
            </div>

            <h4 className="pt-2 text-[14px] font-bold text-navy">Column headings</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Links column"><input className="inp inp-sm" value={s.footer.linksTitle} onChange={(e) => setS({ ...s, footer: { ...s.footer, linksTitle: e.target.value } })} /></Field>
              <Field label="Destinations column"><input className="inp inp-sm" value={s.footer.destinationsTitle} onChange={(e) => setS({ ...s, footer: { ...s.footer, destinationsTitle: e.target.value } })} /></Field>
              <Field label="Contact column"><input className="inp inp-sm" value={s.footer.contactTitle} onChange={(e) => setS({ ...s, footer: { ...s.footer, contactTitle: e.target.value } })} /></Field>
            </div>

            <h4 className="pt-2 text-[14px] font-bold text-navy">Bottom strip</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Scrolling word" hint="Shown alternating with the site name."><input className="inp inp-sm" value={s.footer.marqueeWord} onChange={(e) => setS({ ...s, footer: { ...s.footer, marqueeWord: e.target.value } })} /></Field>
              <Field label="&ldquo;Powered by&rdquo; name" hint="Leave empty to hide the line."><input className="inp inp-sm" value={s.footer.poweredByText} onChange={(e) => setS({ ...s, footer: { ...s.footer, poweredByText: e.target.value } })} /></Field>
              <Field label="&ldquo;Powered by&rdquo; link"><input className="inp inp-sm font-mono" value={s.footer.poweredByUrl} onChange={(e) => setS({ ...s, footer: { ...s.footer, poweredByUrl: e.target.value } })} /></Field>
            </div>

            <button className="btn-primary" onClick={() => save("footer")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "labels" ? (
          <div className="card space-y-4 p-5">
            <h3 className="text-[15px] font-bold text-navy">Text &amp; labels</h3>
            <p className="text-[13px] text-ink-2">
              Every word the site shows that is not part of a page section, a blog post or a destination: button captions,
              form labels, the blog and search furniture, the 404 screen and the destination template&rsquo;s headings.
              In a destination heading <code>{"{country}"}</code> is replaced with that country&rsquo;s name, and
              [square brackets] colour a word with the brand accent.
            </p>
            <ObjectFields value={s.labels as unknown as Record<string, unknown>} onChange={(v) => setS({ ...s, labels: v as unknown as SettingsMap["labels"] })} />
            <button className="btn-primary" onClick={() => save("labels")} disabled={saving}>Save</button>
          </div>
        ) : null}

        {tab === "world" ? (
          <div className="space-y-5">
            <div className="card space-y-4 p-5">
              <h3 className="text-[15px] font-bold text-navy">Home page</h3>
              <p className="text-[13px] text-ink-2">
                Trinity World is the globe-and-flight home page: the visitor picks a country, flies there, and
                lands on its universities, IELTS, visa and student-life sections. Turning it on replaces the
                home page&rsquo;s normal sections — they are not deleted, and come back the moment you turn it off.
              </p>
              <Toggle
                checked={s.world.enabled}
                onChange={(v) => setS({ ...s, world: { ...s.world, enabled: v } })}
                label="Use Trinity World as the home page"
              />
              <div className="flex items-center gap-3">
                <button className="btn-primary" onClick={() => save("world")} disabled={saving}>Save</button>
                <a className="btn-ghost" href="/trinity-world" target="_blank" rel="noopener">Preview&nbsp;&rarr;</a>
              </div>
            </div>

            <div className="card space-y-4 p-5">
              <h3 className="text-[15px] font-bold text-navy">Wording</h3>
              <p className="text-[13px] text-ink-2">
                The headings and copy on that page. <code>&lt;br&gt;</code> forces a line break where the design
                expects one. Anything you leave empty keeps the built-in wording.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {WORLD_TEXT.map(([k, label]) => (
                  <Field key={k} label={label} className={LONG.has(k) ? "sm:col-span-2" : undefined}>
                    {LONG.has(k)
                      ? <textarea className="inp min-h-[72px]" value={s.world.text[k]} onChange={(e) => setS({ ...s, world: { ...s.world, text: { ...s.world.text, [k]: e.target.value } } })} />
                      : <input className="inp" value={s.world.text[k]} onChange={(e) => setS({ ...s, world: { ...s.world, text: { ...s.world.text, [k]: e.target.value } } })} />}
                  </Field>
                ))}
              </div>
              <button className="btn-primary" onClick={() => save("world")} disabled={saving}>Save</button>
            </div>

            <div className="card space-y-4 p-5">
              <h3 className="text-[15px] font-bold text-navy">Countries</h3>
              <p className="text-[13px] text-ink-2">
                Shown as the chips on the globe and used for the flight. Each country&rsquo;s position on the globe
                is fixed in the design and is not editable here, so nothing you type can move a pin or break
                the flight path.
              </p>
              <div className="space-y-3">
                {s.world.countries.map((c, i) => {
                  const setAt = (patch: Partial<typeof c>) =>
                    setS({ ...s, world: { ...s.world, countries: s.world.countries.map((x, j) => (j === i ? { ...x, ...patch } : x)) } });
                  return (
                    <details key={c.k} className="rounded-xl border border-line">
                      <summary className="cursor-pointer px-3 py-2.5 text-[14px] font-medium text-navy">{c.n || c.k}</summary>
                      <div className="grid gap-3 p-3 pt-0 sm:grid-cols-2">
                        <Field label="Name"><input className="inp inp-sm" value={c.n} onChange={(e) => setAt({ n: e.target.value })} /></Field>
                        <Field label="Short name" hint="Used on the globe pin"><input className="inp inp-sm" value={c.s} onChange={(e) => setAt({ s: e.target.value })} /></Field>
                        <Field label="City"><input className="inp inp-sm" value={c.city} onChange={(e) => setAt({ city: e.target.value })} /></Field>
                        <Field label="Tests"><input className="inp inp-sm" value={c.test} onChange={(e) => setAt({ test: e.target.value })} /></Field>
                        <Field label="City photo" hint={`The picture behind this country's section. Leave it empty to keep the shipped photo, ${TW}/city/${c.k}.jpg`} className="@container sm:col-span-2">
                          <ImagePicker value={s.world.images?.city?.[c.k] ?? ""} onChange={(v) => setS({ ...s, world: setWorldImage(s.world, "city", c.k, v) })} />
                        </Field>
                        <Field label="Universities" hint="One per line" className="sm:col-span-2">
                          <textarea className="inp min-h-[120px]" value={c.u.join("\n")} onChange={(e) => setAt({ u: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
                        </Field>
                        {/* Collapsed on purpose: across all countries this is up to 78 pickers, and an
                            owner who opens one country to fix its name should not have to scroll past
                            a dozen photo rows to reach the next one. */}
                        <details className="rounded-xl border border-line bg-canvas/60 sm:col-span-2">
                          <summary className="cursor-pointer px-3 py-2 text-[13px] font-medium text-ink-2">University photos ({c.u.length})</summary>
                          <div className="space-y-4 p-3 pt-0">
                            {c.u.length === 0 ? <p className="text-[12px] text-ink-3">Add a university above first.</p> : null}
                            {c.u.map((u) => {
                              /* The shipped photo is keyed on the university name exactly as typed above, so
                                 renaming a university in the textarea detaches it from its photo — say so
                                 rather than silently showing an empty picker. */
                              const shipped = UNI[u]?.src;
                              return (
                                <Field
                                  key={u}
                                  label={u}
                                  hint={shipped ? `Leave empty to keep ${TW}/${shipped}` : "No photo ships under this exact name — check the spelling, or pick one here."}
                                  className="@container"
                                >
                                  <ImagePicker value={s.world.images?.uni?.[u] ?? ""} onChange={(v) => setS({ ...s, world: setWorldImage(s.world, "uni", u, v) })} />
                                </Field>
                              );
                            })}
                          </div>
                        </details>
                      </div>
                    </details>
                  );
                })}
              </div>
              <button className="btn-primary" onClick={() => save("world")} disabled={saving}>Save</button>
            </div>

            {/* Collapsed and set apart from the content cards: these five files are the first screen
                itself, not decoration, and the safe default is for the owner never to open this. */}
            <details className="card p-5">
              <summary className="cursor-pointer text-[15px] font-bold text-navy">Globe textures &amp; aircraft <span className="ml-1 text-[12px] font-medium text-ink-3">· advanced</span></summary>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-line-2 bg-canvas/70 p-3">
                  <p className="text-[13px] text-ink-2">
                    <strong className="text-navy">Read this first.</strong> These four textures and the aeroplane
                    model are what the first screen is made of — they load before the visitor sees anything, so
                    they decide how fast the home page feels. The shipped files have already been squeezed for
                    exactly that reason: the asset set went from 37&nbsp;MB down to 15&nbsp;MB. Dropping a
                    straight-from-the-camera photo or an unoptimised model in here is the easiest way to make the
                    home page slow, and nothing on this screen will warn you — it will just load badly for
                    everyone. Leave them alone unless someone has prepared replacements at the same size.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {EARTH_TEX.map(([k, label, shipped]) => (
                    <Field key={k} label={label} hint={`Leave empty to keep ${shipped}`} className="@container">
                      <ImagePicker value={s.world.images?.earth?.[k] ?? ""} onChange={(v) => setS({ ...s, world: setWorldEarth(s.world, k, v) })} />
                    </Field>
                  ))}
                  {/* The media library only accepts images, so a .glb has to be typed into the path box.
                      The picker is still the right control: it shows the current value and clears it. */}
                  <Field label="Aircraft model" hint={`A .glb file. Paste its path — the media library uploads images only. Leave empty to keep ${TW}/a350.glb`} className="@container">
                    <ImagePicker value={s.world.images?.plane ?? ""} onChange={(v) => setS({ ...s, world: setWorldPlane(s.world, v) })} />
                  </Field>
                </div>
                <button className="btn-primary" onClick={() => save("world")} disabled={saving}>Save</button>
              </div>
            </details>
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
      <Field label="Assistant name"><input className="inp inp-sm" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} /></Field>
      <Field label="Greeting message"><textarea className="inp" rows={2} value={c.greeting} onChange={(e) => setC({ ...c, greeting: e.target.value })} /></Field>
      <Field label="Matching confidence threshold" hint="0–1. Below this, the assistant admits it doesn't have an answer instead of guessing.">
        <div className="flex items-center gap-3"><input type="range" min={0.1} max={0.95} step={0.05} value={c.matchThreshold} onChange={(e) => setC({ ...c, matchThreshold: Number(e.target.value) })} className="flex-1" /><span className="w-12 text-right text-[13px] font-semibold text-navy">{c.matchThreshold.toFixed(2)}</span></div>
      </Field>
      <Field label="Unmatched-question message" hint="Shown when nothing in the knowledge base is a confident match."><textarea className="inp" rows={2} value={c.unmatchedMessage} onChange={(e) => setC({ ...c, unmatchedMessage: e.target.value })} /></Field>
      <Field label="Urgent-request confirmation" hint="Shown to the student after they click Ask Admin."><textarea className="inp" rows={2} value={c.urgentMessage} onChange={(e) => setC({ ...c, urgentMessage: e.target.value })} /></Field>
      <div className="rounded-xl border border-line-2 bg-canvas/70 p-3">
        <p className="lbl">Widget wording</p>
        <p className="mb-3 text-[12px] text-ink-3">The nudge bubble, the &ldquo;tell us about you&rdquo; form and the two buttons shown when the assistant has no answer.</p>
        <ObjectFields value={c.ui as unknown as Record<string, unknown>} onChange={(v) => setC({ ...c, ui: v as unknown as SettingsMap["chatbot"]["ui"] })} depth={1} />
      </div>
      <Field label="Urgent-query notification email" hint="Gets an email when a student marks a query urgent. Leave blank to use the support email above."><input className="inp inp-sm" type="email" value={c.notifyEmail} onChange={(e) => setC({ ...c, notifyEmail: e.target.value })} placeholder="admissions@trinitystudyabroad.com" /></Field>
      <button className="btn-primary" disabled={saving} onClick={async () => { setSaving(true); const r = await saveSettingsAction("chatbot", c); setSaving(false); r.ok ? toast("Saved") : toast(r.error, "err"); }}>Save</button>
    </div>
  );
}
