"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { pricing } from "@/lib/mock-data";
import type { SectionContent } from "@/app/page";

export function PricingSection({ content }: { content?: SectionContent }) {
  const ref = useRef<HTMLElement>(null);
  const language = useOnboardingStore((s) => s.language);

  const tc = (key: string, fallback: string) =>
    content?.[key]?.[language] ?? fallback;

  const includes = content
    ? [1, 2, 3, 4, 5, 6, 7]
        .map((i) => content[`includes_${i}`]?.[language])
        .filter(Boolean) as string[]
    : pricing.includes;

  const excludes = content
    ? [1, 2, 3, 4]
        .map((i) => content[`excludes_${i}`]?.[language])
        .filter(Boolean) as string[]
    : pricing.excludes;

  const price = tc("price", pricing.price);
  const currency = tc("currency", pricing.currency);

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
      className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 lg:px-20 bg-[#faf8f5]"
    >
      <div className="max-w-[1200px] mx-auto w-full">

        {/* Header con precio integrado */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="mb-16 md:mb-20"
        >
          <span className="text-xs uppercase tracking-[0.25em] text-accent-yellow">
            {tc("label", t("pricing.label", language))}
          </span>

          <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.02em] text-black max-w-lg">
              {tc("title", t("pricing.title", language))}
            </h2>

            {/* Precio como elemento héroe */}
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-xs uppercase tracking-[0.2em] text-black/40 mb-1">
                {tc("priceLabel", t("pricing.priceLabel", language))}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-normal text-black/50 tracking-wide">{currency}</span>
                <span className="text-6xl md:text-7xl lg:text-8xl font-normal tracking-[-0.04em] text-black leading-none">
                  ${price}
                </span>
              </div>
              <p className="mt-2 text-xs text-black/40 tracking-wide">
                {tc("note", t("pricing.note", language))}
              </p>
            </div>
          </div>

          <p className="mt-8 text-base md:text-lg text-black/60 leading-relaxed font-normal max-w-xl text-justify">
            {tc("description", t("pricing.description", language))}
          </p>
        </motion.div>

        {/* Divisor */}
        <div className="w-full h-px bg-black/10 mb-14" />

        {/* Incluye — grid */}
        <div className="mb-14">
          <h3 className="text-xs uppercase tracking-[0.2em] text-black/40 mb-8">
            {tc("includesLabel", t("pricing.includesLabel", language))}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
            {includes.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-3 py-4 border-b border-black/8"
              >
                <span className="mt-0.5 text-primary text-sm shrink-0">✓</span>
                <span className="text-sm text-black leading-relaxed">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* No incluye — fila muted */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-black/30 mb-6">
            {tc("excludesLabel", t("pricing.excludesLabel", language))}
          </h3>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {excludes.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-2 text-sm text-black/35 italic"
              >
                <span className="text-xs not-italic">×</span>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
