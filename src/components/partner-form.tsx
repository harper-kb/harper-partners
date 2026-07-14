"use client";

import { useState } from "react";

const LINES_OPTIONS = [
  "Personal & auto only",
  "Personal, auto & some commercial",
  "Full commercial book",
  "Other / not sure",
];

/**
 * Partner sign-up form — static marketing UI. No backend: on submit it
 * flips to a client-side thank-you state. Styling mirrors the marketplace
 * InquiryForm (form-input-light + coral pill button + arrow chip).
 */
export function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="card-base border-ember-green-600/30 bg-ember-green-100/40 p-8 text-center">
        <p className="display-serif text-2xl text-ember-green-700 m-0">
          You&apos;re on the list ✓
        </p>
        <p className="mt-2 text-sm text-ember-muted max-w-[46ch] mx-auto">
          Thanks for your interest in Harper Partners. Our partnerships team will
          reach out to walk you through the 50/50 split and get you set up.
          Georgia brokerages are onboarding first.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
      noValidate
    >
      <Field label="Your name">
        <input
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          className="form-input-light text-sm"
          placeholder="Jane Alvarez"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Agency name">
          <input
            name="agency"
            required
            maxLength={160}
            autoComplete="organization"
            className="form-input-light text-sm"
            placeholder="Alvarez Family Insurance"
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className="form-input-light text-sm"
            placeholder="jane@youragency.com"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State">
          <input
            name="state"
            required
            maxLength={40}
            className="form-input-light text-sm"
            placeholder="Georgia"
          />
        </Field>
        <Field label="Lines you write">
          <select name="lines" required defaultValue="" className="form-input-light text-sm">
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
        Free to join. You only ever pay us back out of commission we place —
        never out of pocket.
      </p>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="form-label-light mb-1.5">{label}</span>
      {children}
    </label>
  );
}
