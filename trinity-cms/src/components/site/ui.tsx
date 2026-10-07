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

/** `{country}` placeholder used by the destination template's editable headings. */
export const fillCountry = (text: string, country: string) => text.replace(/\{country\}/g, country);

/** The same `[accent]` / `{gold}` markers as `Title`, rendered inline. `accentStyle` is for the
    destination template, which paints its accents with inline styles rather than classes. */
export function Marked({ text, accentStyle }: { text: string; accentStyle?: CSSProperties }) {
  return (
    <>
      {splitTitle(text).map((p, i) =>
        p.cls ? <span key={i} className={accentStyle ? undefined : p.cls} style={accentStyle}>{p.t}</span> : <span key={i}>{p.t}</span>,
      )}
    </>
  );
}

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

export const Stars = ({ label = "5 star rating" }: { label?: string }) => (
  <span className="stars" role="img" aria-label={label}>
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
  /* An entry with an empty link is the owner hiding that icon from the dashboard without
     losing the row, so it is skipped rather than rendered as a dead anchor. */
  const items = (contact.socialLinks ?? []).filter((s) => s.href.trim());
  return (
    <>
      {items.map((s, i) => (
        <a key={`${s.label}-${i}`} className={cls} href={resolveHref(s.href, contact)} aria-label={s.label} target="_blank" rel="noopener"><i className={s.icon} /></a>
      ))}
    </>
  );
}
