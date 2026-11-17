/* The client's country order for every list on the site that is not the home globe's own picker (header menu,
   footer, and anything else that wants it): UK, Ireland, France, Germany, New Zealand, UAE, Singapore, Australia, Japan,
   South Korea, USA, Canada, Netherlands, Italy, Malaysia, Denmark, Affordable Europe.
   Countries with a page come from the destinations table; the one without a page of its own (Affordable Europe) — and
   any other whose page a database does not have yet — opens the home globe on that country instead (`/#c=<key>`).
   Anything in the table that is not named here follows, in its own order. */
export type NavDestination = { key: string; name: string; code: string; href: string; tag: string; sub?: { label: string; href: string; tag?: string }[] };

/* Sub-tabs shown when a destination is hovered in the header menu (and listed under it in the phone menu). */
const SUB: Record<string, { label: string; href: string; tag?: string }[]> = {
  europe: [{ label: "MBBS", href: "/contact-us", tag: "Study medicine abroad" }],
};
type Row = { slug: string; code: string; name: string; tag: string };

const NAV_ORDER = ["uk", "ireland", "france", "germany", "new-zealand", "uae", "singapore", "australia", "japan", "korea", "usa", "canada", "netherlands", "italy", "malaysia", "denmark", "europe"];
const HIDDEN = new Set(["sweden"]);
const LABEL: Record<string, string> = { dubai: "UAE" }; // only for a database that still has the old slug
const GLOBE_ONLY: Record<string, { name: string; code: string; tag: string }> = {
  japan: { name: "Japan", code: "jp", tag: "Research & tech leaders" },
  korea: { name: "South Korea", code: "kr", tag: "Innovation & tech hubs" },
  netherlands: { name: "Netherlands", code: "nl", tag: "English-taught degrees" },
  malaysia: { name: "Malaysia", code: "my", tag: "Affordable campuses" },
  europe: { name: "Affordable Europe", code: "eu", tag: "More options in Europe" },
};

export function navDestinations(rows: Row[]): NavDestination[] {
  const out = navDestinationsBase(rows);
  return out.map((d) => (SUB[d.key] ? { ...d, sub: SUB[d.key] } : d));
}

function navDestinationsBase(rows: Row[]): NavDestination[] {
  const out: NavDestination[] = [];
  const used = new Set<string>();
  for (const k of NAV_ORDER) {
    /* The agreed order says "korea" (the globe's key); the page itself is `south-korea`, so accept either. */
    const d = rows.find((x) => x.slug === k || (k === "korea" && x.slug === "south-korea"));
    if (d) { used.add(d.slug); out.push({ key: d.slug, name: LABEL[d.slug] ?? d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag }); }
    else if (GLOBE_ONLY[k]) out.push({ key: k, ...GLOBE_ONLY[k], href: `/#c=${k}` });
  }
  /* `used`, not NAV_ORDER: a row can be placed under a different key than its slug (`south-korea` under `korea`),
     and checking the slug against the list would add it a second time — two children with one React key. */
  for (const d of rows) if (!used.has(d.slug) && !NAV_ORDER.includes(d.slug) && !HIDDEN.has(d.slug)) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
  return out;
}
