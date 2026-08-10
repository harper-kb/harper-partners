import type { Metadata } from "next";
import { BlitzTrackPortal } from "@/components/blitz-track/blitz-track-portal";

export const metadata: Metadata = {
  title: "Blitz Track",
  description:
    "Shared Harper + Blitz referral dashboard — every Blitz lead in one place.",
  robots: { index: false, follow: false },
};

export default function BlitzTrackPage() {
  return <BlitzTrackPortal />;
}
