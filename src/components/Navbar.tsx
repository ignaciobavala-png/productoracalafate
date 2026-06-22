"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { InvitationButton } from "./InvitationButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

const NAV_ITEMS = [
  { key: "nav.home",      href: "#hero" },
  { key: "nav.manifesto", href: "#manifesto" },
  { key: "nav.program",   href: "#program" },
  { key: "nav.pricing",   href: "#pricing" },
  { key: "nav.register",  href: "#onboarding" },
] as const;

export function Navbar({ companyName }: { companyName?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const language = useOnboardingStore((s) => s.language);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (hero) {
        const bottom = hero.getBoundingClientRect().bottom;
        setScrolled(bottom < 64);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-canvas/95 backdrop-blur-xl border-hairline"
          : "bg-transparent backdrop-blur-xl border-white/[0.06]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className={`text-lg font-normal tracking-[-0.02em] transition-colors duration-200 ${
                scrolled
                  ? "text-black hover:text-primary"
                  : "text-canvas hover:text-primary"
              }`}
            >
              {companyName ?? "Productora Calafate"}
            </Link>

            <ul className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm font-normal transition-colors duration-200 ${
                      scrolled
                        ? "text-black hover:text-primary"
                        : "text-on-dark-soft hover:text-canvas"
                    }`}
                  >
                    {t(item.key, language)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher scrolled={scrolled} />
            <InvitationButton scrolled={scrolled} />
          </div>

          <MobileMenu scrolled={scrolled} />
        </nav>
      </div>
    </header>
  );
}
