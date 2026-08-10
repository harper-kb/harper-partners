import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isBlitzTrackEmail } from "@/lib/blitz-track/auth";
import {
  BLITZ_TRACK,
  blitzTrackSummary,
  getBlitzTrackLeads,
} from "@/lib/blitz-track/data";
import { normalizeEmail } from "@/lib/track/data";

function primaryEmail(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  if (!user) return null;
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );
  const raw = primary?.emailAddress || user.emailAddresses[0]?.emailAddress;
  return raw ? normalizeEmail(raw) : null;
}

/**
 * Shared Blitz session — any allowed Blitz (or Harper QA) email gets the
 * same dashboard payload. Not scoped per individual Clerk user.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await currentUser();
  const email = primaryEmail(user);
  if (!email) {
    return NextResponse.json({
      authenticated: true,
      email: null,
      agency: null,
      error: "No email on this Clerk account.",
    });
  }

  if (!isBlitzTrackEmail(email)) {
    return NextResponse.json({
      authenticated: true,
      email,
      agency: null,
      error:
        "You're signed in, but Blitz Track is only for @blitzinsurance.com emails. Ask partnerships@harperinsure.com if you need access.",
    });
  }

  const { leads, source } = await getBlitzTrackLeads();
  return NextResponse.json({
    authenticated: true,
    email,
    shared: true,
    agency: {
      id: BLITZ_TRACK.id,
      name: BLITZ_TRACK.name,
      shortName: BLITZ_TRACK.shortName,
      referralInbox: BLITZ_TRACK.referralInbox,
      leads,
      summary: blitzTrackSummary(leads),
      dataSource: source,
    },
  });
}

export async function POST() {
  return GET();
}
