// Compares the ordered sequence of class attributes inside <main> between the static export and the Next.js site.
const pairs = [
  ["/index.html", "/"], ["/about-us.html", "/about-us"], ["/why-study-abroad.html", "/why-study-abroad"],
  ["/our-service.html", "/our-service"], ["/contact-us.html", "/contact-us"], ["/blog.html", "/blog"],
  ["/blog/how-to-write-a-statement-of-purpose-sop.html", "/blog/how-to-write-a-statement-of-purpose-sop"],
];
const seq = (html) => {
  const m = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? "";
  return Array.from(m.matchAll(/<([a-z0-9]+)[^>]*?class="([^"]*)"/gi)).map((x) => `${x[1]}.${x[2].trim().split(/\s+/).sort().join(".")}`);
};
let bad = 0;
for (const [a, b] of pairs) {
  const [o, n] = await Promise.all([fetch("http://localhost:8777" + a).then((r) => r.text()), fetch("http://localhost:3000" + b).then((r) => r.text())]);
  const so = seq(o), sn = seq(n);
  const missing = so.filter((c) => !sn.includes(c)), extra = sn.filter((c) => !so.includes(c));
  const ok = missing.length === 0 && extra.length === 0 && so.length === sn.length;
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "DIFF"} ${b.padEnd(48)} orig=${so.length} new=${sn.length}` + (ok ? "" : `\n     missing: ${[...new Set(missing)].slice(0, 12).join(", ")}\n     extra:   ${[...new Set(extra)].slice(0, 12).join(", ")}`));
}
process.exit(bad ? 1 : 0);
