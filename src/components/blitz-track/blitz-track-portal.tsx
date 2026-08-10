"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
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
  dataSource?: string;
};

type SessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "denied"; email: string; message: string }
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

/** Shared Blitz dashboard — every Blitz email sees the same lead list. */
export function BlitzTrackPortal() {
  const { isLoaded, isSignedIn } = useAuth();
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [stage, setStage] = useState<LeadStage>("ingested");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setSession({ status: "anonymous" });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blitz-track/session", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.authenticated && data.agency) {
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
        } else if (data.authenticated) {
          setSession({
            status: "denied",
            email: data.email || "",
            message:
              data.error ||
              "This email isn't enabled for Blitz Track yet.",
          });
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
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || session.status === "loading") {
    return (
      <div className="min-h-screen bg-ember-beige-02 flex items-center justify-center text-ember-muted text-sm">
        Opening Blitz track…
      </div>
    );
  }

  if (session.status === "anonymous") {
    return <ClerkSignInScreen />;
  }

  if (session.status === "denied") {
    return <AccessDeniedScreen email={session.email} message={session.message} />;
  }

  return (
    <Dashboard
      email={session.email}
      agency={session.agency}
      stage={stage}
      setStage={setStage}
      query={query}
      setQuery={setQuery}
    />
  );
}

function ClerkSignInScreen() {
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
            Blitz
          </span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[34rem] py-16 lg:py-0">
          <span className="eyebrow eyebrow-light">Harper + Blitz Track</span>
          <h1 className="display-serif text-white text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] font-normal leading-[1.08] m-0">
            See where all Blitz leads live{" "}
            <em className="accent-serif">right now.</em>
          </h1>
        </div>

        <p className="relative z-10 text-ember-creme/45 text-xs m-0 hidden lg:block">
          Sign in with your @blitzinsurance.com email
        </p>
      </section>

      <section className="relative flex flex-col px-6 sm:px-10 lg:px-14 py-8 lg:py-10">
        <div className="relative z-10 flex justify-end gap-4">
          <Link
            href="/"
            className="text-sm text-ember-muted hover:text-ember-blue transition-colors no-underline"
          >
            Partner program
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[420px] bg-white border border-ember-rule rounded-[10px] shadow-[0_18px_50px_rgba(29,58,71,0.08)] p-7 sm:p-8">
            <h2 className="display-serif text-ember-blue text-[1.75rem] font-normal m-0 mb-2">
              Sign in
            </h2>
            <p className="text-ember-muted text-sm leading-relaxed m-0 mb-7">
              Use your Blitz work email to continue.
            </p>
            <div className="flex flex-col gap-3">
              <SignInButton mode="modal" forceRedirectUrl="/blitz-track">
                <button
                  type="button"
                  className="cta-button-primary w-full justify-center rounded-md border-0 cursor-pointer"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/blitz-track">
                <button
                  type="button"
                  className="w-full h-11 rounded-md border border-ember-rule bg-white text-ember-blue text-sm font-medium cursor-pointer hover:border-ember-blue/40"
                >
                  Create account
                </button>
              </SignUpButton>
            </div>
            <p className="text-[11px] leading-relaxed text-ember-muted/80 m-0 mt-5">
              After sign-in, your Clerk email must be{" "}
              <code className="text-ember-blue/80">@blitzinsurance.com</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccessDeniedScreen({
  email,
  message,
}: {
  email: string;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-ember-beige-02 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-ember-rule rounded-lg p-8 text-center">
        <h1 className="display-serif text-ember-blue text-2xl m-0 mb-3">
          Access not enabled
        </h1>
        <p className="text-ember-muted text-sm m-0 mb-2">{message}</p>
        {email ? (
          <p className="text-ember-blue text-sm m-0 mb-6">
            Signed in as <strong>{email}</strong>
          </p>
        ) : null}
        <div className="flex justify-center">
          <UserButton />
        </div>
      </div>
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
}: {
  email: string;
  agency: AgencyView;
  stage: LeadStage;
  setStage: (s: LeadStage) => void;
  query: string;
  setQuery: (q: string) => void;
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
                Blitz
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/blitz-refer"
              className="cta-button-standalone text-sm no-underline whitespace-nowrap"
            >
              Refer a new lead
            </Link>
            <span className="hidden md:inline text-sm text-ember-creme/70 truncate max-w-[14rem]">
              {email}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <section className="hero-prestige">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-9 lg:pt-12 lg:pb-11">
          <span className="eyebrow eyebrow-light">Harper + Blitz</span>
          <h1 className="display-serif text-white text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-normal leading-[1.08] m-0 mb-8 max-w-[18ch]">
            See where all Blitz leads live{" "}
            <em className="accent-serif">right now.</em>
          </h1>

          <div className="mb-8">
            <Link
              href="/blitz-refer"
              className="cta-button-primary inline-flex no-underline"
            >
              Refer a new lead
              <span className="material-symbols-outlined text-lg">
                arrow_outward
              </span>
            </Link>
          </div>

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
            Shared Blitz board · live data
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

        <div className="pb-12" />
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
