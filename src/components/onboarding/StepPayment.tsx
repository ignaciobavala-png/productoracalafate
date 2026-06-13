"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { paymentMethods } from "@/lib/mock-data";

export function StepPayment() {
  const data = useOnboardingStore((s) => s.data);
  const updateField = useOnboardingStore((s) => s.updateField);
  const setPaymentProof = useOnboardingStore((s) => s.setPaymentProof);
  const language = useOnboardingStore((s) => s.language);

  const selected = paymentMethods.find((m) => m.id === data.paymentMethod);

  return (
    <div className="space-y-8">
      <div className="bg-surface-soft p-6 space-y-4">
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

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-surface-soft p-5">
            <h4 className="text-sm font-semibold text-black mb-3">{selected.label}</h4>
            <ul className="space-y-1.5">
              {selected.details.map((line, i) => (
                <li key={i} className="text-sm text-black leading-relaxed font-mono">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      <div className="pt-4 border-t border-hairline space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.acceptedTerms ?? false}
            onChange={(e) => updateField("acceptedTerms", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
          />
          <span className="text-sm text-black leading-relaxed">
            {t("stepPayment.termsLabel", language)}
            <span className="text-primary ml-1">*</span>
          </span>
        </label>

        {!data.acceptedTerms && (
          <p className="text-[11px] text-primary">
            {t("stepPayment.termsRequired", language)}
          </p>
        )}
      </div>

      {data.paymentMethod && (
        <div className="pt-4 border-t border-hairline">
          <label className="block text-xs uppercase tracking-[0.15em] text-black mb-2">
            {language === "es" ? "Comprobante de pago" : "Payment proof"}
          </label>
          <p className="text-[11px] text-black/50 mb-3">
            {language === "es"
              ? "Adjunta el comprobante de transferencia o captura de pantalla del pago. PDF o imagen."
              : "Attach your transfer confirmation or payment screenshot. PDF or image."}
          </p>
          <ProofDropzone
            file={data.paymentProof ?? null}
            onChange={setPaymentProof}
            language={language}
          />
        </div>
      )}

      <div className="text-[11px] text-black/50 leading-relaxed pt-4 border-t border-hairline">
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
      <div className="flex items-center justify-between px-4 py-3 bg-surface-soft border border-hairline">
        <span className="text-sm text-black truncate mr-4">{file.name}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[11px] text-black hover:text-primary transition-colors duration-300 cursor-pointer underline"
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
      className={`flex flex-col items-center justify-center h-28 border-2 border-dashed cursor-pointer transition-colors duration-200 ${
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
      <span className="text-xs text-black">
        {dragging
          ? (language === "es" ? "Suelta aquí" : "Drop here")
          : (language === "es" ? "Arrastra o haz clic para subir" : "Drag or click to upload")}
      </span>
    </label>
  );
}
