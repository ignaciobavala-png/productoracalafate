"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvitationStore } from "@/store/invitation-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

export function InvitationModal() {
  const { isOpen, close } = useInvitationStore();
  const language = useOnboardingStore((s) => s.language);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setCode("");
    setEmail("");
    setSubmitted(false);
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

            {!submitted ? (
              <>
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
                      onChange={(e) => setCode(e.target.value)}
                      required
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 px-4 bg-canvas border border-hairline text-black text-sm placeholder:text-black/30 focus:ring-0 focus:border-2 focus:border-primary transition-colors duration-200"
                      placeholder={t("invitation.emailPlaceholder", language)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-active transition-colors duration-200 cursor-pointer"
                  >
                    {t("invitation.submit", language)}
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
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-6 border border-primary/30 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="1.5"
                  >
                    <path d="M4 10l4 4 8-8" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-black">
                  {t("invitation.successTitle", language)}
                </h2>
                <p className="mt-3 text-sm text-black leading-relaxed font-normal">
                  {t("invitation.successMessage", language)}
                </p>
                <button
                  onClick={handleClose}
                  className="mt-8 text-xs uppercase tracking-[0.15em] text-primary hover:text-primary-active transition-colors duration-300 cursor-pointer"
                >
                  {t("invitation.close", language)}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
