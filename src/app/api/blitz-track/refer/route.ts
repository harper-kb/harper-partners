import { NextResponse } from "next/server";
import { getBlitzTrackSession } from "@/lib/blitz-track/auth";
import {
  appetiteLabel,
  type BlitzAppetite,
} from "@/lib/blitz-track/appetite";
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
const ALLOWED_APPETITE = new Set(["inside", "outside"]);

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Authenticated Blitz Track referral submit.
 * All fields optional (Ammar) — soft-validate format only when provided.
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
  const classCodeRaw = str(raw.classCode, 40);
  const classCode = classCodeRaw as PartnerClassCode;
  const email = str(raw.email, 200).toLowerCase();
  const zip = str(raw.zip, 10);
  const revenue = str(raw.revenue, 40);
  const appetiteRaw = str(raw.appetite, 20).toLowerCase();
  const appetite = (
    appetiteRaw === "inside" || appetiteRaw === "outside" ? appetiteRaw : ""
  ) as BlitzAppetite | "";

  // Soft validation: only reject bad formats when a value was entered.
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "That email doesn’t look valid — fix it or leave it blank.",
      },
      { status: 400 },
    );
  }
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
  if (appetiteRaw && !ALLOWED_APPETITE.has(appetiteRaw)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Pick inside or outside Blitz appetite, or leave blank.",
      },
      { status: 400 },
    );
  }

  const payload: PartnerReferralPayload = {
    partnerId: BLITZ_TRACK.id,
    partnerName: BLITZ_TRACK.name,
    partnerShortName: BLITZ_TRACK.shortName,
    contactName: str(raw.contactName, 120),
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

  const hasAnyField = Boolean(
    payload.contactName ||
      payload.businessName ||
      payload.phone ||
      payload.email ||
      payload.street ||
      payload.city ||
      payload.state ||
      payload.zip ||
      payload.revenue ||
      classCodeRaw ||
      payload.classCodeOther ||
      payload.notes ||
      appetite,
  );
  if (!hasAnyField) {
    return NextResponse.json(
      {
        ok: false,
        message: "Add at least one detail about the lead before sending.",
      },
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
      appetite,
    });

    const agency = getAgencyById("blitz");
    if (agency) {
      try {
        const label = classLabel(payload) || "Commercial";
        const appetiteBit = appetiteLabel(appetite);
        const baseNotes =
          payload.notes ||
          `Submitted via Blitz Track /blitz-refer by ${session.email}.`;
        await registerPartnerReferral({
          agency,
          businessName: payload.businessName || "Unnamed business",
          contactName: payload.contactName || "Unknown contact",
          contactEmail: payload.email || session.email,
          classLabel: label,
          notes: appetiteBit ? `${appetiteBit}. ${baseNotes}` : baseNotes,
          phone: payload.phone || undefined,
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
