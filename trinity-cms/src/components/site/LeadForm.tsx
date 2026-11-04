"use client";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { LabelSettings } from "@/lib/settings";

/* The dialling codes the form offers, and the flag that goes with each. */
const CODE_FLAG: Record<string, string> = {
  "+91": "/assets/img/flags/in.svg",
  "+971": "/assets/img/flags/ae.png",
  "+44": "/assets/img/flags/gb.png",
  "+1": "/assets/img/flags/us.png",
  "+61": "/assets/img/flags/au.png",
};

/* The destination list, in the same order as the home page's "Where will you study next?" picker, each with
   its flag. The list the block carries (editable in /admin) still counts: anything it has beyond these —
   Italy, Sweden, Denmark — follows, in its own order. "Not decided yet" is dropped at the client's request. */
type Dest = { name: string; flag?: string };
const HOME_DESTS: (Dest & { alias?: string[] })[] = [
  { name: "UK", flag: "gb", alias: ["united kingdom"] }, { name: "Ireland", flag: "ie" }, { name: "France", flag: "fr" },
  { name: "Germany", flag: "de" }, { name: "New Zealand", flag: "nz" }, { name: "UAE", flag: "ae-sq", alias: ["dubai", "united arab emirates"] },
  { name: "Singapore", flag: "sg" }, { name: "Australia", flag: "au" }, { name: "Japan", flag: "jp" },
  { name: "South Korea", flag: "kr", alias: ["korea"] }, { name: "USA", flag: "us", alias: ["united states", "us"] },
  { name: "Canada", flag: "ca" }, { name: "Malaysia", flag: "my" }, { name: "Other Europe", flag: "eu", alias: ["europe"] },
];
const EXTRA_FLAG: Record<string, string> = { italy: "it", sweden: "se", denmark: "dk", netherlands: "nl" };
function orderDestinations(incoming: string[]): Dest[] {
  const norm = (v: string) => v.trim().toLowerCase();
  const home = new Set(HOME_DESTS.flatMap((d) => [norm(d.name), ...(d.alias ?? [])]));
  const extras: Dest[] = [];
  for (const n of incoming) {
    const k = norm(n);
    if (!k || home.has(k)) continue;
    if (/not decided|undecided|^other$/.test(k)) continue;
    extras.push({ name: n, flag: EXTRA_FLAG[k] });
  }
  return [...HOME_DESTS.map(({ name, flag }) => ({ name, flag })), ...extras];
}

/* A <select> cannot hold images, so the destination picker is a small listbox: the flag beside each country,
   two columns on a wide card, arrow keys / Home / End / Escape for the keyboard. A visually hidden required
   input carries the value, so the form's own validity check still stops an empty submit. */
