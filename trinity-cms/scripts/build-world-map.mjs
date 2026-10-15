/* Generates `src/components/site/world-map.ts` — a single SVG path of the world's landmasses plus
   the marker coordinates for our study destinations, both already projected.

     node scripts/build-world-map.mjs

   Run once; the output is committed. `world-atlas` and `topojson-client` are devDependencies only
   so nothing ships to the browser but the generated string. Re-run it if the destination list
   changes.

   Projection is plain equirectangular (lon/lat scaled straight onto the box). It distorts the
   poles, but the map is decorative and the markers have to agree with it — a shared formula
   matters more than accuracy here. Antarctica is dropped: it eats a third of the height and no
   one studies there. */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const topology = require("world-atlas/countries-110m.json");
const { feature } = require("topojson-client");

const W = 1000;
const LAT_TOP = 84;      // top edge of the box
const LAT_BOTTOM = -56;  // below this is Antarctica and empty ocean
const H = Math.round((W / 360) * (LAT_TOP - LAT_BOTTOM));

const project = ([lon, lat]) => [
  ((lon + 180) / 360) * W,
  ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H,
];

/* The map renders about 900px wide, so whole pixels are as much precision as anyone can see and
   they keep the committed string small. */
const r = Math.round;

/* Shoelace area, used to drop islets too small to read. */
const area = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  }
  return Math.abs(a) / 2;
};

const MIN_AREA = 1.5; // square pixels
const MIN_STEP = 3;   // manhattan pixels between kept points

function ring(points) {
  const projected = points.map(project);
  if (projected.length < 4 || area(projected) < MIN_AREA) return "";
  /* Russia and Fiji straddle the antimeridian, so consecutive points can sit at lon +180 and
     -180. In an equirectangular box that is a straight line across the whole world — the stripes
     this used to draw. Break the ring there and emit each side as its own subpath. */
  const pieces = [[]];
  let last = null;
  for (const pt of projected) {
    if (last && Math.abs(pt[0] - last[0]) > W / 2) pieces.push([]);
    pieces[pieces.length - 1].push(pt);
    last = pt;
  }

  let d = "";
  for (const piece of pieces) {
    if (piece.length < 4) continue;
    let sub = "";
    let prev = null;
    for (let i = 0; i < piece.length; i++) {
      const x = r(piece[i][0]), y = r(piece[i][1]);
      /* Keep the first point, the last one, and anything at least MIN_STEP from the previous kept
         point — coastlines carry far more detail than a 1000px box can show. */
      const isLast = i === piece.length - 1;
      if (prev && !isLast && Math.abs(x - prev[0]) + Math.abs(y - prev[1]) < MIN_STEP) continue;
      sub += prev ? `L${x} ${y}` : `M${x} ${y}`;
      prev = [x, y];
    }
    /* A piece that collapsed to a line or a dot is not worth drawing. */
    if (sub.split("L").length > 3) d += `${sub}Z`;
  }
  return d;
}

/* The client wants the continents coloured separately, like the reference map they sent, so the
   land goes out as one path per continent instead of a single blob. `world-atlas` carries only a
   name and an ISO 3166-1 numeric id per country, so the grouping is by id.

   Russia sits in Asia and Greenland in North America — both span two continents, and this is how
   the client's reference colours them. Anything unmatched falls into `other`, which is painted
   the same neutral as Africa; the generator logs those so a gap is noticed rather than silently
   greyed out. */
const CONTINENTS = {
  africa: [12, 24, 204, 72, 854, 108, 120, 132, 140, 148, 174, 178, 180, 384, 262, 818, 226, 232,
    748, 231, 266, 270, 288, 324, 624, 404, 426, 430, 434, 450, 454, 466, 478, 480, 504, 508, 516,
    562, 566, 646, 678, 686, 690, 694, 706, 710, 728, 729, 834, 768, 788, 800, 894, 716, 732],
  europe: [8, 20, 40, 112, 56, 70, 100, 191, 203, 208, 233, 246, 250, 276, 300, 348, 352, 372, 380, 428,
    438, 440, 442, 470, 498, 492, 499, 528, 807, 578, 616, 620, 642, 688, 703, 705, 724, 752, 756,
    804, 826, 336, 234, 292, 248],
  asia: [4, 51, 31, 48, 50, 64, 96, 116, 156, 196, 268, 356, 360, 364, 368, 376, 392, 400, 398,
    408, 410, 414, 417, 418, 422, 458, 462, 496, 104, 524, 512, 586, 275, 608, 634, 682, 702, 144,
    760, 158, 762, 764, 626, 792, 795, 784, 860, 704, 887, 344, 446, 643],
  northAmerica: [28, 44, 52, 84, 124, 188, 192, 212, 214, 222, 308, 320, 332, 340, 388, 484, 558,
    591, 630, 659, 662, 670, 780, 840, 304, 60],
  southAmerica: [32, 68, 76, 152, 170, 218, 238, 254, 328, 600, 604, 740, 858, 862],
  oceania: [36, 242, 296, 584, 583, 520, 554, 585, 598, 882, 90, 776, 798, 548, 540, 258],
};

