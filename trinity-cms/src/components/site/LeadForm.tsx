"use client";
import { useState, type FormEvent } from "react";
import type { LabelSettings } from "@/lib/settings";

/* The dialling codes the form offers, and the flag that goes with each. */
const CODE_FLAG: Record<string, string> = {
  "+91": "/assets/img/flags/in.svg",
  "+971": "/assets/img/flags/ae.png",
  "+44": "/assets/img/flags/gb.png",
  "+1": "/assets/img/flags/us.png",
  "+61": "/assets/img/flags/au.png",
};

/* The short enquiry card from the client's sample: name, email, phone with a country code,
   nearest branch and destination, then one button. It posts to the same /api/leads endpoint as
   the full contact form — `city` and `destination` are folded into the lead's subject and message
   so the leads table and the admin inbox stay as they are. */
export default function LeadForm({
  title, cities, destinations, okMsg, submitLabel, trust = [], labels: L,
}: { title: string; cities: string[]; destinations: string[]; okMsg: string; submitLabel: string; trust?: { icon: string; text: string }[]; labels: LabelSettings["forms"] }) {
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
          message: `Nearest city: ${f.get("city") ?? "—"}`,
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
          <span className="leadcard__f leadcard__f--sel"><i className="fas fa-map-marker-alt" aria-hidden="true" />
          <select name="city" required defaultValue="" aria-label={L.leadCity}>
            <option value="" disabled>{L.leadCity}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select></span>
          <span className="leadcard__f leadcard__f--sel"><i className="fas fa-globe-americas" aria-hidden="true" />
          <select name="destination" required defaultValue="" aria-label={L.leadDestination}>
            <option value="" disabled>{L.leadDestination}</option>
            {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select></span>
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
