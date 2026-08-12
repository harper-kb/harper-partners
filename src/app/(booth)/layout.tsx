import Link from "next/link";
import Image from "next/image";

/**
 * Chrome for booth intake pages (e.g. /auto). Mirrors the main site's header
 * and multi-column footer exactly (same bar, typography, footer structure as
 * harperinsure.com / the partners home page) but swaps the partner-program
 * links (50/50 split, Become a Partner) for dealer-appropriate ones — dealers
 * at an auction booth are a different audience than referring agents.
 */

const FOOTER_SECTIONS: {
  title: string;
  items: { name: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "For Dealers",
    items: [
      { name: "Get a Quote", href: "#quote-form" },
      { name: "Call a Broker", href: "tel:+14159303002" },
    ],
  },
  {
    title: "Coverage",
    items: [
      { name: "Risk We Cover", href: "https://harperinsure.com/coverages", external: true },
      { name: "Industries We Serve", href: "https://harperinsure.com/industries", external: true },
    ],
  },
  {
    title: "Harper",
    items: [
      { name: "harperinsure.com", href: "https://harperinsure.com", external: true },
    ],
  },
  {
    title: "Socials",
    items: [
      { name: "LinkedIn", href: "https://www.linkedin.com/company/harperinsure", external: true },
      { name: "X", href: "https://x.com/Harper_Insure", external: true },
    ],
  },
];

export default function BoothLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="w-full sticky top-0 z-50 bg-ember-blue border-b border-white/[0.06]">
        <nav className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 h-[68px] flex items-center">
          <div className="shrink-0 flex items-center gap-3">
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
          </div>

          <div className="flex justify-end items-center gap-4 sm:gap-7 w-full">
            <a
              href="https://harperinsure.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block text-sm font-medium text-ember-creme/70 hover:text-white transition-colors"
            >
              harperinsure.com
            </a>
            <a
              href="tel:+14159303002"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-ember-creme/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              (415) 930-3002
            </a>
            <a
              href="tel:+14159303002"
              aria-label="Call Harper"
              className="sm:hidden flex items-center text-ember-creme/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">call</span>
            </a>
            <a href="#quote-form" className="cta-button-standalone no-underline">
              Get My Quote
            </a>
          </div>
        </nav>
      </div>

      <main className="flex-1">{children}</main>

      <section className="w-full relative overflow-hidden bg-ember-beige-02 border-t border-ember-rule">
        <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-8">
          <footer className="mt-16 pt-12">
            <div className="flex flex-col gap-10">
              {/* Top: brand + nav columns */}
              <div className="grid grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 md:gap-10">
                <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                  <a href="https://harperinsure.com" className="inline-block">
                    <Image
                      src="/harper_name_logo.svg"
                      alt="Harper"
                      width={79}
                      height={20}
                      className="h-5 w-auto"
                    />
                  </a>
                  <p className="text-ember-blue-08 text-[0.8125rem] leading-relaxed m-0 max-w-[22ch]">
                    425 Market Street, Suite 1300
                    <br />
                    San Francisco, California 94105
                  </p>
                </div>

                {FOOTER_SECTIONS.map((section) => (
                  <div key={section.title} className="flex flex-col gap-3">
                    <h3 className="text-ember-blue text-[0.6875rem] font-semibold uppercase tracking-[0.08em] m-0">
                      {section.title}
                    </h3>
                    <nav className="flex flex-col gap-2">
                      {section.items.map((item) =>
                        item.external ? (
                          <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ember-blue-08 hover:text-ember-blue text-[0.8125rem] transition-colors"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <a
                            key={item.name}
                            href={item.href}
                            className="text-ember-blue-08 hover:text-ember-blue text-[0.8125rem] transition-colors"
                          >
                            {item.name}
                          </a>
                        ),
                      )}
                    </nav>
                  </div>
                ))}
              </div>

              {/* Bottom: logo + copyright + legal links */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7 border-ember-rule border-t">
                <a href="https://harperinsure.com" className="inline-block">
                  <Image
                    src="/harper_name_logo.svg"
                    alt="Harper"
                    width={79}
                    height={20}
                    className="h-5 w-auto"
                  />
                </a>
                <p className="text-ember-blue-08 text-xs m-0">
                  &copy; {new Date().getFullYear()} Harper Group. All rights reserved.
                </p>
                <nav className="flex gap-6">
                  <a
                    href="https://www.harperinsure.com/privacypolicy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ember-blue-08 hover:text-ember-blue text-xs transition-colors"
                  >
                    Privacy Policy
                  </a>
                </nav>
              </div>

              {/* Legal: entity, physical address & license numbers */}
              <address className="-mt-8 pb-2 not-italic">
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
          </footer>
        </div>
      </section>
    </>
  );
}
