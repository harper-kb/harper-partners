import { NextResponse } from "next/server";
import {
  cookieOptions,
  createSessionToken,
  getTrackSession,
  resolveAgencyForEmail,
  TRACK_COOKIE,
} from "@/lib/track/session";
import { isValidEmail, normalizeEmail, summarizeLeads } from "@/lib/track/data";
import { getLiveLeadsForAgency } from "@/lib/track/live-leads";

async function agencyPayload(
  email: string,
  agency: NonNullable<ReturnType<typeof resolveAgencyForEmail>>,
) {
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

export async function GET() {
  const session = await getTrackSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json(
    await agencyPayload(session.email, session.agency),
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = normalizeEmail(
    typeof (body as { email?: unknown })?.email === "string"
      ? ((body as { email: string }).email ?? "")
      : "",
  );

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid work email." },
      { status: 400 },
    );
  }

  const agency = resolveAgencyForEmail(email);
  if (!agency) {
    return NextResponse.json(
      {
        error:
          "We don't recognize that partner email yet. Try a preview address (demo@harperinsure.com) or ask partnerships@harperinsure.com to enable your agency.",
      },
      { status: 403 },
    );
  }

  const token = createSessionToken(email, agency);
  const response = NextResponse.json(await agencyPayload(email, agency));
  response.cookies.set(TRACK_COOKIE, token, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(TRACK_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}
