import type { Metadata } from "next";
import { TrackPortal } from "@/components/track/track-portal";

export const metadata: Metadata = {
  title: "Partner Track",
  description:
    "See where your Harper referral leads live — from intake to quote to bind. Email-based partner portal.",
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return <TrackPortal />;
}
