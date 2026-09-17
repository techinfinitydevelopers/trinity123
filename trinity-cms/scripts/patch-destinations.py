import io, re
def rw(p, fn):
    s = open(p, encoding='utf-8').read(); n = fn(s)
    if n == s: print('NO CHANGE', p)
    open(p, 'w', encoding='utf-8').write(n)

# content.ts: country helpers
def content(s):
    s += '''
/* ---------- destinations ---------- */
export const getCountries = unstable_cache(
  async () => db.country.findMany({ where: { isActive: true }, orderBy: { order: "asc" }, select: { code: true, slug: true, name: true, tag: true, img: true } }),
  ["countries"],
  { tags: ["countries"] },
);

export const getCountry = unstable_cache(
  async (slug: string) => db.country.findUnique({ where: { slug } }),
  ["country"],
  { tags: ["countries"] },
);

export const getAdjacentPosts = unstable_cache(
  async (slug: string) => {
    const all = await db.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, select: { slug: true, title: true } });
    const i = all.findIndex((p) => p.slug === slug);
    if (i < 0 || all.length < 2) return { prev: null, next: null };
    return { prev: all[(i - 1 + all.length) % all.length], next: all[(i + 1) % all.length] };
  },
  ["adjacent"],
  { tags: ["posts"] },
);
'''
    return s.replace('  revalidateTag("settings", "max");', '  revalidateTag("settings", "max");\n  revalidateTag("countries", "max");')
rw('src/lib/content.ts', content)

# seed-content: country cards -> destination pages
slugs = {'us':'usa','au':'australia','ca':'canada','dk':'denmark','fr':'france','de':'germany','ie':'ireland','it':'italy','se':'sweden','gb':'uk','nz':'new-zealand'}
def seedc(s):
    for code, slug in slugs.items():
        s = re.sub(r'(\{ flag: "%s", name: "[^"]+", tag: "[^"]+", href: )C \}' % code, r'\1"/destinations/%s" }' % slug, s)
    return s
rw('src/lib/seed-content.ts', seedc)

# seed.ts
def seed(s):
    s = s.replace('import { seedPages, seedPosts, seedKnowledge } from "../src/lib/seed-content";',
                  'import { seedPages, seedPosts, seedKnowledge } from "../src/lib/seed-content";\nimport { seedCountries, postExtras } from "../src/lib/seed-countries";')
    s = s.replace('''    const { authorName: _a, ...rest } = p;
    void _a;
    await db.post.upsert({
      where: { slug: p.slug },
      create: { ...rest, status: "PUBLISHED", authorId: admin.id },
      update: { ...rest },
    });''', '''    const { authorName: _a, ...rest } = p;
    void _a;
    const extra = postExtras[p.slug] ?? { tags: [], takeaways: [], sources: [] };
    await db.post.upsert({
      where: { slug: p.slug },
      create: { ...rest, ...extra, status: "PUBLISHED", authorId: admin.id },
      update: { ...rest, ...extra },
    });
  }

  for (const c of seedCountries) {
    const existing = await db.country.findUnique({ where: { code: c.code } });
    if (existing && !force) continue;
    await db.country.upsert({ where: { code: c.code }, create: c, update: c });''')
    return s
rw('prisma/seed.ts', seed)

