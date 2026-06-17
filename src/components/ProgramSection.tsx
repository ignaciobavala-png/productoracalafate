"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import type { SectionContent } from "@/app/page";

export interface ProgramItem {
  id: string;
  day_number: number;
  day_label_es: string;
  day_label_en: string;
  day_subtitle_es: string;
  day_subtitle_en: string;
  day_photo_url: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  sort_order: number;
}

const MOCK_ITEMS: ProgramItem[] = [
  { id: "m1", day_number: 1, day_label_es: "Día Uno", day_label_en: "Day One", day_subtitle_es: "Llegar", day_subtitle_en: "Arrive", day_photo_url: "", title_es: "Llegada al Silencio", title_en: "Arrival into Silence", description_es: "Arribo al Hotel Explora. Recepción sin pantallas. Una caminata de reconocimiento al atardecer para desacelerar el cuerpo y la mirada.", description_en: "Arrival at Hotel Explora. Screen-free reception. A sunset reconnaissance walk to slow down body and gaze.", sort_order: 0 },
  { id: "m2", day_number: 1, day_label_es: "Día Uno", day_label_en: "Day One", day_subtitle_es: "Llegar", day_subtitle_en: "Arrive", day_photo_url: "", title_es: "Cena de Apertura", title_en: "Opening Dinner", description_es: "Una mesa larga. Sin sitios asignados. Sin discursos. Vinos del sur y conversaciones que no caben en una tarjeta de presentación.", description_en: "A long table. No assigned seats. No speeches. Southern wines and conversations that don't fit on a business card.", sort_order: 1 },
  { id: "m3", day_number: 2, day_label_es: "Día Dos", day_label_en: "Day Two", day_subtitle_es: "Profundizar", day_subtitle_en: "Go Deeper", day_photo_url: "", title_es: "Caminatas de Introspección", title_en: "Walks of Introspection", description_es: "Recorrido en silencio por los senderos del parque. El paisaje como interlocutor. Una pausa para escuchar sin interrumpir.", description_en: "Silent walks along the park trails. The landscape as interlocutor. A pause to listen without interrupting.", sort_order: 0 },
  { id: "m4", day_number: 2, day_label_es: "Día Dos", day_label_en: "Day Two", day_subtitle_es: "Profundizar", day_subtitle_en: "Go Deeper", day_photo_url: "", title_es: "Charlas Íntimas", title_en: "Intimate Talks", description_es: "Conversaciones junto al fuego. Sin escenario. Sin diapositivas. Ideas que solo se comparten cuando el entorno invita a la honestidad.", description_en: "Fireside conversations. No stage. No slides. Ideas only shared when the setting invites honesty.", sort_order: 1 },
  { id: "m5", day_number: 2, day_label_es: "Día Dos", day_label_en: "Day Two", day_subtitle_es: "Profundizar", day_subtitle_en: "Go Deeper", day_photo_url: "", title_es: "Comida Larga", title_en: "Long Meal", description_es: "Cocina de producto, cocina de tiempo. Un menú que respeta los ritmos de la tierra y extiende la sobremesa hasta que las velas se consumen.", description_en: "Ingredient-driven cooking, time-driven cooking. A menu that extends the after-dinner until the candles burn out.", sort_order: 2 },
  { id: "m6", day_number: 3, day_label_es: "Día Tres", day_label_en: "Day Three", day_subtitle_es: "Cerrar", day_subtitle_en: "Close", day_photo_url: "", title_es: "Exploración Guiada", title_en: "Guided Exploration", description_es: "Salida a los miradores del macizo. Geología, flora, fauna. La inmensidad como recordatorio de la escala justa de nuestras urgencias.", description_en: "Outing to the massif viewpoints. Geology, flora, fauna. Vastness as a reminder of the right scale of our urgencies.", sort_order: 0 },
  { id: "m7", day_number: 3, day_label_es: "Día Tres", day_label_en: "Day Three", day_subtitle_es: "Cerrar", day_subtitle_en: "Close", day_photo_url: "", title_es: "Círculo de Cierre", title_en: "Closing Circle", description_es: "Una conversación final sin guion. Lo que queda después de tres días de distancia. Compromisos que no necesitan firma.", description_en: "A final unscripted conversation. What remains after three days of distance. Commitments that need no signature.", sort_order: 1 },
];

// Gradientes de placeholder por día (oscuros, Patagonia)
const DAY_GRADIENTS = [
  "linear-gradient(135deg, #0d1f2d 0%, #1a3a4a 100%)",
  "linear-gradient(135deg, #1a1206 0%, #3d2a10 100%)",
  "linear-gradient(135deg, #0a1a12 0%, #1d3a28 100%)",
];

interface ProgramSectionProps {
  content?: SectionContent;
  items: ProgramItem[];
}

