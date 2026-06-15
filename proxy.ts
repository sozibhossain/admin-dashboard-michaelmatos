import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Pages that should be reachable without a session.
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/verify-email", "/reset-password"];

// Next.js 16 renamed `middleware` -> `proxy`. NextAuth's `auth` wrapper decodes
// the session JWT from the cookie (no DB hit) and exposes it as `req.auth`.
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isPublic = PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Signed-in users shouldn't see the auth pages.
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Guests can't see protected pages.
  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
