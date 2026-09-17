def rw(p, fn):
    s = open(p, encoding='utf-8').read(); n = fn(s)
    if n == s: print('NO CHANGE', p)
    open(p, 'w', encoding='utf-8').write(n)


def chat(s):
    s = s.replace('''const BUCKET = new Map<string, { n: number; reset: number }>();
/** Per-IP limiter. In-memory, so it is per-instance — good enough for a single Vercel region; move to Redis/KV if you scale out. */
export function rateLimit(ip: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const b = BUCKET.get(ip);''', '''/** The client IP, taken from headers a caller cannot forge.
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
  const b = BUCKET.get(key);''')
    return s.replace('if (!b || now > b.reset) { BUCKET.set(ip, { n: 1, reset: now + windowMs }); return true; }',
                     'if (!b || now > b.reset) { BUCKET.set(key, { n: 1, reset: now + windowMs }); return true; }')


rw('src/lib/chat.ts', chat)


def leads(s):
    s = s.replace('import { db } from "@/lib/db";', 'import { db } from "@/lib/db";\nimport { rateLimit, clientIp } from "@/lib/chat";')
    return s.replace('''export async function POST(req: Request) {
  const json = await req.json().catch(() => null);''', '''export async function POST(req: Request) {
  // The honeypot stops naive bots; this stops a targeted script filling the leads table.
  if (!rateLimit(`lead:${clientIp(req.headers)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Please call or WhatsApp us instead." }, { status: 429 });
  }
  const json = await req.json().catch(() => null);''')


rw('src/app/api/leads/route.ts', leads)

rw('src/app/api/media/route.ts', lambda s: s.replace(
    'const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];',
    '// SVG is deliberately excluded: it is scriptable, and on a self-hosted deploy uploads are served\n// from the site origin, which would turn an uploaded SVG into stored XSS on /admin.\nconst ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];'))


def act(s):
    s = s.replace('import { signIn, signOut, requireSession, hashPassword } from "./auth";',
                  'import { signIn, signOut, requireSession, requireAdminRole, hashPassword } from "./auth";\nimport { rateLimit, clientIp } from "./chat";\nimport { headers } from "next/headers";')
    s = s.replace('''const fail = (e: unknown): ActionResult => ({ ok: false, error: e instanceof Error ? e.message : "Something went wrong" });''', '''function fail(e: unknown): ActionResult {
  const msg = e instanceof Error ? e.message : "";
  if (msg === "UNAUTHORIZED") return { ok: false, error: "Your session expired. Sign in again in another tab, then press Save — your work is still here." };
  if (msg.includes("Unique constraint")) return { ok: false, error: "Something with that name or URL already exists. Try a different one." };
  if (msg.includes("Record to update not found") || msg.includes("P2025")) return { ok: false, error: "That item no longer exists — it may have been deleted in another tab." };
  if (msg.startsWith("This action requires")) return { ok: false, error: msg };
  console.error("[action]", e);
  return { ok: false, error: "Something went wrong. Please try again." };
}''')
    s = s.replace('''  const email = String(fd.get("email") ?? ""), password = String(fd.get("password") ?? "");
  const user = await signIn(email, password);''', '''  const email = String(fd.get("email") ?? ""), password = String(fd.get("password") ?? "");
  // Throttle on IP and on the account, so neither one host nor a distributed attempt
  // can brute-force the single admin account.
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000) || !rateLimit(`login:${email.toLowerCase().trim()}`, 8, 15 * 60_000)) {
    return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
  }
  const user = await signIn(email, password);''')
    # ADMIN-only: configuration and destructive operations
    s = s.replace('  try { await requireSession(); await saveSetting(key, value); revalidateSite(); return { ok: true, message: "Saved" }; }',
                  '  try { await requireAdminRole(); await saveSetting(key, value); revalidateSite(); return { ok: true, message: "Saved" }; }')
    s = s.replace('''export async function deleteCountryAction(id: string): Promise<ActionResult> {
  try { await requireSession();''', '''export async function deleteCountryAction(id: string): Promise<ActionResult> {
  try { await requireAdminRole();''')
    s = s.replace('''export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try { await requireSession();''', '''export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try { await requireAdminRole();''')
    s = s.replace('''export async function deletePageAction(slug: string): Promise<ActionResult> {
  try {
    await requireSession();''', '''export async function deletePageAction(slug: string): Promise<ActionResult> {
  try {
    await requireAdminRole();''')
    s = s.replace('    await db.user.update({ where: { id: me.id }, data: { password: await hashPassword(next) } });\n    return { ok: true, message: "Password updated" };',
                  '    await db.user.update({ where: { id: me.id }, data: { password: await hashPassword(next), tokenVersion: { increment: 1 } } });\n    return { ok: true, message: "Password updated. Other devices have been signed out." };')
    s = s.replace('  try { await requireSession(); await db.media.update({ where: { id }, data: { alt } }); return { ok: true }; }',
                  '  try { await requireSession(); await db.media.update({ where: { id }, data: { alt } }); revalidatePath("/admin/media"); return { ok: true }; }')
    s = s.replace('''    if (!slug || ["admin", "api", "blog", "home"].includes(slug)) return { ok: false, error: "Invalid slug" };''', '''    if (!slug || ["admin", "api", "blog", "home", "destinations"].includes(slug)) return { ok: false, error: "That URL is reserved. Please choose another." };
    if (await db.page.findUnique({ where: { slug }, select: { slug: true } })) return { ok: false, error: `A page already uses /${slug}. Choose a different URL.` };''')
    return s


rw('src/lib/actions.ts', act)
print('done')
