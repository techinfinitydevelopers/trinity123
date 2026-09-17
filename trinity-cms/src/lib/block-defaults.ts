import type { Block, BlockType } from "./blocks";
import { seedPages } from "./seed-content";

/** First occurrence of each block type in the default content — used as the "Add block" template. */
export function blockTemplates(): Record<BlockType, Block> {
  const out = {} as Record<BlockType, Block>;
  for (const p of seedPages) for (const b of p.blocks) if (!out[b.type]) out[b.type] = b;
  out.richText ??= { type: "richText", html: "<h2>New section</h2><p>Write something…</p>", grey: false };
  return out;
}

export const humanize = (k: string) =>
  k.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\bImg\b/, "Image").replace(/\bSq\b/, "Square").replace(/\bBtn\b/, "Button").replace(/\bCta\b/, "CTA").replace(/\bSeo\b/, "SEO");

export const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
