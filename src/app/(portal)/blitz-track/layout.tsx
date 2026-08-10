import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppClerkProvider } from "@/components/providers/clerk-provider";
import { isBlitzTrackEmail } from "@/lib/blitz-track/auth";
import { normalizeEmail } from "@/lib/track/data";

/**
 * Blitz Track — Clerk + Blitz (or Harper QA) email.
 * Shared board: not scoped per individual user.
 */
export default async function BlitzTrackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/blitz-track");
  }

  const user = await currentUser();
  const emailRaw =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress || user?.emailAddresses[0]?.emailAddress;
  const email = emailRaw ? normalizeEmail(emailRaw) : null;

  if (!isBlitzTrackEmail(email)) {
    redirect("/sign-in?redirect_url=/blitz-track");
  }

  return <AppClerkProvider>{children}</AppClerkProvider>;
}
