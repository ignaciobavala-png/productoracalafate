"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

const STEPS = [
  { key: "personal", number: 1 },
  { key: "documents", number: 2 },
  { key: "payment", number: 3 },
  { key: "confirm", number: 4 },
] as const;

export function StepIndicator() {
  const step = useOnboardingStore((s) => s.step);
  const language = useOnboardingStore((s) => s.language);

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, i) => {
        const isCompleted = step > s.number;
        const isCurrent = step === s.number;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 flex items-center justify-center border text-xs font-medium transition-colors duration-300 ${
                  isCompleted
                    ? "bg-ink text-canvas border-ink"
                    : isCurrent
                      ? "border-ink text-black"
                      : "border-hairline text-black/30"
                }`}
              >
                {isCompleted ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 6l3 3 5-6" />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.15em] text-center leading-tight max-w-[60px] ${
                  isCurrent ? "text-black font-semibold" : "text-black/30"
                }`}
              >
                {t(`stepper.${s.key}`, language)}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-12 md:w-16 h-px mx-1 transition-colors duration-300 ${
                  isCompleted ? "bg-ink" : "bg-hairline"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
