import { getSql } from "@/lib/db";
import {
  fetchCompaniesByIds,
  fetchCompaniesByPartnerTag,
  hasBbAccess,
  type BbCompanyRow,
} from "@/lib/track/bb-client";
import {
  type LeadStage,
  type PartnerAgency,
  type PartnerLead,
} from "@/lib/track/data";
import { partnerTag } from "@/lib/track/referral";

type ReferredDealMeta = {
  partner?: string;
  bb?: number | null;
  rstage?: string;
  intro?: string;
  notes?: string;
  next?: string;
  producer?: string;
  line?: string;
  phone?: string;
  email?: string;
};

type OpsReferredRow = {
  id: string;
  org: string;
  vertical: string | null;
  contact_name: string | null;
  contact_email: string | null;
  stage: string | null;
  status_label: string | null;
  summary: string | null;
  updated_at: string | null;
  created_at: string | null;
};

const LIVE_AGENCY_MATCHERS: Record<string, RegExp> = {
  macario: /macario/i,
  brent: /brent|underwood/i,
  faith: /faith/i,
  "joanne-test": /joanne test/i,
};

/** Agencies that still use curated sample leads (demo / marketing preview). */
export function agencyUsesLiveLeads(agencyId: string) {
  return agencyId in LIVE_AGENCY_MATCHERS;
}

function parseReferredMeta(summary: string | null): ReferredDealMeta | null {
  if (!summary) return null;
  const marker = "type:referred-deal";
  if (!summary.toLowerCase().includes(marker)) return null;
  const pipe = summary.indexOf("|");
  const jsonPart = pipe >= 0 ? summary.slice(pipe + 1).trim() : "";
  if (!jsonPart.startsWith("{")) return null;
  try {
    return JSON.parse(jsonPart) as ReferredDealMeta;
  } catch {
    return null;
  }
}

