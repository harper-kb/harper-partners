import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk runs ONLY on Partner Track, Blitz Track, Harper Tracking, and auth.
 * Marketing site and public /blitz form stay public (not in this matcher).
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
    "/blitz-track",
    "/blitz-track/(.*)",
    "/blitz-refer",
    "/blitz-refer/(.*)",
    "/harper-tracking",
    "/harper-tracking/(.*)",
    "/sign-in",
    "/sign-in/(.*)",
    "/sign-up",
    "/sign-up/(.*)",
    "/api/track/(.*)",
    "/api/blitz-track/(.*)",
    "/api/harper-tracking",
    "/api/harper-tracking/(.*)",
    "/__clerk/(.*)",
    "/Blitz",
    "/BLITZ",
  ],
};
