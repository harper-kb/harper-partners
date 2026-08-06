import type { Metadata } from "next";
import { BlitzReferForm } from "@/components/blitz/blitz-refer-form";

export const metadata: Metadata = {
  title: "Refer a lead · Harper + Blitz",
  description:
    "Send a Blitz commercial referral to Harper. Tagged as a partner referral — not a web lead.",
  robots: { index: false, follow: false },
};

export default function BlitzReferPage() {
  return <BlitzReferForm />;
}
