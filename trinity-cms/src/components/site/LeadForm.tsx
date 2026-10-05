"use client";
import { useState, type FormEvent } from "react";

/* The short enquiry card from the client's sample: name, email, phone with a country code,
   nearest branch and destination, then one button. It posts to the same /api/leads endpoint as
   the full contact form — `city` and `destination` are folded into the lead's subject and message
   so the leads table and the admin inbox stay as they are. */
export default function LeadForm({
  title, cities, destinations, okMsg, submitLabel,
}: { title: string; cities: string[]; destinations: string[]; okMsg: string; submitLabel: string }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("busy");
    const f = new FormData(form);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(f.get("name") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: `${f.get("code") ?? ""} ${f.get("phone") ?? ""}`.trim(),
        subject: String(f.get("destination") ?? ""),
        message: `Nearest city: ${f.get("city") ?? "—"}`,
        website: String(f.get("website") ?? ""),
        source: "home-enquiry",
      }),
    });
    setState(res.ok ? "ok" : "err");
  }

  const done = state === "ok";
  return (
    <div className="leadcard">
      <h2 className="leadcard__title">{title}</h2>
      {done ? (
        <p className="leadcard__ok" role="status"><i className="fas fa-check-circle" /> {okMsg}</p>
      ) : (
        <form className="leadcard__form" onSubmit={onSubmit} noValidate>
          <input name="name" type="text" autoComplete="name" required placeholder="Name" aria-label="Name" />
          <input name="email" type="email" autoComplete="email" required placeholder="Email ID" aria-label="Email ID" />
          <div className="leadcard__row">
            <select name="code" aria-label="Country code" defaultValue="+91">
              <option value="+91">+91 · IN</option>
              <option value="+971">+971 · AE</option>
              <option value="+44">+44 · UK</option>
              <option value="+1">+1 · US/CA</option>
              <option value="+61">+61 · AU</option>
            </select>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required placeholder="Mobile No" aria-label="Mobile number" />
          </div>
          <select name="city" required defaultValue="" aria-label="Nearest city">
            <option value="" disabled>Choose Nearest City</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="destination" required defaultValue="" aria-label="Destination of interest">
            <option value="" disabled>Destination(s) of Interest</option>
            {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {/* Honeypot — the API rejects the submission if a bot fills this. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
          <button className="leadcard__btn" type="submit" disabled={state === "busy"}>
            {state === "busy" ? "Sending…" : submitLabel}
          </button>
          {state === "err" ? <p className="leadcard__err" role="alert">Something went wrong. Please call or WhatsApp us.</p> : null}
        </form>
      )}
    </div>
  );
}