function formatProducer(raw: string | null | undefined) {
  if (!raw) return "Harper intake";
  if (raw.includes(" ") && !raw.includes("_")) return raw;
  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function formatState(raw: string | null | undefined) {
  if (!raw) return "—";
  const t = raw.trim();
  if (t.length === 2) return t.toUpperCase();
  const map: Record<string, string> = {
    alabama: "AL",
    alaska: "AK",
    arizona: "AZ",
    arkansas: "AR",
    california: "CA",
    colorado: "CO",
    connecticut: "CT",
    delaware: "DE",
    florida: "FL",
    georgia: "GA",
    hawaii: "HI",
    idaho: "ID",
    illinois: "IL",
    indiana: "IN",
    iowa: "IA",
    kansas: "KS",
    kentucky: "KY",
    louisiana: "LA",
    maine: "ME",
    maryland: "MD",
    massachusetts: "MA",
    michigan: "MI",
    minnesota: "MN",
    mississippi: "MS",
    missouri: "MO",
    montana: "MT",
    nebraska: "NE",
    nevada: "NV",
    "new hampshire": "NH",
    "new jersey": "NJ",
    "new mexico": "NM",
    "new york": "NY",
    "north carolina": "NC",
    "north dakota": "ND",
    ohio: "OH",
    oklahoma: "OK",
    oregon: "OR",
    pennsylvania: "PA",
    "rhode island": "RI",
    "south carolina": "SC",
    "south dakota": "SD",
    tennessee: "TN",
    texas: "TX",
    utah: "UT",
    vermont: "VT",
    virginia: "VA",
    washington: "WA",
    "west virginia": "WV",
    wisconsin: "WI",
    wyoming: "WY",
  };
  return map[t.toLowerCase()] ?? t.slice(0, 12);
}

function formatRevenue(value: string | number | null | undefined) {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

function formatReceived(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function mapGeneralStageToLeadStage(
  generalStage: string | null | undefined,
  stage: string | null | undefined,
  deadLead: boolean | null | undefined,
): LeadStage {
  if (deadLead) return "lost";
  const g = (generalStage || "").toLowerCase();
  const s = (stage || "").toLowerCase();
  const blob = `${g} ${s}`;

  if (g === "dead" || /\blost\b/.test(blob)) return "lost";
  if (
    g === "payment requested" ||
    g === "payment received" ||
    g === "servicing" ||
    /\bbound\b/.test(blob)
  ) {
    return "bound";
  }
  if (
    g === "quote pitched" ||
    g === "quote received" ||
    g === "quote conveyed" ||
    /\bquote\b/.test(blob)
  ) {
    return "quoted";
  }
  return "ingested";
}

function mapRegistryStage(rstage: string | null | undefined, opsStage: string | null): LeadStage {
  const r = (rstage || "").toLowerCase();
  if (r === "lost" || opsStage === "deprioritized") return "lost";
  if (r === "bound" || r === "won") return "bound";
  if (r === "quoted" || r === "in_market" || r === "quote") return "quoted";
  return "ingested";
}

function businessNameFromOrg(org: string) {
  const via = org.split(/\s·\svia\s/i)[0]?.trim();
  return via || org;
}

function leadFromBb(
  row: BbCompanyRow,
  extras?: { classLabel?: string; notes?: string },
): PartnerLead {
  const stage = mapGeneralStageToLeadStage(
    row.general_stage,
    row.stage,
    row.dead_lead,
  );
  const producer = formatProducer(row.producer_assigned);
  const detailBits = [
    row.general_stage || row.stage || "In Harper pipeline",
    extras?.notes,
  ].filter(Boolean);

  return {
    id: `BB-${row.id}`,
    business: row.company_name,
    classLabel: extras?.classLabel || "Commercial",
    state: formatState(row.company_state),
    revenue: formatRevenue(row.company_annual_revenue_usd),
    received: formatReceived(row.created_at),
    owner: `${stageLabelOwner(stage)} · ${producer}`,
    statusDetail: detailBits.join(" — ").slice(0, 280),
    premium: null,
    stage,
  };
}

function stageLabelOwner(stage: LeadStage) {
  switch (stage) {
    case "ingested":
      return "Intake";
    case "quoted":
      return "Quoted";
    case "bound":
      return "Bound";
    case "lost":
      return "Lost";
  }
}

function leadFromOpsOnly(row: OpsReferredRow, meta: ReferredDealMeta): PartnerLead {
  const stage = mapRegistryStage(meta.rstage, row.stage);
  const producer = formatProducer(meta.producer || row.status_label || undefined);
  return {
    id: `RD-${row.id.slice(0, 8)}`,
    business: businessNameFromOrg(row.org),
    classLabel: meta.line || row.vertical || "Commercial",
    state: "—",
    revenue: "—",
    received: formatReceived(meta.intro || row.created_at),
    owner: `${stageLabelOwner(stage)} · ${producer}`,
    statusDetail: (row.status_label || meta.notes || "Partner referral").slice(0, 280),
    premium: null,
    stage,
  };
}

async function loadOpsReferredDeals(agencyId: string): Promise<OpsReferredRow[]> {
  const matcher = LIVE_AGENCY_MATCHERS[agencyId];
  if (!matcher) return [];

  const sql = getSql();
  const rows = await sql<OpsReferredRow[]>`
    select
      id::text as id,
      org,
      vertical,
      contact_name,
      contact_email,
      stage,
      status_label,
      summary,
      updated_at::text as updated_at,
      created_at::text as created_at
    from partnerships.partnership_accounts
    where summary ilike 'type:referred-deal%'
    order by updated_at desc nulls last
  `;

  return rows.filter((row) => {
    const meta = parseReferredMeta(row.summary);
    const partner = meta?.partner || row.org;
    return matcher.test(partner);
  });
}

type FormReferralRow = {
  id: string;
  business_name: string;
  contact_name: string;
  class_label: string;
  state: string;
  revenue: string;
  notes: string | null;
  status: string;
  ingest_status: string;
  created_at: string;
};

async function loadFormReferrals(agencyId: string): Promise<FormReferralRow[]> {
  const sql = getSql();
  return sql<FormReferralRow[]>`
    select
      id::text as id,
      business_name,
      contact_name,
      class_label,
      state,
      revenue,
      notes,
      status,
      ingest_status,
      created_at::text as created_at
    from partnerships.partner_referrals
    where partner_id = ${agencyId}
    order by created_at desc
    limit 100
  `;
}

function leadFromFormRow(row: FormReferralRow): PartnerLead {
  const stage: LeadStage =
    row.status === "lost" || row.status === "closed_lost"
      ? "lost"
      : row.status === "bound"
        ? "bound"
        : row.status === "quoted"
          ? "quoted"
          : "ingested";
  const ingestNote =
    row.ingest_status === "failed"
      ? "Saved to partnerships — Harper intake failed (retry needed)."
      : row.ingest_status === "deferred"
        ? "Saved for partnerships — not sent through Weblead."
        : row.ingest_status === "sent"
          ? "Sent into Harper intake."
          : "Saved — intake pending.";
  return {
    id: `FR-${row.id.slice(0, 8)}`,
    business: row.business_name,
    classLabel: row.class_label || "Commercial",
    state: row.state || "—",
    revenue: row.revenue || "—",
    received: formatReceived(row.created_at),
    owner: `${stageLabelOwner(stage)} · Form submit`,
    statusDetail: [ingestNote, row.notes].filter(Boolean).join(" — ").slice(0, 280),
    premium: null,
    stage,
  };
}

/**
 * Live Partner Track leads: ops referred-deal registry + live BB company stages.
 * Falls back to sample leads only when live mode is off for the agency.
 */
export async function getLiveLeadsForAgency(
  agency: PartnerAgency,
): Promise<{ leads: PartnerLead[]; source: "live" | "sample" | "live-degraded" }> {
  if (!agencyUsesLiveLeads(agency.id)) {
    return { leads: agency.leads, source: "sample" };
  }

  try {
    const [opsRows, formRows] = await Promise.all([
      loadOpsReferredDeals(agency.id),
      loadFormReferrals(agency.id).catch((err) => {
        console.error("loadFormReferrals failed:", err);
        return [] as FormReferralRow[];
      }),
    ]);
    const tag = partnerTag(agency.shortName);

    let tagged: BbCompanyRow[] = [];
    let byId = new Map<number, BbCompanyRow>();

    if (hasBbAccess()) {
      const bbIds = opsRows
        .map((r) => parseReferredMeta(r.summary)?.bb)
        .filter((n): n is number => typeof n === "number" && n > 0);

      const [idRows, tagRows] = await Promise.all([
        fetchCompaniesByIds(bbIds),
        fetchCompaniesByPartnerTag(tag).catch(() => [] as BbCompanyRow[]),
      ]);
      tagged = tagRows;
      byId = new Map(idRows.map((r) => [r.id, r]));
      for (const row of tagRows) byId.set(row.id, row);
    }

    const leads: PartnerLead[] = [];
    const seenBb = new Set<number>();
    const seenBusiness = new Set<string>();

    for (const row of opsRows) {
      const meta = parseReferredMeta(row.summary) || {};
      const bbId = typeof meta.bb === "number" && meta.bb > 0 ? meta.bb : null;
      if (bbId && byId.has(bbId)) {
        seenBb.add(bbId);
        const lead = leadFromBb(byId.get(bbId)!, {
          classLabel: meta.line || row.vertical || undefined,
          notes: row.status_label || meta.notes,
        });
        seenBusiness.add(lead.business.toLowerCase());
        leads.push(lead);
        continue;
      }
      const lead = leadFromOpsOnly(row, meta);
      seenBusiness.add(lead.business.toLowerCase());
      leads.push(lead);
    }

    for (const row of tagged) {
      if (seenBb.has(row.id)) continue;
      seenBb.add(row.id);
      const lead = leadFromBb(row);
      seenBusiness.add(lead.business.toLowerCase());
      leads.push(lead);
    }

    // Form table rows (so test fills show even before BB / referred-deal mirror).
    for (const row of formRows) {
      const key = row.business_name.toLowerCase();
      if (seenBusiness.has(key)) continue;
      seenBusiness.add(key);
      leads.push(leadFromFormRow(row));
    }

    leads.sort((a, b) => {
      const da = Date.parse(a.received) || 0;
      const db = Date.parse(b.received) || 0;
      return db - da;
    });

    return {
      leads,
      source: hasBbAccess() ? "live" : "live-degraded",
    };
  } catch (err) {
    console.error("getLiveLeadsForAgency failed:", err);
    // Prefer empty live view over stale sample for real partners.
    return { leads: [], source: "live-degraded" };
  }
}

export type RegisterReferralInput = {
  agency: PartnerAgency;
  businessName: string;
  contactName: string;
  contactEmail: string;
  classLabel: string;
  notes?: string;
  phone?: string;
};

/** Persist a referred-deal stub so the portal lists form referrals immediately. */
export async function registerPartnerReferral(input: RegisterReferralInput) {
  const sql = getSql();
  const intro = new Date().toISOString().slice(0, 10);
  const meta: ReferredDealMeta = {
    partner: input.agency.name,
    bb: null,
    rstage: "intake",
    intro,
    notes: input.notes || "Submitted via Partner Track /track/refer.",
    next: "Match BB company when intake creates the opportunity.",
    producer: "Harper intake",
    line: input.classLabel,
    phone: input.phone || undefined,
    email: input.contactEmail,
  };

  await sql`
    insert into partnerships.partnership_accounts (
      org,
      vertical,
      contact_name,
      contact_email,
      stage,
      track_type,
      status_label,
      cost,
      deadline_label,
      summary,
      sort_order,
      funnel
    ) values (
      ${`${input.businessName} · via ${input.agency.name}`},
      ${input.classLabel},
      ${input.contactName},
      ${input.contactEmail},
      ${"in-play"},
      ${"account"},
      ${"Ingested · sent to Harper intake"},
      ${null},
      ${"Match BB company id when created"},
      ${`type:referred-deal | ${JSON.stringify(meta)}`},
      ${20},
      ${"agency"}
    )
  `;
}
