/* Which destinations are switched off on the website. The owner ticks them in Settings → Navigation
   ("Destinations on the site"); the list is saved as `nav.hiddenDestinations`. A hidden destination
   disappears everywhere at once — header and footer menus, the home globe's countries and chips,
   the enquiry form's destination list, the sitemap and its own page — and comes back when untick-ed.
   Nothing is deleted: the page content and data stay in the database and the code.

   Safe to import from client code (no server imports). */

/** Every destination the site can show, in the client's agreed order. `key` is what is stored. */
export const DESTINATION_OPTIONS: { key: string; name: string }[] = [
  { key: "uk", name: "United Kingdom" }, { key: "ireland", name: "Ireland" }, { key: "france", name: "France" },
  { key: "germany", name: "Germany" }, { key: "new-zealand", name: "New Zealand" }, { key: "uae", name: "UAE" },
  { key: "singapore", name: "Singapore" }, { key: "australia", name: "Australia" }, { key: "japan", name: "Japan" },
  { key: "korea", name: "South Korea" }, { key: "usa", name: "USA" }, { key: "canada", name: "Canada" },
  { key: "netherlands", name: "Netherlands" }, { key: "italy", name: "Italy" }, { key: "malaysia", name: "Malaysia" },
  { key: "denmark", name: "Denmark" }, { key: "sweden", name: "Sweden" }, { key: "europe", name: "Affordable Europe" },
  { key: "mbbs", name: "MBBS" },
];

/** Off until the owner turns them on (client request, 23 Nov 2026). */
export const DEFAULT_HIDDEN_DESTINATIONS: string[] = ["sweden", "europe", "mbbs"];

/* The same destination is spelled differently in different places: the globe says `nz` and `korea`,
   the pages are `new-zealand` and `south-korea`, an old database may still say `dubai`. */
const CANON: Record<string, string> = { nz: "new-zealand", "south-korea": "korea", dubai: "uae" };
const canon = (k: string) => { const v = k.trim().toLowerCase(); return CANON[v] ?? v; };

/** Is this destination (any of its spellings, or its display name) switched off? */
export function isHiddenDestination(hidden: readonly string[] | undefined, key: string): boolean {
  if (!hidden?.length) return false;
  const k = canon(key);
  return hidden.some((h) => canon(h) === k);
}
