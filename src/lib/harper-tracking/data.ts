import { getSql } from "@/lib/db";
import {
  fetchCompaniesByIds,
  hasBbAccess,
  type BbCompanyRow,
} from "@/lib/track/bb-client";
import type { LeadStage } from "@/lib/track/data";

export type HarperTrackingReferral = {
  id: string;
  contactName: string;
  businessName: string;
  email: string | null;
  phone: string | null;
  classLabel: string;
  stage: LeadStage;
  stageLabel: string;
  statusDetail: string;
  received: string;
  bbCompanyId: number | null;
  producer: string | null;
};

export type HarperTrackingAgency = {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  statusLabel: string | null;
  referralCount: number;
  byStage: Record<LeadStage, number>;
  referrals: HarperTrackingReferral[];
};

type AgencyRow = {
  id: string;
  org: string;
  contact_name: string | null;
  contact_email: string | null;
  status_label: string | null;
};

type DealRow = {
  id: string;
  org: string;
  vertical: string | null;
  contact_name: string | null;
  contact_email: string | null;
  stage: string | null;
  status_label: string | null;
  summary: string | null;
  created_at: string | null;
};

type FormReferralRow = {
  id: string;
  partner_id: string;
  partner_name: string;
  contact_name: string;
  business_name: string;
  email: string;
  phone: string;
  class_label: string;
  status: string;
  ingest_status: string;
  created_at: string;
};

type BlitzRow = {
  id: string;
  contact_name: string;
  business_name: string;
  email: string;
  phone: string;
  class_label: string;
  status: string;
  ingest_status: string;
  created_at: string;
};

type ReferredMeta = {
  partner?: string;
  bb?: number | null;
  rstage?: string;
  intro?: string;
  notes?: string;
  producer?: string;
  line?: string;
  phone?: string;
  email?: string;
};

const STAGE_LABELS: Record<LeadStage, string> = {
  ingested: "Intake / ingested",
  quoted: "Quoted",
  bound: "Bound",
  lost: "Lost",
};

