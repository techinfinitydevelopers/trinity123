/* Study-destination page — a faithful port of the canvas "Country" screen (inline styles preserved). */
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Country } from "@/generated/prisma";
import type { ContactSettings } from "@/lib/settings";
import { FLAG } from "./ui";

type Pair = { label: string; value: string };
type QA = { q: string; a: string };
type Named = { name: string; text: string };
type Step = { title: string; text: string };
type Stat = { v: string; l: string };
type Uni = { name: string; img: string };
export type DestinationLite = { code: string; slug: string; name: string; tag: string };

const P = "Poppins,sans-serif";
const d = (i: number, m = 4) => `${((i % m) * 0.08).toFixed(2)}s`;
const kicker = (text: string, gold?: boolean): CSSProperties & { children?: never } => ({ color: gold ? "var(--gold)" : "var(--primary)", fontFamily: P, fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 } as CSSProperties);
const Kicker = ({ text, gold }: { text: string; gold?: boolean }) => <div data-reveal style={kicker(text, gold)}><span style={{ width: 28, height: 2, background: "var(--gold)" }} />{text}</div>;
const h2: CSSProperties = { fontSize: "clamp(1.9rem,3.2vw,2.8rem)", fontWeight: 700, letterSpacing: -1, textWrap: "balance" as never };
const btnGold: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, background: "var(--gold)", color: "var(--navy)", fontFamily: P, fontWeight: 600, fontSize: 15, padding: "16px 30px", borderRadius: 50, transition: "all .3s" };
const btnGhost: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, border: "1.5px solid rgba(255,255,255,.3)", color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 15, padding: "16px 30px", borderRadius: 50, transition: "all .3s" };
const num = (bg = "var(--primary)", size = 38, r = 12): CSSProperties => ({ position: "relative", fontFamily: P, fontWeight: 700, fontSize: 13, color: "#fff", background: bg, width: size, height: size, borderRadius: r, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 });
const jfill: CSSProperties = { position: "absolute", inset: 0, background: "var(--grey)", opacity: 0, transition: "opacity .45s" };

const JUMP: [string, (n: string) => string][] = [["c-why", (n) => `Why ${n}`], ["c-cost", () => "Costs"], ["c-admission", () => "Requirements"], ["c-funding", () => "Scholarships"], ["c-visa", () => "Visa process"], ["c-work", () => "Work & PR"], ["c-faq", () => "FAQs"]];

