/**
 * Read-only Big Brother (Harper Prod) via Supabase Management API.
 * Prefer /database/query/read-only so the token cannot mutate Prod.
 */

export type BbCompanyRow = {
  id: number;
  company_name: string;
  stage: string | null;
  general_stage: string | null;
  producer_assigned: string | null;
  lead_type: string | null;
  company_state: string | null;
  company_description: string | null;
  company_annual_revenue_usd: string | number | null;
  created_at: string | null;
  dead_lead: boolean | null;
};

const PROD_REF =
  process.env.HARPER_PROD_PROJECT_REF || "ehvopzzidrfxtvsfrfkq";

function accessToken() {
  return (
    process.env.HARPER_PROD_SUPABASE_ACCESS_TOKEN ||
    process.env.SUPABASE_ACCESS_TOKEN ||
    ""
  );
}

export function hasBbAccess() {
  return Boolean(accessToken());
}

async function runReadOnlyQuery<T>(query: string): Promise<T[]> {
  const token = accessToken();
  if (!token) {
    throw new Error("HARPER_PROD_SUPABASE_ACCESS_TOKEN is not set");
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROD_REF}/database/query/read-only`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BB query failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as T[] | { error?: string };
  if (!Array.isArray(data)) {
    throw new Error(
      `BB query unexpected response: ${JSON.stringify(data).slice(0, 300)}`,
    );
  }
  return data;
}

function sqlStringLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function fetchCompaniesByIds(
  ids: number[],
): Promise<BbCompanyRow[]> {
  const unique = [...new Set(ids.filter((n) => Number.isFinite(n) && n > 0))];
  if (!unique.length) return [];

  const query = `
    select
      id,
      company_name,
      stage::text as stage,
      general_stage::text as general_stage,
      producer_assigned,
      lead_type,
      company_state,
      company_description,
      company_annual_revenue_usd,
      created_at,
      coalesce(dead_lead, false) as dead_lead
    from public.companies
    where id in (${unique.join(",")})
  `;
  return runReadOnlyQuery<BbCompanyRow>(query);
}

/** Companies tagged by Partner Track referral form: [PARTNER:TAG] in description. */
export async function fetchCompaniesByPartnerTag(
  tag: string,
): Promise<BbCompanyRow[]> {
  const cleaned = tag.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
  if (!cleaned) return [];

  const needle = sqlStringLiteral(`%[PARTNER:${cleaned}]%`);
  const query = `
    select
      id,
      company_name,
      stage::text as stage,
      general_stage::text as general_stage,
      producer_assigned,
      lead_type,
      company_state,
      company_description,
      company_annual_revenue_usd,
      created_at,
      coalesce(dead_lead, false) as dead_lead
    from public.companies
    where company_description ilike ${needle}
    order by created_at desc nulls last
    limit 100
  `;
  return runReadOnlyQuery<BbCompanyRow>(query);
}
