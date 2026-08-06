import { getSql } from "@/lib/db";
import {
  classLabel,
  type PartnerReferralPayload,
} from "@/lib/track/referral";

export type PartnerReferralRow = {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_short_name: string;
  partner_email: string | null;
  contact_name: string;
  business_name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  revenue: string;
  class_code: string;
  class_code_other: string | null;
  class_label: string;
  notes: string | null;
  status: string;
  session_id: string | null;
  ingest_status: string;
  source: string;
  created_at: string;
};

export type SavePartnerReferralInput = {
  payload: PartnerReferralPayload;
  partnerEmail: string;
  pageUrl: string;
  userAgent?: string | null;
};

/** Persist a Partner Track referral form row (pacing / SDR source of truth). */
export async function savePartnerReferralForm(
  input: SavePartnerReferralInput,
): Promise<{ id: string }> {
  const sql = getSql();
  const { payload, partnerEmail, pageUrl, userAgent } = input;
  const label = classLabel(payload);

  const rows = await sql<{ id: string }[]>`
    insert into partnerships.partner_referrals (
      partner_id,
      partner_name,
      partner_short_name,
      partner_email,
      contact_name,
      business_name,
      phone,
      email,
      street,
      city,
      state,
      zip,
      revenue,
      class_code,
      class_code_other,
      class_label,
      notes,
      status,
      ingest_status,
      source,
      page_url,
      user_agent
    ) values (
      ${payload.partnerId},
      ${payload.partnerName},
      ${payload.partnerShortName},
      ${partnerEmail},
      ${payload.contactName},
      ${payload.businessName},
      ${payload.phone},
      ${payload.email},
      ${payload.street},
      ${payload.city},
      ${payload.state},
      ${payload.zip},
      ${payload.revenue},
      ${payload.classCode},
      ${payload.classCodeOther ?? null},
      ${label},
      ${payload.notes ?? null},
      ${"new"},
      ${"pending"},
      ${"partners_track_refer"},
      ${pageUrl},
      ${userAgent ?? null}
    )
    returning id::text as id
  `;

  const id = rows[0]?.id;
  if (!id) throw new Error("partner_referrals insert returned no id");
  return { id };
}

export async function markPartnerReferralIngested(
  id: string,
  sessionId: string | null,
) {
  const sql = getSql();
  await sql`
    update partnerships.partner_referrals
    set
      session_id = ${sessionId},
      ingest_status = ${"sent"},
      ingest_error = ${null},
      status = ${"ingested"},
      updated_at = now()
    where id = ${id}::uuid
  `;
}

export async function markPartnerReferralIngestFailed(
  id: string,
  error: string,
) {
  const sql = getSql();
  await sql`
    update partnerships.partner_referrals
    set
      ingest_status = ${"failed"},
      ingest_error = ${error.slice(0, 1000)},
      updated_at = now()
    where id = ${id}::uuid
  `;
}
