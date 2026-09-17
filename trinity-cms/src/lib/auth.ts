import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "@/generated/prisma";

const COOKIE = "trinity_admin";

/* A short AUTH_SECRET makes HS256 tokens brute-forceable offline from a single captured
   cookie, which hands an attacker permanent admin. Fail loudly instead of signing with one.
   (A missing secret already fails closed — WebCrypto rejects a zero-length HMAC key.) */
function secret() {
  const s = process.env.AUTH_SECRET ?? "";
  if (s.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 36");
  return new TextEncoder().encode(s);
}

/** Compared against on a missing user so the response time does not reveal valid admin emails. */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7xJ0.bJYuT1S1oZ6ZbL3NPM4sVLh8Zq";

export type SessionUser = { id: string; email: string; name: string; role: Role };

export async function signIn(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !ok) return null;
  const session: SessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  const token = await new SignJWT({ ...session, v: user.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return session;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const s = payload as unknown as SessionUser & { v?: number };
    // tokenVersion is bumped on password change, which revokes every outstanding cookie.
    const user = await db.user.findUnique({ where: { id: s.id }, select: { tokenVersion: true } });
    if (!user || user.tokenVersion !== (s.v ?? 0)) return null;
    return { id: s.id, email: s.email, name: s.name, role: s.role };
  } catch {
    return null;
  }
}

/** For server actions and route handlers — throws, caught by the action's error wrapper. */
export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

/** For admin page components — redirects instead of throwing. Every /admin page calls this;
    the layout check alone is not enough, because a page segment can render without it. */
export async function requireAdminPage(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

/** Settings, users, destinations and lead deletion are ADMIN-only; EDITOR can manage content. */
export async function requireAdminRole(): Promise<SessionUser> {
  const s = await requireSession();
  if (s.role !== "ADMIN") throw new Error("This action requires an administrator account.");
  return s;
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
