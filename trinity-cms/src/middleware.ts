import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/* First of two layers protecting /admin. The second — `requireSession()` inside each
   page and server action — is the one that actually guarantees safety: middleware alone
   has a history of bypasses (CVE-2025-29927), and App Router can serve a page segment
   without re-running a parent layout. Never rely on either of these on its own. */

const COOKIE = "trinity_admin";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const secret = process.env.AUTH_SECRET ?? "";
  let ok = false;
  if (token && secret.length >= 32) {
    try { await jwtVerify(token, new TextEncoder().encode(secret)); ok = true; } catch { ok = false; }
  }
  if (ok) return NextResponse.next();

  // RSC/prefetch requests must not be answered with an HTML redirect body.
  if (req.headers.get("RSC") === "1") return new NextResponse(null, { status: 401 });

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ["/admin/((?!login).*)", "/admin"],
};
