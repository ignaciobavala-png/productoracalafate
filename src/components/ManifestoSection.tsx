"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import type { SectionContent } from "@/app/page";

export function ManifestoSection({
  content,
  photoSrc,
}: {
  content?: SectionContent;
  photoSrc?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const language = useOnboardingStore((s) => s.language);

  const tc = (key: string, fallback: string) =>
    content?.[key]?.[language] ?? fallback;

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
      className="bg-surface-dark min-h-screen flex items-center py-24 px-6 md:px-12 lg:px-20"
    >
      <div className="w-full max-w-[1200px] mx-auto">
        <motion.div
          style={{ opacity, y }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
          {/* Texto */}
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accent-yellow">
              {tc("label", t("manifesto.label", language))}
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.02em] leading-tight text-canvas">
              {tc("title", t("manifesto.title", language))}
            </h2>

            <div className="mt-10 md:mt-14 space-y-6 text-base md:text-lg text-on-dark-soft leading-relaxed font-normal max-w-xl text-justify">
              <p>{tc("p1", t("manifesto.p1", language))}</p>
              <p>{tc("p2", t("manifesto.p2", language))}</p>
            </div>
          </div>

          {/* Foto */}
          <div className="relative h-[72vh] overflow-hidden bg-surface-dark-elevated ring-1 ring-white/10">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt={tc("title", t("manifesto.title", language))}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-on-dark-soft/30 text-xs uppercase tracking-[0.35em]">
                  {t("manifesto.photo", language)}
                </span>
              </div>
            )}
            {/* glow cálido en esquina inferior */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent-yellow/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tl from-black/30 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
