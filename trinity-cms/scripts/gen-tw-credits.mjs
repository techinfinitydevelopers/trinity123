/* Lifts the two credit blocks out of the supplied standalone page, verbatim.

   They are licence attribution for the aircraft model, the earth textures and every
   Wikimedia photograph on the page, so they are copied rather than retyped — a dropped
   name is a licence breach, not a typo. Re-run when a new drop-in changes the asset set:

     node scripts/gen-tw-credits.mjs <drop-in.html> src/components/tw/credits.ts

   Plain indexOf rather than a regex: the blocks are a known shape and the credits run to
   4 KB of names, which is exactly where a lazy quantifier gets expensive. */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(process.argv[2], "utf8");

function grab(cls) {
  const open = '<div class="' + cls + '">';
  const i = src.indexOf(open);
  if (i < 0) throw new Error("no ." + cls + " block found");
  const j = src.indexOf("</div>", i);
  if (j < 0) throw new Error("unterminated ." + cls + " block");
  return src.slice(i + open.length, j).trim();
}

const credit = grab("credit");
const credits = grab("credits");
const header = [
  "/* Generated from the supplied drop-in by scripts/gen-tw-credits.mjs — do not hand-edit.",
  "",
  "   Licence attribution for the aircraft model, the earth textures and the Wikimedia",
  "   photographs the page uses. CC BY and CC BY-SA both require it to travel with the",
  "   work, so it ships in the footer rather than sitting in a README. */",
  "",
].join("\n");

writeFileSync(
  process.argv[3],
  header +
    "export const CREDIT = " + JSON.stringify(credit) + ";\n" +
    "export const CREDITS = " + JSON.stringify(credits) + ";\n",
);
console.log("credit " + credit.length + "b, credits " + credits.length + "b");
