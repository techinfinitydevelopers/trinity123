import type { ThemeSettings } from "@/lib/settings";

/** Overrides the :root tokens declared in site.css with values from the Theme editor. */
export default function ThemeStyle({ t }: { t: ThemeSettings }) {
  /* `cream`/`teal` were added after launch, so fall back for setting rows saved before then. */
  const css = `:root{--primary:${t.primary};--primary-2:${t.primary2};--navy:${t.navy};--navy-2:${t.navy2};--navy-3:${t.navy3};--gold:${t.gold};--gold-2:${t.gold2};--text:${t.text};--muted:${t.muted};--grey:${t.grey};--line:${t.line};--cream:${t.cream ?? "#FFE8BE"};--teal:${t.teal ?? "#1ABC9C"};--font-h:${t.fontHeading},sans-serif;--font-b:${t.fontBody},sans-serif;--r-card:${t.radiusCard}px;--r-pill:${t.radiusPill}px;--container:${t.container}px}`;
  return <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: css }} />;
}

export function fontHref(t: ThemeSettings) {
  const fams = Array.from(new Set([t.fontHeading, t.fontBody]))
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fams}&display=swap`;
}
