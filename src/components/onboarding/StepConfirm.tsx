"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { paymentMethods } from "@/lib/mock-data";

export function StepConfirm() {
  const data = useOnboardingStore((s) => s.data);
  const language = useOnboardingStore((s) => s.language);
  const isSubmitting = useOnboardingStore((s) => s.isSubmitting);
  const submit = useOnboardingStore((s) => s.submit);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      await submit();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : (language === "es" ? "Error al enviar. Intenta nuevamente." : "Submission failed. Please try again."));
    }
  };

  const companion = data.companion;
  const methodName = paymentMethods.find((m) => m.id === data.paymentMethod)?.label ?? t("stepConfirm.emptyField", language);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-black mb-3 pb-2 border-b border-hairline">
          {t("stepConfirm.personalSection", language)}
        </h3>
        <dl className="space-y-3">
          <Row label={t("stepPersonal.fullNameLabel", language)} value={data.fullName} />
          <Row label={t("stepPersonal.nationalityLabel", language)} value={data.nationality} />
          <Row label={t("stepPersonal.dateOfBirthLabel", language)} value={data.dateOfBirth} />
          <Row label={t("stepPersonal.emailLabel", language)} value={data.email} />
          <Row label={t("stepPersonal.phoneLabel", language)} value={data.phone} />
          <Row label={t("stepPersonal.whatsappLabel", language)} value={data.wantsWhatsApp ? t("shared.yes", language) : t("shared.no", language)} />
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-black mb-3 pb-2 border-b border-hairline">
          {t("stepConfirm.companionSection", language)}
        </h3>
        {data.isComingAlone === false && companion ? (
          <dl className="space-y-3">
            <Row label={t("stepPersonal.companionFullNameLabel", language)} value={companion.fullName} />
            <Row label={t("stepPersonal.companionNationalityLabel", language)} value={companion.nationality} />
            <Row label={t("stepPersonal.companionDateOfBirthLabel", language)} value={companion.dateOfBirth} />
            <Row label={t("stepPersonal.companionEmailLabel", language)} value={companion.email} />
            <Row label={t("stepPersonal.companionPhoneLabel", language)} value={companion.phone} />
            <Row label={t("stepPersonal.companionWhatsappLabel", language)} value={companion.wantsWhatsApp ? t("shared.yes", language) : t("shared.no", language)} />
          </dl>
        ) : (
          <p className="text-sm text-black/50">{t("stepConfirm.noCompanion", language)}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-black mb-3 pb-2 border-b border-hairline">
          {t("stepConfirm.documentsSection", language)}
        </h3>
        <dl className="space-y-3">
          <Row
            label={t("stepDocuments.dietaryTitle", language)}
            value={
              (data.dietaryRestrictions ?? []).length > 0
                ? (data.dietaryRestrictions ?? []).join(", ")
                : t("stepConfirm.emptyField", language)
            }
          />
          <Row label={t("stepDocuments.idPhotoLabel", language)} value={data.idPhoto ? data.idPhoto.name : t("stepConfirm.emptyField", language)} />
          <Row label={t("stepDocuments.profilePhotoLabel", language)} value={data.profilePhoto ? data.profilePhoto.name : t("stepConfirm.emptyField", language)} />
          <Row label={t("stepDocuments.bioLabel", language)} value={data.bio} />
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-black mb-3 pb-2 border-b border-hairline">
          {t("stepConfirm.paymentSection", language)}
        </h3>
        <dl className="space-y-3">
          <Row
            label={t("stepPayment.invoiceLabel", language)}
            value={data.needsInvoice ? t("stepConfirm.needsInvoice", language) : t("stepConfirm.noInvoice", language)}
          />
          <Row label={t("stepConfirm.paymentMethod", language)} value={methodName} />
          <Row
            label={language === "es" ? "Comprobante" : "Payment proof"}
            value={data.paymentProof ? data.paymentProof.name : (language === "es" ? "No aplica" : "Not required")}
          />
        </dl>
      </div>

      <div className="pt-4 border-t border-hairline">
        {submitError && (
          <p className="text-sm text-red-500 mb-3 leading-relaxed">{submitError}</p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !data.acceptedTerms}
          className="w-full py-3.5 px-6 bg-ink text-canvas text-sm uppercase tracking-[0.15em] hover:bg-ink/90 transition-colors duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-canvas" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("stepConfirm.submitting", language)}
            </>
          ) : (
            t("stepConfirm.submitButton", language)
          )}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-black/50 mb-0.5">{label}</dt>
      <dd className="text-sm text-black leading-relaxed">{value || "\u2014"}</dd>
    </div>
  );
}
