import Link from "next/link";
import type { ContactSettings, FooterSettings, NavSettings, SiteSettings } from "@/lib/settings";
import { FLAG, Socials } from "./ui";
import type { Destination } from "./Header";

/* The footer lists countries in the same order as the home page's "Where will you study next?" picker.
   Japan, South Korea, Malaysia and Other Europe have no destination page of their own, so they open the
   home globe on that country; destinations that are not in the picker (Sweden, Italy, Denmark) follow. */
type FootDest = { key: string; name: string; code: string; href: string };
const GLOBE_ONLY: Record<string, { name: string; code: string; href: string }> = {
  japan: { name: "Japan", code: "jp", href: "/#c=japan" },
  korea: { name: "South Korea", code: "kr", href: "/#c=korea" },
  malaysia: { name: "Malaysia", code: "my", href: "/#c=malaysia" },
  europe: { name: "Other Europe", code: "eu", href: "/#c=europe" },
};
const FOOT_ORDER = ["uk", "ireland", "france", "germany", "new-zealand", "dubai", "singapore", "australia", "japan", "korea", "usa", "canada", "malaysia", "europe"];
const footDestinations = (destinations: Destination[]): FootDest[] => {
  const out: FootDest[] = [];
  for (const k of FOOT_ORDER) {
    const d = destinations.find((x) => x.slug === k);
    if (d) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}` });
    else if (GLOBE_ONLY[k]) out.push({ key: k, ...GLOBE_ONLY[k] });
  }
  for (const d of destinations) if (!FOOT_ORDER.includes(d.slug)) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}` });
  return out;
};

export default function Footer({ nav, contact, site, footer, destinations }: { nav: NavSettings; contact: ContactSettings; site: SiteSettings; footer: FooterSettings; destinations: Destination[] }) {
  const wa = `https://wa.me/${contact.whatsapp}`;
  return (
    <>
      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <Link className="footer__logo" href="/"><img src={site.logo} alt={site.siteName} width={150} height={50} /></Link>
            <p>{site.footerText}</p>
            <div className="footer__social"><Socials contact={contact} cls="soc" /></div>
          </div>
          <div>
            <h3 className="footer__title">{footer.linksTitle}</h3>
            <ul className="footer__links">
              {nav.items.filter((i) => i.href !== "/blog").map((i) => <li key={i.href}><Link href={i.href}><span className="dot" />{i.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="footer__title">{footer.destinationsTitle}</h3>
            <div className="footer__tags">
              {footDestinations(destinations).map((c) => <Link key={c.key} href={c.href}><img src={FLAG(c.code)} alt="" width={18} height={18} />{c.name}</Link>)}
            </div>
          </div>
          <div>
            <h3 className="footer__title">{footer.contactTitle}</h3>
            <address className="footer__contact">
              <p><span className="ico"><i className="fas fa-map-marker-alt" /></span>{contact.address}</p>
              {contact.landline ? <a href={`tel:${contact.landline.replace(/[^\d+]/g, "")}`}><span className="ico"><i className="fas fa-phone-alt" /></span>{contact.landline}</a> : null}
              <a href={`tel:${contact.phones[0]?.replace(/[^\d+]/g, "")}`}><span className="ico"><i className="fas fa-mobile-alt" /></span>{contact.phones[0]}</a>
              <a href={`mailto:${contact.email}`}><span className="ico"><i className="fas fa-envelope" /></span>{contact.email}</a>
            </address>
          </div>
        </div>
        {/* The oversized ghost wordmark the drop-in's footer closes on. It used to be a
            scrolling marquee of the site name alternating with `footer.marqueeWord`; four
            copies of a long name sliding past read as noise at this size. One name, set
            once: the first word large and the rest beneath it, small and spaced out, which
            is what makes the block read as a mark rather than a sentence.

            Split from `site.siteName` rather than written here, so renaming the company in
            the dashboard still renames this. `footer.marqueeWord` is no longer painted —
            the setting is left in place rather than removed, in case it is wanted back.
            aria-hidden: it repeats the name the footer has already given. */}
        {(() => {
          const [first, ...rest] = site.siteName.trim().split(/\s+/);
          return (
            <div className="footer__word" aria-hidden="true">
              <strong>{first}</strong>
              {rest.length ? <span>{rest.join(" ")}</span> : null}
            </div>
          );
        })()}
        <div className="container footer__bottom">
          <p>{site.copyright}</p>
          {footer.poweredByText ? <p>Powered by <a href={footer.poweredByUrl} target="_blank" rel="noopener">{footer.poweredByText}</a></p> : null}
        </div>
      </footer>
      <a className="fab-wa" href={wa} aria-label="Chat on WhatsApp" target="_blank" rel="noopener"><i className="fab fa-whatsapp" /></a>
      <button className="to-top" id="toTop" type="button" aria-label="Back to top"><i className="fas fa-arrow-up" /></button>
    </>
  );
}
