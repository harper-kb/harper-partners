import Link from "next/link";
import Image from "next/image";

const FOOTER_SECTIONS: {
  title: string;
  items: { name: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Partner Program",
    items: [
      { name: "How It Works", href: "#how-it-works" },
      { name: "The 50/50 Split", href: "#the-split" },
      { name: "Become a Partner", href: "#become-a-partner" },
    ],
  },
  {
    title: "For Brokerages",
    items: [
      { name: "FAQ", href: "#faq" },
      { name: "Get Insured", href: "https://harperinsure.com", external: true },
    ],
  },
  {
    title: "Harper",
    items: [
      { name: "harperinsure.com", href: "https://harperinsure.com", external: true },
      { name: "Industries We Serve", href: "https://harperinsure.com/industries", external: true },
      { name: "Risk We Cover", href: "https://harperinsure.com/coverages", external: true },
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

/**
 * Footer — editorial multi-column footer, same structure and styling as
 * harperinsure.com's Footer.astro (light variant on the beige band).
 */
export function SiteFooter() {
  return (
    <section className="w-full relative overflow-hidden bg-ember-beige-02 border-t border-ember-rule">
      <div className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 py-8">
        <footer className="mt-16 pt-12">
          <div className="flex flex-col gap-10">
            {/* Top: brand + nav columns */}
            <div className="grid grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 md:gap-10">
              <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                <Link href="/" className="inline-block">
                  <Image
                    src="/harper_name_logo.svg"
                    alt="Harper"
                    width={79}
                    height={20}
                    className="h-5 w-auto"
                  />
                </Link>
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
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-ember-blue-08 hover:text-ember-blue text-[0.8125rem] transition-colors"
                        >
                          {item.name}
                        </Link>
                      ),
                    )}
                  </nav>
                </div>
              ))}
            </div>

            {/* Bottom: logo + copyright + legal links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7 border-ember-rule border-t">
              <Link href="/" className="inline-block">
                <Image
                  src="/harper_name_logo.svg"
                  alt="Harper"
                  width={79}
                  height={20}
                  className="h-5 w-auto"
                />
              </Link>
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
                Commission-share arrangements are available to appropriately licensed
                partners only. Unlicensed sources may receive flat per-referral fees
                where permitted by law. Nothing here is an offer of insurance.
              </p>
            </address>
          </div>
        </footer>
      </div>
    </section>
  );
}
