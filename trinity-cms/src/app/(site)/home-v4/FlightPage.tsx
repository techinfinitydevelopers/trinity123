"use client";
/* Home V4 — the supplied "world flight" page, running inside the site.

   The markup below is the source page's, unchanged, minus its own <nav> and <footer>: the
   site's header and footer come from the (site) layout instead. It is injected once and then
   left alone, because flight.js owns this DOM — it writes innerHTML into the university
   track, toggles classes on it and lets GSAP write transforms across almost every node.
   Re-rendering any of it from React would fight the script. The string is a literal in this
   file, not user input.

   flight.js is loaded after mount, from an effect, because it queries the DOM at import time.
   It is imported once per page load even in development, where React runs effects twice. */
import { useEffect, useRef } from "react";

const MARKUP = `<div id="loading">Boarding…</div>
<div id="sky"></div>
<canvas id="c"></canvas>
<section id="flight">
  <div class="stage">
    <div id="pins"></div>
    <div id="cname"></div>
    <div id="panel">
      <span class="tag">Study abroad · IELTS · Visa</span>
      <h1>Where will you<br>study next?</h1>
      <p class="s">Type or pick a country. We'll fly you there.</p>
      <input id="q" placeholder="Search country or city…" autocomplete="off">
      <div id="chips"></div>
      <div id="pickedBox"><div id="pickedName"></div><div id="go"></div><button id="change" type="button">Change country</button></div>
    </div>
    <div class="cap" id="c1"><span class="tag">Boarding</span><h1></h1><p></p></div>
    <div class="cap r dark" id="c2"><span class="tag">Window seat</span><h2></h2><p>Shortlisting, applications, SOPs, scholarships and visa — handled by people who've done it hundreds of times.</p></div>
    <div class="cabin" id="cabin">
      <div class="seat l"></div><div class="seat r"></div>
      <div class="winwrap" id="winwrap"><div class="win"><div class="view"><i class="v1"></i><i class="v2"></i></div><div class="shade" id="shade"></div><div class="glass"></div></div></div>
      <div class="cap dark" id="c3" style="z-index:7"><span class="tag">Seat 1A</span><h2>Lift the shade.</h2><p>Your future starts outside this window.</p></div>
      <div class="cap dark r" id="c4" style="z-index:7"><span class="tag">Descending</span><h2></h2><p></p></div>
    </div>
    <div class="meter" style="z-index:9"><em id="route"></em><small>ALTITUDE (FT)</small><span id="alt">0</span></div>
    <div class="hint" id="hint">Pick a country to take off<b></b></div>
    <div class="arrive" id="arrive">
      <div class="bg"></div>
      <div class="inner">
        <span class="tag"></span>
        <h2></h2>
        <p></p>
        <div class="row"><a class="btn" id="explore" href="#unis">Explore</a><a class="btn ghost" href="#ielts">IELTS coaching</a></div>
      </div>
    </div>
    <div class="flash" id="flash"></div>
  </div>
</section>

<section id="unis" class="page">
  <div class="hs" id="hs">
    <div class="track" id="track">
      <div class="ucard intro"><div class="eyebrow" id="uni-eyebrow">Destination</div><h2 class="h2">Pick your campus.</h2><p class="lead" id="uni-lead"></p></div>
      <div class="ucard intro outro" style="flex-basis:clamp(260px,30vw,420px)"><h2 class="h2" style="font-size:2.4rem" id="out-t">Not on the list?</h2><p class="lead" id="out-p"></p><p style="margin-top:22px"><a class="btn" href="#cta">Get my shortlist</a></p></div>
    </div>
  </div>
  <div class="bar"><i id="uprog"></i></div>
  <div style="height:70px"></div>
  <p style="text-align:center;color:#6f82a8;font-size:.75rem;padding-bottom:26px">Entry requirements vary by course and year — confirm on each university's official page.</p>
</section>

<section id="ielts" class="page">
  <div class="ie">
    <div class="wrap grid">
      <div>
        <div class="eyebrow">Test prep · IELTS</div>
        <div class="band" id="band">5.0</div>
        <h2 class="h2" style="margin-top:16px">Watch your band climb.</h2>
        <p class="lead">Mock tests every week, examiner-style feedback, and a study plan that adapts to your weakest module.</p>
        <div class="steps4"><span>Diagnostic test</span><span>Weekly mocks</span><span>1-on-1 speaking</span><span>Writing correction</span></div>
        <div id="ie-also">Tests</div>
      </div>
      <div class="mods" id="mods">
        <div class="mod"><div><span>Listening</span><span class="v">0</span></div><div class="t"><i></i></div></div>
        <div class="mod"><div><span>Reading</span><span class="v">0</span></div><div class="t"><i></i></div></div>
        <div class="mod"><div><span>Writing</span><span class="v">0</span></div><div class="t"><i></i></div></div>
        <div class="mod"><div><span>Speaking</span><span class="v">0</span></div><div class="t"><i></i></div></div>
      </div>
    </div>
  </div>
</section>

<section id="process" class="page">
  <div class="wrap">
    <div class="eyebrow">How it works</div>
    <h2 class="h2">From first call to<br>boarding pass.</h2>
    <div class="tl" id="tl">
      <svg viewBox="0 0 6 100" preserveAspectRatio="none"><path class="bgp" d="M3 0V100"/><path id="line" d="M3 0V100"/></svg>
      <div class="st"><b>01</b><h3>Free profile evaluation</h3><p>We map your marks, test scores, budget and goals to the right courses in <span class="cdest">your destination</span>.</p></div>
      <div class="st"><b>02</b><h3>Test prep + shortlist</h3><p>Coaching runs in parallel with a shortlist of 6–8 universities across safe, match and reach.</p></div>
      <div class="st"><b>03</b><h3>Applications & SOP</h3><p>Applications, statement of purpose and references — reviewed until they're ready.</p></div>
      <div class="st"><b>04</b><h3>Offer & visa</h3><p>Acceptance, financial documents, interview prep and the student visa file.</p></div>
      <div class="st"><b>05</b><h3>Pre-departure</h3><p>Accommodation, forex, flights and a send-off briefing. Then you board.</p></div>
    </div>
  </div>
</section>

<section id="stats" class="page">
  <div class="wrap">
    <div class="eyebrow" style="color:var(--gold)">Track record</div>
    <h2 class="h2">Numbers that landed.</h2>
    <div class="sg">
      <div><b data-n="42" data-s="+">0</b><span>Years of experience</span></div>
      <div><b data-n="39" data-s="+">0</b><span>Countries</span></div>
      <div><b data-n="1200" data-s="+">0</b><span>Universities</span></div>
      <div><b data-n="100000" data-s="+">0</b><span>Courses</span></div>
    </div>
  </div>
</section>

<section id="voices" class="page">
  <div class="wrap"><div class="eyebrow">Student stories</div><h2 class="h2">They flew. You're next.</h2></div>
  <div class="mq" id="mq"><div class="tc"><p>&ldquo;They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals.&rdquo;</p><footer><i>R</i><div>Rohan Nair<small>Master&rsquo;s in IT &middot; Arizona State University</small></div></footer></div><div class="tc"><p>&ldquo;Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview.&rdquo;</p><footer><i>S</i><div>Sharanya Santosh<small>Master&rsquo;s &middot; Maynooth University, Ireland</small></div></footer></div><div class="tc"><p>&ldquo;They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals.&rdquo;</p><footer><i>R</i><div>Rohan Nair<small>Master&rsquo;s in IT &middot; Arizona State University</small></div></footer></div><div class="tc"><p>&ldquo;Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview.&rdquo;</p><footer><i>S</i><div>Sharanya Santosh<small>Master&rsquo;s &middot; Maynooth University, Ireland</small></div></footer></div><div class="tc"><p>&ldquo;They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals.&rdquo;</p><footer><i>R</i><div>Rohan Nair<small>Master&rsquo;s in IT &middot; Arizona State University</small></div></footer></div><div class="tc"><p>&ldquo;Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview.&rdquo;</p><footer><i>S</i><div>Sharanya Santosh<small>Master&rsquo;s &middot; Maynooth University, Ireland</small></div></footer></div><div class="tc"><p>&ldquo;They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals.&rdquo;</p><footer><i>R</i><div>Rohan Nair<small>Master&rsquo;s in IT &middot; Arizona State University</small></div></footer></div><div class="tc"><p>&ldquo;Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview.&rdquo;</p><footer><i>S</i><div>Sharanya Santosh<small>Master&rsquo;s &middot; Maynooth University, Ireland</small></div></footer></div>
  </div>
  </section>

<section id="cta" class="page">
  <div class="wrap">
    <div class="cbox">
      <div><div class="eyebrow" style="color:var(--gold)">Ready for take-off?</div><h2 class="h2">Book your free counselling session.</h2><p class="lead" style="color:#a9b8d4">30 minutes. Profile review, university shortlist and a clear plan for the next intake.</p></div>
      <form>
        <input placeholder="Full name" required><input type="tel" placeholder="Phone / WhatsApp" required><input type="email" placeholder="Email">
        <select><option>Preferred intake</option><option>September 2027</option><option>January 2028</option></select>
        <button class="btn" type="submit" style="justify-content:center;padding:16px">Request a call back →</button>
      </form>
    </div>
  </div>
</section>
<section class="page" id="v4credits"><div class="wrap">
  <p class="credit">Aircraft: &ldquo;A350&rdquo; by amvlab/aircraft-models, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Earth textures: three.js examples (MIT).</p>
  <p class="credits">City photographs via Wikimedia Commons &mdash; London, Ilya Grigorik (CC BY-SA 3.0) &middot; Dublin, &#30143;&#20029;&#27743;&#30340;&#27827;&#27700; (CC BY-SA 4.0) &middot; Paris, Yann Caradec (CC BY-SA 2.0) &middot; Berlin, Museumsinsel Berlin Juli 2021 (CC BY-SA 4.0) &middot; Prague, Moyan Brenn (CC BY 2.0) &middot; New York City, Dllu (CC BY-SA 4.0) &middot; Toronto, Dillan Payne (CC BY-SA 4.0) &middot; Tokyo, Morio (CC BY-SA 3.0) &middot; Marina Bay Sands, Supanut Ar (CC BY 4.0) &middot; Kuala Lumpur, Renek78 (CC0) &middot; Sydney, Benh LIEU SONG (CC BY-SA 4.0) &middot; Auckland, elpinto007 (CC BY-SA 2.0). Dubai and Seoul: source and licence still to be confirmed.</p>
</div></section>`;

