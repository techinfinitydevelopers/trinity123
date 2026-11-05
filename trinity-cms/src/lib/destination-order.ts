/* The client's country order for every list on the site that is not the home globe's own picker (header menu,
   footer, and anything else that wants it): UK, Ireland, France, USA, Australia, Canada, Sweden, UAE (Dubai),
   Germany, New Zealand, Singapore, Japan, South Korea, Netherlands, Malaysia, other European countries.
   Countries with a page come from the destinations table; the ones without a page of their own (Japan, South
   Korea, Netherlands, Malaysia, Other Europe) open the home globe on that country instead (`/#c=<key>`).
   Anything in the table that is not named here follows, in its own order. */
export type NavDestination = { key: string; name: string; code: string; href: string; tag: string };
type Row = { slug: string; code: string; name: string; tag: string };

const NAV_ORDER = ["uk", "ireland", "france", "usa", "australia", "canada", "sweden", "dubai", "germany", "new-zealand", "singapore", "japan", "korea", "netherlands", "malaysia", "europe"];
const GLOBE_ONLY: Record<string, { name: string; code: string; tag: string }> = {
  japan: { name: "Japan", code: "jp", tag: "Research & tech leaders" },
  korea: { name: "South Korea", code: "kr", tag: "Innovation & tech hubs" },
  netherlands: { name: "Netherlands", code: "nl", tag: "English-taught degrees" },
  malaysia: { name: "Malaysia", code: "my", tag: "Affordable campuses" },
  europe: { name: "Other Europe", code: "eu", tag: "More options in Europe" },
};

export function navDestinations(rows: Row[]): NavDestination[] {
  const out: NavDestination[] = [];
  for (const k of NAV_ORDER) {
    const d = rows.find((x) => x.slug === k);
    if (d) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
    else if (GLOBE_ONLY[k]) out.push({ key: k, ...GLOBE_ONLY[k], href: `/#c=${k}` });
  }
  for (const d of rows) if (!NAV_ORDER.includes(d.slug)) out.push({ key: d.slug, name: d.name, code: d.code, href: `/destinations/${d.slug}`, tag: d.tag });
  return out;
}
