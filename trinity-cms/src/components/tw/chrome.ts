/* The drop-in's own navigation bar and footer.

   The vendored package under this folder ships the page *between* the chrome: the zip's
   `markup.ts` starts at `#loading` and stops at `#cta`, because the first integration kept
   this site's own header and footer around the experience. This file puts the drop-in's
   back, so the home page is the page the design was drawn as.

   It lives outside `markup.ts` on purpose. That file is generated — a new drop-in overwrites
   it wholesale, and the generator strips the chrome every time — so anything written into it
   would be lost on the next update. Here it survives, and the only thing a drop-in update has
   to agree with is the handful of ids and class names `chrome.css` and `engine.ts` reach for.

   The copy is this site's, not the prototype's. The standalone ships placeholder contact
   details — `hello@example.com`, `+91 00000 00000`, "Your office address, City, India" — and
   those are the kind of thing that goes live and stays live. Every one of them is a field the
   dashboard already owns, so they are passed in and the prototype's text is only the fallback
   for a field nobody has filled. The nav links and the footer's Explore column stay as
   on-page anchors, which is what the design is: one page you scroll, not a site map. */

import { CREDIT, CREDITS } from "./credits";

export type ChromeLink = { label: string; href: string };

export type ChromeData = {
  /** Shown in the nav and again, larger, in the footer. */
  logo?: string;
  siteName?: string;
  /** The paragraph under the footer logo. */
  blurb?: string;
  phone?: string;
  email?: string;
  address?: string;
  /** Rendered as the round two-letter buttons the design uses, so the label is what shows. */
  socials?: ChromeLink[];
  copyright?: string;
  /** Privacy, terms — whatever the site actually has. Omitted entirely when empty. */
  legal?: ChromeLink[];
  /** The credit this site carries opposite its copyright, in place of legal links. */
  poweredBy?: ChromeLink;
  ctaLabel?: string;
  /** Where "Free counselling" points. Defaults to the on-page form. */
  ctaHref?: string;
  /** The site's real pages, for the nav bar and the mobile sheet. Top level only — the
      prototype's nav is a pill with room for a row of words, not a menu bar with dropdowns.
      Left empty, the nav falls back to the prototype's own on-page anchors. */
  navItems?: ChromeLink[];
};

/* Everything interpolated below is the site owner's own text out of the dashboard, never a
   visitor's — but it is still user input reaching innerHTML, and a stray `<` in an address
   would silently eat the rest of the footer. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* `href` is escaped the same way and then checked: an attribute is a worse place to be wrong
   than a text node, and the dashboard has no reason to produce anything but these schemes. */
