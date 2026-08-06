/**
 * Partner Track referral form.
 *
 * Browser → /api/track/refer → partnerships.partner_referrals (ops Supabase).
 *
 * We deliberately do NOT POST to the dumbly session-create / WEB_LEADS door:
 * that path treats the phone as a self-serve inquiry (Dakotah "thanks for
 * submitting" SMS + Weblead Slack). Partner referrals are submitted by the
 * agency on behalf of the customer — different SMS + routing needed first.
 *
 * Tagged for later intake with [PARTNER:{AGENCY}] once eng wires a
 * referral-aware ingest (not consumer Weblead).
 */

export type PartnerClassCode =
  | "contractor"
  | "commercial_auto"
  | "restaurant"
  | "retail"
  | "tattoo_parlor"
  | "vape_store"
  | "cannabis"
  | "liquor_store"
  | "workers_comp"
  | "property"
  | "other";

export type PartnerReferralPayload = {
  partnerId: string;
  partnerName: string;
  partnerShortName: string;
  contactName: string;
  businessName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  revenue: string;
  classCode: PartnerClassCode;
  classCodeOther?: string;
  notes?: string;
  submittedAt: string;
};

export const PARTNER_CLASS_OPTIONS: {
  value: PartnerClassCode | "";
  label: string;
}[] = [
  { value: "", label: "Select class / business type..." },
  { value: "contractor", label: "Contractor / construction" },
  { value: "commercial_auto", label: "Commercial auto / trucking" },
  { value: "restaurant", label: "Restaurant / food service" },
  { value: "retail", label: "Retail" },
  { value: "workers_comp", label: "Workers compensation" },
  { value: "property", label: "Property / vacant / lessors risk" },
  { value: "tattoo_parlor", label: "Tattoo parlor" },
  { value: "vape_store", label: "Vape store" },
  { value: "cannabis", label: "Cannabis-related" },
  { value: "liquor_store", label: "Liquor store" },
  { value: "other", label: "Other" },
];

export const PARTNER_REVENUE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select annual revenue..." },
  { value: "50k_100k", label: "$50K – $100K" },
  { value: "100k_250k", label: "$100K – $250K" },
  { value: "250k_500k", label: "$250K – $500K" },
  { value: "500k_1m", label: "$500K – $1M" },
  { value: "1m_5m", label: "$1M – $5M" },
  { value: "5m_plus", label: "$5M+" },
];

/** Same session-create Lambda as quote forms — NOT used for Partner Track yet. */
export const DUMBLY_SESSION_URL =
  "https://fzvdgnq2hd2oydnezildd5xdoi0yybwj.lambda-url.us-east-1.on.aws/";

/**
 * When true, also POST to session-create (WEB_LEADS / Dakotah inquiry SMS).
 * Default off — partner referrals must not use the consumer inquiry path.
 */
export function partnerReferWebleadIngestEnabled() {
  return process.env.PARTNER_REFER_ENABLE_WEBLEAD_INGEST === "true";
}
export const PARTNERS_NOTIFY_EMAIL = "partnerships@harperinsure.com";
export const PARTNERS_SOURCE_COMPONENT = "partners_track_refer";

/** Browsers compile pattern with the `v` flag — hyphen inside a class must be escaped. */
export const PHONE_PATTERN = "[0-9\\-]{7,19}";

const CLASS_LABELS: Record<PartnerClassCode, string> = {
  contractor: "Contractor / construction",
  commercial_auto: "Commercial auto / trucking",
  restaurant: "Restaurant / food service",
  retail: "Retail",
  tattoo_parlor: "Tattoo parlor",
  vape_store: "Vape store",
  cannabis: "Cannabis-related",
  liquor_store: "Liquor store",
  workers_comp: "Workers compensation",
  property: "Property / vacant / lessors risk",
  other: "Other",
};

export function partnerTag(shortName: string) {
  return shortName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
}

export function classLabel(payload: PartnerReferralPayload): string {
  if (payload.classCode === "other" && payload.classCodeOther) {
    return `Other (${payload.classCodeOther})`;
  }
  return CLASS_LABELS[payload.classCode] || payload.classCode;
}

export function buildBusinessDescription(payload: PartnerReferralPayload): string {
  const tag = partnerTag(payload.partnerShortName);
  const parts = [
    `[PARTNER:${tag}]`,
    classLabel(payload),
    `Address: ${payload.street}, ${payload.city}, ${payload.state} ${payload.zip}`,
    `Referred by: ${payload.partnerName}`,
  ];
  if (payload.notes) parts.push(`Notes: ${payload.notes}`);
  return parts.join(" · ");
}

export function sessionCreateBody(
  payload: PartnerReferralPayload,
  pageUrl: string,
) {
  return {
    name: payload.contactName,
    companyName: payload.businessName,
    email: payload.email,
    phoneNumber: payload.phone,
    organizationState: payload.state,
    organizationRevenue: payload.revenue,
    businessDescription: buildBusinessDescription(payload),
    selectedIndustry: classLabel(payload),
    sourceComponent: PARTNERS_SOURCE_COMPONENT,
    pageUrl,
    partner: payload.partnerId,
    partnerName: payload.partnerName,
    source: "partners_track",
    street: payload.street,
    city: payload.city,
    zip: payload.zip,
    classCode: payload.classCode,
    classCodeOther: payload.classCodeOther,
    notes: payload.notes,
    notifyEmail: PARTNERS_NOTIFY_EMAIL,
  };
}
