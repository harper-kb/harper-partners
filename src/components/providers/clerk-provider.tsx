"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Clerk wraps Partner Track, Blitz Track, Harper Tracking + sign-in/up — not marketing or public /blitz. */
export function AppClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
