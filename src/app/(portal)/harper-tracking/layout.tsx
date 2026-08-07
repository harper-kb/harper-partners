import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppClerkProvider } from "@/components/providers/clerk-provider";

function isHarperEmail(email: string | undefined | null) {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith("@harperinsure.com");
}

/** Internal Harper Tracking — Clerk + @harperinsure.com only. */
export default async function HarperTrackingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/harper-tracking");
  }

  const user = await currentUser();
  const email =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress || user?.emailAddresses[0]?.emailAddress;

  if (!isHarperEmail(email)) {
    redirect("/sign-in?redirect_url=/harper-tracking");
  }

  return <AppClerkProvider>{children}</AppClerkProvider>;
}
