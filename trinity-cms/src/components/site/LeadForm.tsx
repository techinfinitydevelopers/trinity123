"use client";
import { useState, type FormEvent } from "react";
import type { LabelSettings } from "@/lib/settings";

/* The short enquiry card from the client's sample: name, email, phone with a country code,
   nearest branch and destination, then one button. It posts to the same /api/leads endpoint as
   the full contact form — `city` and `destination` are folded into the lead's subject and message
   so the leads table and the admin inbox stay as they are. */
export default function LeadForm({
  title, cities, destinations, okMsg, submitLabel, labels: L,
}: { title: string; cities: string[]; destinations: string[]; okMsg: string; submitLabel: string; labels: LabelSettings["forms"] }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
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
      {done ? (
        <p className="leadcard__ok" role="status"><i className="fas fa-check-circle" /> {okMsg}</p>
      ) : (
        <form className="leadcard__form" onSubmit={onSubmit} noValidate>
          <input name="name" type="text" autoComplete="name" required placeholder={L.leadName} aria-label={L.leadName} />
          <input name="email" type="email" autoComplete="email" required placeholder={L.leadEmail} aria-label={L.leadEmail} />
          <div className="leadcard__row">
            <select name="code" aria-label="Country code" defaultValue="+91">
              <option value="+91">+91 · IN</option>
              <option value="+971">+971 · AE</option>
              <option value="+44">+44 · UK</option>
              <option value="+1">+1 · US/CA</option>
              <option value="+61">+61 · AU</option>
            </select>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required placeholder={L.leadPhone} aria-label={L.leadPhone} />
          </div>
          <select name="city" required defaultValue="" aria-label={L.leadCity}>
            <option value="" disabled>{L.leadCity}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="destination" required defaultValue="" aria-label={L.leadDestination}>
            <option value="" disabled>{L.leadDestination}</option>
            {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {/* Honeypot — the API rejects the submission if a bot fills this. */}
          <input type="text" name="hp_url" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
          <button className="leadcard__btn" type="submit" disabled={state === "busy"}>
            {state === "busy" ? "Sending…" : submitLabel}
          </button>
          {state === "err" ? <p className="leadcard__err" role="alert">{error ?? "Something went wrong. Please call or WhatsApp us."}</p> : null}
        </form>
      )}
    </div>
  );
}
