def rw(p, fn):
    s = open(p, encoding='utf-8').read(); n = fn(s)
    if n == s: print('NO CHANGE', p)
    open(p, 'w', encoding='utf-8').write(n)


# ---------- Header: the destinations dropdown must be keyboard-operable ----------
def header(s):
    s = s.replace('  const [open, setOpen] = useState(false);', '  const [open, setOpen] = useState(false);\n  const [destOpen, setDestOpen] = useState(false);')
    s = s.replace('''              <li className="cv-ddwrap" style={{ position: "relative" }}>
                <Link href="/why-study-abroad" className={isDest ? "is-active" : undefined} aria-haspopup="true">
                  Study Destinations <i className="fas fa-chevron-down cv-ddchev" style={{ fontSize: 9, transition: "transform .3s" }} />
                </Link>
                <div className="cv-ddmenu" style={{''', '''              <li className={destOpen ? "cv-ddwrap is-open" : "cv-ddwrap"} style={{ position: "relative" }} onMouseLeave={() => setDestOpen(false)}>
                {/* A real button with aria-expanded: the menu used to open on CSS :hover only,
                    which put all 11 destination links out of reach of keyboard and screen readers. */}
                <button
                  type="button"
                  className={isDest ? "is-active cv-ddbtn" : "cv-ddbtn"}
                  aria-expanded={destOpen}
                  aria-controls="destinations-menu"
                  onClick={() => setDestOpen((o) => !o)}
                  onKeyDown={(e) => { if (e.key === "Escape") setDestOpen(false); }}
                >
                  Study Destinations <i className="fas fa-chevron-down cv-ddchev" style={{ fontSize: 9, transition: "transform .3s" }} />
                </button>
                <div className="cv-ddmenu" id="destinations-menu" onKeyDown={(e) => { if (e.key === "Escape") setDestOpen(false); }} style={{''')
    s = s.replace('''                      <Link key={c.code} href={`/destinations/${c.slug}`} className="cv-ditem"''',
                  '''                      <Link key={c.code} href={`/destinations/${c.slug}`} className="cv-ditem" onClick={() => setDestOpen(false)}''')
    return s


rw('src/components/site/Header.tsx', header)


def canvas(s):
    return s.replace('''.cv-ddwrap:hover .cv-ddmenu{opacity:1!important;visibility:visible!important;transform:translate(-50%,0)!important}
.cv-ddwrap:hover .cv-ddchev{transform:rotate(180deg)}''', '''/* Open on hover (mouse), on focus anywhere inside (keyboard), and when React marks it open (click). */
.cv-ddwrap:hover .cv-ddmenu,
.cv-ddwrap:focus-within .cv-ddmenu,
.cv-ddwrap.is-open .cv-ddmenu{opacity:1!important;visibility:visible!important;transform:translate(-50%,0)!important}
.cv-ddwrap:hover .cv-ddchev,
.cv-ddwrap:focus-within .cv-ddchev,
.cv-ddwrap.is-open .cv-ddchev{transform:rotate(180deg)}
/* The trigger is a <button> but must look exactly like the sibling nav pills. */
.nav__links .cv-ddbtn{font:inherit;background:transparent;border:0;cursor:pointer;color:var(--text);padding:10px 18px;border-radius:var(--r-pill);display:inline-flex;align-items:center;gap:8px;transition:all .3s}
.nav__links .cv-ddbtn:hover{color:var(--primary);background:#fff}
.nav__links .cv-ddbtn.is-active{color:var(--navy);background:#fff;box-shadow:0 6px 16px rgba(22,20,57,.1)}
.nav__links .cv-ddbtn.is-active::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--gold)}

/* A visible focus indicator everywhere. Gold reads on navy (10.9:1) and on white. */
:where(a,button,[role="button"],[tabindex]:not([tabindex="-1"])):focus-visible{
  outline:3px solid var(--gold);outline-offset:3px;border-radius:6px
}''')


rw('src/styles/canvas.css', canvas)


# ---------- contrast: --muted and --text failed 4.5:1 ----------
def site_css(s):
    return s.replace(
        '--gold:#FFC224;--gold-2:#F8BC24;--text:#6D6C80;--muted:#7F7E97;',
        # #5F5E73 = 6.0:1 on white / 5.2:1 on --grey; #605F78 = 5.8:1 on white / 5.0:1 on --grey.
        # Both clear AA at small sizes, where the old #6D6C80 / #7F7E97 did not.
        '--gold:#FFC224;--gold-2:#F8BC24;--text:#5F5E73;--muted:#605F78;')


rw('src/styles/site.css', site_css)


