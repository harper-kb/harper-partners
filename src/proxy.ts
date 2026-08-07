import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 uses `proxy.ts` (formerly middleware.ts).
 * Clerk runs on all matched routes; Partner Track is protected in route code via auth().
 * /blitz and marketing stay public.
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
