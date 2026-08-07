import { auth, currentUser } from "@clerk/nextjs/server";
import {
  findAgencyByEmail,
  getAgencyById,
  normalizeEmail,
  type PartnerAgency,
} from "@/lib/track/data";

export function resolveAgencyForEmail(email: string) {
  return findAgencyByEmail(email);
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

/** Clerk-backed Partner Track session (replaces cookie email gate). */
export async function getTrackSession(): Promise<{
  email: string;
  agency: PartnerAgency;
  clerkUserId: string;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const email = primaryEmailFromUser(user);
  if (!email) return null;

  const agency = findAgencyByEmail(email);
  if (!agency) return null;

  return { email, agency, clerkUserId: userId };
}

export function getAgencyOrNull(id: string) {
  return getAgencyById(id);
}
