"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ContactSettings, NavSettings, SiteSettings } from "@/lib/settings";
import { Socials, FLAG } from "./ui";

export type Destination = { code: string; slug: string; name: string; tag: string };

/* Nav items whose href sits before the Study Destinations dropdown (canvas: Home · About · Why · Services · [Destinations] · Blog · Contact). */
const LEFT = ["/", "/about-us", "/why-study-abroad", "/our-service"];

export default function Header({ nav, contact, site, destinations }: { nav: NavSettings; contact: ContactSettings; site: SiteSettings; destinations: Destination[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const isDest = path.startsWith("/destinations");
  const tel = `tel:${contact.phones[0]?.replace(/[^\d+]/g, "")}`;
  const left = nav.items.filter((i) => LEFT.includes(i.href));
  const right = nav.items.filter((i) => !LEFT.includes(i.href));
  const destRef = useRef<HTMLLIElement>(null);
  // Click-opened menus must close when the visitor clicks anywhere else.
  useEffect(() => {
    if (!destOpen) return;
    const onDown = (e: MouseEvent) => { if (!destRef.current?.contains(e.target as Node)) setDestOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [destOpen]);

  const pill = (it: { href: string; label: string }) => (
    <li key={it.href}><Link href={it.href} className={active(it.href) ? "is-active" : undefined} aria-current={active(it.href) ? "page" : undefined}>{it.label}</Link></li>
  );

  return (
    <header className="site-header" id="siteHeader">
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__group">
            <span><i className="fas fa-map-marker-alt" /> {contact.address}</span>
            <a href={`mailto:${contact.email}`}><i className="fas fa-envelope" /> {contact.email}</a>
          </div>
          <div className="topbar__group">
            <a href={tel}><i className="fas fa-phone-alt" /> Call us: {contact.phones[0]}</a>
            <div className="topbar__social"><Socials contact={contact} cls="" /></div>
          </div>
        </div>
      </div>
      <div className="navwrap">
        <nav className="nav" aria-label="Main navigation">
          <Link className="nav__logo" href="/"><img src={site.logo} alt={site.siteName} width={160} height={54} /></Link>
          <ul className="nav__links" id="navLinks">
            {left.map(pill)}
            {destinations.length ? (
              <li ref={destRef} className={destOpen ? "cv-ddwrap is-open" : "cv-ddwrap"} style={{ position: "relative" }}>
                {/* A real button with aria-expanded: the menu used to open on CSS :hover only,
                    which put all 11 destination links out of reach of keyboard and screen readers. */}
                <button
                  type="button"
                  className={isDest ? "is-active cv-ddbtn" : "cv-ddbtn"}
                  aria-expanded={destOpen}
                  aria-controls="destinations-menu"
                  onClick={() => setDestOpen((o) => !o)}
                  onKeyDown={(e) => { if (e.key === "Escape") setDestOpen(false); }}
                >
                  Study Destinations <i className="fas fa-chevron-down cv-ddchev" style={{ fontSize: 9, transition: "transform .3s" }} />
                </button>
                <div className="cv-ddmenu" id="destinations-menu" onKeyDown={(e) => { if (e.key === "Escape") setDestOpen(false); }} style={{ position: "absolute", left: "50%", top: "calc(100% + 14px)", transform: "translate(-50%,10px)", width: 440, background: "#fff", border: "1px solid var(--line)", borderRadius: 24, boxShadow: "0 30px 70px rgba(22,20,57,.22)", padding: 14, opacity: 0, visibility: "hidden", transition: "all .32s cubic-bezier(.4,0,.2,1)", zIndex: 60 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {destinations.map((c) => (
                      <Link key={c.code} href={`/destinations/${c.slug}`} className="cv-ditem" onClick={() => setDestOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, transition: "all .25s", color: "var(--navy)", background: "transparent", boxShadow: "none" }}>
                        <img src={FLAG(c.code)} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", boxShadow: "0 3px 8px rgba(22,20,57,.18)", flexShrink: 0 }} />
                        <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                          <span style={{ fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{c.name}</span>
                          <span className="cv-dsub" style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.tag}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/why-study-abroad" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "12px 14px", borderRadius: 16, background: "var(--grey)", fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 13, color: "var(--primary)", boxShadow: "none" }}>
                    View all 33+ destinations <i className="fas fa-arrow-right" style={{ fontSize: 11 }} />
                  </Link>
                </div>
              </li>
            ) : null}
            {right.map(pill)}
          </ul>
          <div className="nav__actions">
            <a className="nav__call" href={tel} aria-label="Call us"><i className="fas fa-phone-alt" /></a>
            <Link className="btn btn--dark nav__cta" href={nav.ctaHref}>{nav.ctaLabel} <span className="btn__circle"><i className="fas fa-arrow-right" /></span></Link>
            <button className="nav__toggle" id="navToggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobileMenu" onClick={() => setOpen((o) => !o)}>
              <i className={open ? "fas fa-times" : "fas fa-bars"} />
            </button>
          </div>
        </nav>
        <div className="mobile-menu" id="mobileMenu" hidden={!open}>
          {nav.items.map((it) => <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={active(it.href) ? "is-active" : undefined}>{it.label}</Link>)}
          {destinations.length ? (
            <div style={{ padding: "14px 0 4px" }}>
              <div style={{ fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--primary)", marginBottom: 12 }}>Study Destinations</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {destinations.map((c) => (
                  <Link key={c.code} href={`/destinations/${c.slug}`} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 14, background: "var(--grey)", color: "var(--navy)", fontFamily: "var(--font-h)", fontWeight: 500, fontSize: 14, border: 0 }}>
                    <img src={FLAG(c.code)} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />{c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <Link className="btn btn--gold" href={nav.ctaHref} onClick={() => setOpen(false)}>{nav.ctaLabel}</Link>
        </div>
      </div>
    </header>
  );
}
