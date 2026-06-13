"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { paymentMethods } from "@/lib/mock-data";

export function StepPayment() {
  const data = useOnboardingStore((s) => s.data);
  const updateField = useOnboardingStore((s) => s.updateField);
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

      <div className="text-[11px] text-black/50 leading-relaxed pt-4 border-t border-hairline">
        {t("stepPayment.contactLabel", language)}
      </div>
    </div>
  );
}
