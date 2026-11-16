"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LabelSettings } from "@/lib/settings";
import LeadForm from "./LeadForm";

/* "Get free counselling" on the About page opens this form instead of sending the visitor to the contact
   page (client request). One listener on the page's own content catches every link to the contact page —
   the buttons stay plain links, so they still work with JavaScript off and for anyone opening them in a
   new tab. The header and footer are left alone: those are site-wide navigation, not this page's CTA. */
export default function CounsellingPopup({
  title, lead, destinations, okMsg, submitLabel, labels,
}: { title: string; lead?: string; destinations: string[]; okMsg: string; submitLabel: string; labels: LabelSettings["forms"] }) {
  const [open, setOpen] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    /* Back to the button that opened it, so the keyboard does not land at the top of the page. */
    opener.current?.focus?.();
    opener.current = null;
  }, []);

  /* Intercept the CTAs. Capture phase, so it runs before Next's own router link handler. A click with a
     modifier key, or a middle click, is someone asking for a new tab: leave it alone. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      /* Call-to-action buttons only, wherever they sit: the page's own three, plus "Free Counselling" in the
         header and in the phone menu. Left alone: the "Contact" menu link and the three "Explore" cards in the
         solutions section — links to a page, not a request for a call back. */
      const a = (e.target as HTMLElement | null)?.closest?.("a.btn, a.vbk__btn") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href") ?? "";
      if (!/^\/contact-us(?:[#?]|$)/.test(href)) return;
      /* preventDefault stops the navigation (Next's Link checks it too) but the click still bubbles, so the
         phone menu's own handler closes the menu behind the dialog. */
      e.preventDefault();
      opener.current = a;
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* While it is open: Escape closes it, the page behind does not scroll, and focus starts inside. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    card.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, close]);

  if (!open) return null;
  return (
    <div className="cpop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="cpop__card" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={card}>
        <button type="button" className="cpop__close" onClick={close} aria-label="Close">
          <i className="fas fa-times" aria-hidden="true" />
        </button>
        {lead ? <p className="cpop__lead">{lead}</p> : null}
        <LeadForm title={title} destinations={destinations} okMsg={okMsg} submitLabel={submitLabel} labels={labels} source="about-popup" />
      </div>
    </div>
  );
}
