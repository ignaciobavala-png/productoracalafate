import { create } from "zustand";
import type { GuestOnboardingData, CompanionData } from "@/types";
import type { Language } from "@/lib/onboarding-text";

interface OnboardingState {
  step: number;
  language: Language;
  data: Partial<GuestOnboardingData>;
  isSubmitting: boolean;
  isSubmitted: boolean;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLanguage: (lang: Language) => void;
  updateField: <K extends keyof GuestOnboardingData>(
    key: K,
    value: GuestOnboardingData[K]
  ) => void;
  updateCompanionField: <K extends keyof CompanionData>(
    key: K,
    value: CompanionData[K]
  ) => void;
  setIdPhoto: (file: File | null) => void;
  setProfilePhoto: (file: File | null) => void;
  toggleDietary: (restriction: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

const emptyCompanion: CompanionData = {
  fullName: "",
  nationality: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  wantsWhatsApp: false,
};

const initialData: Partial<GuestOnboardingData> = {
  fullName: "",
  nationality: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  wantsWhatsApp: false,
  isComingAlone: null,
  companion: { ...emptyCompanion },
  dietaryRestrictions: [],
  dietaryDetails: "",
  idPhoto: null,
  profilePhoto: null,
  bio: "",
  needsInvoice: false,
  paymentMethod: "",
  acceptedTerms: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  language: "es",
  data: { ...initialData },
  isSubmitting: false,
  isSubmitted: false,

  setStep: (step) => set({ step }),
  nextStep: () =>
    set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () =>
    set((s) => ({ step: Math.max(s.step - 1, 1) })),
  setLanguage: (language) => set({ language }),

  updateField: (key, value) =>
    set((s) => ({
      data: { ...s.data, [key]: value },
    })),

  updateCompanionField: (key, value) =>
    set((s) => ({
      data: {
        ...s.data,
        companion: {
          ...(s.data.companion ?? emptyCompanion),
          [key]: value,
        },
      },
    })),

  setIdPhoto: (file) => set((s) => ({ data: { ...s.data, idPhoto: file } })),
  setProfilePhoto: (file) => set((s) => ({ data: { ...s.data, profilePhoto: file } })),

  toggleDietary: (restriction) =>
    set((s) => {
      const current = s.data.dietaryRestrictions ?? [];

      if (restriction === "Ninguna") {
        return { data: { ...s.data, dietaryRestrictions: ["Ninguna"] } };
      }

      const withoutNone = current.filter((r) => r !== "Ninguna");

      if (withoutNone.includes(restriction)) {
        return {
          data: {
            ...s.data,
            dietaryRestrictions: withoutNone.filter((r) => r !== restriction),
          },
        };
      }

      return {
        data: {
          ...s.data,
          dietaryRestrictions: [...withoutNone, restriction],
        },
      };
    }),

  submit: async () => {
    set({ isSubmitting: true });
    await new Promise((r) => setTimeout(r, 2000));
    set({ isSubmitting: false, isSubmitted: true });
  },

  reset: () =>
    set({
      step: 1,
      data: { ...initialData },
      isSubmitting: false,
      isSubmitted: false,
    }),
}));
