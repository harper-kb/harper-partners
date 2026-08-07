"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type {
  HarperTrackingAgency,
  HarperTrackingReferral,
} from "@/lib/harper-tracking/data";
import type { LeadStage } from "@/lib/track/data";

const STAGE_ORDER: LeadStage[] = ["ingested", "quoted", "bound", "lost"];

const STAGE_PILL: Record<LeadStage, string> = {
  ingested: "bg-[#eef4f7] text-ember-blue border-ember-blue/15",
  quoted: "bg-[#fff6ef] text-[#9a4b1a] border-[#e8c4a0]",
  bound: "bg-[#e8f8ee] text-ember-green-700 border-ember-green-600/30",
  lost: "bg-[#fff5f4] text-ember-salmon-800 border-ember-salmon/30",
};

export function HarperTrackingDashboard() {
  const [agencies, setAgencies] = useState<HarperTrackingAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/harper-tracking", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setError(data.error || "Could not load board.");
          setAgencies([]);
          return;
        }
        setEmail(data.email || null);
        setAgencies(data.agencies || []);
        setError(null);
      } catch {
        if (!cancelled) setError("Network error loading board.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalReferrals = agencies.reduce((n, a) => n + a.referralCount, 0);

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
                Harper Tracking
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {email ? (
              <span className="hidden md:inline text-sm text-ember-creme/70 truncate max-w-[16rem]">
                {email}
              </span>
            ) : null}
            <UserButton />
          </div>
        </div>
      </header>

      <section className="bg-ember-blue">
        <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 pt-12 pb-10 lg:pt-14 lg:pb-12">
          <span className="eyebrow eyebrow-light">Internal · partnerships</span>
          <h1 className="display-serif text-white text-[2rem] sm:text-[2.75rem] font-normal leading-[1.08] m-0 mb-4 max-w-[18ch]">
            Signed agencies.{" "}
            <em className="accent-serif">Every referral, every stage.</em>
          </h1>
          <p className="text-ember-creme/80 text-[1.05rem] leading-relaxed m-0 max-w-[52ch]">
            One tile per handshake-closed agency. Open a tile to see who they
            referred and where each lead sits in the Harper pipeline.
          </p>
          {!loading && !error ? (
            <p className="text-ember-creme/55 text-sm m-0 mt-5">
              {agencies.length} agencies · {totalReferrals} referrals tracked
            </p>
          ) : null}
        </div>
      </section>

      <div className="band-arc bg-ember-beige-02">
        <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-10 md:py-14">
          {loading ? (
            <p className="text-ember-muted text-sm m-0">Loading agencies…</p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="bg-[#fff5f4] border border-ember-salmon/35 text-ember-salmon-800 rounded-md px-4 py-3 text-sm"
            >
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="grid grid-cols-1 gap-4">
              {agencies.map((agency) => (
                <AgencyTile
                  key={agency.id}
                  agency={agency}
                  open={openId === agency.id}
                  onToggle={() =>
                    setOpenId((id) => (id === agency.id ? null : agency.id))
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AgencyTile({
  agency,
  open,
  onToggle,
}: {
  agency: HarperTrackingAgency;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white border border-ember-rule rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-transparent border-0 cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 material-symbols-outlined text-ember-blue text-xl transition-transform ${
                open ? "rotate-90" : ""
              }`}
              aria-hidden
            >
              chevron_right
            </span>
            <div className="min-w-0">
              <h2 className="display-serif text-ember-blue text-[1.35rem] font-medium leading-snug m-0 mb-1">
                {agency.name}
              </h2>
              <p className="text-ember-muted text-sm m-0 truncate">
                {[agency.contactName, agency.contactEmail]
                  .filter(Boolean)
                  .join(" · ") || "No contact on file"}
              </p>
              {agency.statusLabel ? (
                <p className="text-ember-muted/80 text-xs m-0 mt-1.5 line-clamp-2">
                  {agency.statusLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end pl-9 sm:pl-0">
          <CountChip label="Referrals" value={agency.referralCount} />
          {STAGE_ORDER.map((stage) =>
            agency.byStage[stage] > 0 ? (
              <CountChip
                key={stage}
                label={stageLabelShort(stage)}
                value={agency.byStage[stage]}
              />
            ) : null,
          )}
        </div>
      </button>

      {open ? (
        <div className="border-t border-ember-rule bg-ember-beige-02/50 px-5 sm:px-6 py-4">
          {agency.referrals.length === 0 ? (
            <p className="text-ember-muted text-sm m-0 py-2">
              No referrals logged for this agency yet.
            </p>
          ) : (
            <ul className="list-none m-0 p-0 grid gap-3">
              {agency.referrals.map((ref) => (
                <ReferralRow key={ref.id} referral={ref} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function CountChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ember-rule bg-white px-2.5 py-1 text-[11px] text-ember-blue">
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-ember-muted uppercase tracking-[0.06em]">{label}</span>
    </span>
  );
}

function stageLabelShort(stage: LeadStage) {
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

function ReferralRow({ referral }: { referral: HarperTrackingReferral }) {
  return (
    <li className="bg-white border border-ember-rule rounded-md px-4 py-3.5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-ember-blue font-semibold text-[15px] m-0">
              {referral.contactName}
            </p>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${STAGE_PILL[referral.stage]}`}
            >
              {referral.stageLabel}
            </span>
          </div>
          <p className="text-ember-blue text-sm m-0 mb-1">
            {referral.businessName}
            <span className="text-ember-muted"> · {referral.classLabel}</span>
          </p>
          <p className="text-ember-muted text-[13px] leading-snug m-0">
            {referral.statusDetail}
          </p>
          <p className="text-ember-muted/80 text-xs m-0 mt-2">
            {[
              referral.received !== "—" ? `Received ${referral.received}` : null,
              referral.producer ? `Owner ${referral.producer}` : null,
              referral.bbCompanyId ? `BB ${referral.bbCompanyId}` : null,
              referral.email,
              referral.phone,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
    </li>
  );
}
