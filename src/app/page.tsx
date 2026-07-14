import Link from "next/link";
import { PartnerForm } from "@/components/partner-form";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Do I need a commercial license?",
    a: (
      <>
        Yes. This program is open to licensed agents only — and you must be
        licensed in the state where the business is being written. Commission
        can only be shared with an appropriately licensed partner.
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
    q: "Do I have to service the account?",
    a: (
      <>
        No. Once you forward the client, Harper takes it from there — quoting,
        binding, servicing, renewals, and claims. There&apos;s no portal to learn
        and no ongoing work on your end.
      </>
    ),
  },
  {
    q: "Who owns the account?",
    a: (
      <>
        Harper does. Referred commercial accounts belong to Harper. You earn a
        share of the commission, but you do not own the account or the book of
        business, and you hold no servicing rights or obligations over it.
      </>
    ),
  },
  {
    q: "How and when do I get paid?",
    a: (
      <>
        You earn 50% of the commission on business Harper binds from your
        referral, tracked per partner. Payouts are made 60 days after the
        account settles. Commission is earned only while a policy stays in
        force — if an account cancels or goes unpaid, the corresponding
        commission is reconciled and charged back.
      </>
    ),
  },
  {
    q: "What does it cost to join?",
    a: (
      <>
        Nothing. There&apos;s no fee to join and nothing out of pocket — you earn
        only when Harper binds business from a client you forwarded.
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
              the commission on everything we bind.{" "}
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
                href="#how-it-works"
                className="btn-outline-pill no-underline border-ember-creme/55 text-ember-creme hover:border-ember-creme hover:text-white"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Promise row — hairline-divided value props */}
          <div className="mt-14 lg:mt-16 pt-10 border-t border-ember-creme/15 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0">
            <div className="sm:pr-10">
              <div className="display-serif text-ember-creme text-[1.375rem] font-medium leading-snug">
                You send the <em className="accent-serif">commercial you can&apos;t write.</em>
              </div>
              <div className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-2.5 max-w-[34ch]">
                Every commercial ask you turn away is commission gone. A
                forwarded email keeps it — and you stop saying &ldquo;sorry, we
                can&apos;t help you.&rdquo;
              </div>
            </div>
            <div className="sm:px-10 sm:border-l sm:border-ember-creme/15">
              <div className="display-serif text-ember-creme text-[1.375rem] font-medium leading-snug">
                You keep <em className="accent-serif">50% of the commission.</em>
              </div>
              <div className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-2.5 max-w-[34ch]">
                On every commercial line Harper writes and binds from your
                referral. You never touch the account after the forward.
              </div>
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
              For small personal &amp; auto brokerages: send us the commercial
              walk-ins you can&apos;t serve. When Harper writes and binds the
              business, you earn a share of the commission — backed by the
              brokerage that actually places the coverage.
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
                Harper writes and binds it
              </h3>
              <p className="text-ember-muted text-sm font-normal leading-relaxed m-0">
                We quote, place, and service across every commercial line — GL,
                property, workers&apos; comp, commercial auto, and more. White-glove
                placement; your client is in expert hands, start to finish.
              </p>
            </div>
            <div className="step-card flex flex-col">
              <span className="step-number">STEP 03</span>
              <h3 className="text-ember-blue text-[1.0625rem] font-semibold leading-snug m-0 mt-4 mb-2">
                You get paid when we bind
              </h3>
              <p className="text-ember-muted text-sm font-normal leading-relaxed m-0">
                Once Harper binds the coverage, you earn 50% of the commission —
                tracked per referral and paid 60 days after the account settles.
                A check for business you were turning away.
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

      {/* Partnership band — Deep Blue band (mirrors the QuoteFormFooter surface) */}
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
                Partners turns those dead ends into income: forward the account,
                we place and service it, and you earn a share of the commission
                on everything we bind.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-ember-creme/80 list-none m-0 p-0">
                <li className="cov-item">Keep 50% of the commission on business we bind</li>
                <li className="cov-item">Every commercial line, not just hard-to-place risks</li>
                <li className="cov-item">You never service the account — Harper handles it end to end</li>
                <li className="cov-item">Paid 60 days after the account settles — never out of pocket</li>
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

            {/* Preview card — illustrative payout example (not a real client) */}
            <div className="rounded-[8px] border border-ember-creme/15 bg-white/[0.04] p-6 sm:p-7">
              <span className="eyebrow eyebrow-light">Illustrative Example</span>
              <div className="card-base p-5 text-ember-blue">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold m-0">Example commercial referral</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-blue-01 px-2.5 py-1 text-xs font-semibold text-ember-blue-08 ring-1 ring-ember-rule">
                    Sample
                  </span>
                </div>
                <p className="mt-1 text-xs text-ember-muted m-0">
                  Placed and serviced by Harper
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-ember-rule pb-2">
                    <span className="text-ember-muted">Placed: GL + Property (BOP)</span>
                    <span className="font-medium">$4,200 premium</span>
                  </div>
                  <div className="flex justify-between border-b border-ember-rule pb-2">
                    <span className="text-ember-muted">Harper commission</span>
                    <span className="font-medium">$1,260</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ember-muted">Your share (50%)</span>
                    <span className="font-medium text-ember-green-700">$630</span>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-ember-muted m-0">
                  Illustrative only. Actual commission varies by line, premium,
                  and carrier, and is paid after the account settles.
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
                FAQs
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

      {/* Terms — plain-English program terms */}
      <section id="terms" className="w-full bg-white scroll-mt-24">
        <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-16 md:py-20">
          <div className="max-w-[760px] mx-auto">
            <div className="mb-8 md:mb-10">
              <span className="eyebrow">The Terms</span>
              <h2 className="display-serif text-ember-blue text-[1.75rem] lg:text-[1.875rem] font-medium leading-[1.15] m-0">
                The terms, in <em className="accent-serif">plain English.</em>
              </h2>
            </div>
            <ul className="space-y-4 text-[0.9375rem] text-ember-muted leading-relaxed list-none m-0 p-0">
              <li className="cov-item">
                <b className="text-ember-blue font-semibold">Licensed agents only.</b>{" "}
                You must be a licensed insurance agent — and licensed in the state
                where the business is written — to participate and share
                commission.
              </li>
              <li className="cov-item">
                <b className="text-ember-blue font-semibold">You don&apos;t service the account.</b>{" "}
                You forward the client and you&apos;re done. Harper handles quoting,
                binding, servicing, renewals, and claims.
              </li>
              <li className="cov-item">
                <b className="text-ember-blue font-semibold">Harper owns the account.</b>{" "}
                Referred commercial accounts and the book of business belong to
                Harper. Partners earn a commission share only, and have no
                ownership rights or claim to any referred account.
              </li>
              <li className="cov-item">
                <b className="text-ember-blue font-semibold">How you&apos;re paid.</b>{" "}
                You earn 50% of Harper&apos;s commission on business we bind, paid 60
                days after the account settles.
              </li>
              <li className="cov-item">
                <b className="text-ember-blue font-semibold">Clawbacks.</b>{" "}
                Commission is earned only while a policy stays in force. If an
                account cancels or goes unpaid, the corresponding commission is
                reconciled and charged back.
              </li>
              <li className="cov-item">
                <b className="text-ember-blue font-semibold">No guarantees.</b>{" "}
                This is a commission-share partnership, not employment. Nothing
                here promises a specific volume of business or income.
              </li>
            </ul>
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
                write into steady income on the business we bind. It takes two
                minutes to start.
              </p>
              <p className="text-ember-creme/55 text-[0.8125rem] leading-relaxed mt-5 m-0 max-w-[52ch]">
                Georgia brokerages are onboarding first. Open to licensed agents
                only — you must be licensed in the state where the business is
                written. Referred accounts are owned and serviced by Harper.
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
