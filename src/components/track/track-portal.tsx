"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LeadStage, PartnerLead } from "@/lib/track/data";
import { STAGE_META } from "@/lib/track/data";

type AgencyView = {
  id: string;
  name: string;
  shortName: string;
  referralInbox: string;
  leads: PartnerLead[];
  summary: {
    byStage: Record<LeadStage, number>;
    premiumBound: number;
    inPipeline: number;
    referred: number;
  };
};

type SessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "signed-in"; email: string; agency: AgencyView };

const STAGES: LeadStage[] = ["ingested", "quoted", "bound", "lost"];

function formatMoney(n: number) {
  if (!n) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function TrackPortal() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<LeadStage>("ingested");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/track/session", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.authenticated) {
          setSession({
            status: "signed-in",
            email: data.email,
            agency: data.agency,
          });
          const counts = data.agency.summary.byStage as Record<
            LeadStage,
            number
          >;
          const firstWithLeads =
            STAGES.find((s) => (counts?.[s] ?? 0) > 0) ?? "ingested";
          setStage(firstWithLeads);
        } else {
          setSession({ status: "anonymous" });
        }
      } catch {
        if (!cancelled) setSession({ status: "anonymous" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/track/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not sign in.");
        return;
      }
      setSession({
        status: "signed-in",
        email: data.email,
        agency: data.agency,
      });
      const counts = data.agency.summary.byStage as Record<LeadStage, number>;
      const firstWithLeads =
        STAGES.find((s) => (counts?.[s] ?? 0) > 0) ?? "ingested";
      setStage(firstWithLeads);
      setQuery("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    await fetch("/api/track/session", { method: "DELETE" });
    setSession({ status: "anonymous" });
    setEmail("");
    setError(null);
  }

  if (session.status === "loading") {
    return (
      <div className="min-h-screen bg-ember-beige-02 flex items-center justify-center text-ember-muted text-sm">
        Opening partner track…
      </div>
    );
  }

  if (session.status === "anonymous") {
    return (
      <SignInScreen
        email={email}
        setEmail={setEmail}
        error={error}
        submitting={submitting}
        onSubmit={signIn}
      />
    );
  }

  return (
    <Dashboard
      email={session.email}
      agency={session.agency}
      stage={stage}
      setStage={setStage}
      query={query}
      setQuery={setQuery}
      onSignOut={signOut}
    />
  );
}

function SignInScreen({
  email,
  setEmail,
  error,
  submitting,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ember-beige-02">
      <section className="hero-prestige relative flex flex-col px-6 sm:px-10 lg:px-14 py-8 lg:py-10">
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/harper_name_logo.svg"
            alt="Harper"
            width={110}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ember-creme/60 leading-none border-l border-white/15 pl-3">
            Partners
          </span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[34rem] py-16 lg:py-0">
          <span className="eyebrow eyebrow-light">Harper Partners Track</span>
          <h1 className="display-serif text-white text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] font-normal leading-[1.08] m-0 mb-5">
            See where all your leads live{" "}
            <em className="accent-serif">right now.</em>
          </h1>
          <p className="text-ember-creme/75 text-[0.975rem] leading-relaxed m-0 max-w-[36ch]">
            When your agency refers a risk to Harper, this portal shows the path
            from intake to quote to bind — scoped to your agency only.
          </p>
        </div>

        <p className="relative z-10 text-ember-creme/45 text-xs m-0 hidden lg:block">
          Email-based access · sample data for layout review
        </p>
      </section>

      <section className="relative flex flex-col px-6 sm:px-10 lg:px-14 py-8 lg:py-10">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -right-[18%] -top-[8%] w-[70%] h-[55%] border border-ember-salmon/25 rounded-[50%] rotate-[-12deg]" />
          <div className="absolute -right-[8%] top-[18%] w-[48%] h-[42%] border border-ember-salmon/15 rounded-[50%] rotate-[-18deg]" />
        </div>

        <div className="relative z-10 flex justify-end">
          <Link
            href="/"
            className="text-sm text-ember-muted hover:text-ember-blue transition-colors no-underline"
          >
            Partner program
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center py-10">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-[420px] bg-white border border-ember-rule rounded-[10px] shadow-[0_18px_50px_rgba(29,58,71,0.08)] p-7 sm:p-8"
          >
            <h2 className="display-serif text-ember-blue text-[1.75rem] font-normal m-0 mb-2">
              Sign in
            </h2>
            <p className="text-ember-muted text-sm leading-relaxed m-0 mb-7">
              Enter your work email to open your agency&apos;s lead dashboard.
            </p>

            <label className="block mb-5">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ember-muted mb-2">
                Work email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@youragency.com"
                className="w-full h-11 px-3.5 rounded-md border border-ember-rule bg-white text-ember-blue text-sm outline-none focus:border-ember-salmon focus:ring-2 focus:ring-ember-salmon/20"
              />
            </label>

            {error ? (
              <p className="text-sm text-ember-salmon-700 m-0 mb-4" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="cta-button-primary w-full justify-center rounded-md border-0 cursor-pointer"
            >
              {submitting ? "Checking…" : "Enter portal"}
            </button>

            <p className="text-[11px] leading-relaxed text-ember-muted/80 m-0 mt-5">
              Preview access:{" "}
              <code className="text-ember-blue/80">demo@harperinsure.com</code>,{" "}
              <code className="text-ember-blue/80">
                landon@blitzinsurance.com
              </code>
              , or any{" "}
              <code className="text-ember-blue/80">@blitzinsurance.com</code> /{" "}
              <code className="text-ember-blue/80">@macarioinsurance.com</code>{" "}
              email. Email gate only — not production auth.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

function Dashboard({
  email,
  agency,
  stage,
  setStage,
  query,
  setQuery,
  onSignOut,
}: {
  email: string;
  agency: AgencyView;
  stage: LeadStage;
  setStage: (s: LeadStage) => void;
  query: string;
  setQuery: (q: string) => void;
  onSignOut: () => void;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agency.leads.filter((lead) => {
      if (lead.stage !== stage) return false;
      if (!q) return true;
      const hay = [
        lead.business,
        lead.classLabel,
        lead.state,
        lead.id,
        lead.owner,
        lead.statusDetail,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [agency.leads, stage, query]);

  const meta = STAGE_META[stage];
  const displayName = email.split("@")[0]?.replace(/[._]/g, " ") ?? email;

  return (
    <div className="min-h-screen bg-ember-beige-02">
      <header className="bg-ember-blue border-b border-white/[0.06]">
        <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
              <Image
                src="/harper_name_logo.svg"
                alt="Harper"
                width={110}
                height={28}
                className="h-7 w-auto"
                priority
              />
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.18em] text-ember-creme/60 leading-none border-l border-white/15 pl-3">
                {agency.shortName}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden md:inline text-sm text-ember-creme/70 capitalize truncate max-w-[14rem]">
              {displayName}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="text-sm font-medium text-ember-creme/70 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="hero-prestige">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-9 lg:pt-12 lg:pb-11">
          <span className="eyebrow eyebrow-light">
            Harper + {agency.shortName}
          </span>
          <h1 className="display-serif text-white text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-normal leading-[1.08] m-0 mb-4 max-w-[18ch]">
            See where all your leads live{" "}
            <em className="accent-serif">right now.</em>
          </h1>
          <p className="text-ember-creme/75 text-[0.95rem] leading-relaxed m-0 mb-8 max-w-[46ch]">
            Every risk {agency.shortName} sends to Harper through{" "}
            <span className="text-ember-creme">{agency.referralInbox}</span>{" "}
            lands here. Follow it from intake to quote to bind, without chasing
            for status.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <StatCard
              label="Premium bound"
              value={formatMoney(agency.summary.premiumBound)}
            />
            <StatCard
              label="In pipeline"
              value={String(agency.summary.inPipeline)}
            />
            <StatCard
              label="Leads referred"
              value={
                <>
                  {agency.summary.referred}{" "}
                  <em className="accent-serif text-[0.85em]">total</em>
                </>
              }
            />
          </div>
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 -mt-1">
        <div className="flex flex-wrap gap-1 border-b border-ember-rule">
          {STAGES.map((s) => {
            const count = agency.summary.byStage[s];
            const active = s === stage;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`relative px-4 py-3 text-sm font-medium bg-transparent border-0 cursor-pointer transition-colors ${
                  active
                    ? "text-ember-blue"
                    : "text-ember-muted hover:text-ember-blue"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {STAGE_META[s].label}
                  <span
                    className={`inline-flex min-w-[1.25rem] h-5 px-1.5 items-center justify-center rounded-full text-[11px] font-semibold ${
                      active
                        ? "bg-ember-salmon text-white"
                        : "bg-ember-blue-01 text-ember-muted"
                    }`}
                  >
                    {count}
                  </span>
                </span>
                {active ? (
                  <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-ember-salmon" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="py-5">
          <label className="block relative max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ember-muted text-xl pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search business, class, state, or ID."
              className="w-full h-11 pl-11 pr-3.5 rounded-md border border-ember-rule bg-white text-ember-blue text-sm outline-none focus:border-ember-salmon focus:ring-2 focus:ring-ember-salmon/20"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="display-serif text-ember-blue text-[1.5rem] sm:text-[1.75rem] font-normal m-0 mb-1.5">
              {meta.title}
            </h2>
            <p className="text-ember-muted text-sm leading-relaxed m-0 max-w-2xl">
              {meta.blurb}
            </p>
          </div>
          <span className="inline-flex items-center self-start sm:self-auto px-2.5 py-1 rounded-full bg-ember-salmon-200/70 text-[11px] font-medium text-ember-blue/80">
            Source: {agency.referralInbox} · sample data for draft
          </span>
        </div>

        <div className="overflow-x-auto border border-ember-rule rounded-md bg-white mb-10">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f7ebe3]">
                {[
                  "Business",
                  "State / Revenue",
                  "Received",
                  "Owner / Status",
                  "Premium",
                  "Stage",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ember-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-ember-muted"
                  >
                    No leads in this stage
                    {query.trim() ? " match your search" : ""}.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-ember-rule align-top"
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-ember-blue">
                        {lead.business}
                      </div>
                      <div className="text-xs text-ember-muted mt-0.5">
                        {lead.id} · {lead.classLabel}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-ember-blue">
                      {lead.state}
                      <span className="text-ember-muted">, {lead.revenue}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-ember-blue whitespace-nowrap">
                      {lead.received}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-ember-blue">
                        {lead.owner}
                      </div>
                      <div className="text-xs text-ember-muted mt-0.5 max-w-[22rem]">
                        {lead.statusDetail}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-ember-blue whitespace-nowrap">
                      {lead.premium ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <StagePill stage={lead.stage} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-ember-blue/20 pt-8 pb-12">
          <span className="eyebrow text-ember-salmon mb-3">How this works</span>
          <h3 className="display-serif text-ember-blue text-[1.5rem] font-normal m-0 mb-2">
            {agency.shortName}-only referrals, end to end
          </h3>
          <p className="text-ember-muted text-sm leading-relaxed m-0 max-w-3xl">
            This view is scoped to leads attributed to {agency.name} — not a
            broad campaign feed. Live wiring will read from{" "}
            <code className="text-ember-blue/80">{agency.referralInbox}</code>{" "}
            and tagged opportunities. Rows shown here are sample data for layout
            evaluation.
          </p>
          <p className="text-[11px] text-ember-muted/70 m-0 mt-6">
            Draft on partners.harperinsure.com/track · Login required · Not
            production auth
          </p>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-[2px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ember-creme/55 mb-1.5">
        {label}
      </div>
      <div className="display-serif text-white text-[1.75rem] leading-none">
        {value}
      </div>
    </div>
  );
}

function StagePill({ stage }: { stage: LeadStage }) {
  const styles: Record<LeadStage, string> = {
    ingested: "bg-[#dce8f0] text-ember-blue",
    quoted: "bg-ember-creme-500/60 text-ember-blue",
    bound: "bg-ember-green-100 text-ember-green-800",
    lost: "bg-ember-salmon-200/80 text-ember-salmon-800",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${styles[stage]}`}
    >
      {STAGE_META[stage].label}
    </span>
  );
}