# actions.ts
def actions(s):
    s = s.replace('''  faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  seoTitle: z.string().max(200),''', '''  faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  takeaways: z.array(z.string()),
  sources: z.array(z.object({ label: z.string(), href: z.string() })),
  tags: z.array(z.string()),
  seoTitle: z.string().max(200),''')
    s = s.replace('body: p.body, faqs: p.faqs, seoTitle: p.seoTitle || null,',
                  'body: p.body, faqs: p.faqs, takeaways: p.takeaways, sources: p.sources, tags: p.tags.map((t) => t.trim()).filter(Boolean), seoTitle: p.seoTitle || null,')
    s += '''
/* ---------- destinations ---------- */
export type CountryInput = {
  id?: string; code: string; slug: string; name: string; tag: string; img: string; hero: string; intro: string;
  stats: unknown[]; why: unknown[]; courses: unknown[]; unis: unknown[]; visa: string; intakes: string;
  cost: unknown[]; req: unknown[]; sch: unknown[]; steps: unknown[]; work: string; workPoints: unknown[]; faq: unknown[];
  seoTitle: string; seoDesc: string; isActive: boolean; order: number;
};
export async function saveCountryAction(input: CountryInput): Promise<ActionResult> {
  try {
    await requireSession();
    const { id, seoTitle, seoDesc, ...rest } = input;
    const code = rest.code.toLowerCase().trim();
    const slug = slugify(rest.slug || rest.name);
    if (!code || !slug || !rest.name.trim()) return { ok: false, error: "Code, name and URL are required" };
    const data = { ...rest, code, slug, seoTitle: seoTitle || null, seoDesc: seoDesc || null } as unknown as Parameters<typeof db.country.create>[0]["data"];
    const row = id ? await db.country.update({ where: { id }, data }) : await db.country.create({ data });
    revalidateSite();
    return { ok: true, id: row.id, message: "Destination saved" };
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) return { ok: false, error: "A destination with this code or URL already exists" };
    return fail(e);
  }
}
export async function deleteCountryAction(id: string): Promise<ActionResult> {
  try { await requireSession(); await db.country.delete({ where: { id } }); revalidateSite(); return { ok: true }; } catch (e) { return fail(e); }
}
'''
    return s
rw('src/lib/actions.ts', actions)

# PostForm extras
def postform(s):
    s = s.replace('''        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">FAQ (schema.org rich results)</label>''', '''        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">Key takeaways</label><button className="btn-ghost btn-xs" onClick={() => set({ takeaways: [...p.takeaways, ""] })}>+ Add</button></div>
          <div className="space-y-2">
            {p.takeaways.map((t, i) => <div key={i} className="flex gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-[12px] font-bold text-white">{String(i + 1).padStart(2, "0")}</span><input className="inp inp-sm" value={t} onChange={(e) => set({ takeaways: p.takeaways.map((x, k) => (k === i ? e.target.value : x)) })} /><button className="btn-ghost btn-xs" onClick={() => set({ takeaways: p.takeaways.filter((_, k) => k !== i) })}>x</button></div>)}
            {!p.takeaways.length ? <p className="text-[13px] text-ink-3">Shown as a highlighted summary box at the top of the article.</p> : null}
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">Sources &amp; further reading</label><button className="btn-ghost btn-xs" onClick={() => set({ sources: [...p.sources, { label: "", href: "" }] })}>+ Add</button></div>
          <div className="space-y-2">
            {p.sources.map((sr, i) => <div key={i} className="flex flex-col gap-2 sm:flex-row"><input className="inp inp-sm" placeholder="Label" value={sr.label} onChange={(e) => set({ sources: p.sources.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} /><input className="inp inp-sm font-mono text-[12px]" placeholder="https://" value={sr.href} onChange={(e) => set({ sources: p.sources.map((x, k) => (k === i ? { ...x, href: e.target.value } : x)) })} /><button className="btn-ghost btn-xs" onClick={() => set({ sources: p.sources.filter((_, k) => k !== i) })}>x</button></div>)}
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><label className="lbl mb-0">FAQ (schema.org rich results)</label>''')
    s = s.replace('''          <Field label="Read time (minutes)" hint="0 = auto from word count">''', '''          <Field label="Topics / tags" hint="Comma separated"><input className="inp inp-sm" value={p.tags.join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trimStart()) })} /></Field>
          <Field label="Read time (minutes)" hint="0 = auto from word count">''')
    return s
rw('src/components/admin/PostForm.tsx', postform)

def postpage(s):
    s = s.replace('body: "", faqs: [], seoTitle: ""', 'body: "", faqs: [], takeaways: [], sources: [], tags: [], seoTitle: ""')
    return s.replace('faqs: (p.faqs as { q: string; a: string }[]) ?? [], seoTitle', 'faqs: (p.faqs as { q: string; a: string }[]) ?? [], takeaways: (p.takeaways as string[]) ?? [], sources: (p.sources as { label: string; href: string }[]) ?? [], tags: p.tags ?? [], seoTitle')
rw('src/app/admin/(dash)/posts/[id]/page.tsx', postpage)

def sidebar(s):
    return s.replace('  { href: "/admin/posts", label: "Blog",', '  { href: "/admin/destinations", label: "Destinations", icon: "M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12zm0-9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },\n  { href: "/admin/posts", label: "Blog",')
rw('src/components/admin/Sidebar.tsx', sidebar)
print('patched')
