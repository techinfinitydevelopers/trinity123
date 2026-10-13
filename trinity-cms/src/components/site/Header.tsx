"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ContactSettings, LabelSettings, NavItem, NavSettings, SiteSettings } from "@/lib/settings";
import { Socials, FLAG } from "./ui";

export type Destination = { code: string; slug: string; name: string; tag: string };

export default function Header({ nav, contact, site, labels, destinations }: { nav: NavSettings; contact: ContactSettings; site: SiteSettings; labels: LabelSettings["header"]; destinations: Destination[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  /* Index of the open dropdown, or -1 for none. One piece of state rather than one flag per menu:
     opening a second dropdown has to close the first, and how many there are is now up to the
     owner — any menu item with children becomes one. */
  const [openMenu, setOpenMenu] = useState(-1);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  /* A dropdown counts as current when the page itself or any of its children is open — and the
     destinations menu when the visitor is on any country page. */
  const activeItem = (it: NavItem) =>
    active(it.href) || (it.kind === "destinations" && path.startsWith("/destinations")) || (it.children ?? []).some((c) => active(c.href));
  const tel = `tel:${contact.phones[0]?.replace(/[^\d+]/g, "")}`;
  const navRef = useRef<HTMLUListElement>(null);

  // Click-opened menus must close when the visitor clicks anywhere else.
  useEffect(() => {
    if (openMenu < 0) return;
    const onDown = (e: MouseEvent) => { if (!navRef.current?.contains(e.target as Node)) setOpenMenu(-1); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenu]);

  // Close everything on navigation, or the menu stays open over the new page.
  useEffect(() => { setOpenMenu(-1); setOpen(false); }, [path]);

  const ddMenu = (extra?: React.CSSProperties): React.CSSProperties => ({
    position: "absolute", left: "50%", top: "calc(100% + 14px)", transform: "translate(-50%,10px)",
    background: "#fff", border: "1px solid var(--line)", borderRadius: 24, boxShadow: "0 30px 70px rgba(26,36,86,.22)",
    padding: 14, opacity: 0, visibility: "hidden", transition: "all .32s cubic-bezier(.4,0,.2,1)", zIndex: 60, ...extra,
  });

  /* A real button with aria-expanded: the menus used to open on CSS :hover only, which put every
     link inside them out of reach of keyboard and screen-reader users. */
  const ddButton = (it: NavItem, i: number, id: string) => (
    <button
      type="button"
      className={activeItem(it) ? "is-active cv-ddbtn" : "cv-ddbtn"}
      aria-expanded={openMenu === i}
      aria-controls={id}
      onClick={() => setOpenMenu((o) => (o === i ? -1 : i))}
      onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(-1); }}
    >
      {it.label} <i className="fas fa-chevron-down cv-ddchev" style={{ fontSize: 9, transition: "transform .3s" }} />
    </button>
  );

  const renderItem = (it: NavItem, i: number) => {
    // Country mega-menu: built from the destinations table, not from `children`.
    if (it.kind === "destinations") {
      if (!destinations.length) return null;
      return (
        <li key={`${it.href}-${i}`} className={openMenu === i ? "cv-ddwrap is-open" : "cv-ddwrap"} style={{ position: "relative" }}>
          {ddButton(it, i, "destinations-menu")}
          <div className="cv-ddmenu" id="destinations-menu" onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(-1); }} style={ddMenu({ width: 440 })}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {destinations.map((c) => (
                <Link key={c.code} href={`/destinations/${c.slug}`} className="cv-ditem" onClick={() => setOpenMenu(-1)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, transition: "all .25s", color: "var(--navy)", background: "transparent", boxShadow: "none" }}>
                  <img src={FLAG(c.code)} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", boxShadow: "0 3px 8px rgba(26,36,86,.18)", flexShrink: 0 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{c.name}</span>
                    <span className="cv-dsub" style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.tag}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link href={it.href} onClick={() => setOpenMenu(-1)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "12px 14px", borderRadius: 16, background: "var(--grey)", fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 13, color: "var(--primary)", boxShadow: "none" }}>
              View all destinations <i className="fas fa-arrow-right" style={{ fontSize: 11 }} />
            </Link>
          </div>
        </li>
      );
    }

    // Plain dropdown: whatever children the owner added in Settings.
    if (it.children?.length) {
      const id = `menu-${i}`;
      return (
        <li key={`${it.href}-${i}`} className={openMenu === i ? "cv-ddwrap is-open" : "cv-ddwrap"} style={{ position: "relative" }}>
          {ddButton(it, i, id)}
          <div className="cv-ddmenu" id={id} onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(-1); }} style={ddMenu({ width: 240 })}>
            <div style={{ display: "grid", gap: 2 }}>
              {it.href ? (
                <Link href={it.href} className="cv-ditem" onClick={() => setOpenMenu(-1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, transition: "all .25s", color: "var(--primary)", fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 13.5, background: "var(--grey)", boxShadow: "none", marginBottom: 4 }}>
                  <i className="fas fa-folder-open" style={{ fontSize: 12 }} /> {it.label}
                </Link>
              ) : null}
              {it.children.map((c) => (
                <Link key={c.href} href={c.href} className="cv-ditem" onClick={() => setOpenMenu(-1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, transition: "all .25s", color: "var(--navy)", fontFamily: "var(--font-h)", fontWeight: 500, fontSize: 14, background: "transparent", boxShadow: "none" }}>
                  <i className="fas fa-chevron-right" style={{ fontSize: 9, color: "var(--teal)" }} /> {c.label}
                </Link>
              ))}
            </div>
          </div>
        </li>
      );
    }

    return (
      <li key={`${it.href}-${i}`}>
        <Link href={it.href} className={active(it.href) ? "is-active" : undefined} aria-current={active(it.href) ? "page" : undefined}>{it.label}</Link>
      </li>
    );
  };

  return (
    <header className="site-header" id="siteHeader">
      <div className="topbar">
        <div className="container topbar__inner">
          <form className="topsearch" role="search" action="/search" onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); if (String(q ?? "").trim()) location.href = `/search?q=${encodeURIComponent(String(q))}`; }}>
            <i className="fas fa-search" aria-hidden="true" />
            <input name="q" type="search" placeholder={labels.searchPlaceholder} aria-label={labels.searchPlaceholder} />
          </form>
          <div className="topbar__group">
            <a className="topbar__ico" href={tel} aria-label={`Call ${contact.phones[0]}`} title={contact.phones[0]}><i className="fas fa-phone-alt" /></a>
            <div className="topbar__social"><Socials contact={contact} cls="" /></div>
          </div>
        </div>
      </div>
      <div className="navwrap">
        <nav className="nav" aria-label="Main navigation">
          {/* The mark alone reads as an unlabelled crest at desktop sizes, so the name is locked
              under it. width/height are intrinsic only — CSS sizes it to keep the aspect ratio. */}
          <Link className="nav__logo" href="/">
            <img src={site.logo} alt="" width={160} height={54} />
            <span className="nav__logo-name">{site.siteName}</span>
          </Link>
          <ul className="nav__links" id="navLinks" ref={navRef}>
            {nav.items.map(renderItem)}
          </ul>
          <div className="nav__actions">
            <a className="nav__call" href={tel} aria-label={labels.callLabel}><i className="fas fa-phone-alt" /></a>
            <Link className="btn btn--dark nav__cta" href={nav.ctaHref}>{nav.ctaLabel} <span className="btn__circle"><i className="fas fa-arrow-right" /></span></Link>
            <button className="nav__toggle" id="navToggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobileMenu" onClick={() => setOpen((o) => !o)}>
              <i className={open ? "fas fa-times" : "fas fa-bars"} />
            </button>
          </div>
        </nav>
        <div className="mobile-menu" id="mobileMenu" hidden={!open}>
          {nav.items.map((it, i) => (
            <div key={`${it.href}-${i}`}>
              <Link href={it.href} onClick={() => setOpen(false)} className={activeItem(it) ? "is-active" : undefined}>{it.label}</Link>
              {/* Touch has no hover, so a dropdown's children are listed under their parent rather
                  than hidden behind one. */}
              {it.children?.length ? (
                <div style={{ display: "grid", gap: 2, padding: "2px 0 8px 18px" }}>
                  {it.children.map((c) => (
                    <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className={active(c.href) ? "is-active" : undefined} style={{ fontSize: 14, fontWeight: 500 }}>
                      <i className="fas fa-chevron-right" style={{ fontSize: 8, color: "var(--teal)", marginRight: 8 }} />{c.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {destinations.length ? (
            <div style={{ padding: "14px 0 4px" }}>
              <div style={{ fontFamily: "var(--font-h)", fontWeight: 600, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--primary)", marginBottom: 12 }}>{labels.destinations}</div>
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
