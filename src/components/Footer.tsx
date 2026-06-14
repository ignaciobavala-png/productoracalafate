"use client";

import Link from "next/link";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
export function Footer() {
  const language = useOnboardingStore((s) => s.language);

  return (
    <footer className="border-t border-hairline/60">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
          <div>
            <Link
              href="/"
              className="text-lg font-semibold tracking-[-0.02em] text-black hover:text-primary transition-colors duration-200"
            >
              Productora Calafate
            </Link>
            <p className="mt-4 text-sm text-black font-normal leading-relaxed max-w-xs text-justify">
              {t("footer.description", language)}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-black">
              {t("footer.contact", language)}
            </span>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:calafatesummits@gmail.com"
                  className="text-sm text-black hover:text-primary transition-colors duration-300"
                >
                  calafatesummits@gmail.com
                </a>
              </li>
              <li>
                <span className="text-sm text-black">
                  Torres del Paine, Magallanes
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-hairline/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black">
          <p>&copy; {new Date().getFullYear()} Productora Calafate</p>
          <p>{t("footer.design", language)}</p>
        </div>
      </div>
    </footer>
  );
}