function parseMeta(summary: string | null): ReferredMeta | null {
  if (!summary?.toLowerCase().includes("type:referred-deal")) return null;
  const pipe = summary.indexOf("|");
  const json = pipe >= 0 ? summary.slice(pipe + 1).trim() : "";
  if (!json.startsWith("{")) return null;
  try {
    return JSON.parse(json) as ReferredMeta;
  } catch {
    return null;
  }
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

function formatProducer(raw: string | null | undefined) {
  if (!raw) return null;
  if (raw.includes(" ") && !raw.includes("_")) return raw;
  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function mapBbStage(row: BbCompanyRow): LeadStage {
  if (row.dead_lead) return "lost";
  const g = (row.general_stage || "").toLowerCase();
  const s = (row.stage || "").toLowerCase();
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

function mapRegistryStage(
  rstage: string | null | undefined,
  opsStage: string | null | undefined,
): LeadStage {
  const r = (rstage || "").toLowerCase();
  if (r === "lost" || opsStage === "deprioritized") return "lost";
  if (r === "bound" || r === "won") return "bound";
  if (r === "quoted" || r === "in_market" || r === "quote") return "quoted";
  return "ingested";
}

function mapFormStatus(status: string, ingestStatus: string): LeadStage {
  const s = status.toLowerCase();
  if (s === "lost" || s === "closed_lost") return "lost";
  if (s === "bound") return "bound";
  if (s === "quoted") return "quoted";
  if (ingestStatus === "deferred" || ingestStatus === "pending") return "ingested";
  return "ingested";
}

function emptyByStage(): Record<LeadStage, number> {
  return { ingested: 0, quoted: 0, bound: 0, lost: 0 };
}

function agencyKeyFromOrg(org: string) {
  return org
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function partnerMatchesAgency(partner: string, agencyOrg: string) {
  const p = partner.toLowerCase();
  const a = agencyOrg.toLowerCase();
  // Match on shared distinctive tokens (agency / last name style)
  if (p.includes(a) || a.includes(p)) return true;
  const agencyBits = a
    .split(/[—\-–,]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 3);
  return agencyBits.some((bit) => p.includes(bit));
}

function businessFromOrg(org: string) {
  return org.split(/\s·\svia\s/i)[0]?.trim() || org;
}

/**
 * Internal Harper view: signed (handshake) agencies + their referrals.
 */
export async function getHarperTrackingBoard(): Promise<HarperTrackingAgency[]> {
  const sql = getSql();

  const [agencies, deals, formRefs, blitzRows] = await Promise.all([
    sql<AgencyRow[]>`
      select
        id::text as id,
        org,
        contact_name,
        contact_email,
        status_label
      from partnerships.partnership_accounts
      where funnel = 'agency'
        and stage = 'committed'
        and org not ilike '%outreach campaign%'
      order by sort_order nulls last, org
    `,
    sql<DealRow[]>`
      select
        id::text as id,
        org,
        vertical,
        contact_name,
        contact_email,
        stage,
        status_label,
        summary,
        created_at::text as created_at
      from partnerships.partnership_accounts
      where summary ilike 'type:referred-deal%'
      order by updated_at desc nulls last
    `,
    sql<FormReferralRow[]>`
      select
        id::text as id,
        partner_id,
        partner_name,
        contact_name,
        business_name,
        email,
        phone,
        class_label,
        status,
        ingest_status,
        created_at::text as created_at
      from partnerships.partner_referrals
      order by created_at desc
    `.catch(() => [] as FormReferralRow[]),
    sql<BlitzRow[]>`
      select
        id::text as id,
        contact_name,
        business_name,
        email,
        phone,
        class_label,
        status,
        ingest_status,
        created_at::text as created_at
      from partnerships.partner_blitz
      order by created_at desc
    `.catch(() => [] as BlitzRow[]),
  ]);

  // Ensure Blitz appears even if not in committed roster yet.
  const hasBlitz = agencies.some((a) => /blitz/i.test(a.org));
  const roster: AgencyRow[] = hasBlitz
    ? agencies
    : [
        ...agencies,
        {
          id: "blitz-synthetic",
          org: "Blitz Insurance",
          contact_name: "Landon",
          contact_email: "landon@blitzinsurance.com",
          status_label: "Live partner — public /blitz referral form",
        },
      ];

  const bbIds = deals
    .map((d) => parseMeta(d.summary)?.bb)
    .filter((n): n is number => typeof n === "number" && n > 0);

  let byBb = new Map<number, BbCompanyRow>();
  if (hasBbAccess() && bbIds.length) {
    try {
      const rows = await fetchCompaniesByIds(bbIds);
      byBb = new Map(rows.map((r) => [r.id, r]));
    } catch (err) {
      console.error("harper-tracking BB enrich failed:", err);
    }
  }

  const board: HarperTrackingAgency[] = roster.map((agency) => {
    const referrals: HarperTrackingReferral[] = [];
    const seenBusiness = new Set<string>();

    for (const deal of deals) {
      const meta = parseMeta(deal.summary) || {};
      const partner = meta.partner || deal.org;
      if (!partnerMatchesAgency(partner, agency.org)) continue;

      const bbId =
        typeof meta.bb === "number" && meta.bb > 0 ? meta.bb : null;
      const bb = bbId ? byBb.get(bbId) : undefined;
      const stage = bb
        ? mapBbStage(bb)
        : mapRegistryStage(meta.rstage, deal.stage);
      const business = bb?.company_name || businessFromOrg(deal.org);
      const key = business.toLowerCase();
      if (seenBusiness.has(key)) continue;
      seenBusiness.add(key);

      referrals.push({
        id: `deal-${deal.id}`,
        contactName: deal.contact_name || "—",
        businessName: business,
        email: meta.email || deal.contact_email,
        phone: meta.phone || null,
        classLabel: meta.line || deal.vertical || "Commercial",
        stage,
        stageLabel: bb?.general_stage || STAGE_LABELS[stage],
        statusDetail:
          deal.status_label ||
          meta.notes ||
          (bb ? `${bb.general_stage || bb.stage}` : "Partner referral"),
        received: formatReceived(meta.intro || deal.created_at),
        bbCompanyId: bbId,
        producer: formatProducer(
          bb?.producer_assigned || meta.producer || null,
        ),
      });
    }

    // Partner Track form rows
    for (const row of formRefs) {
      if (!partnerMatchesAgency(row.partner_name, agency.org)) continue;
      const key = row.business_name.toLowerCase();
      if (seenBusiness.has(key)) continue;
      seenBusiness.add(key);
      const stage = mapFormStatus(row.status, row.ingest_status);
      referrals.push({
        id: `form-${row.id}`,
        contactName: row.contact_name,
        businessName: row.business_name,
        email: row.email,
        phone: row.phone,
        classLabel: row.class_label,
        stage,
        stageLabel: STAGE_LABELS[stage],
        statusDetail:
          row.ingest_status === "deferred"
            ? "Saved for partnerships — not sent through Weblead"
            : row.ingest_status === "sent"
              ? "Sent into Harper intake"
              : `Form status: ${row.status}`,
        received: formatReceived(row.created_at),
        bbCompanyId: null,
        producer: null,
      });
    }

    // Blitz public form
    if (/blitz/i.test(agency.org)) {
      for (const row of blitzRows) {
        const key = row.business_name.toLowerCase();
        if (seenBusiness.has(key)) continue;
        seenBusiness.add(key);
        const stage = mapFormStatus(row.status, row.ingest_status);
        referrals.push({
          id: `blitz-${row.id}`,
          contactName: row.contact_name,
          businessName: row.business_name,
          email: row.email,
          phone: row.phone,
          classLabel: row.class_label,
          stage,
          stageLabel: STAGE_LABELS[stage],
          statusDetail:
            row.ingest_status === "deferred"
              ? "Blitz form — saved, no Weblead / inquiry SMS"
              : `Status: ${row.status}`,
          received: formatReceived(row.created_at),
          bbCompanyId: null,
          producer: null,
        });
      }
    }

    referrals.sort((a, b) => {
      const da = Date.parse(a.received) || 0;
      const db = Date.parse(b.received) || 0;
      return db - da;
    });

    const byStage = emptyByStage();
    for (const r of referrals) byStage[r.stage] += 1;

    return {
      id: agency.id || agencyKeyFromOrg(agency.org),
      name: agency.org,
      contactName: agency.contact_name,
      contactEmail: agency.contact_email,
      statusLabel: agency.status_label,
      referralCount: referrals.length,
      byStage,
      referrals,
    };
  });

  // Agencies with referrals first, then A–Z
  board.sort((a, b) => {
    if (b.referralCount !== a.referralCount) {
      return b.referralCount - a.referralCount;
    }
    return a.name.localeCompare(b.name);
  });

  return board;
}
