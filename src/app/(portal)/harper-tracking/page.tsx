import type { Metadata } from "next";
import { HarperTrackingDashboard } from "@/components/harper-tracking/dashboard";

export const metadata: Metadata = {
  title: "Harper Tracking",
  description:
    "Internal board of signed partner agencies and their referred leads.",
  robots: { index: false, follow: false },
};

export default function HarperTrackingPage() {
  return <HarperTrackingDashboard />;
}
