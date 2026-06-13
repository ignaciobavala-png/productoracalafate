"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

interface LanguageSwitcherProps {
  scrolled?: boolean;
}

export function LanguageSwitcher({ scrolled = false }: LanguageSwitcherProps) {
  const language = useOnboardingStore((s) => s.language);
  const setLanguage = useOnboardingStore((s) => s.setLanguage);

  const otherLang = language === "es" ? "en" : "es";

  return (
    <button
      onClick={() => setLanguage(otherLang)}
      aria-label={t("languageSwitchLabel", language)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors duration-200 cursor-pointer ${
        scrolled
          ? "bg-ink/[0.05] text-black hover:bg-ink/[0.10]"
          : "bg-white/[0.10] text-white hover:bg-white/[0.16]"
      }`}
    >
      <span className={language === "es" ? (scrolled ? "text-primary font-semibold" : "text-white font-semibold") : (scrolled ? "text-black/50" : "text-white/50")}>ES</span>
      <span className={scrolled ? "text-black/20" : "text-white/30"}>/</span>
      <span className={language === "en" ? (scrolled ? "text-primary font-semibold" : "text-white font-semibold") : (scrolled ? "text-black/50" : "text-white/50")}>EN</span>
    </button>
  );
}
