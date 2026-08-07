import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  resolveAgencyForEmail,
} from "@/lib/track/session";
import { normalizeEmail, summarizeLeads } from "@/lib/track/data";
import { getLiveLeadsForAgency } from "@/lib/track/live-leads";

async function agencyPayload(email: string) {
  const agency = resolveAgencyForEmail(email);
  if (!agency) {
    return {
      authenticated: true as const,
      email,
      agency: null,
      error:
        "You're signed in, but this email isn't enabled for Partner Track yet. Ask partnerships@harperinsure.com to add your agency.",
    };
  }

  const { leads, source } = await getLiveLeadsForAgency(agency);
  return {
    authenticated: true as const,
    email,
    agency: {
      id: agency.id,
      name: agency.name,
      shortName: agency.shortName,
      referralInbox: agency.referralInbox,
      leads,
      summary: summarizeLeads(leads),
      dataSource: source,
    },
  };
}

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

  return NextResponse.json(await agencyPayload(email));
}

/** Clerk owns sign-in now — POST kept for compatibility, resolves current user. */
export async function POST() {
  return GET();
}

export async function DELETE() {
  return NextResponse.json({
    authenticated: false,
    message: "Use Clerk sign-out (UserButton) to end your session.",
  });
}
