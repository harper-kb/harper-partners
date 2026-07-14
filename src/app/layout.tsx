import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBanner } from "@/components/announcement-banner";
import "./globals.css";

// Font roles mirror harperinsuredotcom: Plus Jakarta Sans (primary) +
// Playfair Display (secondary serif, italics for coral accents).
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Harper Partners — the 50/50 revenue-share partner program",
    template: "%s | Harper Partners",
  },
  description:
    "Send us the commercial business you can't write and keep 50% of the commission — and when personal & auto business comes our way, we'll send it to you. A partnership for personal & auto brokerages.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    siteName: "Harper Partners",
    type: "website",
    title: "Harper Partners",
    description:
      "Turn the commercial clients you can't write into income. Keep 50% of the commission, and when personal & auto business comes our way, we'll send it to you — backed by Harper.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Font variable classes live on <html> so :root-level --font-primary/
    // --font-secondary (which reference them) resolve correctly.
    <html lang="en" className={`${jakarta.variable} ${playfair.variable}`}>
      <head>
        {/* Material Symbols iconography, as on harperinsure.com */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <AnnouncementBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
