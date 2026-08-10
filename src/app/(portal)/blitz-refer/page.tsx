import type { Metadata } from "next";
import { BlitzTrackReferForm } from "@/components/blitz-track/blitz-track-refer-form";

export const metadata: Metadata = {
  title: "Blitz Refer a Lead",
  description: "Refer a commercial lead from Blitz to Harper.",
  robots: { index: false, follow: false },
};

export default function BlitzReferPage() {
  return <BlitzTrackReferForm />;
}
