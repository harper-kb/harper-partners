import { getSql } from "@/lib/db";
import {
  classLabel,
  type PartnerReferralPayload,
} from "@/lib/track/referral";
import {
  withAppetiteNotes,
  type BlitzAppetite,
} from "@/lib/blitz-track/appetite";

export type SaveBlitzReferralInput = {
  payload: PartnerReferralPayload;
  pageUrl: string;
  userAgent?: string | null;
  /** Default: public /blitz. Portal /blitz-refer uses blitz_track_refer. */
  source?: "blitz_public_refer" | "blitz_track_refer";
  submitterEmail?: string | null;
  /** Inside vs outside Blitz underwriting appetite. */
  appetite?: BlitzAppetite | "" | null;
};

/** Persist a Blitz form submit to partnerships.partner_blitz. */
export async function saveBlitzReferralForm(
  input: SaveBlitzReferralInput,
): Promise<{ id: string }> {
  const sql = getSql();
  const { payload, pageUrl, userAgent, source = "blitz_public_refer" } = input;
  const label = classLabel(payload) || "Unspecified";
  const ingestError =
    source === "blitz_track_refer"
      ? "Blitz track portal — skipped Weblead ingest and inquiry SMS by design."
      : "Blitz public form — skipped Weblead ingest and inquiry SMS by design.";

  let notes = withAppetiteNotes(payload.notes, input.appetite);
  if (input.submitterEmail) {
    notes = notes
      ? `${notes}\n\nSubmitted by ${input.submitterEmail}`
      : `Submitted by ${input.submitterEmail}`;
  }

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
      ${notes},
      ${"new"},
      ${"deferred"},
      ${ingestError},
      ${source},
      ${pageUrl},
      ${userAgent ?? null}
    )
    returning id::text as id
  `;

  const id = rows[0]?.id;
  if (!id) throw new Error("partner_blitz insert returned no id");
  return { id };
}
