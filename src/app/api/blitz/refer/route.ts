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
 * Required: first name, last name, phone, email.
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
  const firstName = str(raw.firstName, 60);
  const lastName = str(raw.lastName, 60);
  const contactName =
    str(raw.contactName, 120) ||
    [firstName, lastName].filter(Boolean).join(" ");
  const classCodeRaw = str(raw.classCode, 40);
  const classCode = classCodeRaw as PartnerClassCode;
  const email = str(raw.email, 200).toLowerCase();
  const zip = str(raw.zip, 10);
  const revenue = str(raw.revenue, 40);

  if (!firstName || !lastName) {
    return NextResponse.json(
      { ok: false, message: "First name and last name are required." },
      { status: 400 },
    );
  }
  if (!str(raw.phone, 40) || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Valid customer phone and email are required." },
      { status: 400 },
    );
  }

  // Soft validation when optional fields are provided.
  if (zip && !ZIP_RE.test(zip)) {
    return NextResponse.json(
      { ok: false, message: "ZIP should be 5 digits (or leave blank)." },
      { status: 400 },
    );
  }
  if (classCodeRaw && !ALLOWED_CLASSES.has(classCodeRaw as PartnerClassCode)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Select a class type from the list, or leave blank.",
      },
      { status: 400 },
    );
  }
  if (revenue && !ALLOWED_REVENUE.has(revenue)) {
    return NextResponse.json(
      { ok: false, message: "Select revenue from the list, or leave blank." },
      { status: 400 },
    );
  }
  if (classCodeRaw === "other" && !str(raw.classCodeOther, 120)) {
    return NextResponse.json(
      { ok: false, message: "Please describe the class type for Other." },
      { status: 400 },
    );
  }

  const payload: PartnerReferralPayload = {
    partnerId: BLITZ_AGENCY.id,
    partnerName: BLITZ_AGENCY.name,
    partnerShortName: BLITZ_AGENCY.shortName,
    contactName,
    businessName: str(raw.businessName, 160),
    phone: str(raw.phone, 40),
    email,
    street: str(raw.street, 200),
    city: str(raw.city, 100),
    state: str(raw.state, 2).toUpperCase(),
    zip,
    revenue,
    classCode,
    classCodeOther: str(raw.classCodeOther, 120) || undefined,
    notes: str(raw.notes, 2000) || undefined,
    submittedAt: new Date().toISOString(),
  };

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
      message: "Referral received. Harper will chase this lead.",
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
