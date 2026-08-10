import {
  appetiteLabel,
  parseAppetiteFromNotes,
  stripAppetiteTag,
} from "@/lib/blitz-track/appetite";
import { getSql } from "@/lib/db";
import {
  fetchCompaniesByIds,
  hasBbAccess,
  type BbCompanyRow,
} from "@/lib/track/bb-client";
import {
  summarizeLeads,
  type LeadStage,
  type PartnerLead,
} from "@/lib/track/data";

export const BLITZ_TRACK = {
  id: "blitz",
  name: "Blitz Insurance",
  shortName: "Blitz",
  referralInbox: "blitz@harperinsure.com",
} as const;

type BlitzFormRow = {
  id: string;
  contact_name: string;
  business_name: string;
  email: string;
  phone: string;
  state: string;
  revenue: string;
  class_label: string;
  status: string;
  ingest_status: string;
  notes: string | null;
  created_at: string;
};

type DealRow = {
  id: string;
  org: string;
  vertical: string | null;
  contact_name: string | null;
  stage: string | null;
  status_label: string | null;
  summary: string | null;
  created_at: string | null;
};

type ReferredMeta = {
  partner?: string;
  bb?: number | null;
  rstage?: string;
  intro?: string;
  notes?: string;
  producer?: string;
  line?: string;
};

const REVENUE_LABELS: Record<string, string> = {
  "50k_100k": "$50k–$100k",
  "100k_250k": "$100k–$250k",
  "250k_500k": "$250k–$500k",
  "500k_1m": "$500k–$1M",
  "1m_5m": "$1M–$5M",
  "5m_plus": "$5M+",
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
  if (!raw) return "Harper intake";
  if (raw.includes(" ") && !raw.includes("_")) return raw;
  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function formatRevenueCode(code: string | null | undefined) {
  if (!code) return "—";
  return REVENUE_LABELS[code] || code;
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

function stageOwner(stage: LeadStage) {
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

function businessFromOrg(org: string) {
  return org.split(/\s·\svia\s/i)[0]?.trim() || org;
}

function isBlitzPartner(partner: string | null | undefined, org: string) {
  const blob = `${partner || ""} ${org}`.toLowerCase();
  return /\bblitz\b/.test(blob);
}

/**
 * Shared Blitz board: every /blitz + /blitz-refer submit, plus Blitz referred-deals.
 * Not scoped per Clerk user — any allowed Blitz email sees the same list.
 */
export async function getBlitzTrackLeads(): Promise<{
  leads: PartnerLead[];
  source: "live" | "live-degraded";
}> {
  const sql = getSql();

  try {
    const [formRows, deals] = await Promise.all([
      sql<BlitzFormRow[]>`
        select
          id::text as id,
          contact_name,
          business_name,
          email,
          phone,
          state,
          revenue,
          class_label,
          status,
          ingest_status,
          notes,
          created_at::text as created_at
        from partnerships.partner_blitz
        order by created_at desc
      `.catch(() => [] as BlitzFormRow[]),
      sql<DealRow[]>`
        select
          id::text as id,
          org,
          vertical,
          contact_name,
          stage,
          status_label,
          summary,
          created_at::text as created_at
        from partnerships.partnership_accounts
        where summary ilike 'type:referred-deal%'
          and (
            org ilike '%blitz%'
            or summary ilike '%"partner":"Blitz%'
            or summary ilike '%Blitz Insurance%'
          )
        order by updated_at desc nulls last
      `.catch(() => [] as DealRow[]),
    ]);

    const bbIds = deals
      .map((d) => parseMeta(d.summary)?.bb)
      .filter((n): n is number => typeof n === "number" && n > 0);

    let byBb = new Map<number, BbCompanyRow>();
    if (hasBbAccess() && bbIds.length) {
      try {
        const rows = await fetchCompaniesByIds(bbIds);
        byBb = new Map(rows.map((r) => [r.id, r]));
      } catch (err) {
        console.error("blitz-track BB enrich failed:", err);
      }
    }

    const leads: PartnerLead[] = [];
    const seenBusiness = new Set<string>();

    for (const deal of deals) {
      const meta = parseMeta(deal.summary) || {};
      if (!isBlitzPartner(meta.partner, deal.org)) continue;

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

      const producer = formatProducer(
        bb?.producer_assigned || meta.producer || null,
      );
      leads.push({
        id: bbId ? `BB-${bbId}` : `RD-${deal.id.slice(0, 8)}`,
        business,
        classLabel: meta.line || deal.vertical || "Commercial",
        state: bb?.company_state
          ? bb.company_state.length === 2
            ? bb.company_state.toUpperCase()
            : bb.company_state.slice(0, 12)
          : "—",
        revenue: "—",
        received: formatReceived(meta.intro || deal.created_at),
        owner: `${stageOwner(stage)} · ${producer}`,
        statusDetail: (
          deal.status_label ||
          meta.notes ||
          (bb ? bb.general_stage || bb.stage || "In Harper pipeline" : "Blitz referral")
        ).slice(0, 280),
        premium: null,
        stage,
      });
    }

    for (const row of formRows) {
      const key = row.business_name.toLowerCase();
      if (seenBusiness.has(key)) continue;
      seenBusiness.add(key);
      const stage = mapFormStatus(row.status, row.ingest_status);
      const appetite = parseAppetiteFromNotes(row.notes);
      const appetiteBit = appetiteLabel(appetite);
      const noteBody = stripAppetiteTag(row.notes);
      leads.push({
        id: `BZ-${row.id.slice(0, 8)}`,
        business: row.business_name || "Unnamed business",
        classLabel: row.class_label || "Commercial",
        state: row.state || "—",
        revenue: formatRevenueCode(row.revenue),
        received: formatReceived(row.created_at),
        owner: `${stageOwner(stage)} · Harper intake`,
        statusDetail: (
          [
            appetiteBit,
            noteBody,
            !appetiteBit && !noteBody
              ? row.ingest_status === "deferred"
                ? "Saved from Blitz form — Harper will chase"
                : `Status: ${row.status}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")
        ).slice(0, 280),
        premium: null,
        stage,
      });
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
    console.error("getBlitzTrackLeads failed:", err);
    return { leads: [], source: "live-degraded" };
  }
}

export function blitzTrackSummary(leads: PartnerLead[]) {
  return summarizeLeads(leads);
}
