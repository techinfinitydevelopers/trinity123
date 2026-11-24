import type { Block, WebinarBlock } from "./blocks";

/* Client sheet (24/11): the "Free webinars" slider that closes the home page is shown at the bottom of every other page too, just above
   the blue call-to-action block — except the blog, and the webinars page, which is already all about them. It is one block, the one stored
   on the home page, so editing it in /admin changes it everywhere. A page that already carries its own webinar block keeps that one. */
export const NO_WEBINARS = new Set(["home", "blog", "webinars-events"]);

export function withWebinar(slug: string, blocks: Block[], webinar: WebinarBlock | null): Block[] {
  if (!webinar || NO_WEBINARS.has(slug) || blocks.some((b) => b?.type === "webinar")) return blocks;
  let at = -1;
  blocks.forEach((b, i) => { if (b?.type === "cta") at = i; });
  const pos = at >= 0 ? at : blocks.length;
  return [...blocks.slice(0, pos), webinar, ...blocks.slice(pos)];
}
