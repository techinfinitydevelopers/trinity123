"use client";
/* Student assistant — floating chat on every page. Streams NDJSON from /api/chat. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatbotSettings } from "@/lib/settings";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE = { visitor: "trinity_visitor", session: "trinity_chat_session", log: "trinity_chat_log", seen: "trinity_chat_seen" };
const QUICK = ["Which country suits me?", "How much does it cost?", "Tell me about student visas", "Book a free counselling call"];

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

/** Minimal, safe formatting: **bold**, `/site-links`, bare URLs, line breaks. No raw HTML from the model. */
function render(text: string) {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  let html = esc(text);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener nofollow">$1</a>');
  html = html.replace(/(^|[\s(])\/(destinations\/[a-z0-9-]+|blog\/[a-z0-9-]+|about-us|why-study-abroad|our-service|contact-us|blog)\b/g, '$1<a href="/$2">/$2</a>');
  return html.replace(/\n/g, "<br>");
}

export default function ChatWidget({ cfg }: { cfg: ChatbotSettings }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef<string | null>(null);
  const visitorRef = useRef("");

  // Refs only — restoring the transcript happens on first open so this effect never sets state synchronously.
  useEffect(() => {
    let v = safeGet(STORAGE.visitor);
    if (!v) { v = (crypto.randomUUID?.() ?? `v${Date.now()}${Math.random()}`).replace(/-/g, "").slice(0, 32); safeSet(STORAGE.visitor, v); }
    visitorRef.current = v;
    sessionRef.current = safeGet(STORAGE.session);
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
  const toggle = (next: boolean) => {
    setOpen(next);
    if (!next) return;
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

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);

    const patchLast = (fn: (prev: string) => string) =>
      setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: fn(c[c.length - 1].content) }; return c; });

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitorRef.current, sessionId: sessionRef.current, messages: next.slice(-20) }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        patchLast(() => j.error ?? "Sorry — I couldn't reply just now. Please try again or WhatsApp us.");
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
          let e: { t: string; v?: string; id?: string };
          try { e = JSON.parse(line); } catch { continue; }
          if (e.t === "session" && e.id) { sessionRef.current = e.id; safeSet(STORAGE.session, e.id); }
          else if (e.t === "delta") patchLast((p) => p + (e.v ?? ""));
          else if (e.t === "lead") setLeadSaved(true);
          else if (e.t === "error") patchLast((p) => p + (p ? "\n\n" : "") + (e.v ?? "Something went wrong."));
        }
      }
    } catch {
      patchLast((p) => p || "Connection lost. Please try again, or WhatsApp us — we reply within minutes.");
    } finally {
      setBusy(false);
    }
  }, [busy, msgs]);

  const reset = () => {
    setMsgs([]); setLeadSaved(false); sessionRef.current = null;
    try { localStorage.removeItem(STORAGE.log); localStorage.removeItem(STORAGE.session); } catch { /* ignore */ }
  };

  return (
    <>
      {nudge && !open ? (
        <button className="tc-nudge" onClick={() => toggle(true)}>
          <span className="tc-nudge__x" onClick={(e) => { e.stopPropagation(); setNudge(false); safeSet(STORAGE.seen, "1"); }} role="button" aria-label="Dismiss">×</span>
          <strong>Planning to study abroad?</strong>
          <small>Ask me about countries, fees, visas or intakes.</small>
        </button>
      ) : null}

      <button className={`tc-fab${open ? " is-open" : ""}`} onClick={() => toggle(!open)} aria-label={open ? "Close chat" : `Chat with ${cfg.name}`} aria-expanded={open}>
        <i className={open ? "fas fa-times" : "fas fa-comment-dots"} />
        {!open && msgs.length === 0 ? <span className="tc-fab__dot" /> : null}
      </button>

      <div className={`tc-panel${open ? " is-open" : ""}`} role="dialog" aria-label={cfg.name} aria-modal="false">
        <div className="tc-head">
          <span className="tc-avatar"><i className="fas fa-graduation-cap" /><i className="tc-live" /></span>
          <div className="tc-head__txt"><strong>{cfg.name}</strong><small>Online · usually replies instantly</small></div>
          {msgs.length ? <button className="tc-icon" onClick={reset} title="Start a new chat" aria-label="Start a new chat"><i className="fas fa-rotate-right" /></button> : null}
          <button className="tc-icon" onClick={() => toggle(false)} title="Close" aria-label="Close chat"><i className="fas fa-chevron-down" /></button>
        </div>

        <div className="tc-body nice-scroll" ref={bodyRef}>
          <div className="tc-msg tc-msg--in"><div dangerouslySetInnerHTML={{ __html: render(cfg.greeting) }} /></div>
          {msgs.map((m, i) => (
            <div key={i} className={`tc-msg tc-msg--${m.role === "user" ? "out" : "in"}`}>
              {m.content ? <div dangerouslySetInnerHTML={{ __html: render(m.content) }} /> : <span className="tc-typing"><i /><i /><i /></span>}
            </div>
          ))}
          {leadSaved ? <div className="tc-note"><i className="fas fa-check-circle" /> Your details are with our counselling team — expect a call shortly.</div> : null}
        </div>

        {msgs.length === 0 ? (
          <div className="tc-quick">{QUICK.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
        ) : null}

        <form className="tc-form" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
          <textarea
            ref={inputRef} rows={1} value={input} placeholder="Ask about countries, fees, visas…" maxLength={1000} disabled={busy}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(96, e.target.scrollHeight)}px`; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><i className="fas fa-paper-plane" /></button>
        </form>
        <p className="tc-foot">AI assistant — please confirm fees and visa rules with a counsellor.</p>
      </div>
    </>
  );
}