export default function CountryPage({ c, others, contact }: { c: Country; others: DestinationLite[]; contact: ContactSettings }) {
  const stats = c.stats as Stat[], why = c.why as string[], courses = c.courses as string[], unis = c.unis as Uni[];
  const cost = c.cost as Pair[], req = c.req as Pair[], sch = c.sch as Named[], steps = c.steps as Step[], workPoints = c.workPoints as string[], faq = c.faq as QA[];
  const wa = `https://wa.me/${contact.whatsapp}`;
  const flag = FLAG(c.code);

  return (
    <div>
      {/* hero */}
      <section className="cv-hero cv-section" style={{ position: "relative", minHeight: 560, display: "flex", alignItems: "flex-end", padding: "190px 24px 70px", overflow: "hidden", background: "var(--navy)" }}>
        <img data-plx="0.16" src={c.img} alt={c.name} style={{ position: "absolute", inset: "-10% 0", width: "100%", height: "120%", objectFit: "cover", opacity: 0.5, willChange: "transform" }} />
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(22,20,57,.85) 0%,rgba(22,20,57,.55) 45%,rgba(22,20,57,.96) 100%)" }} />
        <span data-plx="0.1" aria-hidden="true" style={{ position: "absolute", right: "-1%", bottom: -24, fontFamily: P, fontWeight: 800, fontSize: "clamp(5rem,15vw,14rem)", lineHeight: 0.8, letterSpacing: -8, color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,.1)", pointerEvents: "none", userSelect: "none", willChange: "transform", textTransform: "uppercase" }}>{c.name}</span>
        <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div data-word style={{ animationDelay: ".05s", color: "rgba(255,255,255,.65)", fontFamily: P, fontWeight: 500, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.65)" }}>Home</Link> <i className="fas fa-chevron-right" style={{ fontSize: 9, color: "var(--gold)", margin: "0 8px" }} /> <Link href="/why-study-abroad" style={{ color: "rgba(255,255,255,.65)" }}>Destinations</Link> <i className="fas fa-chevron-right" style={{ fontSize: 9, color: "var(--gold)", margin: "0 8px" }} /> <span style={{ color: "var(--gold)", fontWeight: 600 }}>{c.name}</span>
          </div>
          <div data-word style={{ animationDelay: ".15s", display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.25)", padding: "8px 18px 8px 8px", borderRadius: 50, marginBottom: 24 }}>
            <img src={flag} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,.5)" }} />
            <span style={{ color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 14 }}>{c.tag}</span>
          </div>
          <h1 data-word style={{ animationDelay: ".25s", color: "#fff", fontSize: "clamp(2.4rem,5vw,4.4rem)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.03, textWrap: "balance" as never }}>{c.hero}</h1>
          <p data-word style={{ animationDelay: ".4s", color: "rgba(255,255,255,.78)", marginTop: 24, fontSize: 17, maxWidth: 680, lineHeight: 1.8 }}>{c.intro}</p>
          <div data-word style={{ animationDelay: ".5s", display: "flex", gap: 14, flexWrap: "wrap", marginTop: 34 }}>
            <Link className="cv-btny" href="/contact-us" style={btnGold}>Get free counselling <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /></Link>
            <a href={wa} target="_blank" rel="noopener" style={btnGhost}><i className="fab fa-whatsapp" style={{ color: "var(--gold)" }} /> WhatsApp us</a>
          </div>
        </div>
      </section>

      {/* stat cards */}
      <section className="cv-section" style={{ padding: "0 24px", marginTop: -54, position: "relative", zIndex: 3 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
          {stats.map((s, i) => (
            <div key={i} className="cv-jcard" data-reveal style={{ position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: "24px 26px", boxShadow: "0 18px 40px rgba(22,20,57,.08)", transition: "all .45s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i), overflow: "hidden" }}>
              <span className="cv-jfill" style={jfill} />
              <div style={{ position: "relative", fontFamily: P, fontWeight: 800, fontSize: 28, letterSpacing: -1, lineHeight: 1, color: "var(--navy)" }}>{s.v}</div>
              <div style={{ position: "relative", fontSize: 13, color: "var(--muted)", marginTop: 8, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* jump nav */}
      <nav className="cv-section" style={{ padding: "56px 24px 0", background: "#fff" }} aria-label="On this page">
        <div data-reveal style={{ maxWidth: 1320, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 18 }}>
          <span className="cv-dsk" style={{ fontFamily: P, fontWeight: 600, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginRight: 8 }}>On this page</span>
          {JUMP.map(([id, l]) => <a key={id} className="cv-jumper" href={`#${id}`} style={{ fontFamily: P, fontWeight: 500, fontSize: 13.5, color: "var(--navy)", background: "var(--grey)", padding: "9px 16px", borderRadius: 50, transition: "all .3s" }}>{l(c.name)}</a>)}
        </div>
      </nav>

      {/* why + side cards */}
      <section id="c-why" className="cv-section" style={{ padding: "76px 24px 80px", background: "#fff", scrollMarginTop: 110 }}>
        <div className="cv-postgrid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 56, alignItems: "start" }}>
          <div>
            <Kicker text="Why this destination" />
            <h2 data-reveal style={{ ...h2, marginBottom: 34 }}>Why study in <span style={{ color: "var(--primary)" }}>{c.name}</span></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {why.map((w, i) => (
                <div key={i} className="cv-jcard" data-reveal style={{ position: "relative", display: "flex", gap: 18, alignItems: "flex-start", background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: "22px 24px", transition: "all .45s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i), overflow: "hidden" }}>
                  <span className="cv-jfill" style={jfill} />
                  <span style={{ position: "absolute", left: 0, top: 22, bottom: 22, width: 3, borderRadius: "0 3px 3px 0", background: "var(--gold)" }} />
                  <span style={num()}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ position: "relative", fontSize: 16.5, lineHeight: 1.75, color: "var(--text)" }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div data-reveal style={{ background: "var(--grey)", borderRadius: 26, padding: 30 }}>
              <div style={{ fontFamily: P, fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "var(--primary)", marginBottom: 18 }}>Popular courses</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {courses.map((x, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--line)", fontFamily: P, fontWeight: 500, fontSize: 14, color: "var(--navy)", padding: "10px 18px", borderRadius: 50 }}><i className="fas fa-circle" style={{ fontSize: 5, color: "var(--gold)" }} />{x}</span>)}
              </div>
            </div>
            <div data-reveal style={{ background: "var(--navy)", color: "#fff", borderRadius: 26, padding: 30, position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "var(--primary)", filter: "blur(55px)", opacity: 0.55, right: -60, top: -60 }} />
              <div style={{ position: "relative", fontFamily: P, fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>Visa requirements</div>
              <p style={{ position: "relative", fontSize: 15.5, lineHeight: 1.8, color: "rgba(255,255,255,.8)" }}>{c.visa}</p>
            </div>
            <div data-reveal style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 26, padding: 30 }}>
              <div style={{ fontFamily: P, fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "var(--primary)", marginBottom: 14 }}>Intakes &amp; timeline</div>
              <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "var(--text)" }}>{c.intakes}</p>
            </div>
          </div>
        </div>
      </section>

      {/* cost */}
      <section id="c-cost" className="cv-section" style={{ padding: "90px 24px", background: "var(--grey)", scrollMarginTop: 110 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div data-reveal style={{ marginBottom: 40, maxWidth: 620 }}>
            <div style={kicker("Money matters")}><span style={{ width: 28, height: 2, background: "var(--gold)" }} />Money matters</div>
            <h2 style={h2}>Cost of studying in <span style={{ color: "var(--primary)" }}>{c.name}</span></h2>
            <p style={{ marginTop: 18, lineHeight: 1.8, fontSize: 16, color: "var(--text)" }}>Indicative figures for a one-year budget. Your counsellor prepares a written estimate for your exact course and city.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {cost.map((x, i) => {
              const total = i === cost.length - 1;
              return (
                <div key={i} className="cv-jcard" data-reveal style={{ position: "relative", background: total ? "var(--navy)" : "#fff", color: total ? "#fff" : "var(--navy)", border: `1px solid ${total ? "transparent" : "var(--line)"}`, borderRadius: 22, padding: 26, transition: "all .45s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i), display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
                  <span style={{ position: "absolute", left: 0, top: 26, bottom: 26, width: 3, borderRadius: "0 3px 3px 0", background: "var(--gold)" }} />
                  <span style={{ fontSize: 13, color: total ? "rgba(255,255,255,.65)" : "var(--muted)", fontWeight: 500, letterSpacing: 0.3 }}>{x.label}</span>
                  <span style={{ fontFamily: P, fontWeight: 700, fontSize: 19, lineHeight: 1.3, letterSpacing: -0.5 }}>{x.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* admission + funding */}
      <section id="c-admission" className="cv-section" style={{ padding: "90px 24px", background: "#fff", scrollMarginTop: 110 }}>
        <div className="cv-postgrid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 56, alignItems: "start" }}>
          <div>
            <Kicker text="Eligibility" />
            <h2 data-reveal style={{ ...h2, marginBottom: 30 }}>Admission requirements</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {req.map((r, i) => (
                <div key={i} data-reveal style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "var(--grey)", borderRadius: 20, padding: "22px 24px", transitionDelay: d(i) }}>
                  <span style={num("var(--primary)", 34, 11)}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={{ fontFamily: P, fontWeight: 600, fontSize: 16, color: "var(--navy)" }}>{r.label}</span><span style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text)" }}>{r.value}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div id="c-funding" style={{ scrollMarginTop: 110 }}>
            <Kicker text="Funding" />
            <h2 data-reveal style={{ ...h2, marginBottom: 30 }}>Scholarships &amp; financial aid</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sch.map((s, i) => (
                <div key={i} className="cv-jcard" data-reveal style={{ position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: 24, transition: "all .45s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i, 3), overflow: "hidden" }}>
                  <span className="cv-jfill" style={jfill} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--gold)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}><i className="fas fa-award" /></span><span style={{ fontFamily: P, fontWeight: 600, fontSize: 17, color: "var(--navy)" }}>{s.name}</span></div>
                  <p style={{ position: "relative", fontSize: 15, lineHeight: 1.75, color: "var(--text)" }}>{s.text}</p>
                </div>
              ))}
              <Link className="cv-btny" href="/contact-us" style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "var(--navy)", color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 15, padding: "18px 20px 18px 26px", borderRadius: 50, transition: "all .3s" }}>Check what you qualify for <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}><i className="fas fa-arrow-right" /></span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* visa steps */}
      <section id="c-visa" className="cv-section" style={{ padding: "90px 24px", background: "var(--navy)", position: "relative", overflow: "hidden", scrollMarginTop: 110 }}>
        <span style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "var(--primary)", filter: "blur(120px)", opacity: 0.4, right: -120, top: -120 }} />
        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
          <div data-reveal style={{ marginBottom: 44, maxWidth: 620 }}>
            <div style={kicker("Step by step", true)}><span style={{ width: 28, height: 2, background: "var(--gold)" }} />Step by step</div>
            <h2 style={{ ...h2, color: "#fff" }}>The visa process, simplified</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
            {steps.map((s, i) => (
              <div key={i} data-reveal style={{ position: "relative", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(10px)", borderRadius: 22, padding: "26px 24px", transitionDelay: d(i, 5), display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ position: "absolute", left: 24, right: 24, top: 0, height: 2, background: "linear-gradient(90deg,var(--gold),transparent)" }} />
                <span style={{ fontFamily: P, fontWeight: 800, fontSize: 15, color: "var(--gold)", letterSpacing: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 17, lineHeight: 1.3 }}>{s.title}</span>
                <span style={{ color: "rgba(255,255,255,.72)", fontSize: 14.5, lineHeight: 1.7 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* work */}
      <section id="c-work" className="cv-section" style={{ padding: "90px 24px", background: "#fff", scrollMarginTop: 110 }}>
        <div className="cv-postgrid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,.85fr)", gap: 56, alignItems: "center" }}>
          <div>
            <Kicker text="After graduation" />
            <h2 data-reveal style={h2}>Work &amp; settlement options</h2>
            <p data-reveal style={{ marginTop: 20, fontSize: 16.5, lineHeight: 1.85, color: "var(--text)" }}>{c.work}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
              {workPoints.map((w, i) => <div key={i} data-reveal style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--grey)", borderRadius: 16, padding: "16px 20px", transitionDelay: d(i) }}><i className="fas fa-check-circle" style={{ color: "var(--primary)", fontSize: 16 }} /><span style={{ fontFamily: P, fontWeight: 500, fontSize: 15.5, color: "var(--navy)" }}>{w}</span></div>)}
            </div>
          </div>
          <div data-reveal="scale" style={{ position: "relative", borderRadius: 32, overflow: "hidden", minHeight: 420, boxShadow: "0 30px 70px rgba(22,20,57,.2)" }}>
            <img src={c.img} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(22,20,57,0) 40%,rgba(22,20,57,.9) 100%)" }} />
            <span style={{ position: "absolute", left: 26, right: 26, bottom: 26, display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.14)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 20, padding: "16px 20px" }}>
              <img src={flag} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <span style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 16 }}>{c.name}</span><span style={{ color: "rgba(255,255,255,.75)", fontSize: 13 }}>{c.tag}</span></span>
            </span>
          </div>
        </div>
      </section>

      {/* universities */}
      {unis.length ? (
        <section className="cv-section" style={{ padding: "90px 24px", background: "var(--grey)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <div data-reveal style={{ marginBottom: 40 }}>
              <div style={kicker("Partner institutions")}><span style={{ width: 28, height: 2, background: "var(--gold)" }} />Partner institutions</div>
              <h2 style={h2}>Universities we place students in</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
              {unis.map((u, i) => (
                <Link key={i} className="cv-hcard" href="/contact-us" data-reveal style={{ position: "relative", height: 320, borderRadius: 28, overflow: "hidden", display: "block", transition: "all .45s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i), boxShadow: "0 20px 45px rgba(22,20,57,.12)" }}>
                  <img className="cv-zoom" src={u.img} alt={u.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .8s cubic-bezier(.4,0,.2,1)" }} />
                  <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(22,20,57,.1) 35%,rgba(22,20,57,.92) 100%)" }} />
                  <span style={{ position: "absolute", left: 24, right: 24, bottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <span style={{ color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 20, lineHeight: 1.25 }}>{u.name}</span>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}><i className="fas fa-arrow-right" /></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* faq */}
      <section id="c-faq" className="cv-section" style={{ padding: "90px 24px", background: "var(--grey)", scrollMarginTop: 110 }}>
        <div className="cv-postgrid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)", gap: 48, alignItems: "start" }}>
          <div>
            <Kicker text="Questions" />
            <h2 data-reveal style={h2}>{c.name} FAQs</h2>
            <p data-reveal style={{ marginTop: 18, fontSize: 16, lineHeight: 1.8, color: "var(--text)" }}>Still unsure about something? Our counsellors answer profile-specific questions free of charge.</p>
            <Link className="cv-btny" data-reveal href="/contact-us" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 24, background: "var(--primary)", color: "#fff", fontFamily: P, fontWeight: 600, fontSize: 15, padding: "15px 28px", borderRadius: 50, transition: "all .3s" }}>Ask a counsellor <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /></Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faq.map((f, i) => (
              <div key={i} className="cv-jcard" data-reveal style={{ position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: "24px 26px", transition: "all .45s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i), overflow: "hidden" }}>
                <span className="cv-jfill" style={jfill} />
                <div style={{ position: "relative", display: "flex", gap: 14, alignItems: "flex-start" }}><span style={{ width: 28, height: 28, borderRadius: 9, background: "var(--gold)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 2 }}><i className="fas fa-question" /></span><span style={{ fontFamily: P, fontWeight: 600, fontSize: 16.5, color: "var(--navy)", lineHeight: 1.4 }}>{f.q}</span></div>
                <p style={{ position: "relative", margin: "12px 0 0 42px", fontSize: 15, lineHeight: 1.8, color: "var(--text)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* other destinations */}
      {others.length ? (
        <section className="cv-section" style={{ padding: "90px 24px 100px", background: "#fff" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <div data-reveal style={{ marginBottom: 34 }}>
              <div style={kicker("Compare destinations")}><span style={{ width: 28, height: 2, background: "var(--gold)" }} />Compare destinations</div>
              <h2 style={h2}>Other <span style={{ color: "var(--primary)" }}>study destinations</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
              {others.map((o, i) => (
                <Link key={o.code} className="cv-ccard" href={`/destinations/${o.slug}`} data-reveal style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: "20px 18px 18px", color: "var(--navy)", transition: "all .4s cubic-bezier(.4,0,.2,1)", transitionDelay: d(i), overflow: "hidden" }}>
                  <span className="cv-cfill" style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--primary),var(--primary-2))", transform: "translateY(100%)", transition: "transform .45s cubic-bezier(.4,0,.2,1)", borderRadius: 22 }} />
                  <span style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", overflow: "hidden", boxShadow: "0 8px 20px rgba(22,20,57,.15)", border: "2px solid #fff", flexShrink: 0 }}><img src={FLAG(o.code)} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></span>
                  <span style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span className="cv-cname" style={{ fontFamily: P, fontWeight: 600, fontSize: 16, lineHeight: 1.2, transition: "color .4s" }}>{o.name}</span>
                    <span className="cv-csub" style={{ fontSize: 12, color: "var(--muted)", transition: "color .4s" }}>{o.tag}</span>
                  </span>
                  <span className="cv-carrow" style={{ position: "absolute", right: 14, top: 14, width: 30, height: 30, borderRadius: "50%", background: "var(--grey)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, transition: "all .4s" }}><i className="fas fa-arrow-right" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="cv-section" style={{ padding: "0 24px 100px", background: "#fff" }}>
        <div data-reveal="scale" style={{ maxWidth: 1320, margin: "0 auto", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,var(--navy) 0%,var(--navy-2) 55%,var(--primary) 100%)", borderRadius: 36, padding: "clamp(40px,6vw,72px)", textAlign: "center" }}>
          <span style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "var(--gold)", filter: "blur(130px)", opacity: 0.28, left: "50%", top: -140, transform: "translateX(-50%)" }} />
          <div style={{ position: "relative", maxWidth: 660, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)", color: "var(--gold)", fontFamily: P, fontWeight: 600, fontSize: 13, padding: "8px 18px", borderRadius: 50, marginBottom: 22 }}><i className="fas fa-graduation-cap" /> Free counselling</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(1.9rem,3.4vw,2.9rem)", fontWeight: 700, letterSpacing: -1, lineHeight: 1.15 }}>Ready to apply to <span style={{ color: "var(--gold)" }}>{c.name}</span>?</h2>
            <p style={{ color: "rgba(255,255,255,.78)", marginTop: 18, fontSize: 16.5, lineHeight: 1.8 }}>30 years of experience, 1100+ partner universities and end-to-end support — from shortlisting to your first week on campus.</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 32 }}>
              <Link className="cv-btny" href="/contact-us" style={btnGold}>Book free consultation <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /></Link>
              <a href={wa} target="_blank" rel="noopener" style={btnGhost}><i className="fab fa-whatsapp" style={{ color: "var(--gold)" }} /> Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
