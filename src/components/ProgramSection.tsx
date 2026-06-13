"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

const DAYS = [
  { number: 1, labelKey: "day1label", subKey: "day1sub", agendaIds: ["1", "2"] },
  { number: 2, labelKey: "day2label", subKey: "day2sub", agendaIds: ["3", "4", "5"] },
  { number: 3, labelKey: "day3label", subKey: "day3sub", agendaIds: ["6", "7"] },
];

export function ProgramSection() {
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
      id="program"
      ref={ref}
      className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="mb-16 md:mb-24"
        >
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            {t("program.label", language)}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.02em] text-black">
            {t("program.title", language)}
          </h2>
          <p className="mt-6 text-base md:text-lg text-black leading-relaxed font-normal max-w-xl text-justify">
            {t("program.description", language)}
          </p>
        </motion.div>

        <div className="space-y-24 md:space-y-32">
          {DAYS.map((day) => (
            <DayBlock key={day.number} day={day} language={language} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DayBlock({
  day,
  language,
}: {
  day: (typeof DAYS)[number];
  language: "es" | "en";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.6], ["0%", "100%"]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 md:gap-16">
        <motion.div style={{ opacity: labelOpacity }}>
          <div className="md:sticky md:top-24">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">
              {t(`program.${day.labelKey}`, language)}
            </span>
            <h3 className="mt-2 text-2xl md:text-3xl font-normal tracking-[-0.02em] text-black">
              {t(`program.${day.subKey}`, language)}
            </h3>
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-hairline" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-0 top-0 w-px bg-primary origin-top"
          />

          <div className="space-y-12 md:space-y-16 pl-8 md:pl-12">
            {day.agendaIds.map((id, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: i * 0.1,
                }}
                className="relative"
              >
                <div className="absolute left-[-1.625rem] md:left-[-1.75rem] top-1.5 w-2.5 h-2.5 bg-primary/40 ring-4 ring-canvas" />

                <h4 className="text-xl md:text-2xl font-normal tracking-[-0.02em] text-black">
                  {t(`program.agenda.item${id}.title`, language)}
                </h4>
                <p className="mt-3 text-base md:text-lg text-black leading-relaxed font-normal max-w-2xl text-justify">
                  {t(`program.agenda.item${id}.desc`, language)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