export function ProgramSection({ content, items }: ProgramSectionProps) {
  const effectiveItems = items.length > 0 ? items : MOCK_ITEMS;
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

  const days = new Map<number, ProgramItem[]>();
  for (const item of effectiveItems) {
    if (!days.has(item.day_number)) days.set(item.day_number, []);
    days.get(item.day_number)!.push(item);
  }
  const sortedDays = Array.from(days.entries()).sort(([a], [b]) => a - b);

  if (sortedDays.length === 0) return null;

  return (
    <section id="program" ref={ref} className="py-24">
      {/* Header de sección — con padding lateral */}
      <div className="px-6 md:px-12 lg:px-20 mb-20 md:mb-28">
        <div className="max-w-[1200px] mx-auto">
          <motion.div style={{ opacity: headerOpacity, y: headerY }}>
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
        </div>
      </div>

      {/* Días */}
      <div>
        {sortedDays.map(([dayNum, dayItems], idx) => (
          <div key={dayNum}>
            {/* Foto cinematográfica — full bleed */}
            <DayCinematicPhoto
              dayNumber={dayNum}
              photoUrl={dayItems[0].day_photo_url}
              label={language === "es" ? dayItems[0].day_label_es : dayItems[0].day_label_en}
              subtitle={language === "es" ? dayItems[0].day_subtitle_es : dayItems[0].day_subtitle_en}
              gradientFallback={DAY_GRADIENTS[idx % DAY_GRADIENTS.length]}
            />

            {/* Contenido del día — con padding lateral */}
            <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
              <div className="max-w-[1200px] mx-auto">
                <DayBlock
                  dayNumber={dayNum}
                  items={dayItems}
                  language={language}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DayCinematicPhoto({
  dayNumber,
  photoUrl,
  label,
  subtitle,
  gradientFallback,
}: {
  dayNumber: number;
  photoUrl: string;
  label: string;
  subtitle: string;
  gradientFallback: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const numStr = String(dayNumber).padStart(2, "0");

  return (
    <div ref={ref} className="relative h-[48vh] overflow-hidden">
      {/* Foto con parallax */}
      {photoUrl ? (
        <motion.img
          src={photoUrl}
          alt=""
          draggable="false"
          className="absolute inset-0 w-full object-cover"
          style={{ y: imgY, height: "116%", top: "-8%" }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: gradientFallback }} />
      )}

      {/* Overlay: gradiente de izq (oscuro) a der (transparente) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
      {/* Gradiente vertical inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Número decorativo */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 left-8 md:left-16 text-[12rem] md:text-[18rem] font-bold leading-none select-none pointer-events-none text-white/[0.06] tabular-nums"
      >
        {numStr}
      </span>

      {/* Label y subtítulo */}
      <motion.div
        className="absolute bottom-10 left-8 md:left-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span className="block text-xs uppercase tracking-[0.3em] text-accent-yellow mb-3">
          {label}
        </span>
        <h3 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-white leading-none">
          {subtitle}
        </h3>
      </motion.div>
    </div>
  );
}

function DayBlock({
  dayNumber,
  items,
  language,
}: {
  dayNumber: number;
  items: ProgramItem[];
  language: "es" | "en";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const numStr = String(dayNumber).padStart(2, "0");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const labelOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const labelX = useTransform(scrollYProgress, [0, 0.3], [-16, 0]);
  const first = items[0];
  const dayLabel = language === "es" ? first.day_label_es : first.day_label_en;
  const daySubtitle = language === "es" ? first.day_subtitle_es : first.day_subtitle_en;

  return (
    <div ref={ref} className="relative">
      <span
        aria-hidden="true"
        className="absolute -top-10 -left-4 md:-left-8 text-[10rem] md:text-[14rem] font-bold leading-none select-none pointer-events-none text-black/[0.04] tabular-nums"
      >
        {numStr}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-20">
        <motion.div style={{ opacity: labelOpacity, x: labelX }}>
          <div className="md:sticky md:top-28">
            <span className="block text-2xl md:text-3xl font-normal tabular-nums tracking-[-0.03em] text-black/15 select-none">
              {numStr}
            </span>
            <motion.div
              className="mt-3 h-px bg-primary origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              style={{ width: "2rem" }}
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          {items.map((item, i) => {
            const title = language === "es" ? item.title_es : item.title_en;
            const desc = language === "es" ? item.description_es : item.description_en;
            if (!title && !desc) return null;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.12 }}
                className="group border border-hairline bg-surface-soft/50 p-6 md:p-8 hover:border-primary/30 hover:bg-white transition-colors duration-300"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/20 mb-3 block">
                  {numStr}.{String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="text-lg md:text-xl font-normal tracking-[-0.02em] text-black group-hover:text-primary transition-colors duration-300">
                  {title}
                </h4>
                {desc && (
                  <p className="mt-3 text-sm md:text-base text-black/60 leading-relaxed font-normal text-justify">
                    {desc}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
