"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/mock-data";
import { InvitationButton } from "./InvitationButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
              Productora Calafate
            </Link>

            <ul className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-normal transition-colors duration-200 ${
                      scrolled
                        ? "text-black hover:text-primary"
                        : "text-on-dark-soft hover:text-canvas"
                    }`}
                  >
                    {link.label}
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
