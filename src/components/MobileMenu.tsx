"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/mock-data";

interface MobileMenuProps {
  scrolled?: boolean;
}

export function MobileMenu({ scrolled = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const barColor = scrolled ? "bg-ink" : "bg-canvas";

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        className="relative z-50 flex flex-col justify-center items-center w-11 h-11 gap-[5px] cursor-pointer"
      >
        <span
          className={`block w-5 h-px transition-all duration-300 ${barColor} ${
            isOpen ? "rotate-45 translate-y-[3px]" : ""
          }`}
        />
        <span
          className={`block w-5 h-px transition-all duration-300 ${barColor} ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-5 h-px transition-all duration-300 ${barColor} ${
            isOpen ? "-rotate-45 -translate-y-[3px]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-canvas flex flex-col items-center justify-center gap-10">
          <nav className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold tracking-[-0.02em] text-black hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
