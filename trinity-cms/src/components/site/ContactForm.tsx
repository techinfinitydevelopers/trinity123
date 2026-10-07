"use client";
import { useState, type FormEvent } from "react";
import type { LabelSettings } from "@/lib/settings";

export default function ContactForm({ okMsg, labels: L }: { okMsg: string; labels: LabelSettings["forms"] }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("busy");
    const body = Object.fromEntries(new FormData(form).entries());
    /* Without the catch a dropped connection leaves the button on "Sending…" for ever and the
       visitor walks away believing the message was sent. */
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) return setState("ok");
      const json = await res.json().catch(() => null);
      setError(json?.error ?? null);
      setState("err");
    } catch {
      setError(null);
      setState("err");
    }
  }

  const done = state === "ok";
  return (
    <form className="form" id="contactForm" onSubmit={onSubmit} noValidate>
      <div className="form__field" hidden={done}><label htmlFor="f-name">{L.name}</label><input id="f-name" name="name" type="text" autoComplete="name" required placeholder={L.namePlaceholder} /></div>
      <div className="form__field" hidden={done}><label htmlFor="f-email">{L.email}</label><input id="f-email" name="email" type="email" autoComplete="email" required placeholder={L.emailPlaceholder} /></div>
      <div className="form__field" hidden={done}><label htmlFor="f-phone">{L.phone}</label><input id="f-phone" name="phone" type="tel" autoComplete="tel" required placeholder={L.phonePlaceholder} /></div>
      <div className="form__field" hidden={done}><label htmlFor="f-subject">{L.subject}</label><input id="f-subject" name="subject" type="text" placeholder={L.subjectPlaceholder} /></div>
      <div className="form__field form__field--full" hidden={done}><label htmlFor="f-msg">{L.message}</label><textarea id="f-msg" name="message" rows={5} placeholder={L.messagePlaceholder} /></div>
      <input type="text" name="hp_url" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden="true" />
      <button className="btn btn--primary" type="submit" hidden={done} disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Send a Message"} <i className="fas fa-paper-plane" />
      </button>
      <p className="form__ok" id="formOk" hidden={!done} role="status"><i className="fas fa-check-circle" /> {okMsg}</p>
      {state === "err" ? <p className="form__ok" role="alert" style={{ color: "#c0392b" }}>{error ?? "Something went wrong. Please call or WhatsApp us."}</p> : null}
    </form>
  );
}
