"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { StepPersonal } from "@/components/onboarding/StepPersonal";
import { StepDocuments } from "@/components/onboarding/StepDocuments";
import { StepPayment } from "@/components/onboarding/StepPayment";
import { StepConfirm } from "@/components/onboarding/StepConfirm";
import { SuccessScreen } from "@/components/onboarding/SuccessScreen";

const STEP_TITLES: Record<number, string> = {
  1: "stepPersonal.title",
  2: "stepDocuments.title",
  3: "stepPayment.title",
  4: "stepConfirm.title",
};

export function OnboardingPage() {
  const step = useOnboardingStore((s) => s.step);
  const language = useOnboardingStore((s) => s.language);
  const isSubmitted = useOnboardingStore((s) => s.isSubmitted);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const acceptedTerms = useOnboardingStore((s) => s.data.acceptedTerms);

  if (isSubmitted) {
    return (
      <section id="onboarding" className="min-h-screen flex items-center py-24 md:py-32">
        <div className="w-full max-w-lg mx-auto">
          <SuccessScreen />
        </div>
      </section>
    );
  }

  return (
    <section id="onboarding" className="min-h-screen flex flex-col justify-center py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 w-full">
        <div className="mb-12">
          <StepIndicator />
        </div>

        <div className="mb-10">
          <AnimatePresence mode="wait">
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-black text-center"
            >
              {t(STEP_TITLES[step], language)}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {step === 1 && <StepPersonal />}
              {step === 2 && <StepDocuments />}
              {step === 3 && <StepPayment />}
              {step === 4 && <StepConfirm />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="text-xs uppercase tracking-[0.12em] text-black hover:text-primary transition-colors duration-300 cursor-pointer flex items-center gap-1.5"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 2L3 5l3 3" />
                </svg>
                {t("shared.back", language)}
              </button>
            ) : (
              <span />
            )}
          </div>

          {step < 4 && (
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 3 && !acceptedTerms}
              className="text-xs uppercase tracking-[0.12em] text-black hover:text-primary transition-colors duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {t("shared.next", language)}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 2l3 3-3 3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
