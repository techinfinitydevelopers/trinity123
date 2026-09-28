/* Abuse guards shared by the chat API. Knowledge-base matching lives in chat-match.ts;
   session/urgent-flow actions live in chat-session.ts. */

/** The client IP, taken from headers a caller cannot forge.
    `x-forwarded-for` is attacker-controlled at the FRONT of the list — proxies append, so the
    real address is the LAST entry. Vercel sets `x-vercel-forwarded-for` itself, so prefer it. */
export function clientIp(h: Headers): string {
  const vercel = h.get("x-vercel-forwarded-for")?.trim();
  if (vercel) return vercel;
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "local";
}

const BUCKET = new Map<string, { n: number; reset: number }>();
/** In-memory, so the effective limit is per-instance — good enough for one Vercel region.
    Move to Vercel KV / Upstash before relying on it as a real spend ceiling. */
export function rateLimit(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const b = BUCKET.get(key);
  if (!b || now > b.reset) { BUCKET.set(key, { n: 1, reset: now + windowMs }); return true; }
  if (b.n >= max) return false;
  b.n++;
  return true;
}
if (typeof setInterval === "function") {
  setInterval(() => { const now = Date.now(); for (const [k, v] of BUCKET) if (now > v.reset) BUCKET.delete(k); }, 300_000).unref?.();
}
