"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

export function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const language = useOnboardingStore((s) => s.language);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4, 1], [48, 0, 0]);

  return (
    <section
      id="manifesto"
      ref={ref}
      className="min-h-screen flex items-center py-24 px-6 md:px-12 lg:px-20"
    >
      <div className="w-full max-w-[1200px] mx-auto">
        <motion.div
          style={{ opacity, y }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary">
              {t("manifesto.label", language)}
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.02em] leading-tight text-black">
              {t("manifesto.title", language)}
            </h2>

            <div className="mt-10 md:mt-14 space-y-6 text-base md:text-lg text-black leading-relaxed font-normal max-w-xl text-justify">
              <p>{t("manifesto.p1", language)}</p>
              <p>{t("manifesto.p2", language)}</p>
            </div>
          </div>

          <div className="relative aspect-[3/4] max-h-[55vh] bg-surface-soft">
            <div className="absolute inset-0 bg-gradient-to-tl from-ink/[0.04] to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-black text-xs uppercase tracking-[0.35em]">
                {t("manifesto.photo", language)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
