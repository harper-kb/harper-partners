"use client";

import { ClerkProvider } from "@clerk/nextjs";

/** Clerk only wraps Partner Track + sign-in/up — not the public marketing site or /blitz. */
export function AppClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
