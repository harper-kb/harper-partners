import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/** Partner Track requires Clerk sign-in. Public /blitz does not use this layout. */
export default async function TrackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/track");
  }
  return children;
}
