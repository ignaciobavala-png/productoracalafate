"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLACEHOLDERS = [
  "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
  "linear-gradient(135deg, #222222 0%, #111111 100%)",
  "linear-gradient(135deg, #181818 0%, #0a0a0a 100%)",
  "linear-gradient(135deg, #1e1e1e 0%, #0f0f0f 100%)",
  "linear-gradient(135deg, #141414 0%, #080808 100%)",
  "linear-gradient(135deg, #202020 0%, #0c0c0c 100%)",
  "linear-gradient(135deg, #1c1c1c 0%, #0e0e0e 100%)",
  "linear-gradient(135deg, #262626 0%, #121212 100%)",
];

interface MarqueeSectionProps {
  slots: string[];
}

export function MarqueeSection({ slots }: MarqueeSectionProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const realPhotos = slots.filter(Boolean);

  const isOpen = lightboxIdx !== null;

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i !== null ? (i - 1 + realPhotos.length) % realPhotos.length : null));
  }, [realPhotos.length]);

  const next = useCallback(() => {
    setLightboxIdx((i) => (i !== null ? (i + 1) % realPhotos.length : null));
  }, [realPhotos.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, prev, next]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const track = [...slots, ...slots];
  const dur = Math.max(slots.length * 1.8, 14);
  const durMobile = Math.max(slots.length * 0.6, 4);

  return (
    <>
      {/* ── Desktop: marquee ───────────────────────────────────── */}
      <div className="hidden md:block overflow-hidden py-6 md:py-8">
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translate3d(0, 0, 0); }
            to   { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes marquee-scroll-mobile {
            from { transform: translate3d(0, 0, 0); }
            to   { transform: translate3d(-50%, 0, 0); }
          }
          .marquee-track {
            animation: marquee-scroll ${dur}s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
          .marquee-track:hover { animation-play-state: paused; }
          .marquee-track-mobile {
            animation: marquee-scroll-mobile ${durMobile}s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
        `}</style>

        <div className="marquee-track flex gap-3">
          {track.map((src, i) => {
            const realIdx = src ? realPhotos.indexOf(src) : -1;
            const clickable = realIdx !== -1;

            return (
              <div
                key={i}
                className={`shrink-0 h-[40vh] w-[30rem] overflow-hidden group/card relative ${clickable ? "cursor-zoom-in" : ""}`}
                style={!src ? { background: PLACEHOLDERS[i % PLACEHOLDERS.length] } : undefined}
                onClick={() => clickable && setLightboxIdx(realIdx)}
              >
                {src && (
                  <>
                    <img
                      src={src}
                      alt=""
                      draggable="false"
                      className="absolute inset-0 h-full w-full object-cover select-none scale-100 group-hover/card:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                      <svg
                        className="text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 drop-shadow"
                        width="28" height="28" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5"
                      >
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: marquee full-width ────────────────────────── */}
      <div className="md:hidden overflow-hidden">
        <div className="marquee-track-mobile flex gap-0">
          {track.map((src, i) => {
            const realIdx = src ? realPhotos.indexOf(src) : -1;
            const clickable = realIdx !== -1;

            return (
              <div
                key={i}
                className={`shrink-0 w-screen h-[56vw] overflow-hidden relative ${clickable ? "cursor-zoom-in" : ""}`}
                style={!src ? { background: PLACEHOLDERS[i % PLACEHOLDERS.length] } : undefined}
                onClick={() => clickable && setLightboxIdx(realIdx)}
              >
                {src && (
                  <img
                    src={src}
                    alt=""
                    draggable="false"
                    className="absolute inset-0 h-full w-full object-cover select-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIdx(null)}
          >
            {/* Close */}
            <button
              aria-label="Cerrar"
              className="absolute top-5 right-5 z-10 p-2 text-white/50 hover:text-white transition-colors"
              onClick={() => setLightboxIdx(null)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/35 text-xs font-mono tracking-widest select-none">
              {lightboxIdx + 1} / {realPhotos.length}
            </div>

            {realPhotos.length > 1 && (
              <>
                <button
                  aria-label="Anterior"
                  className="absolute left-4 md:left-8 z-10 p-3 text-white/40 hover:text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  aria-label="Siguiente"
                  className="absolute right-4 md:right-8 z-10 p-3 text-white/40 hover:text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={lightboxIdx}
                src={realPhotos[lightboxIdx]}
                alt=""
                draggable="false"
                className="max-h-[85vh] max-w-[88vw] object-contain select-none"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
