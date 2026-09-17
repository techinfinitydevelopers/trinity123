import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { splitTitle, type Word, type Btn } from "@/lib/blocks";
import type { ContactSettings } from "@/lib/settings";

export const FLAG = (code: string) => `/assets/img/flags/${code}.png`;

/** Resolve sentinel hrefs ("whatsapp" | "phone") against contact settings. */
export function resolveHref(href: string, contact: ContactSettings) {
  if (href === "whatsapp") return `https://wa.me/${contact.whatsapp}`;
  if (href === "phone") return `tel:${contact.phones[0]?.replace(/[^\d+]/g, "")}`;
  if (href === "email") return `mailto:${contact.email}`;
  return href;
}

const isExternal = (h: string) => /^(https?:|tel:|mailto:|#)/.test(h);

export function A({ href, contact, className, children, ...rest }: { href: string; contact: ContactSettings; className?: string; children: ReactNode; [k: string]: unknown }) {
  const h = resolveHref(href, contact);
  if (isExternal(h)) {
    const ext = h.startsWith("http");
    return <a href={h} className={className} {...(ext ? { target: "_blank", rel: "noopener" } : {})} {...rest}>{children}</a>;
  }
  return <Link href={h} className={className} {...rest}>{children}</Link>;
}

export const Fa = ({ i, className }: { i: string; className?: string }) => <i className={className ? `${i} ${className}` : i} />;

/** Heading with `[accent]` / `{gold}` markers. */
export function Title({ text, as = "h2", className }: { text: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  const Tag = as;
  return (
    <Tag className={className}>
      {splitTitle(text).map((p, i) => (p.cls ? <span key={i} className={p.cls}>{p.t}</span> : <span key={i}>{p.t}</span>))}
    </Tag>
  );
}

/** Animated word-by-word H1 used by all heroes. */
export function Words({ words, start = 0.15, step = 0.1, capsule }: { words: Word[]; start?: number; step?: number; capsule?: string }) {
  const out: ReactNode[] = [];
  words.forEach((w, i) => {
    const delay = `${(start + i * step).toFixed(2)}s`;
    out.push(
      <span key={`w${i}`} className="w"><span className={w.s ? `w__in ${w.s}` : "w__in"} style={{ animationDelay: delay }}>{w.t}</span></span>,
    );
    if (capsule && w.s === "gold") {
      out.push(" ", <span key={`c${i}`} className="capsule w__in" style={{ animationDelay: ".5s" }}><img src={capsule} alt="" /></span>);
    }
    if (w.br) out.push(<br key={`b${i}`} />);
    else if (i < words.length - 1) out.push(" ");
  });
  return <>{out}</>;
}

export const Stars = () => (
  <span className="stars" aria-label="5 star rating">
    <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
  </span>
);

export function SectionHead({ kicker, title, lead, center, light, gold }: { kicker: string; title: string; lead?: string; center?: boolean; light?: boolean; gold?: boolean }) {
  return (
    <div className={center ? "section-head section-head--center" : "section-head"} data-reveal>
      <p className={gold ? "kicker kicker--gold" : "kicker"}>{kicker}</p>
      <Title text={title} className={light ? "h2 h2--light" : "h2"} />
      {lead ? <p className={light ? "lead lead--light" : "lead"}>{lead}</p> : null}
    </div>
  );
}

export function PhonePill({ contact, small, light }: { contact: ContactSettings; small: string; light?: boolean }) {
  return (
    <a className={light ? "phone-pill phone-pill--light" : "phone-pill"} href={resolveHref("phone", contact)}>
      <span className="phone-pill__ico"><i className="fas fa-phone-alt" /></span>
      <span><small>{small}</small>{contact.phones[0]}</span>
    </a>
  );
}

export function BtnLink({ b, contact, cls, icon }: { b: Btn; contact: ContactSettings; cls: string; icon?: ReactNode }) {
  return <A href={b.href} contact={contact} className={cls}>{b.label} {icon ?? <i className="fas fa-arrow-right" />}</A>;
}

export const d = (i: number, step = 0.08): CSSProperties => ({ ["--d" as string]: `${(i * step).toFixed(2).replace(/\.?0+$/, "") || "0"}s` });

export function Socials({ contact, cls }: { contact: ContactSettings; cls: string }) {
  const s = contact.socials;
  const items = [
    [s.facebook, "Facebook", "fab fa-facebook-f"], [s.twitter, "X (Twitter)", "fab fa-twitter"], [s.instagram, "Instagram", "fab fa-instagram"],
    [`https://wa.me/${contact.whatsapp}`, "WhatsApp", "fab fa-whatsapp"], [s.linkedin, "LinkedIn", "fab fa-linkedin-in"], [s.youtube, "YouTube", "fab fa-youtube"],
  ].filter(([h]) => h);
  return <>{items.map(([h, l, i]) => <a key={l} className={cls} href={h} aria-label={l} target="_blank" rel="noopener"><i className={i} /></a>)}</>;
}
