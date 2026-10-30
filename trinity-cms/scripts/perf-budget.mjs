/* Fails the build when the site gets heavier.

   Page weight does not regress in one dramatic commit; it regresses a hundred kilobytes at a
   time, each increment individually defensible, until the Trinity World globe takes eight
   seconds to appear on a phone again. The Trinity World drop-in alone went from 37 MB to 15 MB
   (see scripts/optimise-tw-assets.mjs) — that work is only worth doing once if something
   notices when a re-drop quietly puts the 4k originals back.

   So this measures four things that actually reach a visitor's device and compares them against
   a budget recorded in source. It is deliberately a byte count and not a Lighthouse run: byte
   counts are deterministic, so a failure here is always a real change in the repo and never a
   flaky machine.

     node scripts/perf-budget.mjs            check, exit 1 if anything is over
     node scripts/perf-budget.mjs --update   print the budgets that would make today pass

   `--update` prints and does not write. Raising a budget should be a deliberate one-line edit
   that shows up in a diff with a reason beside it, not something a script does on your behalf
   while you are looking the other way.                                                       */
import { readdir, stat } from "node:fs/promises";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/* fileURLToPath, not URL.pathname — this project lives under a path with a space in it, which
   pathname hands back percent-encoded, producing a directory that does not exist on Windows. */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const KB = 1024;
const MB = 1024 * 1024;

/* Every budget is today's measured value rounded up to the next comfortable round number —
   roughly 10% of headroom. Tight enough that a genuinely new dependency or an unoptimised
   image drop trips it, loose enough that re-encoding noise and a few new content images do
   not. Measured 2026-10-30 against the current build.

   When one of these fails, the fix is almost never to raise the number. It is to find what was
   added: a stray 4k texture, a library imported into a client component, a font shipped as four
   weights when the design uses two.                                                           */
const BUDGETS = {
  /* Trinity World assets: globe textures, the a350 model, the campus/city/student cards.
     Measured 13.78 MB (14,447,101 bytes) on 2026-10-30. The 15 MB ceiling is the number the
     optimisation pass was aimed at, so this is the line that must not be crossed at all. */
  twTotal: 15 * MB,
  /* No single Trinity World file should be large on its own. The biggest today is a 239 KB
     campus photo; a 400 KB cap catches a full-resolution texture or an unoptimised GLB being
     dropped back in even when the folder total still happens to fit. */
  twLargestFile: 400 * KB,
  /* The older site assets: country photos, icons, logos. Measured 12.75 MB (13,372,957 bytes)
     on 2026-10-30. These are mostly PNGs that have never been through an optimisation pass, so
     the budget is a holding line rather than a target — it stops the folder growing while that
     work is outstanding. */
  assetsTotal: 14 * MB,
  /* Client JS actually shipped to the browser. Measured 2.37 MB (2,484,769 bytes) across 43
     chunks on 2026-10-30. three.js, gsap, lenis and motion dominate this; anything that moves
     it meaningfully is a new dependency reaching a client component. */
  clientJsTotal: 2.75 * MB,
  /* The single largest chunk, which is what a user waits on before the globe renders — a total
     that stays flat while one chunk doubles is still a regression. Measured 562 KB
     (575,771 bytes) on 2026-10-30. */
  clientJsLargestChunk: 640 * KB,
  /* All built CSS. Measured 284 KB (290,898 bytes) across 7 files on 2026-10-30. Tailwind
     output is roughly proportional to the number of distinct utilities used, so growth here
     usually means a vendored stylesheet arrived rather than that anyone wrote more CSS. */
  cssTotal: 320 * KB,
};

/* Walk rather than glob: no dependency, and it lets the caller filter on the full relative path
   so "the .css under .next/static" and "the .js directly under chunks" are the same operation.
   Missing directories come back empty, which the callers interpret themselves — an absent
   public/tw and an absent .next mean very different things. */
async function collect(dir, keep = () => true) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collect(path, keep)));
    } else if (entry.isFile() && keep(path)) {
      out.push({ path, size: (await stat(path)).size });
    }
  }
  return out;
}

const sum = (files) => files.reduce((total, f) => total + f.size, 0);
const largest = (files) => files.reduce((big, f) => (big && big.size >= f.size ? big : f), null);

/* Bytes are what is measured and compared; this is only ever for the report. Two decimals
   because the difference between 13.78 and 13.81 MB is exactly the kind of creep being
   watched for, and "13.8 MB" hides it. */
function human(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
}

/* The budget line to print under --update: today's value plus ~10%, snapped to a round number
   in the same unit the existing budgets use, so the suggestion can be pasted in as-is.
   Never below the budget already in force — the block is meant to be pasted over BUDGETS
   wholesale, and a row that happens to have shrunk must not quietly tighten the guard as a
   side effect of raising a different one. Tightening is a decision of its own. */
function suggest(measured, current) {
  const target = Math.max(measured * 1.1, current);
  if (target >= MB) {
    const mb = Math.ceil((target / MB) * 4) / 4; // quarter-MB steps read naturally
    return { expr: `${mb} * MB`, value: mb * MB };
  }
  const kb = Math.ceil(target / KB / 16) * 16; // 16 KB steps
  return { expr: `${kb} * KB`, value: kb * KB };
}

