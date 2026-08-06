import { NextResponse } from "next/server";
import {
  PARTNER_CLASS_OPTIONS,
  PARTNER_REVENUE_OPTIONS,
  type PartnerClassCode,
  type PartnerReferralPayload,
} from "@/lib/track/referral";
import { saveBlitzReferralForm } from "@/lib/track/blitz-store";

const BLITZ_AGENCY = {
  id: "blitz",
  name: "Blitz Insurance",
  shortName: "Blitz",
} as const;

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

/**
 * Public Blitz referral submit.
 * Writes to partnerships.partner_blitz only — never Weblead / inquiry SMS.
 */
export async function POST(request: Request) {
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
    partnerId: BLITZ_AGENCY.id,
    partnerName: BLITZ_AGENCY.name,
    partnerShortName: BLITZ_AGENCY.shortName,
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
  const pageUrl = `${origin.replace(/\/$/, "")}/blitz`;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    const saved = await saveBlitzReferralForm({
      payload,
      pageUrl,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      referralId: saved.id,
      ingest: "deferred",
      message:
        "Referral received. Harper partnerships has it — the customer was not put through Weblead or sent an inquiry text.",
      partner: {
        id: BLITZ_AGENCY.id,
        shortName: BLITZ_AGENCY.shortName,
      },
    });
  } catch (err) {
    console.error("blitz refer supabase insert failed:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Could not save this referral. Try again, or email partnerships@harperinsure.com.",
      },
      { status: 500 },
    );
  }
}
