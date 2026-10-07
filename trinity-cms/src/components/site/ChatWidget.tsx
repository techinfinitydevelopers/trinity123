"use client";
/* Student assistant — floating chat on every page. Gated behind a short name/email/phone form
   (once per browser, not once per question), then streams NDJSON from /api/chat. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatbotSettings, ContactSettings } from "@/lib/settings";
import { startChatSessionAction, markUrgentAction } from "@/lib/chat-session";

type Msg = { role: "user" | "assistant"; content: string; unmatched?: boolean };
type Profile = { name: string; email: string; phone: string };

const STORAGE = { visitor: "trinity_visitor", session: "trinity_chat_session", profile: "trinity_chat_profile", log: "trinity_chat_log", seen: "trinity_chat_seen" };
const QUICK = ["Which country suits me?", "How much does it cost?", "Tell me about student visas", "What documents do I need?"];

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const safeDel = (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

/** Minimal, safe formatting: **bold**, `/site-links`, bare URLs, line breaks. No raw HTML from the model. */
function render(text: string) {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  let html = esc(text);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener nofollow">$1</a>');
  html = html.replace(/(^|[\s(])\/(destinations\/[a-z0-9-]+|blog\/[a-z0-9-]+|about-us|why-study-abroad|our-service|contact-us|blog)\b/g, '$1<a href="/$2">/$2</a>');
  return html.replace(/\n/g, "<br>");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChatWidget({ cfg, contact }: { cfg: ChatbotSettings; contact: ContactSettings }) {
  const U = cfg.ui;
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [form, setForm] = useState<Profile>({ name: "", email: "", phone: "" });
  const [formErr, setFormErr] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [urgentState, setUrgentState] = useState<"idle" | "sending" | "sent">("idle");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visitorRef = useRef("");

  useEffect(() => {
    let v = safeGet(STORAGE.visitor);
    if (!v) { v = (crypto.randomUUID?.() ?? `v${Date.now()}${Math.random()}`).replace(/-/g, "").slice(0, 32); safeSet(STORAGE.visitor, v); }
    visitorRef.current = v;
    try {
      const savedProfile = JSON.parse(safeGet(STORAGE.profile) ?? "null") as Profile | null;
      const savedSession = safeGet(STORAGE.session);
      // localStorage only exists client-side, so this can't be initial state (SSR has no
      // window) — restoring it once on mount is the correct pattern here, not a cascade.
      if (savedProfile && savedSession) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(savedProfile);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessionId(savedSession);
      }
    } catch { /* ignore */ }
    if (!safeGet(STORAGE.seen)) { const t = setTimeout(() => setNudge(true), 12000); return () => clearTimeout(t); }
  }, []);

  useEffect(() => { if (msgs.length) safeSet(STORAGE.log, JSON.stringify(msgs.slice(-30))); }, [msgs]);
  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const restored = useRef(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const toggle = (next: boolean) => {
    setOpen(next);
    if (!next) { fabRef.current?.focus(); return; }
    setNudge(false);
    safeSet(STORAGE.seen, "1");
    if (!restored.current) {
      restored.current = true;
      try {
        const saved = JSON.parse(safeGet(STORAGE.log) ?? "[]") as Msg[];
        if (Array.isArray(saved) && saved.length) setMsgs(saved.slice(-30));
      } catch { /* ignore */ }
    }
    setTimeout(() => inputRef.current?.focus(), 250);
  };

  const startChat = useCallback(async (p: Profile) => {
    setFormBusy(true);
    setFormErr("");
    const res = await startChatSessionAction({ ...p, visitorId: visitorRef.current });
    setFormBusy(false);
    if (!res.ok) { setFormErr(res.error); return; }
    setProfile(p);
    setSessionId(res.sessionId!);
    safeSet(STORAGE.profile, JSON.stringify(p));
    safeSet(STORAGE.session, res.sessionId!);
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim(), email = form.email.trim(), phone = form.phone.trim();
    if (!name) return setFormErr("Please enter your name.");
    if (!EMAIL_RE.test(email)) return setFormErr("Please enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 6) return setFormErr("Please enter a valid phone number.");
    void startChat({ name, email, phone });
  };

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || busy || !sessionId) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);

    const patchLast = (fn: (prev: Msg) => Msg) => setMsgs((m) => { const c = [...m]; c[c.length - 1] = fn(c[c.length - 1]); return c; });

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitorRef.current, sessionId, message: q }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        patchLast((m) => ({ ...m, content: j.error ?? "Sorry — I couldn't reply just now. Please try again or WhatsApp us." }));
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let e: { t: string; v?: string };
          try { e = JSON.parse(line); } catch { continue; }
          if (e.t === "delta") patchLast((m) => ({ ...m, content: m.content + (e.v ?? "") }));
          else if (e.t === "unmatched") patchLast((m) => ({ ...m, unmatched: true }));
          else if (e.t === "error") patchLast((m) => ({ ...m, content: m.content + (m.content ? "\n\n" : "") + (e.v ?? "Something went wrong.") }));
        }
      }
    } catch {
      patchLast((m) => ({ ...m, content: m.content || "Connection lost. Please try again, or WhatsApp us — we reply within minutes." }));
    } finally {
      setBusy(false);
    }
  }, [busy, msgs, sessionId]);

  const reset = () => {
    setMsgs([]); setUrgentState("idle"); setSessionId(null);
    safeDel(STORAGE.log); safeDel(STORAGE.session);
    // Same student, fresh conversation — re-create the session from the profile we already have
    // instead of asking them to fill the form in again.
    if (profile) void startChat(profile);
  };

  const lastUserQuestion = () => [...msgs].reverse().find((m) => m.role === "user")?.content ?? "(no question given)";

  const askAdmin = async () => {
    if (!sessionId || urgentState !== "idle") return;
    setUrgentState("sending");
    const res = await markUrgentAction({ sessionId, visitorId: visitorRef.current, question: lastUserQuestion() });
    setUrgentState(res.ok ? "sent" : "idle");
    if (!res.ok) setMsgs((m) => [...m, { role: "assistant", content: res.error }]);
  };

  const waHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Hi, I need help with: ${lastUserQuestion()}`)}`;
  const telHref = `tel:${contact.phones[0]?.replace(/[^\d+]/g, "")}`;

  return (
    <>
      {nudge && !open ? (
        <div className="tc-nudge">
          <button type="button" className="tc-nudge__x" onClick={() => { setNudge(false); safeSet(STORAGE.seen, "1"); }} aria-label="Dismiss">×</button>
          <button type="button" className="tc-nudge__open" onClick={() => toggle(true)}>
            <strong>{U.nudgeTitle}</strong>
            <small>{U.nudgeText}</small>
          </button>
        </div>
      ) : null}

      <button ref={fabRef} className={`tc-fab${open ? " is-open" : ""}`} onClick={() => toggle(!open)} aria-label={open ? "Close chat" : `Chat with ${cfg.name}`} aria-expanded={open}>
        <i className={open ? "fas fa-times" : "fas fa-comment-dots"} />
        {!open && msgs.length === 0 ? <span className="tc-fab__dot" /> : null}
      </button>

      <div className={`tc-panel${open ? " is-open" : ""}`} role="dialog" aria-label={cfg.name} aria-modal="false">
        <div className="tc-head">
          <span className="tc-avatar"><i className="fas fa-graduation-cap" /><i className="tc-live" /></span>
          <div className="tc-head__txt"><strong>{cfg.name}</strong><small>{U.status}</small></div>
          {sessionId ? <button className="tc-icon tc-icon--urgent" onClick={askAdmin} disabled={urgentState !== "idle"} title="This is urgent — contact admin" aria-label="This is urgent — contact admin"><i className="fas fa-triangle-exclamation" /></button> : null}
          {sessionId ? <button className="tc-icon" onClick={reset} title="Start a new chat" aria-label="Start a new chat"><i className="fas fa-rotate-right" /></button> : null}
          <button className="tc-icon" onClick={() => toggle(false)} title="Close" aria-label="Close chat"><i className="fas fa-chevron-down" /></button>
        </div>

        {!sessionId ? (
          <form className="tc-gate" onSubmit={submitForm}>
            <p className="tc-gate__hi"><i className="fas fa-hand-sparkles" /> {U.gateIntro}</p>
            <label className="tc-gate__lbl" htmlFor="tc-gate-name">{U.gateName}</label>
            <input id="tc-gate-name" className="tc-gate__inp" placeholder={U.gateNamePlaceholder} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            <label className="tc-gate__lbl" htmlFor="tc-gate-email">{U.gateEmail}</label>
            <input id="tc-gate-email" className="tc-gate__inp" type="email" placeholder={U.gateEmailPlaceholder} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            <label className="tc-gate__lbl" htmlFor="tc-gate-phone">{U.gatePhone}</label>
            <input id="tc-gate-phone" className="tc-gate__inp" type="tel" placeholder={U.gatePhonePlaceholder} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
            {formErr ? <p className="tc-gate__err">{formErr}</p> : null}
            <button type="submit" className="tc-gate__go" disabled={formBusy}>{formBusy ? "Starting…" : "Start chatting"}</button>
            <p className="tc-foot">{U.gateFoot}</p>
          </form>
        ) : (
          <>
            <div className="tc-body nice-scroll" ref={bodyRef} role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation">
              <div className="tc-msg tc-msg--in"><div dangerouslySetInnerHTML={{ __html: render(cfg.greeting) }} /></div>
              {msgs.map((m, i) => (
                <div key={i} className={`tc-msg tc-msg--${m.role === "user" ? "out" : "in"}`}>
                  {m.content ? <div dangerouslySetInnerHTML={{ __html: render(m.content) }} /> : <span className="tc-typing"><i /><i /><i /></span>}
                  {m.unmatched && i === msgs.length - 1 ? (
                    <div className="tc-unmatched">
                      <a className="tc-unmatched__btn" href={telHref}><i className="fas fa-phone-alt" /> {U.callButton}</a>
                      <a className="tc-unmatched__btn" href={waHref} target="_blank" rel="noopener"><i className="fab fa-whatsapp" /> {U.messageButton}</a>
                      <button type="button" className="tc-unmatched__btn tc-unmatched__btn--gold" onClick={askAdmin} disabled={urgentState !== "idle"}>
                        <i className="fas fa-user-shield" /> {urgentState === "sent" ? "Admin notified ✓" : "Ask Admin"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              {urgentState === "sent" ? <div className="tc-note"><i className="fas fa-check-circle" /> {cfg.urgentMessage}</div> : null}
            </div>

            {msgs.length === 0 ? (
              <div className="tc-quick">{QUICK.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
            ) : null}

            <form className="tc-form" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
              <textarea
                ref={inputRef} rows={1} value={input} placeholder={U.inputPlaceholder} aria-label="Your message" maxLength={1000} disabled={busy}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(96, e.target.scrollHeight)}px`; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><i className="fas fa-paper-plane" /></button>
            </form>
            <p className="tc-foot">{U.disclaimer}</p>
          </>
        )}
      </div>
    </>
  );
}
