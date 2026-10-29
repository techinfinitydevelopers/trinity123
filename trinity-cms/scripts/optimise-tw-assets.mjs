/* Re-encodes the Trinity World assets in place, at the same paths and the same file names.

   The drop-in builds its own URLs (`engine.ts` composes `/tw/earth/...`, `uni.ts` lists the
   campus files), so nothing here may rename a file — src/components/tw/ is vendored and has
   to stay replaceable. Every output therefore overwrites its input, keeping the extension.

   The sizes are driven by how large each image is ever painted:
     earth/*_4k      the globe is at most ~900 CSS px across; 4096 is four times what a 2x
                     screen can resolve, and the bump and specular maps are masks, not detail.
     uni/, city/     a .ucard tops out at 430x590 CSS px and scales to 1.08 on hover, so 1100
                     wide covers a 2x screen with room to spare.
     stu/            the same cards, a little smaller.
   Run after dropping in new assets:  node scripts/optimise-tw-assets.mjs
   `--dry` reports what it would do and writes nothing.                                    */
import sharp from "sharp";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/* fileURLToPath, not URL.pathname — the project lives under a path with a space in it,
   which pathname hands back percent-encoded. */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "tw");
const DRY = process.argv.includes("--dry");

/* width, then the encoder. The earth maps are listed one by one because each is a different
   kind of image: colour, a grayscale height mask, a grayscale water mask, and an alpha cloud
   layer that is drawn with additive blending — additive ignores alpha, so the clouds can drop
   to a palette PNG without the edges changing. */
const JOBS = [
  { file: "earth/2_no_clouds_4k.jpg", w: 2048, enc: (p) => p.jpeg({ quality: 82, mozjpeg: true }) },
  { file: "earth/elev_bump_4k.jpg",   w: 2048, enc: (p) => p.jpeg({ quality: 80, mozjpeg: true }) },
  /* A one-channel mask at 4096 as a lossless PNG was the single largest file on the page.
     1024 is ample for "is this pixel water", and PNG is kept because the name says .png. */
  { file: "earth/water_4k.png",       w: 1024, enc: (p) => p.png({ palette: true, colours: 64, compressionLevel: 9 }) },
  /* The clouds keep their alpha: AdditiveBlending multiplies the source colour by its alpha
     before adding, so the transparency is what shapes the cloud layer rather than covering the
     globe in a flat white haze. Quantising to a palette keeps that channel and still takes the
     file to well under half. */
  { file: "earth/earth_clouds_1024.png", w: 1024, enc: (p) => p.png({ palette: true, quality: 70, effort: 10, compressionLevel: 9 }) },
];
const DIRS = [
  { dir: "uni",  w: 1100, q: 78 },
  { dir: "city", w: 1200, q: 78 },
  { dir: "stu",  w: 1100, q: 78 },
];

const kb = (n) => Math.round(n / 1024) + " KB";
let before = 0, after = 0;

async function run(rel, w, enc) {
  const path = join(ROOT, rel);
  /* Read the bytes first and hand sharp a buffer: given a path it keeps the file open while
     it decodes, and on Windows that blocks the write back to the same name. */
  const src = await readFile(path);
  const was = src.length;
  /* withoutEnlargement: an asset that is already small enough is only re-encoded, never
     upscaled. The buffer round-trip is because sharp cannot read and write the same file. */
  const buf = await enc(sharp(src).resize({ width: w, withoutEnlargement: true })).toBuffer();
  /* Never make a file bigger — a re-encode that loses is simply skipped. */
  if (buf.length >= was) { before += was; after += was; console.log(`  = ${rel} ${kb(was)} (already smaller)`); return; }
  if (!DRY) await writeFile(path, buf);
  before += was; after += buf.length;
  console.log(`  ${DRY ? "would" : "✓"} ${rel}  ${kb(was)} → ${kb(buf.length)}`);
}

console.log(DRY ? "Dry run — nothing will be written.\n" : "Re-encoding in place.\n");
console.log("earth/");
for (const j of JOBS) await run(j.file, j.w, j.enc);

for (const { dir, w, q } of DIRS) {
  console.log(`\n${dir}/`);
  const files = (await readdir(join(ROOT, dir))).filter((f) => /\.jpe?g$/i.test(f));
  for (const f of files) await run(join(dir, f), w, (p) => p.jpeg({ quality: q, mozjpeg: true }));
}

console.log(`\nTotal: ${kb(before)} → ${kb(after)}  (${Math.round((1 - after / before) * 100)}% smaller)`);
