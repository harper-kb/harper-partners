"use client";

import { useMemo, useState } from "react";

/**
 * Auto auction dealer intake — a 5-minute booth questionnaire that mirrors the
 * garage application. Knockout questions come first (repossession, overnight
 * test drives, auto pawn); everything Ryan flagged as skippable is auto-filled
 * silently and submitted alongside the answers.
 */

type Answers = Record<string, string>;

// Answers we never ask at the booth — pre-filled per Ryan's walkthrough of the
// garage app. Submitted with every intake so the record is complete.
const AUTO_FILL = {
  inventoryType: "Private passenger autos (100%)",
  serviceAndRepair: "No — sales only",
  commercialDriversLicense: "No",
  personalAutoPolicyInPlace: "Yes",
  employment: "Full-time / owner",
  subcontractDrivers: "No — owners drive",
  towingOperations: "No",
  transporterOrRepairPlates: "No",
  leaseOrRentVehiclesOut: "No",
  importExportVehicles: "No",
  operatesAuction: "No",
  raceOrSpecialtyVehicles: "No",
  customerVehiclesOnStreet: "N/A — no customer vehicles",
  deliverVehiclesToCustomer: "No — customer picks up",
  rideShareProgram: "No",
  verifyDriversLicenseBeforeTestDrive: "Yes",
  rideAlongOnTestDrives: "Yes",
};

const YES_NO = ["Yes", "No"] as const;

const STEPS = [
  "Your business",
  "Quick check",
  "Owner & insurance",
  "Lot & security",
  "Operations",
  "Coverage",
] as const;

function RequiredMark() {
  return <span className="text-ember-salmon-800"> *</span>;
}

