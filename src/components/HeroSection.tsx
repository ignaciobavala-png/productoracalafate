"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import type { SectionContent } from "@/app/page";

interface HeroSectionProps {
  videoSrc?: string;
  content?: SectionContent;
}

export function HeroSection({ videoSrc, content }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const language = useOnboardingStore((s) => s.language);

  const tc = (key: string, fallback: string) =>
    content?.[key]?.[language] ?? fallback;

  return (
    <section
      id="hero"
      className="relative min-h-[75vh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        {videoSrc && !videoFailed ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-surface-dark" />
        )}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-8 pt-28 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs md:text-sm uppercase tracking-[0.3em] text-on-dark-soft">
            {tc("location", t("hero.location", language))}
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-normal tracking-[-0.02em] leading-[1.02] text-canvas">
            {tc("title", t("hero.title", language))}
            <br />
            <span className="text-primary">{tc("subtitle", t("hero.subtitle", language))}</span>
          </h1>

          <p className="mt-8 md:mt-10 text-base md:text-xl text-on-dark-soft leading-relaxed font-normal max-w-xl mx-auto">
            {tc("tagline", t("hero.tagline", language))}
          </p>

          <div className="mt-10 md:mt-14">
            <span className="text-sm text-on-dark-soft/70">
              {tc("date", t("hero.date", language))}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
