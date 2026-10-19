import Link from "next/link";
import type { HeroBlock, PageHeroBlock } from "@/lib/blocks";
import { getLabels } from "@/lib/labels";
import type { ContactSettings } from "@/lib/settings";
import { A, Words, Stars, resolveHref } from "../ui";
import LeadForm from "../LeadForm";

export async function Hero({ b, contact }: { b: HeroBlock; contact: ContactSettings }) {
  const all = await getLabels();
  const L = all.common;
  /* Blocks are stored as JSON, so a page saved before the 2026-09 hero redesign still has the old
     orbit fields and none of these. Render the copy column rather than throwing on the home page. */
  const hive = Array.isArray(b.hive) ? b.hive : [];
  return (
    <section className="hero">
      <div className="hero__bg" /><div className="hero__grid" />
      <div className="hero__glows" data-hero-parallax><span className="glow glow--a" /><span className="glow glow--b" /></div>
      <div className="container hero__inner">
        {/* The headline spans the container rather than sitting in the left column: the client
            wants the tagline on one line, and half the grid cannot hold it at hero size. */}
        <h1 className="h1 hero__title"><Words words={b.words} start={0.25} /></h1>
        {/* The dashed flight path from the client's design, arcing out of the headline towards
            the enquiry card. Decorative, and it draws itself once on load. */}
        {/* The plane lives inside the SVG so it can travel the same curve as the dashes: the
            CSS gives it that path as a motion path, in the viewBox's own units, so it stays on
            the line at every width. It is drawn nose-down, hence the -90deg correction. */}
        <span className="hero__path" aria-hidden="true">
          {/* The trail carries on past the enquiry card and ends underneath it, so it reads as
              a flight leaving the frame rather than stopping dead at the card's edge. The card
              sits above it (`.hero__form` is z-index 3, the trail 2). */}
          <svg viewBox="0 0 470 120" focusable="false" overflow="visible">
            <path id="trinity-flightpath" d="M4 112C70 112 128 92 176 56 206 33 236 16 272 10 326 1 396 -4 464 -10" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeDasharray="7 9" opacity=".55" />
            {/* `animateMotion` follows the very same `<path>`, in the SVG's own user units, so
                the plane cannot drift off the line however the box is scaled. CSS `offset-path`
                was doing exactly that: it resolves in CSS pixels against the element's box, and
                the plane ended up 200px below its own trail. `rotate="auto"` turns the nose
                along the curve; the artwork is drawn nose-down, hence the -90 on the image. */}
            <g className="hero__plane">
              <animateMotion dur="11s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                <mpath href="#trinity-flightpath" />
              </animateMotion>
              <image href="/assets/img/home/plane.webp" x="-24" y="-25" width="48" height="50" transform="rotate(-90)" />
            </g>
          </svg>
        </span>
        <div className="hero__cols">
        <div className="hero__copy">
          <p className="hero__text w__in" style={{ animationDelay: ".85s" }}>{b.text}</p>
          {/* The plain stat row is gone: the honeycomb carries the same claims, and the two
              disagreed on screen ("100k+ Courses" here against "1 lakh+ Courses" there).
              `stats` stays on the block so it can be brought back from the editor. */}
        {b.photo || hive.length ? (
        <div className="hero-visual w__in" style={{ animationDelay: ".3s" }}>
          {/* The frame wraps photo and chip together: above 1200px the honeycomb sits beside
              them as a flex sibling, and the chip has to stay pinned to the photo's corner
              rather than to the whole row's right edge. */}
          <div className="hero-visual__frame">
            {b.photo ? (
              <div className="hero-visual__img hero-visual__img--cutout">
                {/* The sky behind her, with the landmarks drawn into it — the same idea as the
                    client's artwork, as vectors so it stays crisp and weighs nothing. */}
                <svg className="hero__sky" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
                  <defs>
                    {/* The blue field has a soft edge at the bottom so she stands out of it
                        rather than being pasted onto a disc. */}
                    <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                      <stop offset="74%" stopColor="#fff" stopOpacity="1" />
                      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <mask id="skyMask"><rect width="400" height="400" fill="url(#skyFade)" /></mask>
                  </defs>
                  <g mask="url(#skyMask)">
                    <ellipse cx="200" cy="196" rx="192" ry="182" fill="#DCEEF9" />
                    <g fill="#A3CCE8">
                      {/* Big Ben, left */}
                      <path d="M46 348V206h26v142zM45 206l14-26 14 26zM50 214h18v22H50z" />
                      <circle cx="59" cy="225" r="7" fill="#DCEEF9" />
                      {/* The Eiffel Tower, right */}
                      <path d="M316 348l20-120 20 120h-9l-11-70-11 70z" />
                      <path d="M322 300h28v6h-28zM328 272h16v6h-16zM333 248h6v16h-6z" />
                      {/* a low skyline between them */}
                      <path d="M96 348v-44h16v44zM120 348v-62h14v62zM142 348v-30h12v30zM262 348v-52h15v52zM284 348v-34h13v34z" />
                    </g>
                  </g>
                </svg>
                <img src={b.photo} alt={L.heroPhotoAlt} />
              </div>
            ) : null}
            <div className="chip chip--glass chip--hv-b">
              <span className="avatars"><img src={L.avatarImage1} alt="" /><img src={L.avatarImage2} alt="" /></span>
              <span><Stars label={L.ratingLabel} /><small>{b.chipCText}</small></span>
            </div>
          </div>
          <div className="hive">
            {hive.map((h, i) => (
              /* Two faces: the photograph on the front, the figure on the back. It turns on
                 hover, and on its own in sequence — `--i` is this cell's place in that queue.
                 The figure is also in the front face's `aria-label`, so a screen reader and a
                 visitor who never hovers both still get the claim. */
              <div key={i} className={`hive__item hive__item--${i + 1}`} style={{ ["--i" as string]: i }}>
                <div className="hive__flip">
                  <div
                    className={h.img ? "hive__face hive__face--front has-photo" : "hive__face hive__face--front"}
                    style={h.img ? ({ ["--photo" as string]: `url(${h.img})` }) : undefined}
                    role="img"
                    aria-label={`${h.value} ${h.label}`}
                  />
                  <div className="hive__face hive__face--back" aria-hidden="true">
                    {h.icon ? <i className={`${h.icon} hive__ico`} /> : null}
                    <strong>{h.value}</strong><span>{h.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        ) : null}
          {/* The client's design has no button row under the honeycomb — the form's own "Apply
              Now" is the hero's call to action. `primary` and `ghost` stay on the block, so
              filling either one in the editor brings the row back. */}
          {b.primary?.label || b.ghost?.label ? (
            <div className="btn-row w__in" style={{ animationDelay: "1s" }}>
              {b.primary?.label ? <A href={b.primary.href} contact={contact} className="btn btn--primary">{b.primary.label} <i className="fas fa-arrow-right" /></A> : null}
              {b.ghost?.label ? <A href={b.ghost.href} contact={contact} className="btn btn--ghost"><i className="fab fa-whatsapp gold" /> {b.ghost.label}</A> : null}
            </div>
          ) : null}
        </div>
        {b.form ? (
          <div className="hero__form w__in" style={{ animationDelay: "1.15s" }}>
            <LeadForm
              title={b.form.title}
              cities={b.form.cities}
              destinations={b.form.destinations}
              okMsg={b.form.okMsg}
              submitLabel={b.form.submitLabel}
              trust={b.form.trust ?? []}
              labels={all.forms}
            />
          </div>
        ) : null}
        </div>
      </div>
      <p className="hero__scroll" aria-hidden="true">{L.scrollLabel}<span /></p>
    </section>
  );
}

export async function PageHero({ b, contact }: { b: PageHeroBlock; contact: ContactSettings }) {
  const L = (await getLabels()).common;
  const a = b.aside;
  return (
    <section className={b.short ? "page-hero page-hero--short" : "page-hero"}>
      <div className="page-hero__bg" />
      <div className="page-hero__grid" />
      {/* `--ghost-len` lets the CSS size the watermark from how long the word is, so "EVENTS"
          and "WHY STUDY ABROAD" both span the hero instead of one being tiny and the other
          running off the edge. */}
      <p className="page-hero__ghost" data-plx="0.12" aria-hidden="true" style={{ ["--ghost-len" as string]: Math.max(b.ghost.length, 1) }}>{b.ghost}</p>
      <div className="container page-hero__inner">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">{L.home}</Link><i className="fas fa-chevron-right" /><span>{b.crumb}</span></nav>
          <h1 className="h1"><Words words={b.words} /></h1>
          <p className="page-hero__sub">{b.sub}</p>
        </div>

        {a.kind === "statchips" && (
          <div className="statchips w__in" style={{ animationDelay: ".6s" }}>
            {a.items.map((s, i) => (
              <div key={i} className={`statchip statchip--${s.style}${s.icon ? " statchip--wide" : ""}`}>
                {s.icon ? (
                  /* The suffix used to be dropped on this branch, so a chip with an icon could
                     never say "1200+" however it was filled in — it printed a flat "1200" while
                     the rest of the page said "1200+". */
                  <><span><strong>{s.strong}{s.suffix ? <em>{s.suffix}</em> : null}</strong><small>{s.small}</small></span><i className={s.icon} /></>
                ) : (
                  <><strong>{s.strong}{s.suffix ? <em className={s.style === "gold" ? "purple" : undefined}>{s.suffix}</em> : null}</strong><small>{s.small}</small></>
                )}
              </div>
            ))}
          </div>
        )}

        {a.kind === "visual" && (
          <div className="hero-visual w__in" style={{ animationDelay: ".6s" }}>
            <div className="hero-visual__img"><img src={a.img} alt={L.asideImageAlt} /></div>
            <div className="chip chip--gold chip--hv-a"><span><strong className="big">{a.chipA.big}</strong><small>{a.chipA.small}</small></span></div>
            <div className="chip chip--hv-b"><span className="chip__ico"><i className={a.chipB.icon} /></span><span><strong>{a.chipB.strong}</strong><small>{a.chipB.small}</small></span></div>
          </div>
        )}

        {a.kind === "svcchips" && (
          <div className="svc-chips w__in" style={{ animationDelay: ".6s" }}>
            {a.items.map((s, i) => (
              <div key={i} className="svc-chip" style={{ ["--x" as string]: `${-18 * i}px` }}>
                <span className="svc-chip__ico"><i className={s.icon} /></span><strong>{s.label}</strong><i className="fas fa-check-circle gold" />
              </div>
            ))}
          </div>
        )}

        {a.kind === "quick" && (
          <div className="quick w__in" style={{ animationDelay: ".6s" }}>
            <a className="quick__item quick__item--wa" href={resolveHref("whatsapp", contact)} target="_blank" rel="noopener">
              <span className="quick__ico"><i className="fab fa-whatsapp" /></span><span><small>{L.quickWhatsappSmall}</small><strong>{L.quickWhatsappStrong}</strong></span><i className="fas fa-arrow-right" />
            </a>
            <a className="quick__item" href={resolveHref("phone", contact)}>
              <span className="quick__ico quick__ico--gold"><i className="fas fa-phone-alt" /></span><span><small>{L.quickCallSmall}</small><strong>{contact.phones[0]}</strong></span>
            </a>
            <a className="quick__item" href={`mailto:${contact.email}`}>
              <span className="quick__ico quick__ico--purple"><i className="fas fa-envelope" /></span><span><small>{L.quickEmailSmall}</small><strong className="sm">{contact.email}</strong></span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
