"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvitationStore } from "@/store/invitation-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { validateInvitationCode } from "@/app/actions/validate-invitation";
import { logInvitationRequest } from "@/app/actions/log-invitation-request";

interface Props {
  tripSlug: string;
  initialCode?: string;
}

export function InvitationModal({ tripSlug, initialCode }: Props) {
  const { isOpen, close, unlock } = useInvitationStore();
  const language = useOnboardingStore((s) => s.language);
  const [code, setCode] = useState(initialCode ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

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
        handleClose();
      } else {
        setError(result.error || t("invitation.errorInvalid", language));
      }
    } catch {
      setError(t("invitation.errorInvalid", language));
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setEmail("");
    setError(null);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-canvas w-full max-w-md p-8 md:p-10 border border-hairline shadow-sm"
          >
            <button
              onClick={handleClose}
              aria-label={t("invitation.close", language)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-black hover:text-black transition-colors duration-300 cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>

            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-black">
              {t("invitation.title", language)}
            </h2>
            <p className="mt-3 text-sm text-black leading-relaxed font-normal">
              {t("invitation.description", language)}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="invite-code"
                  className="block text-xs uppercase tracking-[0.15em] text-black mb-2"
                >
                  {t("invitation.codeLabel", language)}
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="off"
                  className="w-full h-12 px-4 bg-canvas border border-hairline text-black text-sm placeholder:text-black/30 focus:ring-0 focus:border-2 focus:border-primary transition-colors duration-200"
                  placeholder={t("invitation.codePlaceholder", language)}
                />
              </div>

              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-xs uppercase tracking-[0.15em] text-black mb-2"
                >
                  {t("invitation.emailLabel", language)}
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="email"
                  className="w-full h-12 px-4 bg-canvas border border-hairline text-black text-sm placeholder:text-black/30 focus:ring-0 focus:border-2 focus:border-primary transition-colors duration-200"
                  placeholder={t("invitation.emailPlaceholder", language)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 leading-relaxed">{error}</p>
              )}

              <button
                type="submit"
                disabled={isValidating}
                className="w-full py-3 px-6 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-active transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating
                  ? t("invitation.validating", language)
                  : t("invitation.submit", language)}
              </button>
            </form>

            <p className="mt-6 text-xs text-black text-center leading-relaxed">
              {t("invitation.footer", language)}{" "}
              <a
                href="mailto:calafatesummits@gmail.com"
                className="underline underline-offset-4 hover:text-primary transition-colors"
              >
                calafatesummits@gmail.com
              </a>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
