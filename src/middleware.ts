import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Normalize /Blitz → /blitz so the public URL works either way. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/Blitz" || pathname === "/BLITZ") {
    const url = request.nextUrl.clone();
    url.pathname = "/blitz";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/Blitz", "/BLITZ"],
};
