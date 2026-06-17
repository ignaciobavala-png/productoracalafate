"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useInvitationStore } from "@/store/invitation-store";
import { t } from "@/lib/onboarding-text";
import { CARD_PAYMENT_METHODS } from "@/lib/mock-data";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { StepPersonal } from "@/components/onboarding/StepPersonal";
import { StepDocuments } from "@/components/onboarding/StepDocuments";
import { StepPayment } from "@/components/onboarding/StepPayment";
import { StepConfirm } from "@/components/onboarding/StepConfirm";
import { SuccessScreen } from "@/components/onboarding/SuccessScreen";
import { validateInvitationCode } from "@/app/actions/validate-invitation";
import { logInvitationRequest } from "@/app/actions/log-invitation-request";

const STEP_TITLES: Record<number, string> = {
  1: "stepPersonal.title",
  2: "stepDocuments.title",
  3: "stepPayment.title",
  4: "stepConfirm.title",
};

interface GateProps {
  tripSlug: string;
  initialCode?: string;
}

function InvitationGate({ tripSlug, initialCode }: GateProps) {
  const language = useOnboardingStore((s) => s.language);
  const unlock = useInvitationStore((s) => s.unlock);
  const [code, setCode] = useState(initialCode ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t("invitation.errorEmail", language));
      return;
    }

    setIsValidating(true);

    try {
      const result = await validateInvitationCode(code, tripSlug);

      logInvitationRequest(code.trim().toUpperCase(), trimmedEmail);

      if (result.valid) {
        unlock(result.code!, result.tripId!);
      } else {
        setError(result.error || t("invitation.errorInvalid", language));
      }
    } catch {
      setError(t("invitation.errorInvalid", language));
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section
      id="onboarding"
      className="min-h-screen bg-surface-dark flex items-center py-24 md:py-32 px-6 md:px-8"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Columna izquierda — declaración de exclusividad */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-accent-yellow">
              {t("invitation.eyebrow", language)}
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.02em] leading-tight text-canvas">
              {t("invitation.title", language)}
            </h2>
            <p className="mt-6 text-base text-on-dark-soft leading-relaxed max-w-sm">
              {t("invitation.description", language)}
            </p>

            {/* Divisor decorativo */}
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">
                {t("invitation.divider", language)}
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <p className="mt-8 text-xs text-white/20 leading-relaxed max-w-xs">
              {t("invitation.footer", language)}{" "}
              <a
                href="mailto:calafatesummits@gmail.com"
                className="text-white/40 hover:text-accent-yellow underline underline-offset-4 transition-colors duration-200"
              >
                calafatesummits@gmail.com
              </a>
            </p>
          </motion.div>

          {/* Columna derecha — formulario */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="gate-invite-code"
                  className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2"
                >
                  {t("invitation.codeLabel", language)}
                </label>
                <input
                  id="gate-invite-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="off"
                  className="w-full h-13 px-4 bg-surface-dark-elevated border border-white/10 text-canvas text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-yellow/60 transition-colors duration-200"
                  placeholder={t("invitation.codePlaceholder", language)}
                />
              </div>

              <div>
                <label
                  htmlFor="gate-invite-email"
                  className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2"
                >
                  {t("invitation.emailLabel", language)}
                </label>
                <input
                  id="gate-invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="email"
                  className="w-full h-13 px-4 bg-surface-dark-elevated border border-white/10 text-canvas text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-yellow/60 transition-colors duration-200"
                  placeholder={t("invitation.emailPlaceholder", language)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 leading-relaxed">{error}</p>
              )}

              <button
                type="submit"
                disabled={isValidating}
                className="w-full py-4 px-6 bg-accent-yellow text-black text-sm font-semibold tracking-wide hover:bg-yellow-300 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isValidating
                  ? t("invitation.validating", language)
                  : t("invitation.submit", language)}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

interface OnboardingPageProps {
  tripSlug: string;
  initialCode?: string;
}

export function OnboardingPage({ tripSlug, initialCode }: OnboardingPageProps) {
  const step = useOnboardingStore((s) => s.step);
  const language = useOnboardingStore((s) => s.language);
  const isSubmitted = useOnboardingStore((s) => s.isSubmitted);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const acceptedTerms = useOnboardingStore((s) => s.data.acceptedTerms);
  const paymentMethod = useOnboardingStore((s) => s.data.paymentMethod);
  const paymentProof = useOnboardingStore((s) => s.data.paymentProof);
  const isUnlocked = useInvitationStore((s) => s.isUnlocked);

  const isStep3Ready =
    !!paymentMethod &&
    !!acceptedTerms &&
    (CARD_PAYMENT_METHODS.includes(paymentMethod) || !!paymentProof);

  if (!isUnlocked) {
    return <InvitationGate tripSlug={tripSlug} initialCode={initialCode} />;
  }

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
              disabled={step === 3 && !isStep3Ready}
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
