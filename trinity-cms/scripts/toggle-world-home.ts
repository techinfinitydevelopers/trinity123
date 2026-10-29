/* Flips Settings → Home page → "Use the Trinity World home page" from the command line.

   Exactly the write the dashboard toggle performs, for when you would rather not sign in —
   e.g. on a fresh local database. Everything else in the `world` setting (the countries and
   the fifteen strings) is left untouched; only `enabled` moves.

     npx tsx scripts/toggle-world-home.ts on
     npx tsx scripts/toggle-world-home.ts off
     npx tsx scripts/toggle-world-home.ts          # reports the current state, changes nothing

   It writes to whatever DATABASE_URL points at, so check that first if you are not on the
   local dev database. `getSetting` is wrapped in `unstable_cache`, which this script cannot
   revalidate the way the save action does — restart `npm run dev` for the change to show. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const arg = (process.argv[2] ?? "").toLowerCase();
  if (arg && arg !== "on" && arg !== "off") {
    console.error(`Unknown argument "${arg}" — expected "on", "off" or nothing.`);
    process.exitCode = 1;
    return;
  }

  const row = await prisma.setting.findUnique({ where: { key: "world" } });
  const current = (row?.value ?? {}) as { enabled?: boolean; countries?: unknown[] };

  if (!arg) {
    console.log(`Trinity World home page: ${current.enabled ? "ON" : "OFF"}`);
    if (!row) console.log("(no row yet — the defaults in src/lib/settings.ts apply)");
    return;
  }

  const enabled = arg === "on";
  const value = { ...current, enabled };
  await prisma.setting.upsert({
    where: { key: "world" },
    create: { key: "world", value },
    update: { value },
  });

  const after = (await prisma.setting.findUnique({ where: { key: "world" } }))!.value as {
    enabled: boolean;
    countries?: unknown[];
  };
  console.log(`Trinity World home page: ${after.enabled ? "ON" : "OFF"}`);
  console.log(`Countries kept: ${after.countries?.length ?? "(defaults)"}`);
  console.log("Restart `npm run dev` — the settings cache does not clear on its own.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
