import { NextResponse } from "next/server";
import { getTrackSession } from "@/lib/track/session";
import {
  DUMBLY_SESSION_URL,
  PARTNER_CLASS_OPTIONS,
  PARTNER_REVENUE_OPTIONS,
  classLabel,
  partnerReferWebleadIngestEnabled,
  type PartnerClassCode,
  type PartnerReferralPayload,
  sessionCreateBody,
} from "@/lib/track/referral";
import { registerPartnerReferral } from "@/lib/track/live-leads";
import {
  markPartnerReferralDeferred,
  markPartnerReferralIngestFailed,
  markPartnerReferralIngested,
  savePartnerReferralForm,
} from "@/lib/track/referral-store";

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

async function mirrorDashboard(session: {
  agency: Parameters<typeof registerPartnerReferral>[0]["agency"];
}, payload: PartnerReferralPayload) {
  try {
    await registerPartnerReferral({
      agency: session.agency,
      businessName: payload.businessName,
      contactName: payload.contactName,
      contactEmail: payload.email,
      classLabel: classLabel(payload),
      notes: payload.notes,
      phone: payload.phone,
    });
  } catch (regErr) {
    console.error("track refer registry write failed:", regErr);
  }
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
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  // Always persist to partnerships.partner_referrals (pacing source of truth).
  let referralId: string;
  try {
    const saved = await savePartnerReferralForm({
      payload,
      partnerEmail: session.email,
      pageUrl,
      userAgent,
    });
    referralId = saved.id;
  } catch (err) {
    console.error("track refer supabase insert failed:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Could not save this referral. Try again, or email partnerships@harperinsure.com.",
      },
      { status: 500 },
    );
  }

  // Default: do NOT send through WEB_LEADS / Dakotah inquiry SMS.
  // Opt-in only via PARTNER_REFER_ENABLE_WEBLEAD_INGEST=true once referral SMS exists.
  if (!partnerReferWebleadIngestEnabled()) {
    await markPartnerReferralDeferred(
      referralId,
      "Skipped Weblead ingest — partner referral (not a self-serve inquiry). Awaiting referral-aware SMS + routing.",
    ).catch((e) => console.error("deferred mark error:", e));

    await mirrorDashboard(session, payload);

    return NextResponse.json({
      ok: true,
      referralId,
      ingest: "deferred",
      message:
        "Referral saved. Harper will chase this lead.",
      partner: {
        id: session.agency.id,
        shortName: session.agency.shortName,
      },
    });
  }

  // Optional legacy Weblead path (off by default).
  try {
    const res = await fetch(DUMBLY_SESSION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(sessionCreateBody(payload, pageUrl)),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("track refer session-create failed:", res.status, errText);
      await markPartnerReferralIngestFailed(
        referralId,
        `session-create ${res.status}: ${errText.slice(0, 400)}`,
      ).catch((e) => console.error("ingest failed mark error:", e));

      return NextResponse.json(
        {
          ok: false,
          referralId,
          message: `Lead saved for partnerships, but Harper intake failed (${res.status}). We will retry — or email partnerships@harperinsure.com.`,
        },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as {
      sessionId?: string;
    };

    await markPartnerReferralIngested(referralId, data.sessionId ?? null).catch(
      (e) => console.error("ingest sent mark error:", e),
    );

    await mirrorDashboard(session, payload);

    return NextResponse.json({
      ok: true,
      referralId,
      sessionId: data.sessionId,
      ingest: "weblead",
      message:
        "Referral received and sent into Harper intake. We will chase this lead.",
      partner: {
        id: session.agency.id,
        shortName: session.agency.shortName,
      },
    });
  } catch (err) {
    console.error("track refer network error:", err);
    await markPartnerReferralIngestFailed(
      referralId,
      err instanceof Error ? err.message : "network error",
    ).catch((e) => console.error("ingest failed mark error:", e));

    return NextResponse.json(
      {
        ok: false,
        referralId,
        message:
          "Lead saved for partnerships, but intake network failed. We will retry — or email partnerships@harperinsure.com.",
      },
      { status: 502 },
    );
  }
}
