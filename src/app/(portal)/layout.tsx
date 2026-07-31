export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex-1 min-h-screen">{children}</main>;
}
