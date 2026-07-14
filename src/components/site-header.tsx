"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const MENU_ITEMS = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "The 50/50", href: "#the-split" },
  { name: "FAQ", href: "#faq" },
  { name: "harperinsure.com", href: "https://harperinsure.com", external: true },
];

/**
 * Site header — Deep Blue editorial bar, same structure as
 * harperinsure.com's Navigation.astro: 68px sticky ember-blue bar,
 * coral wordmark, right-aligned nav + phone + coral pill CTA,
 * hamburger + slide-in sidebar on mobile.
 */
export function SiteHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const cta = (
    <Link href="#become-a-partner" className="cta-button-standalone no-underline">
      Become a Partner
    </Link>
  );

  return (
    <>
      <div className="w-full sticky top-0 z-50 bg-ember-blue border-b border-white/[0.06]">
        <nav className="w-full max-w-container mx-auto px-4 sm:px-8 lg:px-16 h-[68px] flex items-center">
          {/* Logo — wordmark renders in its native brand coral */}
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/harper_name_logo.svg"
                alt="Harper"
                width={110}
                height={28}
                className="h-7 w-auto"
                priority
              />
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.18em] text-ember-creme/60 leading-none border-l border-white/15 pl-3">
                Partners
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex justify-end items-center space-x-7 w-full">
            <div className="flex items-center space-x-7">
              {MENU_ITEMS.map((item) =>
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-ember-creme/70 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-ember-creme/70 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                ),
              )}
            </div>

            {/* Phone number, as on harperinsure.com */}
            <a
              href="tel:+14157046424"
              className="flex items-center gap-2 text-sm font-medium text-ember-creme/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              (415) 704-6424
            </a>

            {cta}
          </div>

          {/* Mobile header */}
          <div className="lg:hidden flex items-center space-x-4 w-full justify-end">
            {cta}
            <button
              className="p-2 relative z-[60]"
              aria-label="Toggle mobile menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <span className="material-symbols-outlined text-2xl text-ember-creme transition-colors">
                {sidebarOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-ember-blue z-[60] transform transition-transform duration-300 ease-out lg:hidden shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end p-6 border-b border-white/10">
            <button
              className="p-2 text-ember-creme hover:text-white transition-colors"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <nav className="flex-1 py-6">
            <ul className="space-y-1 list-none m-0 p-0">
              {MENU_ITEMS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-6 py-4 text-ember-creme/80 text-lg font-medium hover:bg-white/5 hover:text-white transition-colors no-underline"
                  >
                    {item.name}
                    <span className="material-symbols-outlined ml-auto text-base opacity-50">
                      arrow_outward
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6 border-t border-white/10 space-y-4">
            <a
              href="tel:+14157046424"
              className="flex items-center justify-center gap-2 text-ember-creme text-lg font-medium hover:text-white transition-colors no-underline"
            >
              <span className="material-symbols-outlined text-xl">call</span>
              (415) 704-6424
            </a>
            <Link
              href="#become-a-partner"
              onClick={() => setSidebarOpen(false)}
              className="cta-button-primary w-full justify-center no-underline"
            >
              Become a Partner
              <span className="material-symbols-outlined text-lg">arrow_outward</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
