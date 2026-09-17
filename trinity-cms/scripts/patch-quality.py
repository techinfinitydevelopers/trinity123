import re


def rw(p, fn):
    s = open(p, encoding='utf-8').read(); n = fn(s)
    if n == s: print('NO CHANGE', p)
    open(p, 'w', encoding='utf-8').write(n)


# ---------- FieldEditor: stable control choice + correct empty-array template ----------
def fe(s):
    # 1. Decide the control from the value AT MOUNT, not on every keystroke, so the control
    #    never swaps out mid-typing and steals focus.
    s = s.replace('''export default function FieldEditor({ value, onChange, name, depth = 0 }: { value: unknown; onChange: (v: unknown) => void; name: string; depth?: number }) {
  const label = humanize(name);''', '''export default function FieldEditor({ value, onChange, name, depth = 0 }: { value: unknown; onChange: (v: unknown) => void; name: string; depth?: number }) {
  const label = humanize(name);
  /* The control is chosen once, from the value this field mounted with. Deciding it from the
     CURRENT value made the control swap while the owner typed — a different DOM subtree, so
     React remounted it and focus was lost mid-word. */
  const mounted = useRef(typeof value === "string" ? value : "");
  const atMount = mounted.current;''')
    s = s.replace('''    if ((IMG_KEY.test(name) && !isFa(value)) || isImgVal(value)) return <ImagePicker label={label} value={value} onChange={onChange} />;
    if (isFa(value) || /icon/i.test(name)) return (''', '''    // `icon`-suffixed keys are always Font Awesome classes except Journey's SVG icons,
    // which live under `icon` with an image path — so judge those two by the mounted value.
    const iconKey = /icon$/i.test(name);
    const looksImage = (IMG_KEY.test(name) && !iconKey) || isImgVal(atMount);
    if (looksImage && !isFa(atMount)) return <ImagePicker label={label} value={value} onChange={onChange} />;
    if (iconKey ? !isImgVal(atMount) : (isFa(atMount) || /icon/i.test(name))) return (''')
    s = s.replace('''    if (LONG_KEY.test(name) || value.length > 90) return <Row label={label}><textarea className="inp" rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))} value={value} onChange={(e) => onChange(e.target.value)} /></Row>;''', '''    if (LONG_KEY.test(name) || atMount.length > 90) return <Row label={label}><textarea className="inp" rows={Math.min(8, Math.max(2, Math.ceil((value.length || 60) / 70)))} value={value} onChange={(e) => onChange(e.target.value)} /></Row>;''')

    # 2. "+ Add" on an emptied array of objects used to push "" — an unrecoverable one-way door
    #    that silently broke the rendered page. Remember the item shape instead.
    s = s.replace('''  if (Array.isArray(value)) {
    const arr = value as unknown[];''', '''  if (Array.isArray(value)) {
    const arr = value as unknown[];
    // Remember what an item of THIS list looks like, so "+ Add" still works after the
    // owner deletes every row (otherwise a list of objects would gain a bare string).
    if (arr.length && typeof arr[0] === "object" && arr[0]) shapeMemory.set(shapeKey(name, depth), arr[0] as object);''')
    s = s.replace('''    const add = () => onChange([...arr, arr.length ? (typeof arr[arr.length - 1] === "object" ? deepClone(arr[arr.length - 1]) : "") : ""]);
    const primitive = arr.length === 0 || typeof arr[0] !== "object";''', '''    const remembered = shapeMemory.get(shapeKey(name, depth));
    const add = () => {
      if (arr.length) return onChange([...arr, typeof arr[arr.length - 1] === "object" ? deepClone(arr[arr.length - 1]) : ""]);
      return onChange([...arr, remembered ? (emptyLike(remembered) as unknown) : ""]);
    };
    const primitive = arr.length ? typeof arr[0] !== "object" : !remembered;''')
    s = s.replace('import { useState, type ReactNode } from "react";', 'import { useRef, useState, type ReactNode } from "react";')
    s = s.replace('type Obj = Record<string, unknown>;', '''type Obj = Record<string, unknown>;

/* Shape of each list, keyed by field name, so an emptied array can still be re-populated
   with the right kind of item. Module-scoped: it only has to survive re-renders. */
const shapeMemory = new Map<string, object>();
const shapeKey = (name: string, depth: number) => `${depth}:${name}`;''')
    # the duplicate "Enable" control (Object.keys already yields `chip`)
    s = s.replace('''        {value.chip === null ? <div><FieldEditor name="chip" value={null} onChange={(nv) => onChange({ ...value, chip: nv })} /></div> : null}
''', '')
    return s


rw('src/components/admin/FieldEditor.tsx', fe)


