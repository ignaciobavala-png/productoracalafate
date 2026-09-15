"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";
import { buildPaymentMethods, CARD_PAYMENT_METHODS } from "@/lib/mock-data";

export function StepConfirm() {
  const data = useOnboardingStore((s) => s.data);
  const language = useOnboardingStore((s) => s.language);
  const isSubmitting = useOnboardingStore((s) => s.isSubmitting);
  const submit = useOnboardingStore((s) => s.submit);
  const paymentContent = useOnboardingStore((s) => s.paymentContent);
  const setStep = useOnboardingStore((s) => s.setStep);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      await submit();
    } catch (err) {
      // El envío ahora revierte lo que alcanzó a escribir, así que reintentar
      // siempre es seguro. Se aclara que el borrador quedó guardado y se
      // sugiere recargar: si la app se redeployó con esta pestaña abierta,
      // recargar es lo único que la destraba.
      const fallback =
        language === "es"
          ? "No pudimos enviar el formulario. Tus datos quedaron guardados en este navegador: recargá la página y volvé a intentar."
          : "We couldn't submit the form. Your answers are saved in this browser: reload the page and try again.";
      const detail = err instanceof Error && err.message ? err.message : null;
      setSubmitError(detail ? `${detail} ${fallback}` : fallback);
    }
  };

  const companions = data.companions ?? [];
  const paymentMethods = buildPaymentMethods(paymentContent, language);
  const methodName = paymentMethods.find((m) => m.id === data.paymentMethod)?.label ?? t("stepConfirm.emptyField", language);

  const needsProof =
    !!data.paymentMethod && !CARD_PAYMENT_METHODS.includes(data.paymentMethod);

  // Los archivos no sobreviven a un refresh: no son serializables y el borrador
  // los guarda como null (ver `partialize` en el store). Como el paso también
  // se persiste, quien recarga o vuelve al otro día reaparece acá con las fotos
  // y el comprobante vacíos — y hasta ahora el envío salía igual, sin error y
  // con pantalla de agradecimiento. Cuatro invitados quedaron inscriptos así.
  const missing: { label: string; step: number }[] = [];
  const falta = (es: string, en: string, step: number) =>
    missing.push({ label: language === "es" ? es : en, step });

  if (!data.idPhoto) falta("tu foto de documento", "your ID photo", 2);
  if (!data.profilePhoto) falta("tu foto de perfil", "your profile photo", 2);
  // Mismo criterio que el submit: solo cuentan los acompañantes que realmente
  // se van a insertar. Si no, un borrador viejo con un acompañante residual
  // bloquearía el envío por fotos de alguien que ni siquiera se muestra acá.
  if (data.isComingAlone === false) {
    companions.forEach((c, i) => {
      if (!c.fullName?.trim()) return;
      const quien = language === "es" ? `acompañante ${i + 1}` : `companion ${i + 1}`;
      if (!c.idPhoto) falta(`foto de documento del ${quien}`, `ID photo of ${quien}`, 2);
      if (!c.profilePhoto) falta(`foto de perfil del ${quien}`, `profile photo of ${quien}`, 2);
    });
  }
  if (needsProof && !data.paymentProof) {
    falta("el comprobante de pago", "your payment proof", 3);
  }

  const missingStep = missing.length > 0 ? Math.min(...missing.map((m) => m.step)) : null;

  const proofValue = data.paymentProof
    ? data.paymentProof.name
    : needsProof
      ? (language === "es" ? "Falta adjuntar" : "Missing")
      : (language === "es" ? "No aplica" : "Not required");

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
          <Row label={t("stepPersonal.documentNumberLabel", language)} value={data.documentNumber} />
          <Row label={t("stepPersonal.emailLabel", language)} value={data.email} />
          <Row label={t("stepPersonal.phoneLabel", language)} value={data.phone} />
          <Row label={t("stepPersonal.whatsappLabel", language)} value={data.wantsWhatsApp ? t("shared.yes", language) : t("shared.no", language)} />
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-black mb-3 pb-2 border-b border-hairline">
          {t("stepConfirm.companionSection", language)}
        </h3>
        {data.isComingAlone === false && companions.length > 0 ? (
          <div className="space-y-6">
            {companions.map((companion, index) => (
              <dl key={index} className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-black/50">
                  {t("stepConfirm.companionHeading", language)} {index + 1}
                </p>
                <Row label={t("stepPersonal.companionFullNameLabel", language)} value={companion.fullName} />
                <Row label={t("stepPersonal.companionNationalityLabel", language)} value={companion.nationality} />
                <Row label={t("stepPersonal.companionDateOfBirthLabel", language)} value={companion.dateOfBirth} />
                <Row label={t("stepPersonal.companionDocumentNumberLabel", language)} value={companion.documentNumber} />
                <Row label={t("stepPersonal.companionEmailLabel", language)} value={companion.email} />
                <Row label={t("stepPersonal.companionPhoneLabel", language)} value={companion.phone} />
                <Row label={t("stepPersonal.companionWhatsappLabel", language)} value={companion.wantsWhatsApp ? t("shared.yes", language) : t("shared.no", language)} />
                <Row
                  label={t("stepDocuments.companionDietaryTitle", language)}
                  value={(companion.dietaryRestrictions?.length ?? 0) > 0 ? companion.dietaryRestrictions!.join(", ") : t("stepConfirm.emptyField", language)}
                />
                <Row label={t("stepDocuments.companionIdPhotoLabel", language)} value={companion.idPhoto?.name} missing={!companion.idPhoto} language={language} />
                <Row label={t("stepDocuments.companionProfilePhotoLabel", language)} value={companion.profilePhoto?.name} missing={!companion.profilePhoto} language={language} />
                <Row label={t("stepDocuments.companionBioLabel", language)} value={companion.bio} />
              </dl>
            ))}
          </div>
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
          <Row label={t("stepDocuments.idPhotoLabel", language)} value={data.idPhoto?.name} missing={!data.idPhoto} language={language} />
          <Row label={t("stepDocuments.profilePhotoLabel", language)} value={data.profilePhoto?.name} missing={!data.profilePhoto} language={language} />
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
            value={proofValue}
            missing={needsProof && !data.paymentProof}
            language={language}
          />
        </dl>
      </div>

      <div className="pt-4 border-t border-hairline">
        {missingStep !== null && (
          <div className="mb-4 p-4 border border-primary/30 bg-primary/[0.04]">
            <p className="text-sm text-black leading-relaxed">
              {language === "es"
                ? "Los archivos no quedan guardados cuando se recarga la página, así que hay que volver a elegirlos. Falta:"
                : "Files are not kept when the page reloads, so they need to be selected again. Missing:"}
            </p>
            <ul className="mt-2 text-sm text-black/70 list-disc pl-5 space-y-0.5">
              {missing.map((m, i) => (
                <li key={i}>{m.label}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setStep(missingStep)}
              className="mt-3 text-xs uppercase tracking-[0.12em] text-primary hover:text-black transition-colors duration-200 cursor-pointer underline underline-offset-4"
            >
              {language === "es"
                ? `Volver al paso ${missingStep} para adjuntarlos`
                : `Go back to step ${missingStep} to attach them`}
            </button>
          </div>
        )}
        {submitError && (
          <p className="text-sm text-red-500 mb-3 leading-relaxed">{submitError}</p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !data.acceptedTerms || missingStep !== null}
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

function Row({
  label,
  value,
  missing,
  language,
}: {
  label: string;
  value?: string;
  missing?: boolean;
  language?: "es" | "en";
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-black/50 mb-0.5">{label}</dt>
      <dd className={`text-sm leading-relaxed ${missing ? "text-primary" : "text-black"}`}>
        {missing
          ? (language === "en" ? "Missing" : "Falta adjuntar")
          : value || "\u2014"}
      </dd>
    </div>
  );
}