const rel = (path) => relative(ROOT, path).split(sep).join("/");

async function main() {
  const update = process.argv.includes("--update");

  /* .next is checked before anything else: without it the two JS/CSS rows would silently
     measure zero and report a comfortable pass, which is the worst possible failure mode for a
     guard — it would wave through exactly the regression it exists to catch. */
  const nextDir = join(ROOT, ".next");
  try {
    await stat(nextDir);
  } catch {
    console.error(
      "perf-budget: .next not found.\n" +
        "  The client JS and CSS budgets are measured from the production build output, so the\n" +
        "  project must be built first:  npm run build",
    );
    process.exit(1);
  }

  const tw = await collect(join(ROOT, "public", "tw"));
  const assets = await collect(join(ROOT, "public", "assets"));
  const chunks = await collect(join(ROOT, ".next", "static", "chunks"), (p) => p.endsWith(".js"));
  const css = await collect(join(ROOT, ".next", "static"), (p) => p.endsWith(".css"));

  const twBiggest = largest(tw);
  const jsBiggest = largest(chunks);

  const rows = [
    {
      key: "twTotal",
      label: "public/tw total",
      measured: sum(tw),
      note: `${tw.length} files`,
    },
    {
      key: "twLargestFile",
      label: "public/tw largest file",
      measured: twBiggest ? twBiggest.size : 0,
      note: twBiggest ? rel(twBiggest.path) : "none",
    },
    {
      key: "assetsTotal",
      label: "public/assets total",
      measured: sum(assets),
      note: `${assets.length} files`,
    },
    {
      key: "clientJsTotal",
      label: "client JS total",
      measured: sum(chunks),
      note: `${chunks.length} chunks`,
    },
    {
      key: "clientJsLargestChunk",
      label: "client JS largest chunk",
      measured: jsBiggest ? jsBiggest.size : 0,
      note: jsBiggest ? rel(jsBiggest.path) : "none",
    },
    {
      key: "cssTotal",
      label: "CSS total",
      measured: sum(css),
      note: `${css.length} files`,
    },
  ];

  /* An empty .next/static/chunks is the same trap as a missing .next: a build that produced no
     chunks is broken, not weightless. */
  if (chunks.length === 0) {
    console.error(
      "perf-budget: .next exists but .next/static/chunks holds no .js files.\n" +
        "  The build output looks incomplete — rebuild before trusting these numbers.",
    );
    process.exit(1);
  }

  const widths = {
    label: Math.max(...rows.map((r) => r.label.length), "item".length),
    measured: Math.max(...rows.map((r) => human(r.measured).length), "measured".length),
    budget: Math.max(...rows.map((r) => human(BUDGETS[r.key]).length), "budget".length),
  };
  const pad = (s, n) => String(s).padEnd(n);
  const padStart = (s, n) => String(s).padStart(n);

  console.log("");
  console.log(
    `  ${pad("item", widths.label)}  ${padStart("measured", widths.measured)}  ` +
      `${padStart("budget", widths.budget)}  ${padStart("used", 7)}  result`,
  );
  console.log(`  ${"-".repeat(widths.label + widths.measured + widths.budget + 7 + 6 + 10)}`);

  let failed = 0;
  for (const row of rows) {
    const budget = BUDGETS[row.key];
    const over = row.measured > budget;
    if (over) failed++;
    const pct = `${((row.measured / budget) * 100).toFixed(1)}%`;
    console.log(
      `  ${pad(row.label, widths.label)}  ${padStart(human(row.measured), widths.measured)}  ` +
        `${padStart(human(budget), widths.budget)}  ${padStart(pct, 7)}  ` +
        `${over ? "FAIL" : "pass"}  ${row.note}`,
    );
  }
  console.log("");

  if (update) {
    /* Printed for every row, not only the failing ones, so the block can be pasted over BUDGETS
       wholesale and the passing rows keep a sensible margin instead of being left to drift. */
    console.log("  Budgets that would make the current state pass (paste into BUDGETS, and say why):");
    console.log("");
    const today = new Date().toISOString().slice(0, 10);
    for (const row of rows) {
      const s = suggest(row.measured, BUDGETS[row.key]);
      const changed = s.value !== BUDGETS[row.key];
      console.log(
        `    ${row.key}: ${s.expr},`.padEnd(42) +
          (changed
            ? `/* raised from ${human(BUDGETS[row.key])}; measured ${human(row.measured)} on ${today} */`
            : `/* unchanged; measured ${human(row.measured)} on ${today} */`),
      );
    }
    console.log("");
    console.log("  Nothing was written. Edit scripts/perf-budget.mjs by hand.");
    console.log("");
    /* --update still reports the real verdict in its exit code: it is a convenience for writing
       the edit, not a way to make a red check go green by adding a flag to the command. */
  }

  if (failed > 0) {
    console.error(
      `  ${failed} item${failed === 1 ? "" : "s"} over budget. Find what was added before raising a budget;\n` +
        `  run with --update for the numbers if the increase is deliberate.\n`,
    );
    process.exit(1);
  }

  console.log("  All within budget.\n");
}

main().catch((error) => {
  /* A crash must not read as a pass — an unreadable public/tw would otherwise exit 0. */
  console.error("perf-budget: failed to run\n", error);
  process.exit(1);
});
