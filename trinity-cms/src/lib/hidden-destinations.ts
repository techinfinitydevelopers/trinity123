/* Destinations taken off the website for now at the client's request (23 Nov 2026), kept in the code
   and the database so they can come back. Remove a key here and it returns everywhere at once: the
   header and footer menus, the home globe's countries and chips, the enquiry form's destination list,
   the sitemap, and its page — /destinations/sweden, /mbbs (Affordable Europe never had a page). */
export const HIDDEN_DESTINATIONS: ReadonlySet<string> = new Set(["sweden", "europe", "mbbs"]);
