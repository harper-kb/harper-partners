import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppClerkProvider } from "@/components/providers/clerk-provider";

/**
 * Clerk applies ONLY to Partner Track (/track), not marketing or /blitz.
 */
export default async function TrackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/track");
  }

  return <AppClerkProvider>{children}</AppClerkProvider>;
}