# ---------- BlockEditor: add-after-empty index, and a guard on in-app navigation ----------
def be(s):
    s = s.replace('  const remove = (i: number) => { setBlocks(page.blocks.filter((_, k) => k !== i)); setSel(Math.max(0, i - 1)); };',
                  '  const remove = (i: number) => { const n = page.blocks.filter((_, k) => k !== i); setBlocks(n); setSel(Math.min(Math.max(0, i - 1), Math.max(0, n.length - 1))); };')
    s = s.replace('  const add = (t: BlockType) => { const n = [...page.blocks]; n.splice(sel + 1, 0, deepClone(templates[t])); setBlocks(n); setSel(sel + 1); setAdding(false); };',
                  '''  const add = (t: BlockType) => {
    const n = [...page.blocks];
    const at = n.length ? sel + 1 : 0; // splice(1,…) on an empty list appends at 0, so sel+1 would point past the end
    n.splice(at, 0, deepClone(templates[t]));
    setBlocks(n); setSel(at); setAdding(false);
  };''')
    # warn before a client-side navigation away from unsaved work
    s = s.replace('        <Link href="/admin/pages" className="text-[13px] text-ink-3 hover:text-brand">‹ Pages</Link>',
                  '        <Link href="/admin/pages" className="text-[13px] text-ink-3 hover:text-brand" onClick={(e) => { if (dirty && !confirm("You have unsaved changes. Leave without saving?")) e.preventDefault(); }}>‹ Pages</Link>')
    return s


rw('src/components/admin/BlockEditor.tsx', be)


# ---------- sitemap: destinations, priorities ----------
def sm(s):
    return s.replace('''import { getPageSlugs, getPublishedPostSlugs } from "@/lib/content";''', '''import { getPageSlugs, getPublishedPostSlugs, getCountries } from "@/lib/content";''').replace(
        '''  const [pages, posts] = await Promise.all([getPageSlugs().catch(() => []), getPublishedPostSlugs().catch(() => [])]);
  return [
    ...pages.map((p) => ({ url: p.slug === "home" ? `${base}/` : `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const })),
  ];''', '''  const [pages, posts, countries] = await Promise.all([
    getPageSlugs().catch(() => []),
    getPublishedPostSlugs().catch(() => []),
    getCountries().catch(() => []),
  ]);
  return [
    ...pages.map((p) => ({
      url: p.slug === "home" ? `${base}/` : `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: p.slug === "home" ? 1 : 0.8,
    })),
    // The destination pages are the commercial landing pages ("study in canada from india"),
    // so they get the highest non-home priority.
    ...countries.map((c) => ({
      url: `${base}/destinations/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];''')


rw('src/app/sitemap.ts', sm)


# ---------- og:image fallback + self-canonical on CMS pages ----------
def home(s):
    return s.replace('''export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage("home");
  return { title: { absolute: p?.seoTitle || p?.title || "Home" }, description: p?.seoDesc ?? undefined, openGraph: { images: p?.ogImage ? [p.ogImage] : undefined } };
}''', '''export async function generateMetadata(): Promise<Metadata> {
  const [p, s] = await Promise.all([getPage("home"), getAllSettings()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // og:image must be absolute — WhatsApp and Facebook will not resolve a relative path.
  const image = `${base}${p?.ogImage || s.site.logo}`;
  return {
    title: { absolute: p?.seoTitle || p?.title || "Home" },
    description: p?.seoDesc ?? undefined,
    alternates: { canonical: `${base}/` },
    openGraph: { images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}''')


rw('src/app/(site)/page.tsx', home)


def slug(s):
    return s.replace('''export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPage(slug);
  if (!p) return {};
  return { title: { absolute: p.seoTitle || p.title }, description: p.seoDesc ?? undefined, openGraph: { images: p.ogImage ? [p.ogImage] : undefined } };
}''', '''export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [p, s] = await Promise.all([getPage(slug), getAllSettings()]);
  if (!p) return {};
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const image = `${base}${p.ogImage || s.site.logo}`;
  return {
    title: { absolute: p.seoTitle || p.title },
    description: p.seoDesc ?? undefined,
    // Self-canonical ignoring the query string, so /blog?tag=Visa does not compete with /blog.
    alternates: { canonical: `${base}/${slug}` },
    openGraph: { images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}''')


rw('src/app/(site)/[slug]/page.tsx', slug)

# ---------- JSON-LD: escape the </script> breakout ----------
for p in ['src/app/(site)/blog/[slug]/page.tsx', 'src/app/(site)/destinations/[slug]/page.tsx']:
    rw(p, lambda s: s.replace(
        'dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}',
        'dangerouslySetInnerHTML={{ __html: jsonLd(ld) }}').replace(
        'const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";',
        'const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";\n/** JSON.stringify does not escape "<", so a title containing </script> would break out of the tag. */\nconst jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, "\\\\u003c");'))

# author of a blog post is a person, not the organisation
rw('src/app/(site)/blog/[slug]/page.tsx', lambda s: s.replace(
    'author: { "@type": "Organization", name: author, url: `${base()}/` },',
    'author: { "@type": post.author ? "Person" : "Organization", name: author },'))

print('done')
