/* The client's country order for every list on the site that is not the home globe's own picker (header menu,
   footer, and anything else that wants it): UK, Ireland, France, Germany, New Zealand, UAE, Singapore, Australia, Japan,
   South Korea, USA, Canada, Netherlands, Italy, Malaysia, other European countries, Denmark.
   Countries with a page come from the destinations table; the ones without a page of their own (Japan, South
   Korea, Netherlands, Malaysia, Other Europe) open the home globe on that country instead (`/#c=<key>`).
   Anything in the table that is not named here follows, in its own order. */
export type NavDestination = { key: string; name: string; code: string; href: string; tag: string; sub?: { label: string; href: string; tag?: string }[] };

/* Sub-tabs shown when a destination is hovered in the header menu (and listed under it in the phone menu). */
const SUB: Record<string, { label: string; href: string; tag?: string }[]> = {
  europe: [{ label: "MBBS", href: "/mbbs", tag: "Study medicine abroad" }],
};
type Row = { slug: string; code: string; name: string; tag: string };

const NAV_ORDER = ["uk", "ireland", "france", "germany", "new-zealand", "uae", "singapore", "australia", "japan", "korea", "usa", "canada", "netherlands", "italy", "malaysia", "europe", "denmark"];
const HIDDEN = new Set(["sweden"]);
const LABEL: Record<string, string> = { dubai: "UAE" }; // only for a database that still has the old slug
const GLOBE_ONLY: Record<string, { name: string; code: string; tag: string }> = {
  japan: { name: "Japan", code: "jp", tag: "Research & tech leaders" },
  korea: { name: "South Korea", code: "kr", tag: "Innovation & tech hubs" },
  netherlands: { name: "Netherlands", code: "nl", tag: "English-taught degrees" },
  malaysia: { name: "Malaysia", code: "my", tag: "Affordable campuses" },
  europe: { name: "Other Europe", code: "eu", tag: "More options in Europe" },
};

export function navDestinations(rows: Row[]): NavDestination[] {
  const out = navDestinationsBase(rows);
  return out.map((d) => (SUB[d.key] ? { ...d, sub: SUB[d.key] } : d));
}

function navDestinationsBase(rows: Row[]): NavDestination[] {
  const out: NavDestination[] = [];
  for (const k of NAV_ORDER) {
    const d = rows.find((x) => x.slug === k);
    if (d) out.push({ key: d.slug, name: LABEL[d.slug] ?? d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
    else if (GLOBE_ONLY[k]) out.push({ key: k, ...GLOBE_ONLY[k], href: `/#c=${k}` });
  }
  for (const d of rows) if (!NAV_ORDER.includes(d.slug) && !HIDDEN.has(d.slug)) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
  return out;
}
