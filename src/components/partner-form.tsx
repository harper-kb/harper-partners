"use client";

import { useState } from "react";

const LINES_OPTIONS = [
  "Personal & auto only",
  "Personal, auto & some commercial",
  "Full commercial book",
  "Other / not sure",
];

// Reasonable email shape check — something@something.tld
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldKey = "name" | "agency" | "email" | "state" | "lines" | "licensed";
type Errors = Partial<Record<FieldKey, string>>;

/**
 * Partner sign-up form — static marketing UI. No backend: on a valid submit it
 * flips to a client-side thank-you state. Validates required fields, a proper
 * email address, and a licensed-agent confirmation before accepting.
 */
export function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  if (submitted) {
    return (
      <div className="card-base border-ember-green-600/30 bg-ember-green-100/40 p-8 text-center">
        <p className="display-serif text-2xl text-ember-green-700 m-0">
          You&apos;re on the list ✓
        </p>
        <p className="mt-2 text-sm text-ember-muted max-w-[46ch] mx-auto">
          Thanks for your interest in Harper Partners. Our partnerships team will
          reach out to confirm your license and walk you through the 50/50 split.
          Georgia brokerages are onboarding first.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = ((data.get("name") as string) ?? "").trim();
    const agency = ((data.get("agency") as string) ?? "").trim();
    const email = ((data.get("email") as string) ?? "").trim();
    const state = ((data.get("state") as string) ?? "").trim();
    const lines = (data.get("lines") as string) ?? "";
    const licensed = data.get("licensed") === "on";

    const next: Errors = {};
    if (!name) next.name = "Please enter your name.";
    if (!agency) next.agency = "Please enter your agency name.";
    if (!email) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!state) next.state = "Please enter your state.";
    if (!lines) next.lines = "Select the lines you write.";
    if (!licensed) next.licensed = "You must be a licensed agent to join.";

    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Your name" error={errors.name}>
        <input
          name="name"
          maxLength={120}
          autoComplete="name"
          className="form-input-light text-sm"
          placeholder="Your full name"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Agency name" error={errors.agency}>
          <input
            name="agency"
            maxLength={160}
            autoComplete="organization"
            className="form-input-light text-sm"
            placeholder="Your agency"
          />
        </Field>
        <Field label="Work email" error={errors.email}>
          <input
            name="email"
            type="email"
            inputMode="email"
            maxLength={200}
            autoComplete="email"
            className="form-input-light text-sm"
            placeholder="you@youragency.com"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State licensed in" error={errors.state}>
          <input
            name="state"
            maxLength={40}
            className="form-input-light text-sm"
            placeholder="Georgia"
          />
        </Field>
        <Field label="Lines you write" error={errors.lines}>
          <select name="lines" defaultValue="" className="form-input-light text-sm">
            <option value="" disabled>
              Select…
            </option>
            {LINES_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ember-blue/85">
          <input
            type="checkbox"
            name="licensed"
            className="mt-0.5 h-4 w-4 accent-ember-salmon"
          />
          <span>
            I confirm I&apos;m a licensed insurance agent in the state(s) where
            I&apos;ll refer business.
          </span>
        </label>
        {errors.licensed && (
          <p className="mt-1 text-[0.75rem] text-ember-salmon-800">{errors.licensed}</p>
        )}
      </div>

      <button
        type="submit"
        className="cta-button-primary w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-salmon focus-visible:ring-offset-2"
      >
        Become a partner
        <span className="btn-arrow-chip">
          <span className="material-symbols-outlined text-sm">arrow_outward</span>
        </span>
      </button>
      <p className="text-center text-[11px] leading-relaxed text-ember-muted">
        Licensed agents only. No fee to join — you earn a share of commission on
        business Harper binds. Referred accounts are owned and serviced by Harper.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="form-label-light mb-1.5">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-[0.75rem] text-ember-salmon-800">{error}</span>
      )}
    </label>
  );
}
