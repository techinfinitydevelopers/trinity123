import Link from "next/link";
import type { ContactSettings, NavSettings, SiteSettings } from "@/lib/settings";
import { FLAG, Socials } from "./ui";
import type { Destination } from "./Header";

export default function Footer({ nav, contact, site, destinations }: { nav: NavSettings; contact: ContactSettings; site: SiteSettings; destinations: Destination[] }) {
  const wa = `https://wa.me/${contact.whatsapp}`;
  return (
    <>
      <footer className="footer">
        <div className="container footer__cta" data-reveal="scale">
          <div>
            <p className="kicker kicker--gold">Dream Big · Make It Happen</p>
            <h2 className="footer__cta-title">Ready to start your study abroad journey?</h2>
          </div>
          <div className="btn-row">
            <Link className="btn btn--gold" href="/contact-us">Book Free Consultation <i className="fas fa-arrow-right" /></Link>
            <a className="btn btn--ghost" href={wa} target="_blank" rel="noopener"><i className="fab fa-whatsapp" /> WhatsApp</a>
          </div>
        </div>
        <div className="container footer__grid">
          <div className="footer__brand">
            <Link className="footer__logo" href="/"><img src={site.logo} alt={site.siteName} width={150} height={50} /></Link>
            <p>{site.footerText}</p>
            <div className="footer__social"><Socials contact={contact} cls="soc" /></div>
          </div>
          <div>
            <h3 className="footer__title">Quick Links</h3>
            <ul className="footer__links">
              {nav.items.filter((i) => i.href !== "/blog").map((i) => <li key={i.href}><Link href={i.href}><span className="dot" />{i.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="footer__title">Destinations</h3>
            <div className="footer__tags">
              {destinations.map((c) => <Link key={c.code} href={`/destinations/${c.slug}`}><img src={FLAG(c.code)} alt="" width={18} height={18} />{c.name}</Link>)}
            </div>
          </div>
          <div>
            <h3 className="footer__title">Get in Touch</h3>
            <address className="footer__contact">
              <p><span className="ico"><i className="fas fa-map-marker-alt" /></span>{contact.address}</p>
              {contact.landline ? <a href={`tel:${contact.landline.replace(/[^\d+]/g, "")}`}><span className="ico"><i className="fas fa-phone-alt" /></span>{contact.landline}</a> : null}
              <a href={`tel:${contact.phones[0]?.replace(/[^\d+]/g, "")}`}><span className="ico"><i className="fas fa-mobile-alt" /></span>{contact.phones[0]}</a>
              <a href={`mailto:${contact.email}`}><span className="ico"><i className="fas fa-envelope" /></span>{contact.email}</a>
            </address>
          </div>
        </div>
        <div className="footer__marquee" aria-hidden="true">
          <div className="marquee__track marquee__track--slow"><span>{site.siteName}</span><span>Think Global</span><span>{site.siteName}</span><span>Think Global</span></div>
        </div>
        <div className="container footer__bottom">
          <p>{site.copyright}</p>
          <p>Powered by <a href="https://www.itarsia.com/" target="_blank" rel="noopener">Itarsia India Limited</a></p>
        </div>
      </footer>
      <a className="fab-wa" href={wa} aria-label="Chat on WhatsApp" target="_blank" rel="noopener"><i className="fab fa-whatsapp" /></a>
      <button className="to-top" id="toTop" type="button" aria-label="Back to top"><i className="fas fa-arrow-up" /></button>
    </>
  );
}
