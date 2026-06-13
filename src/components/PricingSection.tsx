"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { pricing } from "@/lib/mock-data";

export function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  const language = useOnboardingStore((s) => s.language);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.5], [32, 0]);

  return (
    <section
      id="pricing"
      ref={ref}
      className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="mb-16 md:mb-24"
        >
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            {t("pricing.label", language)}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.02em] text-black">
            {t("pricing.title", language)}
          </h2>
          <p className="mt-6 text-base md:text-lg text-black leading-relaxed font-normal max-w-xl text-justify">
            {t("pricing.description", language)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-20">
          <div className="space-y-10">
            <div>
              <h3 className="text-sm uppercase tracking-[0.15em] text-black font-normal mb-5">
                {t("pricing.includesLabel", language)}
              </h3>
              <ul className="space-y-3">
                {pricing.includes.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm text-black leading-relaxed"
                  >
                    <span className="mt-[3px] text-primary text-[10px]">
                      &#10003;
                    </span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-[0.15em] text-black font-normal mb-5">
                {t("pricing.excludesLabel", language)}
              </h3>
              <ul className="space-y-2">
                {pricing.excludes.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm text-black/50 leading-relaxed"
                  >
                    <span className="mt-[3px] text-[10px]">&times;</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-surface-soft p-8 md:p-10 h-fit lg:sticky lg:top-24"
          >
            <div className="text-xs uppercase tracking-[0.15em] text-black mb-3">
              {t("pricing.priceLabel", language)}
            </div>
            <div className="text-4xl md:text-5xl font-normal tracking-[-0.02em] text-black">
              {pricing.currency} ${pricing.price}
            </div>
            <p className="mt-4 text-xs text-black/60 leading-relaxed">
              {t("pricing.note", language)}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
