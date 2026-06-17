"use client";

import Link from "next/link";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { SectionContent } from "@/app/page";

export function Footer({ content: _ }: { content?: SectionContent }) {
  const language = useOnboardingStore((s) => s.language);

  return (
    <footer className="border-t border-hairline/60">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-6 text-xs text-black/40">
          <span>Productora Calafate</span>
          <a
            href="mailto:calafatesummits@gmail.com"
            className="hover:text-black transition-colors duration-200"
          >
            calafatesummits@gmail.com
          </a>
          <span>Torres del Paine, Magallanes</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-black/25">
          <p>
            {language === "es" ? "Diseñado por" : "Designed by"}{" "}
            <a
              href="https://petralabs.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black/50 transition-colors duration-200"
            >
              Petra-Labs
            </a>
          </p>
          <Link
            href="/admin"
            className="hover:text-black/50 transition-colors duration-200"
          >
            acceso
          </Link>
        </div>
      </div>
    </footer>
  );
}