/* Four of the 177 features carry no ISO id at all — they are disputed or partially recognised —
   so they are matched by name instead. */
const BY_NAME = { "N. Cyprus": "asia", "Kosovo": "europe", "Somaliland": "africa" };

const continentOf = (id, name) => {
  const n = Number(id);
  for (const [key, ids] of Object.entries(CONTINENTS)) if (ids.includes(n)) return key;
  return BY_NAME[name] ?? "other";
};

const regions = {};
const unmatched = [];
for (const f of feature(topology, topology.objects.countries).features) {
  if (f.properties.name === "Antarctica") continue;
  const key = continentOf(f.id, f.properties.name);
  if (key === "other") unmatched.push(`${f.properties.name} (${f.id})`);
  const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  regions[key] = (regions[key] ?? "") + polygons.flatMap((polygon) => polygon.map(ring)).join("");
}

const land = Object.values(regions).join("");

/* The destinations the client listed, with the capital (or the city students actually go to)
   standing in for the country. "Other European countries" is pinned on Amsterdam. */
const DESTINATIONS = [
  { name: "UK", lon: -0.13, lat: 51.51, slug: "uk" },
  { name: "Ireland", lon: -6.26, lat: 53.35, slug: "ireland" },
  { name: "France", lon: 2.35, lat: 48.86, slug: "france" },
  { name: "Germany", lon: 13.4, lat: 52.52, slug: "germany" },
  { name: "Other European countries", lon: 4.9, lat: 52.37 },
  { name: "USA", lon: -77.04, lat: 38.91, slug: "usa" },
  { name: "Canada", lon: -75.7, lat: 45.42, slug: "canada" },
  { name: "UAE", lon: 55.27, lat: 25.2 },
  { name: "South Korea", lon: 126.98, lat: 37.57 },
  { name: "Japan", lon: 139.69, lat: 35.69 },
  { name: "Singapore", lon: 103.82, lat: 1.35 },
  { name: "Malaysia", lon: 101.69, lat: 3.14 },
  { name: "Australia", lon: 151.21, lat: -33.87, slug: "australia" },
  { name: "New Zealand", lon: 174.76, lat: -36.85, slug: "new-zealand" },
];

const markers = DESTINATIONS.map((d) => {
  const [x, y] = project([d.lon, d.lat]).map(r);
  return { name: d.name, x, y, ...(d.slug ? { slug: d.slug } : {}) };
});

const out = `/* Generated by scripts/build-world-map.mjs — do not edit by hand.
   Equirectangular projection of a ${W}x${H} box, longitude -180..180 and latitude ${LAT_TOP}..${LAT_BOTTOM}. */
export const MAP_W = ${W};
export const MAP_H = ${H};

export type MapMarker = { name: string; x: number; y: number; slug?: string };

export const MAP_MARKERS: MapMarker[] = ${JSON.stringify(markers, null, 2)};

export const MAP_LAND =
  "${land}";

/* One path per continent, in the order they should paint. */
export const MAP_REGIONS: { id: string; d: string }[] = ${JSON.stringify(
  ["africa", "europe", "asia", "northAmerica", "southAmerica", "oceania", "other"]
    .filter((k) => regions[k])
    .map((k) => ({ id: k, d: regions[k] })),
  null,
  2,
)};
`;

writeFileSync(new URL("../src/components/site/world-map.ts", import.meta.url), out);
console.log(`world-map.ts written — ${markers.length} markers, ${Object.keys(regions).length} regions, land path ${land.length} chars, box ${W}x${H}`);
if (unmatched.length) console.log(`unmatched (painted neutral): ${unmatched.join(", ")}`);
