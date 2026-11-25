/* Client (25/11): the home page's country chips (and the globe pin, route line and landing text) must say "South Korea", not "Korea".
   The short name is content: it lives in the `world` setting (Admin → Home page → Countries → Korea → short name), so the code default alone
   does not change it. Sets `s` to "South Korea" on the `korea` entry when it is still "Korea". Idempotent; backs up the old setting first.

     DATABASE_URL="<url>" npx tsx scripts/fix-world-korea-name.ts            # dry run
     DATABASE_URL="<url>" npx tsx scripts/fix-world-korea-name.ts --apply    # write

   A direct DB write never reaches revalidateSite(): redeploy afterwards. */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { mkdirSync, writeFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const row = await db.setting.findUnique({ where: { key: "world" } });
  const value = row?.value as { countries?: Record<string, unknown>[] } | undefined;
  const at = value?.countries?.findIndex((c) => c.k === "korea") ?? -1;
  if (!value || at < 0) { console.log("no korea entry in the world setting — nothing to do"); return; }
  const cur = value.countries![at].s;
  console.log(`korea short name is currently: ${JSON.stringify(cur)}`);
  if (cur === "South Korea") { console.log("already correct — nothing to do"); return; }
  if (!apply) { console.log("dry run — pass --apply to write"); return; }
  mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/world-korea-name-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(row!.value, null, 2));
  const countries = value.countries!.map((c, i) => (i === at ? { ...c, s: "South Korea" } : c));
  await db.setting.update({ where: { key: "world" }, data: { value: { ...value, countries } as unknown as object } });
  console.log(`done. backup: ${file}`);
}
main().finally(() => db.$disconnect());
