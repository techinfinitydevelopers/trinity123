import { db } from "./db";
import { unstable_cache, revalidateTag } from "next/cache";
import { DEFAULTS, type SettingsKey, type SettingsMap } from "./settings";

export type { SettingsKey, SettingsMap } from "./settings";

export const getSetting = unstable_cache(
  async <K extends SettingsKey>(key: K): Promise<SettingsMap[K]> => {
    const row = await db.setting.findUnique({ where: { key } });
    return { ...DEFAULTS[key], ...((row?.value as object) ?? {}) } as SettingsMap[K];
  },
  /* "v2": a database write made outside the admin (a script) never calls revalidateTag, and Railway keeps
     `.next/cache` between builds, so the old entries survived a redeploy. Bump this to force a fresh read. */
  ["setting", "v2"],
  { tags: ["settings"] },
);

export async function getAllSettings(): Promise<SettingsMap> {
  const keys = Object.keys(DEFAULTS) as SettingsKey[];
  const vals = await Promise.all(keys.map((k) => getSetting(k)));
  return Object.fromEntries(keys.map((k, i) => [k, vals[i]])) as SettingsMap;
}

export async function saveSetting<K extends SettingsKey>(key: K, value: SettingsMap[K]) {
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  revalidateTag("settings", "max");
}
