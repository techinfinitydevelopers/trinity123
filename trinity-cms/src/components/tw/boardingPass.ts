/* Turns the drop-in's closing CTA into a boarding pass that tears when it is submitted.

   Done to the live DOM rather than to `markup.ts`, for the reason the page chrome is also
   kept out of it: the generator rewrites that file wholesale on every drop-in update. The
   engine's own `#leadForm` element is moved into the pass, never rebuilt, so the submit
   handler it bound at mount keeps working and the lead still reaches /api/leads.

   The tear fires on success, which the engine reports only by rewriting its button's label
   — so that label is what this watches. A failed send leaves the pass whole, which is the
   honest outcome: nothing was torn because nothing was accepted. */

/* The engine writes one of these three into the button. Matching on "Thanks" alone would
   also match a future "Thanks, but…", so the failure wording is checked first. */
const SENT = /thanks/i;
const FAILED = /fail/i;

const el = (tag: string, cls?: string, html?: string) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

/* One ticket per destination. The code and city are the real airport the drop-in already
   flies to — `data.ts` gives each country the same city — so the pass reads like a ticket
   somebody could hold rather than a placeholder. Flight number, terminal and gate are
   invented but fixed per country: a ticket that reshuffles on every visit looks like a toy.

   Keyed on the short name the engine prints into `#route`, uppercased, because that is the
   only handle this file has on the engine's state. A country the dashboard adds later is
   not in here and falls back to the first three letters of its name, which is wrong often
   enough to be worth adding a row for when it happens. */
const TICKETS: Record<string, { code: string; city: string; flight: string; gate: string }> = {
  "UK":          { code: "LHR", city: "London",        flight: "TR 101", gate: "B12" },
  "IRELAND":     { code: "DUB", city: "Dublin",        flight: "TR 114", gate: "A04" },
  "FRANCE":      { code: "CDG", city: "Paris",         flight: "TR 127", gate: "2E" },
  "GERMANY":     { code: "BER", city: "Berlin",        flight: "TR 133", gate: "C07" },
  "NEW ZEALAND": { code: "AKL", city: "Auckland",      flight: "TR 648", gate: "D21" },
  "UAE":         { code: "DXB", city: "Dubai",         flight: "TR 209", gate: "A18" },
  "SINGAPORE":   { code: "SIN", city: "Singapore",     flight: "TR 318", gate: "E05" },
  "AUSTRALIA":   { code: "SYD", city: "Sydney",        flight: "TR 571", gate: "T1-9" },
  "JAPAN":       { code: "HND", city: "Tokyo",         flight: "TR 442", gate: "C14" },
  "KOREA":       { code: "ICN", city: "Seoul",         flight: "TR 455", gate: "B22" },
  "USA":         { code: "JFK", city: "New York",      flight: "TR 880", gate: "T4-6" },
  "CANADA":      { code: "YYZ", city: "Toronto",       flight: "TR 812", gate: "E73" },
  "MALAYSIA":    { code: "KUL", city: "Kuala Lumpur",  flight: "TR 326", gate: "C09" },
  "EUROPE":      { code: "PRG", city: "Prague",        flight: "TR 140", gate: "B03" },
  "SWEDEN":      { code: "ARN", city: "Stockholm",     flight: "TR 158", gate: "F31" },
  "ITALY":       { code: "FCO", city: "Rome",          flight: "TR 166", gate: "G08" },
  "DENMARK":     { code: "CPH", city: "Copenhagen",    flight: "TR 172", gate: "A26" },
};

/* The fallback keeps the same shape: three letters, and a flight number that is stable for
   a given name instead of random. */
const ticketFor = (to: string) => {
  const known = TICKETS[to.toUpperCase()];
  if (known) return known;
  let h = 0;
  for (const c of to) h = (h * 31 + c.charCodeAt(0)) % 9000;
  return { code: to.slice(0, 3).toUpperCase(), city: to, flight: "TR " + (100 + (h % 900)), gate: "A" + (1 + (h % 30)) };
};

