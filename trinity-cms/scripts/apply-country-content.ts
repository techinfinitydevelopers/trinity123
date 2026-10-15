/* Applies the client's destination content, extracted from their brief into one JSON file per
   country, to the database.

     DATABASE_URL="<url>" npx tsx scripts/apply-country-content.ts <dir>

   <dir> holds `country-<slug>.json` files. Each is a partial Country: a key that is present is
   written, a key that is absent leaves whatever the site already has. A country whose slug does
   not exist yet is created, which is how Dubai and Singapore arrive.

   Images are not in those files — the brief's text export drops them — so `img` and the per-
   university images are filled from the existing photo library and never overwritten once set.

   Idempotent. A direct database write never reaches `revalidateSite()`, so redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("Pass the directory holding the country-*.json files.");
  process.exit(1);
}

/* The photo library, used only for rows that have no image yet. */
const POOL = ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8", "z9", "z10"].map((n) => `/assets/img/unversity/${n}.jpg`);

const CONTENT_KEYS = [
  "tag", "hero", "intro", "stats", "why", "courses", "unis", "visa", "intakes",
  "cost", "req", "sch", "steps", "work", "workPoints", "faq",
] as const;

const db = new PrismaClient();

async function main() {
  const files = readdirSync(dir).filter((f) => /^country-.+\.json$/.test(f)).sort();
  if (!files.length) throw new Error(`No country-*.json in ${dir}`);

  let maxOrder = (await db.country.aggregate({ _max: { order: true } }))._max.order ?? 0;

  for (const file of files) {
    const raw = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as Record<string, unknown>;
    const slug = String(raw.slug ?? "").trim();
    if (!slug) { console.log(`${file}: no slug, skipped`); continue; }

    const existing = await db.country.findUnique({ where: { slug } });

    const data: Record<string, unknown> = {};
    const filled: string[] = [];
    for (const k of CONTENT_KEYS) {
      const v = raw[k];
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && !v.trim()) continue;
      if (Array.isArray(v) && !v.length) continue;
      data[k] = v;
      filled.push(k);
    }

    /* Each university the brief names arrives without a picture. Give it one from the library,
       and leave any picture that is already there alone. */
    if (Array.isArray(data.unis)) {
      const was = (existing?.unis as { name: string; img: string }[] | undefined) ?? [];
      data.unis = (data.unis as { name: string; img?: string }[]).map((u, i) => ({
        name: u.name,
        img: u.img || was.find((w) => w.name === u.name)?.img || POOL[i % POOL.length],
      }));
    }

    if (existing) {
      if (!filled.length) { console.log(`${slug}: nothing to write`); continue; }
      await db.country.update({ where: { slug }, data });
      console.log(`${slug}: updated — ${filled.join(", ")}`);
    } else {
      const code = String(raw.code ?? "").trim();
      const name = String(raw.name ?? "").trim();
      if (!code || !name) { console.log(`${slug}: new country needs code and name, skipped`); continue; }
      await db.country.create({
        data: { ...data, slug, code, name, img: POOL[maxOrder % POOL.length], order: ++maxOrder },
      } as never);
      console.log(`${slug}: created — ${filled.join(", ")}`);
    }
  }

  await db.$disconnect();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
