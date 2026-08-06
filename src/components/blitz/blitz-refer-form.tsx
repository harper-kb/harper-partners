"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import {
  PARTNER_CLASS_OPTIONS,
  PARTNER_REVENUE_OPTIONS,
  PHONE_PATTERN,
} from "@/lib/track/referral";
import { US_STATES } from "@/lib/track/us-states";

/**
 * Public Blitz → Harper referral form.
 * No login, no Partner Track dashboard — form fill only.
 * Saves to partnerships.partner_referrals; never hits Weblead / inquiry SMS.
 */
export function BlitzReferForm() {
  const [classCode, setClassCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) {
      setStatus({
        ok: false,
        message: "Please complete all required fields with valid values.",
      });
      return;
    }

    const data = new FormData(form);
    const payload = {
      contactName: String(data.get("contactName") || "").trim(),
      businessName: String(data.get("businessName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      street: String(data.get("street") || "").trim(),
      city: String(data.get("city") || "").trim(),
      state: String(data.get("state") || "").trim(),
      zip: String(data.get("zip") || "").trim(),
      revenue: String(data.get("revenue") || "").trim(),
      classCode: String(data.get("classCode") || "").trim(),
      classCodeOther: String(data.get("classCodeOther") || "").trim() || undefined,
      notes: String(data.get("notes") || "").trim() || undefined,
    };

    if (payload.classCode === "other" && !payload.classCodeOther) {
      setStatus({
        ok: false,
        message: "Please describe the class type for Other.",
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/blitz/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      setStatus({
        ok: Boolean(result.ok),
        message:
          result.message || (result.ok ? "Referral sent." : "Submit failed."),
      });
      if (result.ok) {
        form.reset();
        setClassCode("");
      }
    } catch {
      setStatus({
        ok: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ember-beige-02">
      <header className="bg-ember-blue border-b border-white/[0.06]">
        <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
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
        </div>
      </header>

      <section className="bg-ember-blue">
        <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 pt-12 pb-10 lg:pt-14 lg:pb-12">
          <span className="eyebrow eyebrow-light">Harper + Blitz</span>
          <h1 className="display-serif text-white text-[2rem] sm:text-[2.75rem] font-normal leading-[1.08] m-0 mb-4 max-w-[16ch]">
            Refer a lead. <em className="accent-serif">We will chase it.</em>
          </h1>
          <p className="text-ember-creme/80 text-[1.05rem] leading-relaxed m-0 max-w-[48ch]">
            Fill this out when a commercial risk is outside Blitz appetite.
            Harper will chase the customer and work the quote. Every submission
            is tagged as a Blitz referral.
          </p>
        </div>
      </section>

      <div className="band-arc bg-ember-beige-02">
        <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-12 items-start">
            <div>
              <span className="eyebrow">What to include</span>
              <h2 className="display-serif text-ember-blue text-[1.75rem] font-medium leading-[1.15] m-0 mb-3">
                Share leads with Harper
              </h2>
              <p className="text-ember-muted text-base leading-relaxed m-0 mb-6 max-w-[44ch]">
                Enter the customer&apos;s contact info, business address, class
                type, and annual revenue so Harper can quote faster on the first
                call.
              </p>
              <ul className="list-none m-0 p-0 grid gap-3">
                {[
                  "Use this form for risks outside Blitz appetite",
                  "Priority classes: tattoo, vape, cannabis, liquor stores",
                  "Include contact phone + email so intake can reach them",
                  "Include annual revenue of $50k+ when known",
                  "Notes are optional — fill required fields first",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3.5 text-[15px] leading-relaxed text-ember-blue"
                  >
                    <span
                      className="mt-[0.35em] w-0.5 h-[1.15em] shrink-0 rounded-sm bg-ember-salmon"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative bg-white border border-ember-rule rounded-md p-6 sm:p-7 overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-br from-ember-salmon to-ember-coral-deep"
                aria-hidden
              />
              <span className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                Blitz referral
              </span>
              <h3 className="display-serif text-ember-blue text-xl font-medium leading-[1.2] m-0 mb-5">
                Lead details
              </h3>

              {status ? (
                <div
                  role="status"
                  className={`mb-3.5 px-3.5 py-3 rounded-md text-[13px] leading-snug ${
                    status.ok
                      ? "bg-[#e8f8ee] border border-ember-green-600/35 text-ember-green-700"
                      : "bg-[#fff5f4] border border-ember-salmon/35 text-ember-salmon-800"
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Customer contact name" htmlFor="contact-name">
                    <input
                      id="contact-name"
                      name="contactName"
                      type="text"
                      required
                      className="track-finput"
                    />
                  </Field>
                  <Field label="Business name" htmlFor="business-name">
                    <input
                      id="business-name"
                      name="businessName"
                      type="text"
                      required
                      className="track-finput"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Customer phone" htmlFor="phone">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      pattern={PHONE_PATTERN}
                      className="track-finput"
                    />
                  </Field>
                  <Field label="Customer email" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="track-finput"
                    />
                  </Field>
                </div>

                <Field label="Business street address" htmlFor="street">
                  <input
                    id="street"
                    name="street"
                    type="text"
                    required
                    placeholder="Street, suite"
                    className="track-finput"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="City" htmlFor="city">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      className="track-finput"
                    />
                  </Field>
                  <Field label="State" htmlFor="state">
                    <div className="relative">
                      <select
                        id="state"
                        name="state"
                        required
                        className="track-finput appearance-none pr-8"
                        defaultValue=""
                      >
                        {US_STATES.map((o) => (
                          <option key={o.value || "empty"} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ember-blue text-base">
                        keyboard_arrow_down
                      </span>
                    </div>
                  </Field>
                  <Field label="ZIP" htmlFor="zip">
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      required
                      pattern="[0-9]{5}(-[0-9]{4})?"
                      className="track-finput"
                    />
                  </Field>
                </div>

                <Field label="Class / business type" htmlFor="class-code">
                  <div className="relative">
                    <select
                      id="class-code"
                      name="classCode"
                      required
                      className="track-finput appearance-none pr-8"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                    >
                      {PARTNER_CLASS_OPTIONS.map((o) => (
                        <option key={o.value || "empty"} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ember-blue text-base">
                      keyboard_arrow_down
                    </span>
                  </div>
                </Field>

                {classCode === "other" ? (
                  <Field label="Describe the class" htmlFor="class-other">
                    <input
                      id="class-other"
                      name="classCodeOther"
                      type="text"
                      required
                      className="track-finput"
                    />
                  </Field>
                ) : null}

                <Field label="Annual revenue" htmlFor="revenue">
                  <div className="relative">
                    <select
                      id="revenue"
                      name="revenue"
                      required
                      className="track-finput appearance-none pr-8"
                      defaultValue=""
                    >
                      {PARTNER_REVENUE_OPTIONS.map((o) => (
                        <option key={o.value || "empty"} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ember-blue text-base">
                      keyboard_arrow_down
                    </span>
                  </div>
                </Field>

                <Field label="Notes for Harper (optional)" htmlFor="notes">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Landlord requirements, timing, prior carrier, anything that helps quote faster"
                    className="track-finput min-h-[84px] resize-y"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="cta-button-primary w-full justify-center mt-2 border-0 cursor-pointer"
                >
                  {submitting ? "Sending…" : "Send referral to Harper"}
                  {!submitting ? (
                    <span className="material-symbols-outlined text-sm">
                      arrow_outward
                    </span>
                  ) : null}
                </button>
                <p className="text-[0.7rem] text-ember-muted m-0 pt-1 leading-tight">
                  Every submission is tagged as a Blitz referral to Harper.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .track-finput {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 8px;
          background: #fff;
          border: 1px solid rgb(29 58 71 / 0.2);
          color: var(--color-ember-blue);
          font-family: var(--font-primary);
          outline: none;
        }
        .track-finput:focus {
          border-color: var(--color-ember-blue);
          box-shadow: 0 0 0 1px var(--color-ember-blue);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-ember-blue text-xs font-medium mb-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