function safeHref(href: string): string {
  const t = href.trim();
  if (/^(https?:|mailto:|tel:|[/#])/i.test(t)) return esc(t);
  return "#";
}

/* The two letters inside each social button. The design has no room for an icon font and no
   room for a word, so "Instagram" becomes IG and "LinkedIn" becomes in — the shapes the
   prototype drew. Anything unrecognised falls back to its own first two letters. */
const SOCIAL_SHORT: Record<string, string> = {
  instagram: "IG",
  linkedin: "in",
  youtube: "YT",
  whatsapp: "WA",
  facebook: "f",
  twitter: "X",
  x: "X",
};

/* A label the table does not know falls back to its own opening letters — trimmed again
   afterwards, because "X (Twitter)" would otherwise render as "X" plus a stray space that
   the centred grid shows up as an off-centre glyph. */
function socialShort(label: string): string {
  const k = label.trim().toLowerCase();
  return SOCIAL_SHORT[k] ?? label.trim().slice(0, 2).trim();
}

/* The five sections the nav and the footer's Explore column both point at. They are ids in
   `markup.ts`; if a drop-in update renames one, the link goes dead quietly, so they are
   written once here rather than twice. */
const SECTIONS: ChromeLink[] = [
  { label: "Universities", href: "#unis" },
  { label: "IELTS", href: "#ielts" },
  { label: "Process", href: "#process" },
  { label: "Results", href: "#stats" },
  { label: "Stories", href: "#voices" },
];

/* The mobile sheet spells two of them out — there is room for the full words at 2.4rem. */
const SECTIONS_LONG: ChromeLink[] = [
  { label: "Universities", href: "#unis" },
  { label: "IELTS coaching", href: "#ielts" },
  { label: "Process", href: "#process" },
  { label: "Results", href: "#stats" },
  { label: "Stories", href: "#voices" },
];

/* The seven the site has a destination page for, in the order the prototype listed them.
   `data-k` is a country key the engine knows: clicking one picks that country and flies
   there rather than leaving the page, which is the whole point of the footer column. */
const FOOTER_DESTINATIONS: { k: string; label: string }[] = [
  { k: "uk", label: "United Kingdom" },
  { k: "usa", label: "USA" },
  { k: "canada", label: "Canada" },
  { k: "australia", label: "Australia" },
  { k: "germany", label: "Germany" },
  { k: "ireland", label: "Ireland" },
  { k: "nz", label: "New Zealand" },
];

const LOGO_FALLBACK = "/tw/logo.png";
const BLURB_FALLBACK =
  "IELTS coaching, university shortlisting, applications and visa — one team, door to door.";

function logoMarkup(d: ChromeData, extraClass: string, id: string): string {
  const name = esc(d.siteName?.trim() || "Trinity");
  const src = esc(d.logo?.trim() || LOGO_FALLBACK);
  const idAttr = id ? ` id="${id}"` : "";
  /* The `.mark` span is the drop-in's wordmark, shown only while the image has not loaded —
     `chrome.css` hides one or the other. Keeping both means no empty gap on a slow connection
     and no duplicate name once the logo arrives. */
  return (
    `<a class="logo${extraClass}" href="#">` +
    `<img${idAttr} src="${src}" alt="${name}">` +
    `<span class="mark"><i></i>${name}</span>` +
    `</a>`
  );
}

export function navMarkup(d: ChromeData): string {
  /* The site's own pages when it has them. The prototype navigates its single page, but this
     is the home page of a site with somewhere to go, and the design is the pill — not the
     list inside it. Dropdowns are flattened away to their parent: thirteen service pages do
     not fit in a pill, and they are all one click further on from /our-service anyway. */
  const items = d.navItems?.length ? d.navItems : SECTIONS;
  const links = items.map((s) => `<li><a href="${safeHref(s.href)}">${esc(s.label)}</a></li>`).join("");
  /* The sheet is a full screen of stacked lines, so it carries the same list — there is no
     reason for the phone to offer less than the desktop. */
  const sheetItems = d.navItems?.length ? d.navItems : SECTIONS_LONG;
  const sheet = sheetItems.map((s) => `<a href="${safeHref(s.href)}">${esc(s.label)}</a>`).join("");
  const ctaLabel = esc(d.ctaLabel?.trim() || "Free counselling");
  const ctaHref = safeHref(d.ctaHref?.trim() || "#cta");

  /* `#change` is not written here. `markup.ts` already contains that button and `engine.ts`
     binds its click handler while setting up, so the engine moves the existing node into
     `nav .right` once the chrome is in place — a listener travels with its element, and this
     way the drop-in keeps owning the behaviour. */
  return (
    `<nav id="nav">` +
    logoMarkup(d, "", "logoimg") +
    `<ul id="navlinks">${links}<span class="ind"></span></ul>` +
    `<div class="right">` +
    `<a class="btn" href="${ctaHref}">${ctaLabel} <em>→</em></a>` +
    `<button id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mmenu"><i></i><i></i></button>` +
    `</div>` +
    `</nav>` +
    `<div id="mmenu">${sheet}` +
    `<a href="${ctaHref}" class="gold">${ctaLabel} →</a>` +
    `<button id="mchange" type="button">Change country</button>` +
    `</div>`
  );
}

export function footerMarkup(d: ChromeData): string {
  const name = esc(d.siteName?.trim() || "Trinity");
  const blurb = esc(d.blurb?.trim() || BLURB_FALLBACK);

  const socials = (d.socials ?? [])
    .filter((s) => s.label && s.href)
    .map(
      (s) =>
        `<a href="${safeHref(s.href)}" aria-label="${esc(s.label)}" target="_blank" rel="noopener">` +
        `${esc(socialShort(s.label))}</a>`,
    )
    .join("");

  const explore = SECTIONS_LONG.map(
    (s) => `<a href="${s.href}">${esc(s.label)}</a>`,
  ).join("");

  const dests = FOOTER_DESTINATIONS.map(
    (c) => `<a href="#" data-k="${esc(c.k)}">${esc(c.label)}</a>`,
  ).join("");

  /* Only the fields that have a value are printed. An empty <a href="tel:"> is a dead link
     that looks live, which is worse than a column with one row fewer. */
  const contact = [
    d.phone?.trim() ? `<a href="tel:${esc(d.phone.replace(/[^+\d]/g, ""))}">${esc(d.phone)}</a>` : "",
    d.email?.trim() ? `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>` : "",
    d.address?.trim() ? `<span>${esc(d.address)}</span>` : "",
    `<a class="btn" href="${safeHref(d.ctaHref?.trim() || "#cta")}" style="margin-top:10px">Book free session</a>`,
  ]
    .filter(Boolean)
    .join("");

  /* The right-hand half of the bottom bar. The prototype put Privacy · Terms there; this
     site has neither page and carries a build credit instead, so whichever it has is used
     and the slot is dropped when it has neither. */
  const legal =
    (d.legal ?? [])
      .filter((l) => l.label && l.href)
      .map((l) => `<a href="${safeHref(l.href)}">${esc(l.label)}</a>`)
      .join(" · ") ||
    (d.poweredBy?.label
      ? `Powered by <a href="${safeHref(d.poweredBy.href)}" target="_blank" rel="noopener">${esc(d.poweredBy.label)}</a>`
      : "");

  const copyright = esc(
    d.copyright?.trim() || `© ${new Date().getFullYear()} ${d.siteName?.trim() || "Trinity"}. All rights reserved.`,
  );

  /* `.fword` is the oversized wordmark the footer fades out behind; it is decoration that
     repeats the site name, so it is hidden from screen readers rather than read twice. */
  return (
    `<footer class="f">` +
    `<div class="fwrap">` +
    `<div class="ftop">` +
    `<div class="fb">${logoMarkup(d, " flogo", "")}<p>${blurb}</p>` +
    (socials ? `<div class="soc">${socials}</div>` : "") +
    `</div>` +
    `<div class="fc"><h4>Explore</h4>${explore}</div>` +
    `<div class="fc fd"><h4>Destinations</h4>${dests}</div>` +
    `<div class="fc"><h4>Contact</h4>${contact}</div>` +
    `</div>` +
    `<div class="fword" aria-hidden="true">${name}</div>` +
    `<div class="fbot"><span>${copyright}</span>${legal ? `<span>${legal}</span>` : ""}</div>` +
    `<details class="fcred"><summary>Image &amp; asset credits</summary>` +
    `<div class="credit">${CREDIT}</div>` +
    `<div class="credits">${CREDITS}</div>` +
    `</details>` +
    `</div>` +
    `</footer>`
  );
}
