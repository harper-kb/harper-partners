import { NextResponse } from "next/server";
import { getBlitzTrackSession } from "@/lib/blitz-track/auth";
import { BLITZ_TRACK } from "@/lib/blitz-track/data";
import {
  PARTNER_CLASS_OPTIONS,
  PARTNER_REVENUE_OPTIONS,
  classLabel,
  type PartnerClassCode,
  type PartnerReferralPayload,
} from "@/lib/track/referral";
import { saveBlitzReferralForm } from "@/lib/track/blitz-store";
import { registerPartnerReferral } from "@/lib/track/live-leads";
import { getAgencyById } from "@/lib/track/data";

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
 * Authenticated Blitz Track referral submit.
 * Same shared partner_blitz table as public /blitz — never Weblead / inquiry SMS.
 */
export async function POST(request: Request) {
  const session = await getBlitzTrackSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in with a Blitz email to refer a lead." },
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
    partnerId: BLITZ_TRACK.id,
    partnerName: BLITZ_TRACK.name,
    partnerShortName: BLITZ_TRACK.shortName,
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
  const pageUrl = `${origin.replace(/\/$/, "")}/blitz-refer`;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    const saved = await saveBlitzReferralForm({
      payload,
      pageUrl,
      userAgent,
      source: "blitz_track_refer",
      submitterEmail: session.email,
    });

    const agency = getAgencyById("blitz");
    if (agency) {
      try {
        await registerPartnerReferral({
          agency,
          businessName: payload.businessName,
          contactName: payload.contactName,
          contactEmail: payload.email,
          classLabel: classLabel(payload),
          notes:
            payload.notes ||
            `Submitted via Blitz Track /blitz-refer by ${session.email}.`,
          phone: payload.phone,
        });
      } catch (regErr) {
        console.error("blitz-track refer registry write failed:", regErr);
      }
    }

    return NextResponse.json({
      ok: true,
      referralId: saved.id,
      ingest: "deferred",
      message: "Referral received. Harper will chase this lead.",
      partner: {
        id: BLITZ_TRACK.id,
        shortName: BLITZ_TRACK.shortName,
      },
    });
  } catch (err) {
    console.error("blitz-track refer insert failed:", err);
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
