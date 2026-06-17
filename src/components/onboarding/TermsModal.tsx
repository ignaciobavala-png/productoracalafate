"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

interface TermsModalProps {
  open: boolean;
  alreadyAccepted: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ open, alreadyAccepted, onClose, onAccept }: TermsModalProps) {
  const language = useOnboardingStore((s) => s.language);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedBottom, setReachedBottom] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 24;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (atBottom) setReachedBottom(true);
  };

  useEffect(() => {
    if (open) {
      setReachedBottom(alreadyAccepted);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open, alreadyAccepted]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-canvas w-full max-w-xl max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
              <h2 className="text-sm font-medium">{t("terms.title", language)}</h2>
              <button
                onClick={onClose}
                className="p-1 text-black/30 hover:text-black transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 4L4 12M4 4l8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-black/70 leading-relaxed text-justify"
            >
              <p>{t("terms.p1", language)}</p>
              <p>{t("terms.p2", language)}</p>
              <p>{t("terms.p3", language)}</p>
              <p>{t("terms.p4", language)}</p>

              <h3 className="text-xs uppercase tracking-[0.15em] text-black/50 pt-4">
                {t("terms.cancelTitle", language)}
              </h3>
              <p>{t("terms.cancelP1", language)}</p>
              <p>{t("terms.cancelP2", language)}</p>

              {!reachedBottom && (
                <div className="text-center pt-4 pb-2">
                  <span className="text-xs text-black/30">
                    {language === "es"
                      ? "Desplázate hasta el final para aceptar"
                      : "Scroll to the bottom to accept"}
                  </span>
                </div>
              )}
            </div>

            {/* Footer with accept button */}
            <div className="px-6 py-4 border-t border-hairline">
              {alreadyAccepted ? (
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-medium transition-colors duration-200 cursor-pointer bg-black/5 text-black hover:bg-black/10"
                >
                  {language === "es" ? "Cerrar" : "Close"}
                </button>
              ) : (
                <button
                  onClick={() => { onAccept(); onClose(); }}
                  disabled={!reachedBottom}
                  className="w-full py-3 text-sm font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 bg-ink text-canvas hover:bg-ink/90"
                >
                  {language === "es" ? "Aceptar términos y condiciones" : "Accept terms and conditions"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
