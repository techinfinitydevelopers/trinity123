/* The client's country order for every list on the site that is not the home globe's own picker (header menu,
   footer, and anything else that wants it): UK, Ireland, France, Germany, New Zealand, UAE, Singapore, Australia, Japan,
   South Korea, USA, Canada, Netherlands, Italy, Malaysia, Denmark, Sweden, Affordable Europe, MBBS.
   Countries with a page come from the destinations table; the ones without a page of their own (Affordable Europe,
   MBBS) — and any other whose page a database does not have yet — fall back to a fixed href below.
   Anything in the table that is not named here follows, in its own order.

   Which of these are shown is the owner's choice: Settings → Navigation → "Destinations on the site" saves the
   switched-off ones as `nav.hiddenDestinations`, passed in here (see hidden-destinations.ts).

   MBBS used to be a sub-tab that popped out beside "Affordable Europe"; the client asked for two plain, equal rows
   instead (19 Nov 2026), both going straight to the enquiry form rather than one opening the globe and the other a
   popout. `icon` replaces the flag image for entries that are not a country.

   Sweden already had a destinations-table row (full page content, flag) but was kept out of
   every list here until the globe had somewhere to send it — added 19 Nov 2026 alongside the
   client's partner-university sheet, which is the first thing that needed Sweden on the globe. */
import { isHiddenDestination } from "./hidden-destinations";

export type NavDestination = { key: string; name: string; code: string; href: string; tag: string; icon?: string };

type Row = { slug: string; code: string; name: string; tag: string };

const NAV_ORDER = ["uk", "ireland", "france", "germany", "new-zealand", "uae", "singapore", "australia", "japan", "korea", "usa", "canada", "netherlands", "italy", "malaysia", "denmark", "sweden", "europe", "mbbs"];
const LABEL: Record<string, string> = { dubai: "UAE" }; // only for a database that still has the old slug
const GLOBE_ONLY: Record<string, { name: string; code: string; tag: string; href?: string; icon?: string }> = {
  japan: { name: "Japan", code: "jp", tag: "Research & tech leaders" },
  korea: { name: "South Korea", code: "kr", tag: "Innovation & tech hubs" },
  netherlands: { name: "Netherlands", code: "nl", tag: "English-taught degrees" },
  malaysia: { name: "Malaysia", code: "my", tag: "Affordable campuses" },
  europe: { name: "Affordable Europe", code: "eu", tag: "More options in Europe", href: "/contact-us" },
  mbbs: { name: "MBBS", code: "", tag: "Study medicine abroad", href: "/contact-us", icon: "fas fa-user-md" },
};

export function navDestinations(rows: Row[], hidden?: readonly string[]): NavDestination[] {
  const out: NavDestination[] = [];
  const used = new Set<string>();
  for (const k of NAV_ORDER) {
    /* The agreed order says "korea" (the globe's key); the page itself is `south-korea`, so accept either. */
    const d = rows.find((x) => x.slug === k || (k === "korea" && x.slug === "south-korea"));
    if (d) used.add(d.slug);
    if (isHiddenDestination(hidden, k)) continue;
    if (d) out.push({ key: d.slug, name: LABEL[d.slug] ?? d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
    else if (GLOBE_ONLY[k]) { const { href, ...rest } = GLOBE_ONLY[k]; out.push({ key: k, ...rest, href: href ?? `/#c=${k}` }); }
  }
  /* `used`, not NAV_ORDER: a row can be placed under a different key than its slug (`south-korea` under `korea`),
     and checking the slug against the list would add it a second time — two children with one React key. */
  for (const d of rows) if (!used.has(d.slug) && !NAV_ORDER.includes(d.slug) && !isHiddenDestination(hidden, d.slug)) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
  return out;
}
