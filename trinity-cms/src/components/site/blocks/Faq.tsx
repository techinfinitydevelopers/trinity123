"use client";
import { useState } from "react";
import type { FaqBlock } from "@/lib/blocks";
import type { ContactSettings } from "@/lib/settings";
import { SectionHead, d } from "../ui";

export function Faq({ b, contact }: { b: FaqBlock; contact: ContactSettings }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section section--grey" id="faq">
      <div className="container split split--top">
        <div className="faq__side">
          <SectionHead kicker={b.kicker} title={b.title} lead={b.lead} />
          <div className="chatcard" data-reveal aria-hidden="true">
            <span className="chatcard__glow" />
            <div className="chatcard__head">
              <span className="chatcard__avatar"><img src="/assets/img/home/client-1.png" alt="" /><i className="live" /></span>
              <div><strong>{b.chat.name}</strong><small>{b.chat.status}</small></div>
            </div>
            <div className="chatcard__body">
              {b.chat.msgs.map((m, i) => (
                <p key={i} className={`msg msg--${m.dir}${m.gold ? " msg--gold" : ""}`} style={{ animationDelay: `${(i * 2.1).toFixed(1)}s` }}>
                  {m.gold ? <><i className="fas fa-check-double" /> </> : null}{m.text}
                </p>
              ))}
              <p className="msg msg--in msg--typing" style={{ animationDelay: `${(b.chat.msgs.length * 2).toFixed(1)}s` }}><i /><i /><i /></p>
            </div>
            <a className="btn btn--wa" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener"><i className="fab fa-whatsapp" /> {b.chat.btn}</a>
          </div>
        </div>
        <div className="faq" id="faqList">
          {b.items.map((f, i) => (
            <div key={i} className={open === i ? "faq__item is-open" : "faq__item"} data-reveal style={d(i)}>
              <button className="faq__q" type="button" aria-expanded={open === i} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}<span className="faq__icon"><i className="fas fa-plus" /></span>
              </button>
              <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
