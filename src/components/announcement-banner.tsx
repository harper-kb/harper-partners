"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Announcement banner — same pattern as harperinsure.com's
 * AnnouncementBanner.astro (dark bar above the nav, dismissible).
 */
export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="w-full text-ember-creme/80 bg-ember-blue-dark border-b border-white/[0.06]"
    >
      <div className="relative flex items-center justify-center min-h-[40px] px-4 sm:px-8 lg:px-16 py-2">
        <p className="text-sm sm:text-base font-medium text-center pr-8 sm:pr-10 m-0">
          <span className="md:hidden">Georgia brokerages onboarding first</span>
          <span className="hidden md:inline">
            Now onboarding Georgia brokerages — keep 50% on every commercial referral.
          </span>
          <Link
            href="#become-a-partner"
            className="inline-flex items-center gap-1 bg-ember-salmon text-white text-xs sm:text-sm font-semibold rounded-full px-3 py-0.5 whitespace-nowrap shrink-0 ml-2 hover:bg-ember-coral-deep transition-colors no-underline"
          >
            Become a partner
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setDismissed(true)}
          className="absolute right-4 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 p-1 text-ember-creme/70 hover:text-ember-creme transition-colors"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            close
          </span>
        </button>
      </div>
    </div>
  );
}
