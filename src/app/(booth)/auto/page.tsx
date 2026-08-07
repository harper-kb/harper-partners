import type { Metadata } from "next";
import { AutoIntakeForm } from "@/components/auto-intake-form";

export const metadata: Metadata = {
  title: "Dealer Insurance — Harper",
  description:
    "Garage & dealer coverage for auto auction dealers. Answer a short questionnaire and a licensed Harper broker calls you with a quote.",
};

export default function AutoAuctionPage() {
  return (
    <div>
      {/* Compact hero */}
      <section className="hero-prestige w-full">
        <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-10 lg:pt-14 lg:pb-12">
          <div className="max-w-[760px]">
            <span className="eyebrow eyebrow-light">For Auto Auction Dealers</span>
            <h1 className="display-serif text-white text-[2rem] lg:text-[2.75rem] font-normal leading-[1.08] m-0 mb-4">
              Dealer coverage, minus{" "}
              <em className="accent-serif">the paperwork.</em>
            </h1>
            <p className="text-[1rem] lg:text-[1.0625rem] leading-relaxed text-ember-creme/88 max-w-[54ch] m-0">
              Garage liability, garagekeepers, and lot coverage for dealers who
              buy at auction. Answer the short form below —{" "}
              <b className="font-semibold text-white">
                you&apos;re automatically entered in the raffle
              </b>{" "}
              and a licensed Harper broker calls you with your quote.
            </p>
          </div>
        </div>
      </section>

      {/* Form band */}
      <section className="w-full bg-ember-beige-02 border-b border-ember-rule">
        <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-10 md:py-14">
          <div className="max-w-[640px] mx-auto">
            <div className="rounded-[8px] border border-ember-rule bg-white p-6 sm:p-8 shadow-sm">
              <AutoIntakeForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
