import { NextResponse } from "next/server";
import { getTrackSession } from "@/lib/track/session";
import {
  DUMBLY_SESSION_URL,
  PARTNER_CLASS_OPTIONS,
  PARTNER_REVENUE_OPTIONS,
  type PartnerClassCode,
  type PartnerReferralPayload,
  sessionCreateBody,
} from "@/lib/track/referral";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP_RE = /^[0-9]{5}(-[0-9]{4})?$/;
const ALLOWED_CLASSES = new Set(
  PARTNER_CLASS_OPTIONS.map((o) => o.value).filter(Boolean),
);
const ALLOWED_REVENUE = new Set(
  PARTNER_REVENUE_OPTIONS.map((o) => o.value).filter(Boolean),
);

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const session = await getTrackSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in to refer a lead." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const classCode = str(raw.classCode, 40) as PartnerClassCode;
  const payload: PartnerReferralPayload = {
    partnerId: session.agency.id,
    partnerName: session.agency.name,
    partnerShortName: session.agency.shortName,
    contactName: str(raw.contactName, 120),
    businessName: str(raw.businessName, 160),
    phone: str(raw.phone, 40),
    email: str(raw.email, 200).toLowerCase(),
    street: str(raw.street, 200),
    city: str(raw.city, 100),
    state: str(raw.state, 2).toUpperCase(),
    zip: str(raw.zip, 10),
    revenue: str(raw.revenue, 40),
    classCode,
    classCodeOther: str(raw.classCodeOther, 120) || undefined,
    notes: str(raw.notes, 2000) || undefined,
    submittedAt: new Date().toISOString(),
  };

  if (!payload.contactName || !payload.businessName) {
    return NextResponse.json(
      { ok: false, message: "Contact name and business name are required." },
      { status: 400 },
    );
  }
  if (!payload.phone || !EMAIL_RE.test(payload.email)) {
    return NextResponse.json(
      { ok: false, message: "Valid customer phone and email are required." },
      { status: 400 },
    );
  }
  if (!payload.street || !payload.city || !payload.state || !ZIP_RE.test(payload.zip)) {
    return NextResponse.json(
      { ok: false, message: "Complete business address, city, state, and ZIP." },
      { status: 400 },
    );
  }
  if (!ALLOWED_CLASSES.has(payload.classCode) || !ALLOWED_REVENUE.has(payload.revenue)) {
    return NextResponse.json(
      { ok: false, message: "Select class type and annual revenue." },
      { status: 400 },
    );
  }
  if (payload.classCode === "other" && !payload.classCodeOther) {
    return NextResponse.json(
      { ok: false, message: "Please describe the class type for Other." },
      { status: 400 },
    );
  }

  const origin =
    request.headers.get("origin") || "https://partners.harperinsure.com";
  const pageUrl = `${origin.replace(/\/$/, "")}/track/refer`;

  try {
    const res = await fetch(DUMBLY_SESSION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(sessionCreateBody(payload, pageUrl)),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("track refer session-create failed:", res.status, errText);
      return NextResponse.json(
        {
          ok: false,
          message: `Lead ingest failed (${res.status}). Try again, or email partnerships@harperinsure.com.`,
        },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as {
      sessionId?: string;
    };

    return NextResponse.json({
      ok: true,
      sessionId: data.sessionId,
      message:
        "Referral received and sent into Harper intake. We will chase this lead.",
      partner: {
        id: session.agency.id,
        shortName: session.agency.shortName,
      },
    });
  } catch (err) {
    console.error("track refer network error:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Network error reaching Harper intake. Try again, or email partnerships@harperinsure.com.",
      },
      { status: 502 },
    );
  }
}
