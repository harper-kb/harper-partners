import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppClerkProvider } from "@/components/providers/clerk-provider";
import { isBlitzTrackEmail } from "@/lib/blitz-track/auth";
import { normalizeEmail } from "@/lib/track/data";

/** Authenticated Blitz referral form — same gate as /blitz-track. */
export default async function BlitzReferLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/blitz-refer");
  }

  const user = await currentUser();
  const emailRaw =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress || user?.emailAddresses[0]?.emailAddress;
  const email = emailRaw ? normalizeEmail(emailRaw) : null;

  if (!isBlitzTrackEmail(email)) {
    redirect("/sign-in?redirect_url=/blitz-refer");
  }

  return <AppClerkProvider>{children}</AppClerkProvider>;
}
