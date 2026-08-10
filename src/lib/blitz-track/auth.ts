import { auth, currentUser } from "@clerk/nextjs/server";
import { normalizeEmail } from "@/lib/track/data";

/** Shared Blitz portal — any @blitzinsurance.com (plus Harper for internal QA). */
const ALLOWED_DOMAINS = new Set(["blitzinsurance.com", "harperinsure.com"]);

export function isBlitzTrackEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  const domain = normalized.split("@")[1] ?? "";
  return ALLOWED_DOMAINS.has(domain);
}

function primaryEmailFromUser(
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
) {
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );
  const raw = primary?.emailAddress || user.emailAddresses[0]?.emailAddress;
  return raw ? normalizeEmail(raw) : null;
}

/** Clerk session for the shared Blitz track (not per-user lead scoping). */
export async function getBlitzTrackSession(): Promise<{
  email: string;
  clerkUserId: string;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const email = primaryEmailFromUser(user);
  if (!email || !isBlitzTrackEmail(email)) return null;

  return { email, clerkUserId: userId };
}
