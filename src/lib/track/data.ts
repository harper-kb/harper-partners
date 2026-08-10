export type LeadStage = "ingested" | "quoted" | "bound" | "lost";

export type PartnerLead = {
  id: string;
  business: string;
  classLabel: string;
  state: string;
  revenue: string;
  received: string;
  owner: string;
  statusDetail: string;
  premium: string | null;
  stage: LeadStage;
};

export type PartnerAgency = {
  id: string;
  name: string;
  shortName: string;
  /** Exact emails that can open this agency's track view */
  emails: string[];
  /** Domains that map to this agency (any *@domain) */
  domains: string[];
  referralInbox: string;
  leads: PartnerLead[];
};

/**
 * Preview partner roster — agency-scoped sample leads for /track.
 * Live wiring will replace this with attributed opportunities by partner.
 */
export const PARTNER_AGENCIES: PartnerAgency[] = [
  {
    id: "blitz",
    name: "Blitz Insurance",
    shortName: "Blitz",
    emails: ["landon@blitzinsurance.com", "portal@blitzinsurance.com"],
    domains: ["blitzinsurance.com"],
    referralInbox: "blitz@harperinsure.com",
    leads: [
      {
        id: "BZ-1042",
        business: "Ink & Iron Tattoo Co.",
        classLabel: "Tattoo parlor",
        state: "CA",
        revenue: "$250k–$500k",
        received: "Jul 29, 2026",
        owner: "Intake · Tier 2",
        statusDetail: "Awaiting customer callback (attempt 2 of 7).",
        premium: null,
        stage: "ingested",
      },
      {
        id: "BZ-1041",
        business: "Cloud Nine Vape Lounge",
        classLabel: "Vape store",
        state: "TX",
        revenue: "$100k–$250k",
        received: "Jul 28, 2026",
        owner: "Intake · Tier 1",
        statusDetail: "Warm email from Blitz — form incomplete.",
        premium: null,
        stage: "ingested",
      },
      {
        id: "BZ-1038",
        business: "Harbor View Cannabis",
        classLabel: "Cannabis retail",
        state: "CA",
        revenue: "$500k–$1M",
        received: "Jul 22, 2026",
        owner: "Quoting · Markets out",
        statusDetail: "Indicative quote shared; waiting on owner decision.",
        premium: "$18,400",
        stage: "quoted",
      },
      {
        id: "BZ-1036",
        business: "Summit Event Collective",
        classLabel: "Special events",
        state: "CO",
        revenue: "$250k–$500k",
        received: "Jul 18, 2026",
        owner: "Quoting · UW review",
        statusDetail: "Carrier questions on crowd control — Harper chasing.",
        premium: "$9,250",
        stage: "quoted",
      },
      {
        id: "BZ-1029",
        business: "Northstar Contractors LLC",
        classLabel: "General contractor",
        state: "AZ",
        revenue: "$1M–$2.5M",
        received: "Jul 8, 2026",
        owner: "Bound · Policy issued",
        statusDetail: "GL + tools bound. Commission share active.",
        premium: "$4,975",
        stage: "bound",
      },
      {
        id: "BZ-1024",
        business: "Lumen Retail Group",
        classLabel: "Retail",
        state: "NV",
        revenue: "$100k–$250k",
        received: "Jul 2, 2026",
        owner: "Bound · Active",
        statusDetail: "BOP bound; COI sent to landlord.",
        premium: null,
        stage: "bound",
      },
      {
        id: "BZ-1019",
        business: "Desert Sky Vacants LLC",
        classLabel: "Vacant commercial",
        state: "AZ",
        revenue: "$250k–$500k",
        received: "Jun 24, 2026",
        owner: "Lost · Bound elsewhere",
        statusDetail: "Customer stayed with incumbent on price.",
        premium: null,
        stage: "lost",
      },
      {
        id: "BZ-1015",
        business: "Pulse Fitness Studio",
        classLabel: "Fitness",
        state: "CA",
        revenue: "$100k–$250k",
        received: "Jun 19, 2026",
        owner: "Lost · No response",
        statusDetail: "Seven outreach attempts; closed after no reply.",
        premium: null,
        stage: "lost",
      },
    ],
  },
  {
    id: "macario",
    name: "Macario Insurance",
    shortName: "Macario Insurance",
    emails: [
      "david@macarioinsurance.com",
      "davidmacario@macarioinsurance.com",
      "macario@harperinsure.com",
    ],
    domains: ["macarioinsurance.com"],
    referralInbox: "partners@harperinsure.com",
    /** Live from Big Brother + partnerships referred-deal registry. */
    leads: [],
  },
  {
    id: "brent",
    name: "Brent Underwood — Farmers Insurance",
    shortName: "Brent",
    emails: [
      "bunderwood@farmersagent.com",
      "brent@farmersagent.com",
      "brent.underwood@farmersagent.com",
    ],
    domains: [],
    referralInbox: "partnerships@harperinsure.com",
    /** Live from Big Brother + partnerships referred-deal registry. */
    leads: [],
  },
  {
    id: "faith",
    name: "Faith Insurance Solutions",
    shortName: "Faith",
    emails: [
      "faith@faithinsurancesolutions.com",
      "faithbratlie@gmail.com",
      "faith@harperinsure.com",
    ],
    domains: ["faithinsurancesolutions.com"],
    referralInbox: "partnerships@harperinsure.com",
    leads: [],
  },
  {
    id: "demo",
    name: "Harper Demo Agency",
    shortName: "Demo",
    emails: [
      "demo@harperinsure.com",
      "partner@harperinsure.com",
      "preview@harperinsure.com",
    ],
    domains: [],
    referralInbox: "partners@harperinsure.com",
    leads: [
      {
        id: "DM-1001",
        business: "Bayshore Cafe Group",
        classLabel: "Restaurant",
        state: "CA",
        revenue: "$250k–$500k",
        received: "Jul 27, 2026",
        owner: "Intake · Tier 1",
        statusDetail: "Warm intro received — awaiting owner callback.",
        premium: null,
        stage: "ingested",
      },
      {
        id: "DM-1000",
        business: "Ridgeline Landscaping",
        classLabel: "Landscaping",
        state: "OR",
        revenue: "$100k–$250k",
        received: "Jul 12, 2026",
        owner: "Bound · Policy issued",
        statusDetail: "GL bound. Commission share active.",
        premium: "$2,140",
        stage: "bound",
      },
    ],
  },
  {
    id: "joanne-test",
    name: "Joanne Test Agency",
    shortName: "Joanne Test",
    emails: ["joanne@harperinsure.com"],
    domains: [],
    referralInbox: "partners@harperinsure.com",
    /** Empty starter — form fills + live BB/registry populate the dashboard. */
    leads: [],
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return EMAIL_RE.test(normalizeEmail(email));
}

export function findAgencyByEmail(email: string): PartnerAgency | null {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;

  const exact = PARTNER_AGENCIES.find((agency) =>
    agency.emails.some((e) => e.toLowerCase() === normalized),
  );
  if (exact) return exact;

  const domain = normalized.split("@")[1] ?? "";
  return (
    PARTNER_AGENCIES.find((agency) =>
      agency.domains.some((d) => d.toLowerCase() === domain),
    ) ?? null
  );
}

export function getAgencyById(id: string): PartnerAgency | null {
  return PARTNER_AGENCIES.find((agency) => agency.id === id) ?? null;
}

export function summarizeLeads(leads: PartnerLead[]) {
  const byStage = {
    ingested: leads.filter((l) => l.stage === "ingested").length,
    quoted: leads.filter((l) => l.stage === "quoted").length,
    bound: leads.filter((l) => l.stage === "bound").length,
    lost: leads.filter((l) => l.stage === "lost").length,
  };
  const premiumBound = leads
    .filter((l) => l.stage === "bound" && l.premium)
    .reduce((sum, l) => {
      const n = Number(String(l.premium).replace(/[^0-9.]/g, ""));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  const inPipeline = byStage.ingested + byStage.quoted;

  return {
    byStage,
    premiumBound,
    inPipeline,
    referred: leads.length,
  };
}

export const STAGE_META: Record<
  LeadStage,
  { label: string; title: string; blurb: string }
> = {
  ingested: {
    label: "Awaiting customer response",
    title: "Awaiting customer response",
    blurb:
      "Harper has the referral and intake is chasing. Call, text, and email until we get the customer on the phone.",
  },
  quoted: {
    label: "Quoted",
    title: "Quoted · decision pending",
    blurb:
      "Markets are out or indicative pricing is back. Harper is working the customer toward a bind.",
  },
  bound: {
    label: "Bound",
    title: "Bound · commission share active",
    blurb:
      "Policy is live. Your commission share tracks while the account stays in force.",
  },
  lost: {
    label: "Lost",
    title: "Lost · closed without bind",
    blurb:
      "These referrals did not bind with Harper — price, timing, or no response.",
  },
};
