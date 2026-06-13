"use client";

import { useInvitationStore } from "@/store/invitation-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

interface InvitationButtonProps {
  className?: string;
  scrolled?: boolean;
}

export function InvitationButton({ className = "", scrolled = false }: InvitationButtonProps) {
  const open = useInvitationStore((s) => s.open);
  const language = useOnboardingStore((s) => s.language);

  return (
    <button
      onClick={open}
      className={`inline-flex items-center px-5 py-2.5 text-sm font-semibold transition-colors duration-300 cursor-pointer ${
        scrolled
          ? "bg-primary text-on-primary hover:bg-primary-active"
          : "bg-white text-black hover:bg-white/90"
      } ${className}`}
    >
      {t("shared.apply", language)}
    </button>
  );
}