export default function FlightPage() {
  const host = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    /* The module runs its whole sequence at import time and expects the markup to be in the
       document already, which it is by the time an effect fires.
       The rejection is logged unconditionally: gating it on a "cancelled" flag set by the
       cleanup hides every failure, because React runs effects twice in development and the
       first pass is always torn down. */
    import("./flight.js").catch((e) => console.error("[home-v4] flight.js failed", e));
    /* The module publishes a teardown. Without it Lenis survives the route change — and it
       is created *stopped*, so it goes on calling preventDefault() on every wheel and touch
       event, leaving the rest of the site unscrollable until a full reload. */
    return () => {
      const w = window as unknown as { __v4teardown?: () => void };
      try { w.__v4teardown?.(); } catch (e) { console.error("[home-v4] teardown", e); }
      started.current = false;
    };
  }, []);

  /* The site header is fixed and sits over the top of the screen. The source page had the
     viewport to itself, so everything full-screen — the sky, the WebGL canvas, the pinned
     stage — started at 0 and the header cut the globe in half. Its real height is published
     as --v4-top and kept current, because the header is shorter on a phone and taller once
     it goes solid. The stylesheet carries 133px as the pre-hydration fallback. */
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header, .cv-nav, .nav");
    const el = host.current;
    if (!header || !el) return;
    const publish = () => {
      const h = Math.round(header.getBoundingClientRect().height);
      if (h > 0) el.style.setProperty("--v4-top", `${h}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(header);
    addEventListener("resize", publish);
    return () => { ro.disconnect(); removeEventListener("resize", publish); };
  }, []);

  /* The source page's form only rewrote its own button text on submit. Left as it was it
     would tell a real visitor "we'll call you" while sending nothing, so it is held here
     until it is pointed at the site's own /api/leads. */
  const onSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    const b = (e.target as HTMLElement).querySelector?.("button");
    if (b) b.textContent = "Not connected yet — please use Contact";
  };

  return (
    <div
      className="v4"
      ref={host}
      onSubmit={onSubmit}
      dangerouslySetInnerHTML={{ __html: MARKUP }}
    />
  );
}