export function mountBoardingPass(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  let done = false;

  const build = () => {
    const box = root.querySelector<HTMLElement>("#cta .cbox");
    const form = root.querySelector<HTMLFormElement>("#leadForm");
    if (!box || !form) return false;

    /* Leaving the home page and coming back does not always rebuild the engine — it parks
       the instance and remounts the same DOM. The pass is then already assembled and only
       its listeners, dropped by the last cleanup, need binding again. */
    const existing = box.querySelector<HTMLElement>(".bp");
    if (existing) return bind(existing, form);

    /* The heading block is the drop-in's first child of .cbox. It is moved, not copied:
       TrinityWorldHost writes the dashboard's own wording into `#cta .h2` and `#cta .lead`
       after mount, and a copy would leave it editing a detached node. */
    const intro = box.firstElementChild as HTMLElement | null;
    if (!intro || intro === form) return false;

    const pass = el("div", "bp");
    const main = el("div", "bp__main");
    const stub = el("aside", "bp__stub");

    main.append(
      el("header", "bp__head", '<span class="bp__air">Trinity <em>Study Abroad</em></span><span class="bp__kind">Boarding pass</span>'),
      el("div", "bp__route",
        '<div class="bp__place from"><b>BOM</b><small>Mumbai</small></div>' +
        '<div class="bp__dash"><span>&#9992;</span></div>' +
        '<div class="bp__place to"><b data-bp="code">———</b><small data-bp="city">Your destination</small></div>'),
    );
    intro.classList.add("bp__intro");
    main.append(intro, form);
    main.append(el("div", "bp__kept", "Boarded"));

    stub.append(
      el("span", "bp__notch t"),
      el("span", "bp__notch b"),
      el("header", "bp__head", '<span class="bp__air">Stub</span><span class="bp__kind">Keep</span>'),
      el("div", "bp__rows",
        '<div class="bp__row"><span>Passenger</span><b data-bp="name">—</b></div>' +
        '<div class="bp__row"><span>Flight</span><b data-bp="flight">TR ———</b></div>' +
        '<div class="bp__row"><span>Intake</span><b data-bp="intake">—</b></div>' +
        '<div class="bp__row"><span>Gate</span><b data-bp="gate">—</b></div>'),
      el("div", "bp__bars", "<i></i>".repeat(28)),
      el("div", "bp__seq", "SEQ 001"),
    );

    pass.append(main, stub);
    box.append(pass);
    box.classList.add("is-pass");

    return bind(pass, form);
  };

  /* Everything that has to be re-done each time this module is mounted over the same DOM. */
  const bind = (pass: HTMLElement, form: HTMLFormElement) => {
    const at = (k: string) => pass.querySelector<HTMLElement>(`[data-bp="${k}"]`);

    /* The ticket fills in as the visitor types. Three letters because that is what an
       airport code is; the country's short name is what the engine already shows. */
    const sync = () => {
      const name = (form.elements.namedItem("name") as HTMLInputElement | null)?.value.trim();
      const intake = (form.elements.namedItem("intake") as HTMLSelectElement | null)?.value.trim();
      const nameAt = at("name"), intakeAt = at("intake");
      if (nameAt) nameAt.textContent = name ? name.toUpperCase() : "—";
      if (intakeAt) intakeAt.textContent = intake || "—";
    };
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    cleanups.push(() => { form.removeEventListener("input", sync); form.removeEventListener("change", sync); });

    /* Destination comes from the flight meter the engine keeps current — "MUMBAI → UK" —
       rather than from its internal state, which this file has no handle on. */
    const route = root.querySelector<HTMLElement>("#route");
    const readRoute = () => {
      const to = route?.textContent?.split("→")[1]?.trim();
      if (!to) return;
      const t = ticketFor(to);
      const code = at("code"), city = at("city"), fl = at("flight"), gate = at("gate");
      if (code) code.textContent = t.code;
      /* Both, because either alone misleads: the code is an airport, so "LHR / United
         Kingdom" reads wrong, and "London" alone loses the country they actually picked. */
      if (city) city.textContent = t.city === to ? to : `${t.city}, ${to}`;
      if (fl) fl.textContent = t.flight;
      if (gate) gate.textContent = t.gate;
    };
    readRoute();
    if (route) {
      const ro = new MutationObserver(readRoute);
      ro.observe(route, { childList: true, characterData: true, subtree: true });
      cleanups.push(() => ro.disconnect());
    }

    /* Success is only visible in the button's label, so that is what is watched. */
    const btn = form.querySelector("button");
    if (btn) {
      const bo = new MutationObserver(() => {
        const t = btn.textContent || "";
        if (done || FAILED.test(t) || !SENT.test(t)) return;
        done = true;
        pass.classList.add("is-torn");
        bo.disconnect();
      });
      bo.observe(btn, { childList: true, characterData: true, subtree: true });
      cleanups.push(() => bo.disconnect());
    }

    return true;
  };

  /* The engine sets the whole page with one innerHTML write, so the observer fires once. */
  if (!build()) {
    const mo = new MutationObserver(() => { if (build()) mo.disconnect(); });
    mo.observe(root, { childList: true, subtree: true });
    cleanups.push(() => mo.disconnect());
  }

  return () => cleanups.forEach((f) => { try { f(); } catch { /* unmounting anyway */ } });
}
