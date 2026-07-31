import { NextResponse } from "next/server";
import {
  cookieOptions,
  createSessionToken,
  getTrackSession,
  resolveAgencyForEmail,
  TRACK_COOKIE,
} from "@/lib/track/session";
import { isValidEmail, normalizeEmail, summarizeLeads } from "@/lib/track/data";

export async function GET() {
  const session = await getTrackSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const summary = summarizeLeads(session.agency.leads);
  return NextResponse.json({
    authenticated: true,
    email: session.email,
    agency: {
      id: session.agency.id,
      name: session.agency.name,
      shortName: session.agency.shortName,
      referralInbox: session.agency.referralInbox,
      leads: session.agency.leads,
      summary,
    },
  });
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
  const response = NextResponse.json({
    authenticated: true,
    email,
    agency: {
      id: agency.id,
      name: agency.name,
      shortName: agency.shortName,
      referralInbox: agency.referralInbox,
      leads: agency.leads,
      summary: summarizeLeads(agency.leads),
    },
  });
  response.cookies.set(TRACK_COOKIE, token, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(TRACK_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}