# ---------- chat widget a11y ----------
def widget(s):
    s = s.replace('<div className="tc-body nice-scroll" ref={bodyRef}>',
                  '<div className="tc-body nice-scroll" ref={bodyRef} role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation">')
    s = s.replace('            ref={inputRef} rows={1} value={input} placeholder="Ask about countries, fees, visas…" maxLength={1000} disabled={busy}',
                  '            ref={inputRef} rows={1} value={input} placeholder="Ask about countries, fees, visas…" aria-label="Your message" maxLength={1000} disabled={busy}')
    # a <span role="button"> nested inside a <button> is invalid and mouse-only
    s = s.replace('''        <button className="tc-nudge" onClick={() => toggle(true)}>
          <span className="tc-nudge__x" onClick={(e) => { e.stopPropagation(); setNudge(false); safeSet(STORAGE.seen, "1"); }} role="button" aria-label="Dismiss">×</span>
          <strong>Planning to study abroad?</strong>
          <small>Ask me about countries, fees, visas or intakes.</small>
        </button>''', '''        <div className="tc-nudge">
          <button type="button" className="tc-nudge__x" onClick={() => { setNudge(false); safeSet(STORAGE.seen, "1"); }} aria-label="Dismiss">×</button>
          <button type="button" className="tc-nudge__open" onClick={() => toggle(true)}>
            <strong>Planning to study abroad?</strong>
            <small>Ask me about countries, fees, visas or intakes.</small>
          </button>
        </div>''')
    # return focus to the launcher when the panel closes
    s = s.replace('''  const restored = useRef(false);
  const toggle = (next: boolean) => {
    setOpen(next);
    if (!next) return;''', '''  const restored = useRef(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const toggle = (next: boolean) => {
    setOpen(next);
    // Closing hides the panel with visibility:hidden, which would strand focus on a hidden node.
    if (!next) { fabRef.current?.focus(); return; }''')
    s = s.replace('<button className={`tc-fab${open ? " is-open" : ""}`}', '<button ref={fabRef} className={`tc-fab${open ? " is-open" : ""}`}')
    return s


rw('src/components/site/ChatWidget.tsx', widget)


def chat_css(s):
    return s.replace(
        '''.tc-nudge{position:fixed;right:92px;bottom:96px;z-index:61;max-width:270px;text-align:left;background:#fff;border:1px solid var(--line);border-radius:18px 18px 4px 18px;padding:14px 16px;box-shadow:var(--shadow);cursor:pointer;animation:fadeUpChat .45s var(--ease) both;font-family:var(--font-b)}''',
        '''.tc-nudge{position:fixed;right:92px;bottom:96px;z-index:61;max-width:270px;background:#fff;border:1px solid var(--line);border-radius:18px 18px 4px 18px;padding:14px 16px;box-shadow:var(--shadow);animation:fadeUpChat .45s var(--ease) both;font-family:var(--font-b)}
.tc-nudge__open{display:block;width:100%;text-align:left;background:none;border:0;padding:0;cursor:pointer;font:inherit}''').replace(
        '''.tc-nudge__x{position:absolute;top:6px;right:10px;font-size:17px;line-height:1;color:var(--muted)}''',
        '''.tc-nudge__x{position:absolute;top:4px;right:6px;width:24px;height:24px;background:none;border:0;cursor:pointer;font-size:17px;line-height:1;color:var(--muted)}''').replace(
        '.tc-foot{padding:0 16px 12px;font-size:10.5px;color:var(--muted);',
        '.tc-foot{padding:0 16px 12px;font-size:11.5px;color:var(--muted);')


rw('src/styles/chat.css', chat_css)


# ---------- FAQ: a collapsed answer must leave the a11y tree ----------
def faq(s):
    return s.replace(
        '<div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}><p>{f.a}</p></div>',
        '<div className="faq__a" id={`faq-a-${i}`} aria-labelledby={`faq-q-${i}`} hidden={open !== i}><p>{f.a}</p></div>')


rw('src/components/site/blocks/Faq.tsx', faq)


# ---------- reduced motion must also stop the JS scroll effects ----------
def scripts(s):
    s = s.replace('''  useEffect(() => {
    const header = document.getElementById("siteHeader");''', '''  useEffect(() => {
    // The CSS media query cannot stop these — they are the heaviest motion on the site.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.getElementById("siteHeader");''')
    s = s.replace('''    /* reveal */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));''', '''    /* reveal */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    if (reduce) document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
    else document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));''')
    s = s.replace('''    const onTop = () => window.scrollTo({ top: 0, behavior: "smooth" });''',
                  '''    const onTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });''')
    s = s.replace('''      const y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
      header?.classList.toggle("is-scrolled", y > 40);
      toTop?.classList.toggle("is-visible", y > 40);
      if (heroGlows) heroGlows.style.transform = `translateY(${y * 0.3}px)`;''', '''      const y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
      header?.classList.toggle("is-scrolled", y > 40);
      toTop?.classList.toggle("is-visible", y > 40);
      // Everything past this point is decorative transform work.
      if (reduce) { ticking = false; return; }
      if (heroGlows) heroGlows.style.transform = `translateY(${y * 0.3}px)`;''')
    return s


rw('src/components/site/SiteScripts.tsx', scripts)


def reduced(s):
    return s.replace('@media (prefers-reduced-motion:reduce){', '@media (prefers-reduced-motion:reduce){\n  html{scroll-behavior:auto}')


rw('src/styles/site.css', reduced)


# ---------- Stars needs role="img" for its aria-label to be honoured ----------
rw('src/components/site/ui.tsx', lambda s: s.replace(
    '<span className="stars" aria-label="5 star rating">',
    '<span className="stars" role="img" aria-label="5 star rating">'))

print('done')
