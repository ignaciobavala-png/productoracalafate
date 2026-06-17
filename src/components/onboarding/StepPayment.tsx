"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { paymentMethods, CARD_PAYMENT_METHODS } from "@/lib/mock-data";
import { TermsModal } from "./TermsModal";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ml-3 text-black/25 hover:text-black/60"
      title={copied ? "Copiado" : "Copiar"}
      aria-label="Copiar"
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 6.5l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4.5" y="1" width="7.5" height="8.5" rx="1" />
          <path d="M8.5 1H2a1 1 0 00-1 1v8.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

export function StepPayment() {
  const data = useOnboardingStore((s) => s.data);
  const updateField = useOnboardingStore((s) => s.updateField);
  const setPaymentProof = useOnboardingStore((s) => s.setPaymentProof);
  const language = useOnboardingStore((s) => s.language);
  const [termsOpen, setTermsOpen] = useState(false);

  const selected = paymentMethods.find((m) => m.id === data.paymentMethod);
  const isCardMethod = selected ? CARD_PAYMENT_METHODS.includes(selected.id) : false;

  return (
    <div className="space-y-8">

      {/* Factura */}
      <div className="bg-surface-soft p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.needsInvoice ?? false}
            onChange={(e) => updateField("needsInvoice", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
          />
          <div>
            <span className="text-sm text-black font-normal">
              {t("stepPayment.invoiceLabel", language)}
            </span>
            <p className="text-[11px] text-black/50 mt-0.5">
              {t("stepPayment.invoiceHint", language)}
            </p>
          </div>
        </label>
      </div>

      {/* Selección de método */}
      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-black mb-3">
          {t("stepPayment.methodLabel", language)}
        </label>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => updateField("paymentMethod", method.id)}
              className={`w-full text-left px-4 py-3 border text-sm transition-colors duration-200 cursor-pointer ${
                data.paymentMethod === method.id
                  ? "border-ink bg-ink text-canvas"
                  : "border-hairline text-black hover:border-ink/40"
              }`}
            >
              {method.label}
              <span className="text-xs opacity-60 ml-2">({method.currency})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel de instrucciones + comprobante */}
      {selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="space-y-5"
        >
          {/* Datos bancarios / instrucciones con copy */}
          <div className="bg-surface-soft p-5 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-black/40 mb-1">
              {language === "es" ? "Datos de pago" : "Payment details"}
            </p>
            <ul className="space-y-2">
              {selected.details.map((line, i) => (
                <li
                  key={i}
                  className="group flex items-center justify-between text-sm text-black leading-relaxed font-mono"
                >
                  <span>{line}</span>
                  <CopyButton value={line} />
                </li>
              ))}
            </ul>
          </div>

          {/* Tarjeta de crédito: mensaje de próximo paso */}
          {isCardMethod ? (
            <div className="flex gap-3 p-4 bg-black/[0.03] border border-black/10">
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="8" cy="8" r="7" />
                <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-black/70 leading-relaxed">
                {language === "es"
                  ? "Una vez revisada tu solicitud, el equipo te enviará el link de pago por email. No es necesario adjuntar comprobante en este momento."
                  : "Once your application is reviewed, the team will send you a payment link by email. No proof is needed at this stage."}
              </p>
            </div>
          ) : (
            /* Transferencia / Global66: comprobante requerido */
            <div className="space-y-3">
              <div>
                <p className="text-xs text-black/60 leading-relaxed mb-1">
                  {language === "es"
                    ? "Una vez realizado el pago, adjunta el comprobante de transferencia o captura de pantalla."
                    : "Once you have made the payment, attach your transfer confirmation or screenshot."}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs uppercase tracking-[0.15em] text-black">
                    {language === "es" ? "Comprobante de pago" : "Payment proof"}
                  </span>
                  <span className="text-primary text-xs">*</span>
                </div>
                <ProofDropzone
                  file={data.paymentProof ?? null}
                  onChange={setPaymentProof}
                  language={language}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Términos */}
      <div className="pt-4 border-t border-hairline">
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="flex items-start gap-3 w-full text-left cursor-pointer group"
        >
          <span
            className={`mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center border transition-colors duration-200 ${
              data.acceptedTerms
                ? "bg-ink border-ink"
                : "border-hairline group-hover:border-ink/40"
            }`}
          >
            {data.acceptedTerms && (
              <svg
                width="10" height="10" viewBox="0 0 10 10"
                fill="none" stroke="currentColor" strokeWidth="2"
                className="text-canvas"
              >
                <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-sm text-black leading-relaxed group-hover:text-black/80 transition-colors">
            {data.acceptedTerms
              ? (language === "es" ? "Términos y condiciones aceptados" : "Terms and conditions accepted")
              : t("stepPayment.termsLabel", language)}
            {!data.acceptedTerms && <span className="text-primary ml-1">*</span>}
          </span>
        </button>
      </div>

      <TermsModal
        open={termsOpen}
        alreadyAccepted={!!data.acceptedTerms}
        onClose={() => setTermsOpen(false)}
        onAccept={() => updateField("acceptedTerms", true)}
      />

      <div className="text-[11px] text-black/50 leading-relaxed">
        {t("stepPayment.contactLabel", language)}
      </div>
    </div>
  );
}

function ProofDropzone({
  file,
  onChange,
  language,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  language: "es" | "en";
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onChange(f);
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-soft border border-hairline">
        <svg className="shrink-0 text-green-600" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 7l4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-black truncate flex-1">{file.name}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 text-[11px] text-black/40 hover:text-primary transition-colors duration-300 cursor-pointer underline underline-offset-2"
        >
          {language === "es" ? "Quitar" : "Remove"}
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed cursor-pointer transition-colors duration-200 ${
        dragging
          ? "border-primary bg-primary/[0.03]"
          : "border-hairline hover:border-ink/30 bg-canvas"
      }`}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-black/25">
        <path d="M10 13V4M10 4l-3 3M10 4l3 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" strokeLinecap="round" />
      </svg>
      <span className="text-xs text-black/50 text-center px-4">
        {dragging
          ? (language === "es" ? "Suelta aquí" : "Drop here")
          : (language === "es"
              ? "Arrastra o haz clic para subir — JPG, PNG, PDF"
              : "Drag or click to upload — JPG, PNG, PDF")}
      </span>
    </label>
  );
}
