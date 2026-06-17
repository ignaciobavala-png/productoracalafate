"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import type { SectionContent } from "@/app/page";

const DAYS = [
  { number: 1, labelKey: "day1label", subKey: "day1sub", agendaIds: ["1", "2"] },
  { number: 2, labelKey: "day2label", subKey: "day2sub", agendaIds: ["3", "4", "5"] },
  { number: 3, labelKey: "day3label", subKey: "day3sub", agendaIds: ["6", "7"] },
];

export function ProgramSection({ content }: { content?: SectionContent }) {
  const ref = useRef<HTMLElement>(null);
  const language = useOnboardingStore((s) => s.language);

  const tc = (key: string, fallback: string) =>
    content?.[key]?.[language] ?? fallback;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.5], [32, 0]);

  return (
    <section
      id="program"
      ref={ref}
      className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="mb-20 md:mb-28"
        >
          <span className="text-xs uppercase tracking-[0.25em] text-accent-yellow">
            {tc("label", t("program.label", language))}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-6xl font-normal tracking-[-0.02em] text-black">
            {tc("title", t("program.title", language))}
          </h2>
          <p className="mt-6 text-base md:text-lg text-black/60 leading-relaxed font-normal max-w-xl text-justify">
            {tc("description", t("program.description", language))}
          </p>
        </motion.div>

        {/* Días */}
        <div className="space-y-28 md:space-y-36">
          {DAYS.map((day) => (
            <DayBlock key={day.number} day={day} language={language} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DayBlock({
  day,
  language,
  content,
}: {
  day: (typeof DAYS)[number];
  language: "es" | "en";
  content?: SectionContent;
}) {
  const tc = (key: string, fallback: string) =>
    content?.[key]?.[language] ?? fallback;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const labelOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const labelX = useTransform(scrollYProgress, [0, 0.3], [-16, 0]);

  const numStr = String(day.number).padStart(2, "0");

  return (
    <div ref={ref} className="relative">
      {/* Número decorativo de fondo */}
      <span
        aria-hidden="true"
        className="absolute -top-10 -left-4 md:-left-8 text-[10rem] md:text-[14rem] font-bold leading-none select-none pointer-events-none text-black/[0.04] tabular-nums"
      >
        {numStr}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-20">
        {/* Etiqueta del día */}
        <motion.div style={{ opacity: labelOpacity, x: labelX }}>
          <div className="md:sticky md:top-28">
            <span className="block text-xs uppercase tracking-[0.25em] text-accent-yellow mb-2">
              {tc(day.labelKey, t(`program.${day.labelKey}`, language))}
            </span>
            <h3 className="text-2xl md:text-3xl font-normal tracking-[-0.02em] text-black">
              {tc(day.subKey, t(`program.${day.subKey}`, language))}
            </h3>
            {/* Línea decorativa bajo el título */}
            <motion.div
              className="mt-4 h-px bg-primary origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              style={{ width: "3rem" }}
            />
          </div>
        </motion.div>

        {/* Items de agenda */}
        <div className="space-y-4">
          {day.agendaIds.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                delay: i * 0.12,
              }}
              className="group border border-hairline bg-surface-soft/50 p-6 md:p-8 hover:border-primary/30 hover:bg-white transition-colors duration-300"
            >
              {/* Número de item */}
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/20 mb-3 block">
                {numStr}.{String(i + 1).padStart(2, "0")}
              </span>

              <h4 className="text-lg md:text-xl font-normal tracking-[-0.02em] text-black group-hover:text-primary transition-colors duration-300">
                {tc(`item${id}_title`, t(`program.agenda.item${id}.title`, language))}
              </h4>
              <p className="mt-3 text-sm md:text-base text-black/60 leading-relaxed font-normal text-justify">
                {tc(`item${id}_desc`, t(`program.agenda.item${id}.desc`, language))}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
