import { getSql } from "@/lib/db";
import {
  classLabel,
  type PartnerReferralPayload,
} from "@/lib/track/referral";

export type SaveBlitzReferralInput = {
  payload: PartnerReferralPayload;
  pageUrl: string;
  userAgent?: string | null;
};

/** Persist a public Blitz /blitz form submit to partnerships.partner_blitz. */
export async function saveBlitzReferralForm(
  input: SaveBlitzReferralInput,
): Promise<{ id: string }> {
  const sql = getSql();
  const { payload, pageUrl, userAgent } = input;
  const label = classLabel(payload);

  const rows = await sql<{ id: string }[]>`
    insert into partnerships.partner_blitz (
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
      ingest_error,
      source,
      page_url,
      user_agent
    ) values (
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
      ${"deferred"},
      ${"Blitz public form — skipped Weblead ingest and inquiry SMS by design."},
      ${"blitz_public_refer"},
      ${pageUrl},
      ${userAgent ?? null}
    )
    returning id::text as id
  `;

  const id = rows[0]?.id;
  if (!id) throw new Error("partner_blitz insert returned no id");
  return { id };
}
