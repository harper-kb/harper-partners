import Link from "next/link";
import { PartnerForm } from "@/components/partner-form";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Do I need a commercial license?",
    a: (
      <>
        To share commission, yes — commission-share is available to
        appropriately licensed partners only. If you&apos;re not licensed for
        commercial lines, you can still send us business as a referral source
        and receive a flat per-referral fee where permitted by law. Either way,
        the client you couldn&apos;t serve gets taken care of.
      </>
    ),
  },
  {
    q: "Will you poach my personal-lines clients?",
    a: (
      <>
        No — your personal-lines book stays yours, in writing. We&apos;re here only
        for the commercial business you can&apos;t write. And when personal &amp; auto
        business comes our way, we&apos;ll send it to you, too.
      </>
    ),
  },
  {
    q: "Which commercial lines can I send?",
    a: (
      <>
        All of them. General liability, property, workers&apos; comp, commercial
        auto, BOPs, professional and management liability — every commercial
        line, not just the hard-to-place risks. If a walk-in needs commercial
        coverage you don&apos;t write, forward it.
      </>
    ),
  },
  {
    q: "How and when do I get paid?",
    a: (
      <>
        You keep 50% of the commission on every policy we bind from your
        referral. It&apos;s tracked per partner and paid on bind — no waiting on
        vague &ldquo;pipeline&rdquo; promises. Licensed partners share
        commission; unlicensed sources receive flat per-referral fees.
      </>
    ),
  },
  {
    q: "What does it cost to join?",
    a: (
      <>
        Nothing. Free to join, and you only ever earn — you pay nothing out of
        pocket. Your acquisition cost on this new income is essentially $0,
        because these are clients you were already losing.
      </>
    ),
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero — Deep Blue editorial hero (hero-prestige, as on harperinsure.com) */}
      <section className="hero-prestige w-full">
        <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 pt-16 pb-12 lg:pt-24 lg:pb-14">
          <div className="max-w-[880px]">
            <span className="eyebrow eyebrow-light">Harper Partners</span>
            <h1 className="display-serif text-white text-[2.375rem] lg:text-[3.5rem] font-normal leading-[1.05] m-0 mb-6 max-w-[18ch]">
              Turn the commercial clients you can&apos;t write into{" "}
              <em className="accent-serif">income.</em>
            </h1>

            <p className="text-[1.0625rem] lg:text-lg font-normal leading-relaxed text-ember-creme/88 max-w-[52ch] m-0">
              Send us the commercial business you can&apos;t place and keep 50% of
              the commission. And when personal &amp; auto business comes our way,
              we&apos;ll send it to you.{" "}
              <b className="font-semibold text-white">
                A real partnership — not a lead sale.
              </b>
            </p>

            {/* CTA row */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="#become-a-partner" className="cta-button-primary no-underline">
                Become a partner
                <span className="btn-arrow-chip">
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </span>
              </Link>
              <Link
                href="#the-split"
                className="btn-outline-pill no-underline border-ember-creme/55 text-ember-creme hover:border-ember-creme hover:text-white"
              >
                See how the 50/50 works
              </Link>
            </div>
          </div>

          {/* Promise row — hairline-divided value props */}
          <div className="mt-14 lg:mt-16 pt-10 border-t border-ember-creme/15 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
            <div className="sm:pr-10">
              <div className="display-serif text-ember-creme text-[1.375rem] font-medium leading-snug">
                You send the <em className="accent-serif">commercial you can&apos;t write.</em>
              </div>
              <div className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-2.5 max-w-[30ch]">
                Every commercial ask you turn away is ~$300–500 in commission
                gone. A forwarded email keeps it — and you stop saying
                &ldquo;sorry, we can&apos;t help you.&rdquo;
              </div>
            </div>
            <div className="sm:px-10 sm:border-l sm:border-ember-creme/15">
              <div className="display-serif text-ember-creme text-[1.375rem] font-medium leading-snug">
                You keep <em className="accent-serif">50% of the commission.</em>
              </div>
              <div className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-2.5 max-w-[30ch]">
                On every commercial line we bind. Roughly $1,000–$2,000 a month
                in income you were leaving on the table.
              </div>
            </div>
            <div className="sm:px-10 sm:border-l sm:border-ember-creme/15">
              <div className="display-serif text-ember-creme text-[1.375rem] font-medium leading-snug">
                We send <em className="accent-serif">personal lines your way.</em>
              </div>
              <div className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-2.5 max-w-[30ch]">
                When personal &amp; auto business comes our way, we&apos;ll send it
                to you.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof band — serif stats */}
      <section className="w-full bg-ember-beige-02 border-b border-ember-rule">
        <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
            <div className="sm:pr-10">
              <p className="stat-number m-0">50/50</p>
              <p className="stat-label m-0 mt-1">
                Commission split — you keep 50% on every line
              </p>
            </div>
            <div className="sm:px-10 sm:border-l sm:border-ember-rule">
              <p className="stat-number m-0">$1–2K</p>
              <p className="stat-label m-0 mt-1">
                Added income per month, at ~$0 acquisition cost
              </p>
            </div>
            <div className="sm:px-10 sm:border-l sm:border-ember-rule">
              <p className="stat-number m-0">$300–500</p>
              <p className="stat-label m-0 mt-1">
                Commission on each commercial ask you&apos;d otherwise turn away
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — white band with coral arc + step cards */}
      <section id="how-it-works" className="w-full bg-white band-arc scroll-mt-24">
        <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-16 md:py-20">
          <div className="max-w-[560px] mx-auto text-center mb-12 md:mb-14">
            <span className="eyebrow text-center">How It Works</span>
            <h2 className="display-serif text-ember-blue text-[1.75rem] lg:text-[1.875rem] font-medium leading-[1.15] m-0 mb-3">
              A dead end becomes <em className="accent-serif">a payday.</em>
            </h2>
            <p className="text-ember-muted text-base font-normal leading-relaxed m-0">
              For small personal &amp; auto brokerages: turn the commercial
              walk-ins you can&apos;t serve into commission and goodwill — backed by
              Harper, the brokerage that actually places the coverage.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="step-card flex flex-col">
              <span className="step-number">STEP 01</span>
              <h3 className="text-ember-blue text-[1.0625rem] font-semibold leading-snug m-0 mt-4 mb-2">
                Forward the client you can&apos;t write
              </h3>
              <p className="text-ember-muted text-sm font-normal leading-relaxed m-0">
                A commercial walk-in you can&apos;t place? Forward the email. That&apos;s
                the whole ask — no portals, no paperwork, no new workflow.
              </p>
            </div>
            <div className="step-card flex flex-col">
              <span className="step-number">STEP 02</span>
              <h3 className="text-ember-blue text-[1.0625rem] font-semibold leading-snug m-0 mt-4 mb-2">
                We place the coverage
              </h3>
              <p className="text-ember-muted text-sm font-normal leading-relaxed m-0">
                Harper quotes and binds across every commercial line — GL,
                property, workers&apos; comp, commercial auto, and more. White-glove
                placement; your client is in expert hands.
              </p>
            </div>
            <div className="step-card flex flex-col">
              <span className="step-number">STEP 03</span>
              <h3 className="text-ember-blue text-[1.0625rem] font-semibold leading-snug m-0 mt-4 mb-2">
                You get paid — and we send work your way
              </h3>
              <p className="text-ember-muted text-sm font-normal leading-relaxed m-0">
                Your client is covered — here&apos;s the certificate, and here&apos;s your
                50%. And when personal &amp; auto business comes our way, we&apos;ll
                send it to you.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-12 md:mt-14">
            <Link href="#become-a-partner" className="cta-button-primary no-underline">
              Become a partner
              <span className="btn-arrow-chip">
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Two-way band — Deep Blue band (mirrors the QuoteFormFooter surface) */}
      <section id="the-split" className="hero-prestige w-full scroll-mt-24">
        <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow eyebrow-light">A Real Partnership</span>
              <h2 className="display-serif text-white text-[2rem] lg:text-[2.5rem] font-normal leading-[1.1] m-0 mb-5">
                Keep 50%. Send nothing but{" "}
                <em className="accent-serif">a forward.</em>
              </h2>
              <p className="text-ember-creme/88 text-base leading-relaxed m-0 max-w-[52ch]">
                Small brokerages lose face telling a commercial client &ldquo;we
                can&apos;t help you&rdquo; — with nowhere good to send them. Harper
                Partners turns those dead ends into income and pride: now you can
                say &ldquo;our partner handles these.&rdquo; And when personal &amp;
                auto business comes our way, we&apos;ll send it to you, too.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-ember-creme/80 list-none m-0 p-0">
                <li className="cov-item">Keep 50% of the commission — 50/50 split</li>
                <li className="cov-item">Every commercial line, not just hard-to-place risks</li>
                <li className="cov-item">When personal &amp; auto business comes our way, we send it to you</li>
                <li className="cov-item">Your personal-lines book stays yours — in writing</li>
                <li className="cov-item">Free to join — you only pay on bind</li>
              </ul>
              <div className="mt-9">
                <Link
                  href="#become-a-partner"
                  className="cta-button-primary no-underline inline-flex"
                >
                  Become a partner
                  <span className="btn-arrow-chip">
                    <span className="material-symbols-outlined text-sm">arrow_outward</span>
                  </span>
                </Link>
              </div>
            </div>

            {/* Preview card — partner payout / referral summary mock */}
            <div className="rounded-[8px] border border-ember-creme/15 bg-white/[0.04] p-6 sm:p-7">
              <span className="eyebrow eyebrow-light">Your Partner Summary</span>
              <div className="card-base p-5 text-ember-blue">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold m-0">Alvarez Family Insurance</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-green-600/10 px-2.5 py-1 text-xs font-semibold text-ember-green-700 ring-1 ring-ember-green-600/25">
                    ✓ Paid on bind
                  </span>
                </div>
                <p className="mt-1 text-xs text-ember-muted m-0">
                  Commercial referral · placed by Harper
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-ember-rule pb-2">
                    <span className="text-ember-muted">Placed: GL + Property (BOP)</span>
                    <span className="font-medium">$4,200 premium</span>
                  </div>
                  <div className="flex justify-between border-b border-ember-rule pb-2">
                    <span className="text-ember-muted">Your share (50%)</span>
                    <span className="font-medium text-ember-green-700">$630 commission</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ember-muted">Personal-lines referral</span>
                    <span className="font-medium">When it comes our way</span>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-ember-muted m-0">
                  Tracked per partner · no-poach guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — editorial hairline rules */}
      <section id="faq" className="w-full bg-ember-beige-02 border-y border-ember-rule scroll-mt-24">
        <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-16 md:py-20">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <span className="eyebrow text-center">Common Questions</span>
              <h2 className="display-serif text-ember-blue text-[1.75rem] lg:text-[1.875rem] font-medium leading-[1.15] m-0">
                The honest <em className="accent-serif">answers.</em>
              </h2>
            </div>
            <dl className="m-0">
              {FAQS.map((item, i) => (
                <div
                  key={item.q}
                  className={`py-6 ${i === 0 ? "border-t" : ""} border-b border-ember-rule`}
                >
                  <dt className="display-serif text-ember-blue text-[1.1875rem] font-medium leading-snug m-0">
                    {item.q}
                  </dt>
                  <dd className="text-ember-muted text-[0.9375rem] leading-relaxed m-0 mt-2.5 max-w-[62ch]">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Final CTA — Deep Blue band with partner form */}
      <section id="become-a-partner" className="hero-prestige w-full scroll-mt-24">
        <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow eyebrow-light">Become a Partner</span>
              <h2 className="display-serif text-white text-[2rem] lg:text-[2.5rem] font-normal leading-[1.1] m-0 mb-5">
                Stop losing clients you were{" "}
                <em className="accent-serif">never going to keep.</em>
              </h2>
              <p className="text-ember-creme/88 text-base leading-relaxed m-0 max-w-[52ch]">
                Join Harper Partners and turn the commercial business you can&apos;t
                write into steady income — and when personal &amp; auto business
                comes our way, we&apos;ll send it to you. It takes two minutes to
                start.
              </p>
              <p className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-5 m-0 max-w-[52ch]">
                Georgia brokerages are onboarding first. Commission-share is for
                licensed partners; unlicensed sources receive flat per-referral
                fees where permitted by law.
              </p>
            </div>

            {/* Sign-up card */}
            <div className="rounded-[8px] border border-ember-creme/15 bg-white p-6 sm:p-7">
              <PartnerForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
