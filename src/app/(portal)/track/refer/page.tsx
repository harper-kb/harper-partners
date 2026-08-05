import type { Metadata } from "next";
import { ReferForm } from "@/components/track/refer-form";

export const metadata: Metadata = {
  title: "Refer a lead",
  description:
    "Send a commercial referral to Harper intake from the Partner Track portal.",
  robots: { index: false, follow: false },
};

export default function TrackReferPage() {
  return <ReferForm />;
}
