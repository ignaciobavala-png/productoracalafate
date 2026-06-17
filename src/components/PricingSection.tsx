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
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.6], [24, 0]);

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-16 md:py-20 px-6 md:px-12 lg:px-20 bg-[#faf8f5]"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        <motion.div style={{ opacity, y }}>

          {/* Label */}
          <span className="text-xs uppercase tracking-[0.28em] text-accent-yellow">
            {tc("label", t("pricing.label", language))}
          </span>

          {/* Grid principal: precio izquierda, incluidos derecha */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 md:gap-20 items-start">

            {/* ── Precio ──────────────────────────────────── */}
            <div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-black/35 mt-3 tracking-wide font-light">
                  {currency}
                </span>
                <span className="text-4xl md:text-5xl font-normal leading-none tracking-[-0.03em] text-black tabular-nums">
                  ${price}
                </span>
              </div>
              <p className="mt-4 text-sm text-black/50 leading-snug">
                {tc("priceLabel", t("pricing.priceLabel", language))}
              </p>
              <p className="mt-1 text-xs text-black/30 italic">
                {tc("note", pricing.note)}
              </p>
            </div>

            {/* ── Incluidos ───────────────────────────────── */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-black/35 mb-5 block">
                {language === "es" ? "Qué incluye" : "What's included"}
              </span>
              <ul className="space-y-3">
                {includes.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-accent-yellow/70 shrink-0 mt-[3px] text-xs select-none">✦</span>
                    <span className="text-sm md:text-base text-black/75 leading-snug font-normal">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divisor */}
          <motion.div
            className="h-px bg-black/8 mt-10 mb-6 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          />

          {/* No incluye — footnote inline */}
          {excludes.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-black/30 mr-2">
                {tc("excludesLabel", t("pricing.excludesLabel", language))}
              </span>
              {excludes.map((item, i) => (
                <span key={i} className="text-xs text-black/30 italic">
                  {item}{i < excludes.length - 1 && <span className="not-italic mx-1 text-black/15">·</span>}
                </span>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </section>
  );
}
