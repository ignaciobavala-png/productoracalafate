"use client";

import { useState, useCallback } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { t } from "@/lib/onboarding-text";

const DIETARY_OPTIONS = [
  "dietaryVegan",
  "dietaryVegetarian",
  "dietaryCeliac",
  "dietaryKosher",
  "dietaryAllergies",
  "dietaryNone",
] as const;

export function StepDocuments() {
  const data = useOnboardingStore((s) => s.data);
  const updateField = useOnboardingStore((s) => s.updateField);
  const toggleDietary = useOnboardingStore((s) => s.toggleDietary);
  const setIdPhoto = useOnboardingStore((s) => s.setIdPhoto);
  const setProfilePhoto = useOnboardingStore((s) => s.setProfilePhoto);
  const language = useOnboardingStore((s) => s.language);

  const dietary = data.dietaryRestrictions ?? [];

  return (
    <div className="space-y-8">
      <div>
        <legend className="text-sm font-semibold text-black mb-4">
          {t("stepDocuments.dietaryTitle", language)}
        </legend>

        <div className="flex flex-wrap gap-2 mb-4">
          {DIETARY_OPTIONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleDietary(t(`stepDocuments.${key}`, "es"))}
              disabled={key === "dietaryNone" ? false : dietary.includes(t("stepDocuments.dietaryNone", "es"))}
              className={`px-4 py-2 text-sm border cursor-pointer transition-colors duration-300 ${
                dietary.includes(t(`stepDocuments.${key}`, "es"))
                  ? "border-ink bg-ink text-canvas"
                  : key === "dietaryNone"
                    ? "border-hairline text-black hover:border-ink/40"
                    : dietary.includes(t("stepDocuments.dietaryNone", "es"))
                      ? "border-hairline text-black cursor-not-allowed"
                      : "border-hairline text-black hover:border-ink/40"
              }`}
            >
              {t(`stepDocuments.${key}`, language)}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-black mb-2">
            {t("stepDocuments.dietaryDetailLabel", language)}
          </span>
          <textarea
            value={data.dietaryDetails ?? ""}
            onChange={(e) => updateField("dietaryDetails", e.target.value)}
            placeholder={t("stepDocuments.dietaryDetailPlaceholder", language)}
            rows={3}
            className="w-full px-4 py-3 bg-canvas border border-hairline text-black text-sm placeholder:text-black/30 focus:ring-0 focus:border-2 focus:border-primary transition-colors duration-200 resize-none"
          />
        </label>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-black mb-2">
          {t("stepDocuments.idPhotoLabel", language)}
          <span className="text-primary ml-1">*</span>
        </label>
        <p className="text-[11px] text-black/50 mb-3">
          {t("stepDocuments.idPhotoHint", language)}
        </p>
        <FileDropzone
          file={data.idPhoto ?? null}
          onChange={setIdPhoto}
          language={language}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-black mb-2">
          {t("stepDocuments.profilePhotoLabel", language)}
          <span className="text-primary ml-1">*</span>
        </label>
        <p className="text-[11px] text-black/50 mb-3">
          {t("stepDocuments.profilePhotoHint", language)}
        </p>
        <FileDropzone
          file={data.profilePhoto ?? null}
          onChange={setProfilePhoto}
          language={language}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-black mb-2">
          {t("stepDocuments.bioLabel", language)}
          <span className="text-primary ml-1">*</span>
        </label>
        <textarea
          value={data.bio ?? ""}
          onChange={(e) => updateField("bio", e.target.value)}
          placeholder={t("stepDocuments.bioPlaceholder", language)}
          rows={10}
          className="w-full px-4 py-3 bg-canvas border border-hairline text-black text-sm placeholder:text-black/30 focus:ring-0 focus:border-2 focus:border-primary transition-colors duration-200 resize-none"
        />
      </div>
    </div>
  );
}

function FileDropzone({
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

  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between px-4 py-3 bg-surface-soft border border-hairline">
          <span className="text-sm text-black truncate mr-4">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-black hover:text-primary transition-colors duration-300 cursor-pointer underline"
          >
            {t("stepDocuments.dropzoneRemove", language)}
          </button>
        </div>
      ) : (
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
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />
          <span className="text-xs text-black">
            {dragging
              ? t("stepDocuments.dropzoneDragging", language)
              : t("stepDocuments.dropzoneIdle", language)}
          </span>
        </label>
      )}
    </div>
  );
}
