"use client";
import { useState, type FormEvent } from "react";

export default function ContactForm({ okMsg }: { okMsg: string }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("busy");
    const body = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setState(res.ok ? "ok" : "err");
  }

  const done = state === "ok";
  return (
    <form className="form" id="contactForm" onSubmit={onSubmit} noValidate>
      <div className="form__field" hidden={done}><label htmlFor="f-name">Full Name</label><input id="f-name" name="name" type="text" autoComplete="name" required placeholder="Your full name" /></div>
      <div className="form__field" hidden={done}><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div>
      <div className="form__field" hidden={done}><label htmlFor="f-phone">Phone Number</label><input id="f-phone" name="phone" type="tel" autoComplete="tel" required placeholder="+91" /></div>
      <div className="form__field" hidden={done}><label htmlFor="f-subject">Subject</label><input id="f-subject" name="subject" type="text" placeholder="Country / course / visa" /></div>
      <div className="form__field form__field--full" hidden={done}><label htmlFor="f-msg">Message</label><textarea id="f-msg" name="message" rows={5} placeholder="Tell us about your plans" /></div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden="true" />
      <button className="btn btn--primary" type="submit" hidden={done} disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Send a Message"} <i className="fas fa-paper-plane" />
      </button>
      <p className="form__ok" id="formOk" hidden={!done} role="status"><i className="fas fa-check-circle" /> {okMsg}</p>
      {state === "err" ? <p className="form__ok" role="alert" style={{ color: "#c0392b" }}>Something went wrong. Please call or WhatsApp us.</p> : null}
    </form>
  );
}
