import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk runs ONLY on Partner Track + auth routes.
 * Marketing site and /blitz are public (not in this matcher).
 */
export default clerkMiddleware(async (_auth, request) => {
  const { pathname } = request.nextUrl;
  if (pathname === "/Blitz" || pathname === "/BLITZ") {
    const url = request.nextUrl.clone();
    url.pathname = "/blitz";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/track",
    "/track/(.*)",
    "/sign-in",
    "/sign-in/(.*)",
    "/sign-up",
    "/sign-up/(.*)",
    "/api/track/(.*)",
    "/__clerk/(.*)",
    "/Blitz",
    "/BLITZ",
  ],
};
