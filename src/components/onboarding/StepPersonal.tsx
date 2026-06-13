"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

export function StepPersonal() {
  const data = useOnboardingStore((s) => s.data);
  const updateField = useOnboardingStore((s) => s.updateField);
  const updateCompanionField = useOnboardingStore((s) => s.updateCompanionField);
  const language = useOnboardingStore((s) => s.language);

  const companion = data.companion;
  const isAlone = data.isComingAlone;

  return (
    <div>
      <div className="space-y-5">
        <Field
          label={t("stepPersonal.fullNameLabel", language)}
          required
          value={data.fullName ?? ""}
          onChange={(v) => updateField("fullName", v)}
          placeholder={t("stepPersonal.fullNamePlaceholder", language)}
        />

        <Field
          label={t("stepPersonal.nationalityLabel", language)}
          required
          value={data.nationality ?? ""}
          onChange={(v) => updateField("nationality", v)}
          placeholder={t("stepPersonal.nationalityPlaceholder", language)}
        />

        <Field
          label={t("stepPersonal.dateOfBirthLabel", language)}
          required
          type="date"
          value={data.dateOfBirth ?? ""}
          onChange={(v) => updateField("dateOfBirth", v)}
        />

        <Field
          label={t("stepPersonal.emailLabel", language)}
          required
          type="email"
          value={data.email ?? ""}
          onChange={(v) => updateField("email", v)}
          placeholder={t("stepPersonal.emailPlaceholder", language)}
        />

        <Field
          label={t("stepPersonal.phoneLabel", language)}
          value={data.phone ?? ""}
          onChange={(v) => updateField("phone", v)}
          placeholder={t("stepPersonal.phonePlaceholder", language)}
        />

        <Checkbox
          label={t("stepPersonal.whatsappLabel", language)}
          checked={data.wantsWhatsApp ?? false}
          onChange={(v) => updateField("wantsWhatsApp", v)}
        />

        <div className="pt-4 border-t border-hairline">
          <legend className="text-xs uppercase tracking-[0.15em] text-black mb-4">
            {t("stepPersonal.comingAloneTitle", language)}
          </legend>
          <div className="flex gap-4">
            <RadioChip
              label={t("stepPersonal.alone", language)}
              selected={isAlone === true}
              onClick={() => updateField("isComingAlone", true)}
            />
            <RadioChip
              label={t("stepPersonal.withCompanion", language)}
              selected={isAlone === false}
              onClick={() => updateField("isComingAlone", false)}
            />
          </div>
        </div>

        {isAlone === false && companion && (
          <div className="pt-4 border-t border-hairline space-y-5">
            <p className="text-sm font-semibold text-black">
              {t("stepPersonal.companionSection", language)}
            </p>

            <Field
              label={t("stepPersonal.companionFullNameLabel", language)}
              required
              value={companion.fullName}
              onChange={(v) => updateCompanionField("fullName", v)}
              placeholder={t("stepPersonal.fullNamePlaceholder", language)}
            />

            <Field
              label={t("stepPersonal.companionNationalityLabel", language)}
              required
              value={companion.nationality}
              onChange={(v) => updateCompanionField("nationality", v)}
              placeholder={t("stepPersonal.nationalityPlaceholder", language)}
            />

            <Field
              label={t("stepPersonal.companionDateOfBirthLabel", language)}
              required
              type="date"
              value={companion.dateOfBirth}
              onChange={(v) => updateCompanionField("dateOfBirth", v)}
            />

            <Field
              label={t("stepPersonal.companionEmailLabel", language)}
              required
              type="email"
              value={companion.email}
              onChange={(v) => updateCompanionField("email", v)}
              placeholder={t("stepPersonal.emailPlaceholder", language)}
            />

            <Field
              label={t("stepPersonal.companionPhoneLabel", language)}
              value={companion.phone}
              onChange={(v) => updateCompanionField("phone", v)}
              placeholder={t("stepPersonal.phonePlaceholder", language)}
            />

            <Checkbox
              label={t("stepPersonal.companionWhatsappLabel", language)}
              checked={companion.wantsWhatsApp}
              onChange={(v) => updateCompanionField("wantsWhatsApp", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.15em] text-black mb-2">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 bg-canvas border border-hairline text-black text-sm placeholder:text-black/30 focus:ring-0 focus:border-2 focus:border-primary transition-colors duration-200"
      />
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
      />
      <span className="text-sm text-black leading-relaxed">{label}</span>
    </label>
  );
}

function RadioChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 text-sm border cursor-pointer transition-colors duration-200 ${
        selected
          ? "border-ink bg-ink text-canvas"
          : "border-hairline text-black hover:border-ink/40"
      }`}
    >
      {label}
    </button>
  );
}
