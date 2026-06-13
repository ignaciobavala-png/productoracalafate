"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import Link from "next/link";

export function SuccessScreen() {
  const language = useOnboardingStore((s) => s.language);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="text-center py-16 md:py-24"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-16 h-16 mx-auto mb-8 border border-primary/30 flex items-center justify-center"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        >
          <path d="M4 14l7 7 12-12" />
        </svg>
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-black">
        {t("success.title", language)}
      </h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-6 text-sm text-black leading-relaxed font-normal max-w-md mx-auto"
      >
        {t("success.message", language)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10"
      >
        <Link
          href="/"
          className="inline-flex items-center px-8 py-3 border border-ink/20 text-black text-sm uppercase tracking-[0.12em] hover:border-primary hover:text-primary transition-colors duration-300"
        >
          {t("success.closeButton", language)}
        </Link>
      </motion.div>
    </motion.div>
  );
}
