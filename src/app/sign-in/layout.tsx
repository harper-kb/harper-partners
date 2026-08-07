import { AppClerkProvider } from "@/components/providers/clerk-provider";

export default function SignInLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
