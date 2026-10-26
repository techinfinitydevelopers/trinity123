/* One-off: strip the demo's invented content out of the already-generated Home V4 page.

   The same edits live in `build-v4-component.js`, which is where they belong for a re-port —
   but the source HTML these generators read (`globebound-world-flight_1.html`) is no longer
   on disk, so the generators cannot be run today. This patches the committed component
   instead. It is idempotent: every edit is anchored, and the script reports and exits if an
   anchor is already gone.

   What it removes, and why it cannot ship as it stands:
   - Four invented statistics, two of which contradict the rest of the site by 30x, and one
     of which ("96% visa success rate") is a quantified outcome claim with nothing behind it.
   - Five invented students with invented quotes, shown twice each. `flight.js` rewrites every
     `.cdest` to whichever country the visitor clicked, so the same fictional person was
     relabelled as having studied in Japan or the UAE on demand.
   - Two "(sample figures)" / "(samples)" labels telling the visitor the content is fake.
   It also restores the CC attribution that went out with the source page's <footer> while the
   assets it covers are still being served.
*/
const fs = require("fs");
const P = "src/app/(site)/home-v4/FlightPage.tsx";
let s = fs.readFileSync(P, "utf8");
const before = s;
const done = [];
const skip = [];

const swap = (a, b, why) => {
  if (!s.includes(a)) { skip.push(why); return; }
  s = s.split(a).join(b);
  done.push(why);
};

/* 1 · the statistics — replaced with the `stats` block from src/lib/seed-content.ts */
swap(
  '<div><b data-n="3200" data-s="+">0</b><span>Students placed abroad</span></div>\n' +
    '      <div><b data-n="40" data-s="+">0</b><span>University partners</span></div>\n' +
    '      <div><b data-n="96" data-s="%">0</b><span>Visa success rate</span></div>\n' +
    '      <div><b data-n="7" data-s=".5">0</b><span>Average IELTS band</span></div>',
  '<div><b data-n="42" data-s="+">0</b><span>Years of experience</span></div>\n' +
    '      <div><b data-n="39" data-s="+">0</b><span>Countries</span></div>\n' +
    '      <div><b data-n="1200" data-s="+">0</b><span>Universities</span></div>\n' +
    '      <div><b data-n="100000" data-s="+">0</b><span>Courses</span></div>',
  "invented statistics -> the site's published figures",
);

/* 2 · the "this is fake" labels */
swap("Track record (sample figures)", "Track record", 'drop "(sample figures)"');
swap("Student stories (samples)", "Student stories", 'drop "(samples)"');

/* 3 · the testimonials — replaced with the only two genuine quotes the client has supplied.
       The rail is a continuous marquee, so they repeat to fill it rather than being padded
       out with invented ones. The `.cdest` spans go too: a real student's destination is a
       fact, not something to rewrite on click. */
const start = s.indexOf('<div class="mq" id="mq">');
const end = s.indexOf("</section>", start);
if (start < 0 || end < 0) {
  skip.push("testimonial rail (anchors not found)");
} else if (s.slice(start, end).includes("Rohan Nair")) {
  skip.push("testimonial rail (already real)");
} else {
  const real = [
    { i: "R", n: "Rohan Nair", d: "Master&rsquo;s in IT &middot; Arizona State University",
      q: "They were instrumental in helping me decide on the right university, taking into consideration the curriculum that best suited my academic and career goals." },
    { i: "S", n: "Sharanya Santosh", d: "Master&rsquo;s &middot; Maynooth University, Ireland",
      q: "Trinity assisted me in choosing the best college for the subject of my choice. They guided me with the application process, the documentation required and coached and prepped me for the visa interview." },
  ];
  const card = (t) =>
    `<div class="tc"><p>&ldquo;${t.q}&rdquo;</p><footer><i>${t.i}</i><div>${t.n}<small>${t.d}</small></div></footer></div>`;
  s = s.slice(0, start) + '<div class="mq" id="mq">' +
    [...real, ...real, ...real, ...real].map(card).join("") + "\n  </div>\n  " + s.slice(end);
  done.push("invented testimonials -> the two genuine quotes, repeated to fill the rail");
}

/* 4 · the attribution that went out with the source page's <footer>. Thirteen of the fourteen
       photographs require it; malaysia.jpg is CC0. Dubai and Seoul came with neither a named
       author nor a licence version, so they are listed as outstanding rather than dropped. */
if (s.includes('id="v4credits"')) {
  skip.push("credits (already present)");
} else {
  const anchor = "</section>";
  const at = s.lastIndexOf(anchor);
  if (at < 0) skip.push("credits (no section to append after)");
  else {
    s = s.slice(0, at + anchor.length) + `
<section class="page" id="v4credits"><div class="wrap">
  <p class="credit">Aircraft: &ldquo;A350&rdquo; by amvlab/aircraft-models, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Earth textures: three.js examples (MIT).</p>
  <p class="credits">City photographs via Wikimedia Commons &mdash; London, Ilya Grigorik (CC BY-SA 3.0) &middot; Dublin, &#30143;&#20029;&#27743;&#30340;&#27827;&#27700; (CC BY-SA 4.0) &middot; Paris, Yann Caradec (CC BY-SA 2.0) &middot; Berlin, Museumsinsel Berlin Juli 2021 (CC BY-SA 4.0) &middot; Prague, Moyan Brenn (CC BY 2.0) &middot; New York City, Dllu (CC BY-SA 4.0) &middot; Toronto, Dillan Payne (CC BY-SA 4.0) &middot; Tokyo, Morio (CC BY-SA 3.0) &middot; Marina Bay Sands, Supanut Ar (CC BY 4.0) &middot; Kuala Lumpur, Renek78 (CC0) &middot; Sydney, Benh LIEU SONG (CC BY-SA 4.0) &middot; Auckland, elpinto007 (CC BY-SA 2.0). Dubai and Seoul: source and licence still to be confirmed.</p>
</div></section>` + s.slice(at + anchor.length);
    done.push("restore the CC BY / CC BY-SA attribution");
  }
}

if (s === before) {
  console.log("no change — every edit was already applied");
} else {
  fs.writeFileSync(P, s);
  console.log(`${P}: ${before.length} -> ${s.length} bytes`);
}
done.forEach((d) => console.log("  applied ·", d));
skip.forEach((d) => console.log("  skipped ·", d));