function YesNo({
  label,
  hint,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <span className="form-label-light mb-1.5 block">
        {label}
        {required && <RequiredMark />}
      </span>
      {hint && <p className="text-[0.75rem] text-ember-muted m-0 mb-2">{hint}</p>}
      <div className="flex gap-2">
        {YES_NO.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-[6px] border px-4 py-3 text-sm font-medium transition-colors ${
              value === opt
                ? "border-ember-salmon bg-ember-salmon/10 text-ember-blue"
                : "border-ember-rule bg-white text-ember-muted hover:border-ember-blue/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-[0.75rem] text-ember-salmon-800 m-0">{error}</p>}
    </div>
  );
}

function Choice({
  label,
  hint,
  options,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  hint?: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <span className="form-label-light mb-1.5 block">
        {label}
        {required && <RequiredMark />}
      </span>
      {hint && <p className="text-[0.75rem] text-ember-muted m-0 mb-2">{hint}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-[6px] border px-4 py-3 text-left text-sm font-medium transition-colors ${
              value === opt
                ? "border-ember-salmon bg-ember-salmon/10 text-ember-blue"
                : "border-ember-rule bg-white text-ember-muted hover:border-ember-blue/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-[0.75rem] text-ember-salmon-800 m-0">{error}</p>}
    </div>
  );
}

function Text({
  label,
  name,
  value,
  onChange,
  placeholder,
  hint,
  error,
  type = "text",
  inputMode,
  required,
  min,
  max,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "decimal";
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="form-label-light mb-1.5">
        {label}
        {required && <RequiredMark />}
      </span>
      {hint && <p className="text-[0.75rem] text-ember-muted m-0 mb-1.5">{hint}</p>}
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        maxLength={300}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input-light text-sm"
        placeholder={placeholder}
      />
      {error && <span className="mt-1 block text-[0.75rem] text-ember-salmon-800">{error}</span>}
    </label>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="form-label-light mb-1.5">
        {label}
        {required && <RequiredMark />}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input-light text-sm"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-[0.75rem] text-ember-salmon-800">{error}</span>}
    </label>
  );
}

const LIABILITY_OPTIONS = [
  "$100,000 (most popular)",
  "$200,000",
  "$300,000",
  "Not sure",
  "Custom amount…",
] as const;

export function AutoIntakeForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "qualified" | "disqualified">(null);

  const set = (key: string) => (v: string) => {
    setAnswers((a) => ({ ...a, [key]: v }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  // Repossession and overnight test drives can be rescued if the dealer is
  // willing to change the practice (per Ryan); auto pawn is a hard knockout.
  const knockedOut = useMemo(
    () =>
      answers.autoPawn === "Yes" ||
      (answers.repossess === "Yes" && answers.repossessWilling !== "Yes") ||
      (answers.overnightTestDrives === "Yes" &&
        answers.overnightWilling !== "Yes"),
    [answers]
  );

  function validate(current: number): boolean {
    const next: Record<string, string> = {};
    const need = (key: string, msg: string) => {
      if (!(answers[key] ?? "").trim()) next[key] = msg;
    };

    if (current === 0) {
      need("businessName", "Please enter the business name.");
      need("entityType", "Pick one.");
      need("contactName", "Please enter a name.");
      need("phone", "Please enter a phone number.");
      need("mailingAddress", "Please enter the mailing address.");
      need("yearsExperience", "Required.");
      need("yearsInBusiness", "Required.");
      need("annualSales", "Rough number is fine.");
    }
    if (current === 1) {
      need("repossess", "Please answer.");
      if (answers.repossess === "Yes") need("repossessWilling", "Please answer.");
      need("overnightTestDrives", "Please answer.");
      if (answers.overnightTestDrives === "Yes")
        need("overnightWilling", "Please answer.");
      need("autoPawn", "Please answer.");
    }
    if (current === 2) {
      need("ownerName", "Required for the quote.");
      need("ownerDob", "Required for the quote.");
      need("dlNumber", "Required — carriers pull MVRs.");
      need("dlState", "Required.");
      need("otherOwners", "Please answer.");
      if (answers.otherOwners === "Yes") {
        need("otherOwnerName", "Required for the quote.");
        need("otherOwnerDob", "Required for the quote.");
        need("otherOwnerDl", "Required — carriers pull MVRs.");
        need("otherOwnerDlState", "Required.");
      }
      need("priorInsurance", "Please answer.");
      if (answers.priorInsurance === "Yes") {
        need("priorCarrier", "Who was the carrier?");
        need("priorLosses", "Please answer.");
        need("renewalOffered", "Please answer.");
        if (answers.renewalOffered === "No")
          need("renewalNotOfferedReason", "A quick reason is fine.");
      }
    }
    if (current === 3) {
      need("addressMatch", "Please answer.");
      if (answers.addressMatch === "No") need("businessAddress", "Where is the lot?");
      need("oneLocation", "Please answer.");
      if (answers.oneLocation === "No")
        need("otherLocations", "Where else are vehicles kept?");
      need("lotSecurity", "Pick one.");
      need("keysStored", "Pick one.");
      need("firearms", "Please answer.");
    }
    if (current === 4) {
      need("dealerLicense", "Please answer.");
      if (answers.dealerLicense === "Yes") need("licenseState", "Which state?");
      need("salesType", "Pick one.");
      need("numPlates", "How many plates?");
      need("vehiclesPerYear", "Required.");
      need("sightUnseen", "Please answer.");
      need("salvageTitles", "Please answer.");
      need("financing", "Please answer.");
      need("whoTransports", "Pick one.");
      if (answers.whoTransports === "Third-party transporter")
        need("thirdPartyCoi", "Please answer.");
      need("maxDistance", "Rough number is fine.");
    }
    if (current === 5) {
      need("liabilityOccurrence", "Pick one.");
      if (answers.liabilityOccurrence === "Custom amount…")
        need("liabilityOccurrenceCustom", "Enter an amount.");
      need("liabilityAggregate", "Pick one.");
      if (answers.liabilityAggregate === "Custom amount…")
        need("liabilityAggregateCustom", "Enter an amount.");
      need("inventoryCoverage", "Please answer.");
      if (answers.inventoryCoverage === "Yes") {
        need("avgCarsOnLot", "Rough number is fine.");
        need("avgCarCost", "Rough number is fine.");
        need("mostExpensiveCar", "Rough number is fine.");
      }
      need("testDriveCollision", "Please answer.");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(status: "qualified" | "disqualified") {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auto-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, answers, autofill: AUTO_FILL }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setDone(status);
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!validate(step)) return;
    // Knockout answers end the flow early — save what we have and hand off to
    // a broker follow-up instead of walking them through the full app.
    if (step === 1 && knockedOut) {
      void submit("disqualified");
      return;
    }
    if (step === STEPS.length - 1) {
      void submit("qualified");
      return;
    }
    setStep((s) => s + 1);
  }

  if (done) {
    return (
      <div className="card-base border-ember-green-600/30 bg-ember-green-100/40 p-8 text-center">
        <p className="display-serif text-2xl text-ember-green-700 m-0">
          You&apos;re in ✓
        </p>
        <p className="mt-2 text-sm text-ember-muted max-w-[46ch] mx-auto">
          {done === "qualified"
            ? "That's everything we need to start your quote. You're entered in the raffle — a Harper broker will call you with your quote, usually within one business day."
            : "Thanks — you're entered in the raffle. Your operation has a couple of details our standard program doesn't cover, so a Harper broker will reach out to talk through options."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ember-muted">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-[0.6875rem] font-medium text-ember-muted">
            {STEPS[step]}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-ember-rule overflow-hidden">
          <div
            className="h-full rounded-full bg-ember-salmon transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {step === 0 && (
          <>
            <Text
              label="Business name"
              name="businessName"
              value={answers.businessName ?? ""}
              onChange={set("businessName")}
              placeholder="Fully spelled out — as on your dealer license"
              error={errors.businessName}
              required
            />
            <Text
              label="DBA (if any)"
              name="dba"
              value={answers.dba ?? ""}
              onChange={set("dba")}
              placeholder="Doing business as…"
            />
            <Choice
              label="How is the business set up?"
              options={["LLC", "Individual / sole proprietor", "Corporation"]}
              value={answers.entityType ?? ""}
              onChange={set("entityType")}
              error={errors.entityType}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="Your name"
                name="contactName"
                value={answers.contactName ?? ""}
                onChange={set("contactName")}
                placeholder="First and last"
                error={errors.contactName}
                required
              />
              <Text
                label="Phone"
                name="phone"
                type="tel"
                inputMode="tel"
                value={answers.phone ?? ""}
                onChange={set("phone")}
                placeholder="(555) 555-5555"
                error={errors.phone}
                required
              />
            </div>
            <Text
              label="Mailing address"
              name="mailingAddress"
              value={answers.mailingAddress ?? ""}
              onChange={set("mailingAddress")}
              placeholder="Street, city, state, ZIP"
              error={errors.mailingAddress}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="Years of dealer experience"
                name="yearsExperience"
                inputMode="numeric"
                value={answers.yearsExperience ?? ""}
                onChange={set("yearsExperience")}
                placeholder="e.g. 6"
                error={errors.yearsExperience}
                required
              />
              <Text
                label="How long has the business been operating?"
                name="yearsInBusiness"
                inputMode="numeric"
                value={answers.yearsInBusiness ?? ""}
                onChange={set("yearsInBusiness")}
                placeholder="Years"
                error={errors.yearsInBusiness}
                required
              />
            </div>
            <Text
              label="Total dealer sales per year ($)"
              name="annualSales"
              inputMode="numeric"
              value={answers.annualSales ?? ""}
              onChange={set("annualSales")}
              placeholder="Rough number is fine"
              error={errors.annualSales}
              required
            />
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-ember-muted m-0">
              Three quick yes/no questions before we go any further.
            </p>
            <YesNo
              label="Do you ever repossess vehicles you've sold yourself?"
              value={answers.repossess ?? ""}
              onChange={set("repossess")}
              error={errors.repossess}
              required
            />
            {answers.repossess === "Yes" && (
              <YesNo
                label="Would you be willing to have a third party handle repossessions instead?"
                hint="Self-repossession is very high risk — hiring it out moves that risk to someone else."
                value={answers.repossessWilling ?? ""}
                onChange={set("repossessWilling")}
                error={errors.repossessWilling}
                required
              />
            )}
            <YesNo
              label="Do you allow overnight or extended test drives?"
              hint="Letting a customer take a car home or keep it overnight."
              value={answers.overnightTestDrives ?? ""}
              onChange={set("overnightTestDrives")}
              error={errors.overnightTestDrives}
              required
            />
            {answers.overnightTestDrives === "Yes" && (
              <YesNo
                label="Would you be willing to stop allowing overnight or extended test drives?"
                value={answers.overnightWilling ?? ""}
                onChange={set("overnightWilling")}
                error={errors.overnightWilling}
                required
              />
            )}
            <YesNo
              label="Any auto pawn operations?"
              value={answers.autoPawn ?? ""}
              onChange={set("autoPawn")}
              error={errors.autoPawn}
              required
            />
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-ember-muted m-0">
              Carriers run a motor vehicle report on the owner — this part is
              required for every quote.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="Owner's full name"
                name="ownerName"
                value={answers.ownerName ?? ""}
                onChange={set("ownerName")}
                error={errors.ownerName}
                required
              />
              <Text
                label="Owner's date of birth"
                name="ownerDob"
                type="date"
                min="1920-01-01"
                max="2005-12-31"
                value={answers.ownerDob ?? ""}
                onChange={set("ownerDob")}
                error={errors.ownerDob}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="Driver's license number"
                name="dlNumber"
                value={answers.dlNumber ?? ""}
                onChange={set("dlNumber")}
                error={errors.dlNumber}
                required
              />
              <Text
                label="License state"
                name="dlState"
                value={answers.dlState ?? ""}
                onChange={set("dlState")}
                placeholder="e.g. OH"
                error={errors.dlState}
                required
              />
            </div>
            <YesNo
              label="Any other owners in the business?"
              value={answers.otherOwners ?? ""}
              onChange={set("otherOwners")}
              error={errors.otherOwners}
              required
            />
            {answers.otherOwners === "Yes" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text
                    label="Other owner's full name"
                    name="otherOwnerName"
                    value={answers.otherOwnerName ?? ""}
                    onChange={set("otherOwnerName")}
                    error={errors.otherOwnerName}
                    required
                  />
                  <Text
                    label="Other owner's date of birth"
                    name="otherOwnerDob"
                    type="date"
                    min="1920-01-01"
                    max="2005-12-31"
                    value={answers.otherOwnerDob ?? ""}
                    onChange={set("otherOwnerDob")}
                    error={errors.otherOwnerDob}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text
                    label="Other owner's driver's license number"
                    name="otherOwnerDl"
                    value={answers.otherOwnerDl ?? ""}
                    onChange={set("otherOwnerDl")}
                    error={errors.otherOwnerDl}
                    required
                  />
                  <Text
                    label="Other owner's license state"
                    name="otherOwnerDlState"
                    value={answers.otherOwnerDlState ?? ""}
                    onChange={set("otherOwnerDlState")}
                    placeholder="e.g. OH"
                    error={errors.otherOwnerDlState}
                    required
                  />
                </div>
                <p className="text-[0.75rem] text-ember-muted m-0">
                  More than one additional owner? We&apos;ll collect the rest on
                  the follow-up call.
                </p>
              </>
            )}
            <YesNo
              label="Have you had insurance for this business before?"
              value={answers.priorInsurance ?? ""}
              onChange={set("priorInsurance")}
              error={errors.priorInsurance}
              required
            />
            {answers.priorInsurance === "Yes" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text
                    label="Who was the carrier?"
                    name="priorCarrier"
                    value={answers.priorCarrier ?? ""}
                    onChange={set("priorCarrier")}
                    error={errors.priorCarrier}
                    required
                  />
                  <Text
                    label="Roughly what were you paying?"
                    name="priorPremium"
                    inputMode="numeric"
                    value={answers.priorPremium ?? ""}
                    onChange={set("priorPremium")}
                    placeholder="$ per year"
                  />
                </div>
                <Choice
                  label="Is your current insurer offering you a renewal?"
                  options={["Yes", "No", "Not sure"]}
                  value={answers.renewalOffered ?? ""}
                  onChange={set("renewalOffered")}
                  error={errors.renewalOffered}
                  required
                />
                {answers.renewalOffered === "No" && (
                  <Text
                    label="Why aren't they offering renewal?"
                    name="renewalNotOfferedReason"
                    value={answers.renewalNotOfferedReason ?? ""}
                    onChange={set("renewalNotOfferedReason")}
                    placeholder="A quick reason is fine"
                    error={errors.renewalNotOfferedReason}
                    required
                  />
                )}
                <YesNo
                  label="Any losses or claims?"
                  value={answers.priorLosses ?? ""}
                  onChange={set("priorLosses")}
                  error={errors.priorLosses}
                  required
                />
                {answers.priorLosses === "Yes" && (
                  <Text
                    label="Quick description of the loss(es)"
                    name="lossDetails"
                    value={answers.lossDetails ?? ""}
                    onChange={set("lossDetails")}
                  />
                )}
                <YesNo
                  label="Has a policy ever been canceled on you?"
                  value={answers.everCanceled ?? ""}
                  onChange={set("everCanceled")}
                />
                {answers.everCanceled === "Yes" && (
                  <Text
                    label="What was the reason?"
                    name="cancelReason"
                    value={answers.cancelReason ?? ""}
                    onChange={set("cancelReason")}
                  />
                )}
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <YesNo
              label="Is your business address the same as your mailing address?"
              value={answers.addressMatch ?? ""}
              onChange={set("addressMatch")}
              error={errors.addressMatch}
              required
            />
            {answers.addressMatch === "No" && (
              <Text
                label="Business / lot address"
                name="businessAddress"
                value={answers.businessAddress ?? ""}
                onChange={set("businessAddress")}
                placeholder="Street, city, state, ZIP"
                error={errors.businessAddress}
                required
              />
            )}
            <YesNo
              label="Is everything at one location?"
              hint="Or do you store / display vehicles anywhere else?"
              value={answers.oneLocation ?? ""}
              onChange={set("oneLocation")}
              error={errors.oneLocation}
              required
            />
            {answers.oneLocation === "No" && (
              <Text
                label="Where else are vehicles kept?"
                name="otherLocations"
                value={answers.otherLocations ?? ""}
                onChange={set("otherLocations")}
                error={errors.otherLocations}
                required
              />
            )}
            <Choice
              label="What security does your lot have?"
              hint="Carriers require some form of lot security for dealer coverage."
              options={[
                "Cameras",
                "Post & cable / fencing",
                "Cameras + fencing",
                "None yet — willing to install",
                "None",
              ]}
              value={answers.lotSecurity ?? ""}
              onChange={set("lotSecurity")}
              error={errors.lotSecurity}
              required
            />
            <Choice
              label="Where are vehicle keys kept?"
              options={[
                "Key cabinet in the office",
                "Safe in the office",
                "Locked drawer or desk in the office",
                "Owner takes them home",
                "Carried by owner / staff",
                "Somewhere else",
              ]}
              value={answers.keysStored ?? ""}
              onChange={set("keysStored")}
              error={errors.keysStored}
              required
            />
            <YesNo
              label="Are any firearms kept on the premises?"
              value={answers.firearms ?? ""}
              onChange={set("firearms")}
              error={errors.firearms}
              required
            />
          </>
        )}

        {step === 4 && (
          <>
            <YesNo
              label="Do you hold a dealer's license?"
              value={answers.dealerLicense ?? ""}
              onChange={set("dealerLicense")}
              error={errors.dealerLicense}
              required
            />
            {answers.dealerLicense === "Yes" && (
              <Text
                label="Which state?"
                name="licenseState"
                value={answers.licenseState ?? ""}
                onChange={set("licenseState")}
                placeholder="e.g. OH"
                error={errors.licenseState}
                required
              />
            )}
            <Choice
              label="Do you sell retail or wholesale?"
              options={["Retail (to the public)", "Wholesale (to other dealers)", "Both"]}
              value={answers.salesType ?? ""}
              onChange={set("salesType")}
              error={errors.salesType}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="How many dealer plates do you have?"
                name="numPlates"
                inputMode="numeric"
                value={answers.numPlates ?? ""}
                onChange={set("numPlates")}
                error={errors.numPlates}
                required
              />
              <Text
                label="Vehicles sold per year"
                name="vehiclesPerYear"
                inputMode="numeric"
                value={answers.vehiclesPerYear ?? ""}
                onChange={set("vehiclesPerYear")}
                placeholder="Rough number is fine"
                error={errors.vehiclesPerYear}
                required
              />
            </div>
            <YesNo
              label="Do you sell vehicles sight-unseen / online?"
              hint="Buyers purchasing without visiting the lot."
              value={answers.sightUnseen ?? ""}
              onChange={set("sightUnseen")}
              error={errors.sightUnseen}
              required
            />
            <YesNo
              label="Do you deal in salvage or total-loss titled vehicles?"
              value={answers.salvageTitles ?? ""}
              onChange={set("salvageTitles")}
              error={errors.salvageTitles}
              required
            />
            <YesNo
              label="Do you offer financing to buyers?"
              hint="In-house or through an outside bank."
              value={answers.financing ?? ""}
              onChange={set("financing")}
              error={errors.financing}
              required
            />
            <Choice
              label="After you buy at auction, who gets the car back to your lot?"
              options={["I / my team drive it", "Third-party transporter", "Towed"]}
              value={answers.whoTransports ?? ""}
              onChange={set("whoTransports")}
              error={errors.whoTransports}
              required
            />
            {answers.whoTransports === "Third-party transporter" && (
              <YesNo
                label="Does the transporter carry their own insurance (COI)?"
                value={answers.thirdPartyCoi ?? ""}
                onChange={set("thirdPartyCoi")}
                error={errors.thirdPartyCoi}
                required
              />
            )}
            <Text
              label="Farthest you'd ever transport a vehicle (miles)"
              name="maxDistance"
              inputMode="numeric"
              value={answers.maxDistance ?? ""}
              onChange={set("maxDistance")}
              placeholder="e.g. 150"
              error={errors.maxDistance}
              required
            />
          </>
        )}

        {step === 5 && (
          <>
            <div>
              <span className="form-label-light mb-1.5 block">
                How much liability coverage do you want?
                <RequiredMark />
              </span>
              <p className="text-[0.75rem] text-ember-muted m-0 mb-2">
                Most dealers your size start at $100k — premium scales quickly
                above that.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Per occurrence"
                  options={LIABILITY_OPTIONS}
                  value={answers.liabilityOccurrence ?? ""}
                  onChange={set("liabilityOccurrence")}
                  error={errors.liabilityOccurrence}
                />
                <Select
                  label="Aggregate"
                  options={LIABILITY_OPTIONS}
                  value={answers.liabilityAggregate ?? ""}
                  onChange={set("liabilityAggregate")}
                  error={errors.liabilityAggregate}
                />
              </div>
              {(answers.liabilityOccurrence === "Custom amount…" ||
                answers.liabilityAggregate === "Custom amount…") && (
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  {answers.liabilityOccurrence === "Custom amount…" ? (
                    <Text
                      label="Custom per-occurrence amount ($)"
                      name="liabilityOccurrenceCustom"
                      inputMode="numeric"
                      value={answers.liabilityOccurrenceCustom ?? ""}
                      onChange={set("liabilityOccurrenceCustom")}
                      error={errors.liabilityOccurrenceCustom}
                      required
                    />
                  ) : (
                    <div />
                  )}
                  {answers.liabilityAggregate === "Custom amount…" && (
                    <Text
                      label="Custom aggregate amount ($)"
                      name="liabilityAggregateCustom"
                      inputMode="numeric"
                      value={answers.liabilityAggregateCustom ?? ""}
                      onChange={set("liabilityAggregateCustom")}
                      error={errors.liabilityAggregateCustom}
                      required
                    />
                  )}
                </div>
              )}
            </div>
            <YesNo
              label="Do you want your inventory (the cars on your lot) covered?"
              value={answers.inventoryCoverage ?? ""}
              onChange={set("inventoryCoverage")}
              error={errors.inventoryCoverage}
              required
            />
            {answers.inventoryCoverage === "Yes" && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Text
                  label="Avg. cars on the lot"
                  name="avgCarsOnLot"
                  inputMode="numeric"
                  value={answers.avgCarsOnLot ?? ""}
                  onChange={set("avgCarsOnLot")}
                  error={errors.avgCarsOnLot}
                  required
                />
                <Text
                  label="Avg. cost per car ($)"
                  name="avgCarCost"
                  inputMode="numeric"
                  value={answers.avgCarCost ?? ""}
                  onChange={set("avgCarCost")}
                  error={errors.avgCarCost}
                  required
                />
                <Text
                  label="Most expensive car ($)"
                  name="mostExpensiveCar"
                  inputMode="numeric"
                  value={answers.mostExpensiveCar ?? ""}
                  onChange={set("mostExpensiveCar")}
                  error={errors.mostExpensiveCar}
                  required
                />
              </div>
            )}
            <YesNo
              label="Do you want collision coverage on test drives?"
              hint="Covers the car if it's hit while a customer is test driving."
              value={answers.testDriveCollision ?? ""}
              onChange={set("testDriveCollision")}
              error={errors.testDriveCollision}
              required
            />
          </>
        )}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="btn-outline-pill border-ember-rule text-ember-muted hover:border-ember-blue/40 hover:text-ember-blue"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="cta-button-primary flex-1 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-salmon focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Saving…"
            : step === STEPS.length - 1
              ? "Submit — enter the raffle"
              : "Next"}
          <span className="btn-arrow-chip">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </button>
      </div>
      {submitError && (
        <p className="mt-3 text-center text-[0.8125rem] text-ember-salmon-800" role="alert">
          {submitError}
        </p>
      )}
      <p className="mt-4 text-center text-[11px] leading-relaxed text-ember-muted">
        <span className="text-ember-salmon-800">*</span> required. Your answers
        go straight to a licensed Harper broker — no spam, no obligation.
      </p>
    </div>
  );
}