function DestinationSelect({ options, label, placeholder }: { options: Dest[]; label: string; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const sel = options.find((o) => o.name === value);
  const flag = (f?: string) => (f ? <img className="dsel__flag" src={`/assets/img/flags/${f}.png`} alt="" loading="lazy" /> : <span className="dsel__flag dsel__flag--globe"><i className="fas fa-globe-americas" aria-hidden="true" /></span>);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    /* Land on the chosen option (or the first) so the keyboard starts where the eye is. */
    const opts = root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    (root.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]') ?? opts?.[0])?.focus();
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  function pick(n: string) { setValue(n); setOpen(false); btn.current?.focus(); }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && open) { e.preventDefault(); setOpen(false); btn.current?.focus(); return; }
    if (e.key === "Tab" && open) { setOpen(false); return; }
    const opts = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const at = opts.indexOf(document.activeElement as HTMLButtonElement);
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setOpen(true); return; }
    if (!open || !opts.length) return;
    const go = (i: number) => { e.preventDefault(); opts[(i + opts.length) % opts.length].focus(); };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(opts.length - 1);
  }

  return (
    <div className="dsel" ref={root} onKeyDown={onKey}>
      <button ref={btn} type="button" className="dsel__btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>
        {sel ? flag(sel.flag) : <i className="fas fa-globe-americas dsel__globe" aria-hidden="true" />}
        <span className={sel ? "dsel__val" : "dsel__ph"}>{sel ? sel.name : placeholder}</span>
        <i className="fas fa-chevron-down dsel__chev" aria-hidden="true" />
      </button>
      <input className="dsel__req" name="destination" required value={value} onChange={() => {}} tabIndex={-1} aria-hidden="true" autoComplete="off" />
      {open ? (
        <div className="dsel__panel" role="listbox" aria-label={label}>
          {options.map((o) => (
            <button key={o.name} type="button" role="option" aria-selected={o.name === value} className="dsel__opt" onClick={() => pick(o.name)}>
              {flag(o.flag)}<span>{o.name}</span>{o.name === value ? <i className="fas fa-check dsel__tick" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* The short enquiry card from the client's sample: name, email, phone with a country code and
   destination, then one button. It posts to the same /api/leads endpoint as the full contact form —
   `destination` is folded into the lead's subject so the leads table and the admin inbox stay as they
   are. The nearest-city field was removed at the client's request; `cities` stays an accepted (ignored)
   prop so the blocks that still carry the list keep compiling. */
export default function LeadForm({
  title, destinations, okMsg, submitLabel, trust = [], labels: L,
}: { title: string; cities?: string[]; destinations: string[]; okMsg: string; submitLabel: string; trust?: { icon: string; text: string }[]; labels: LabelSettings["forms"] }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  /* The design shows a flag beside the dialling code. A <select> cannot hold an image, so the
     flag sits in the field's padding and follows whatever the visitor picks. */
  const [code, setCode] = useState("+91");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("busy");
    const f = new FormData(form);
    /* Without the catch a dropped connection leaves the button on "Sending…" for ever and the
       visitor walks away believing the enquiry was sent. */
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(f.get("name") ?? ""),
          email: String(f.get("email") ?? ""),
          phone: `${f.get("code") ?? ""} ${f.get("phone") ?? ""}`.trim(),
          subject: String(f.get("destination") ?? ""),
          website: String(f.get("hp_url") ?? ""),
          source: "home-enquiry",
        }),
      });
      if (res.ok) return setState("ok");
      /* Surface what the server actually said — "too many submissions" is useful, the generic
         line is not. */
      const body = await res.json().catch(() => null);
      setError(body?.error ?? null);
      setState("err");
    } catch {
      setError(null);
      setState("err");
    }
  }

  const done = state === "ok";
  return (
    <div className="leadcard">
      <h2 className="leadcard__title">{title}</h2>
      <span className="leadcard__rule" aria-hidden="true" />
      {done ? (
        <p className="leadcard__ok" role="status"><i className="fas fa-check-circle" /> {okMsg}</p>
      ) : (
        <form className="leadcard__form" onSubmit={onSubmit} noValidate>
          {/* The icon lives in the field's left padding. It is decorative, so the control keeps
              its own label, its placeholder and its focus ring. */}
          <span className="leadcard__f"><i className="far fa-user" aria-hidden="true" /><input name="name" type="text" autoComplete="name" required placeholder={L.leadName} aria-label={L.leadName} /></span>
          <span className="leadcard__f"><i className="far fa-envelope" aria-hidden="true" /><input name="email" type="email" autoComplete="email" required placeholder={L.leadEmail} aria-label={L.leadEmail} /></span>
          <div className="leadcard__row">
            <span className="leadcard__f leadcard__f--code">
              <img src={CODE_FLAG[code] ?? CODE_FLAG["+91"]} alt="" />
              <select name="code" aria-label="Country code" value={code} onChange={(e) => setCode(e.target.value)}>
                <option value="+91">+91</option>
                <option value="+971">+971</option>
                <option value="+44">+44</option>
                <option value="+1">+1</option>
                <option value="+61">+61</option>
              </select>
            </span>
            <span className="leadcard__f"><i className="fas fa-mobile-alt" aria-hidden="true" /><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required minLength={7} pattern="[0-9 ]{7,15}" title="Your number without the country code" placeholder={L.leadPhone} aria-label={L.leadPhone} /></span>
          </div>
          <DestinationSelect options={orderDestinations(destinations)} label={L.leadDestination} placeholder={L.leadDestination} />
          {/* Honeypot — the API rejects the submission if a bot fills this. */}
          <input type="text" name="hp_url" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
          <button className="leadcard__btn" type="submit" disabled={state === "busy"}>
            {state === "busy" ? "Sending…" : <>{submitLabel} <i className="fas fa-arrow-right" aria-hidden="true" /></>}
          </button>
          {state === "err" ? <p className="leadcard__err" role="alert">{error ?? "Something went wrong. Please call or WhatsApp us."}</p> : null}
          {/* The three reassurances under the button in the client's design. */}
          {trust.length ? (
            <ul className="leadcard__trust">
              {trust.map((t) => <li key={t.text}><i className={t.icon} aria-hidden="true" />{t.text}</li>)}
            </ul>
          ) : null}
        </form>
      )}
    </div>
  );
}
