import { AppClerkProvider } from "@/components/providers/clerk-provider";

export default function SignUpLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
