import Link from "next/link";
import Image from "next/image";

/**
 * Minimal chrome for booth intake pages (e.g. /auto). Deliberately omits the
 * partner-program header/footer (50/50 split, Become a Partner) — dealers at
 * an auction booth are a different audience than referring agents.
 */
export default function BoothLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="w-full sticky top-0 z-50 bg-ember-blue border-b border-white/[0.06]">
        <nav className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 h-[68px] flex items-center justify-between">
          <Link href="https://harperinsure.com" className="flex items-center gap-3">
            <Image
              src="/harper_name_logo.svg"
              alt="Harper"
              width={110}
              height={28}
              className="h-7 w-auto"
              priority
            />
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.18em] text-ember-creme/60 leading-none border-l border-white/15 pl-3">
              For Auto Dealers
            </span>
          </Link>
          <a
            href="tel:+14159303002"
            className="flex items-center gap-2 text-sm font-medium text-ember-creme/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            (415) 930-3002
          </a>
        </nav>
      </div>

      <main className="flex-1">{children}</main>

      <section className="w-full bg-ember-beige-02 border-t border-ember-rule">
        <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Image
              src="/harper_name_logo.svg"
              alt="Harper"
              width={79}
              height={20}
              className="h-5 w-auto"
            />
            <p className="text-ember-blue-08 text-xs m-0">
              &copy; {new Date().getFullYear()} Harper Group. All rights reserved.
            </p>
          </div>
          <address className="mt-4 not-italic">
            <p className="text-ember-blue-08 text-[0.71875rem] leading-normal m-0">
              Harper Global Enterprises Inc. DBA Harper Global Insurance Agency
            </p>
            <p className="text-ember-blue-08 text-[0.71875rem] leading-normal m-0">
              425 Market St, Suite 1300, San Francisco, CA 94105
            </p>
            <p className="text-ember-blue-08 text-[0.71875rem] leading-normal m-0">
              State Licenses: California License No. 6017784; Georgia License No. 237101.
            </p>
            <p className="text-ember-blue-08 text-[0.71875rem] leading-normal m-0 mt-2 max-w-[68ch]">
              Nothing here is an offer of insurance. Quotes are subject to
              underwriting review.
            </p>
          </address>
        </div>
      </section>
    </>
  );
}
