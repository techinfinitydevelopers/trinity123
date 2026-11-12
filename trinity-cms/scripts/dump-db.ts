/* Read-only full-data backup: writes every table of the database in DATABASE_URL to one JSON file.

     DATABASE_URL="<url>" npx tsx scripts/dump-db.ts <output-file.json>

   Each table is read with `SELECT row_to_json(t)` so every column (jsonb, arrays, dates) is kept exactly as
   Postgres returns it. The schema itself is prisma/schema.prisma. The file contains personal data (leads,
   admin users): keep it OUTSIDE the repository. Nothing is written to the database. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { writeFileSync } from "node:fs";

const out = process.argv[2];
if (!out) throw new Error("usage: dump-db.ts <output-file.json>");
const db = new PrismaClient();

async function main() {
  const tables = (await db.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`,
  )).map((t) => t.table_name);
  const dump: Record<string, unknown> = { _meta: { takenAt: new Date().toISOString(), tables: tables.length } };
  for (const t of tables) {
    const rows = await db.$queryRawUnsafe<{ row_to_json: unknown }[]>(`SELECT row_to_json(t) FROM "${t}" t`);
    dump[t] = rows.map((r) => r.row_to_json);
    console.log(`${t}: ${rows.length} rows`);
  }
  writeFileSync(out, JSON.stringify(dump));
  console.log(`written: ${out}`);
}
main().finally(() => db.$disconnect());
