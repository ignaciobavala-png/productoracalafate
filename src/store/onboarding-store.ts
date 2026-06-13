import { create } from "zustand";
import type { GuestOnboardingData, CompanionData } from "@/types";
import type { Language } from "@/lib/onboarding-text";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/supabase/storage";

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
  setPaymentProof: (file: File | null) => void;
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
  paymentProof: null,
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
  setPaymentProof: (file) => set((s) => ({ data: { ...s.data, paymentProof: file } })),

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
    const { data } = useOnboardingStore.getState();
    set({ isSubmitting: true });

    try {
      const supabase = createClient();

      // Insertar guest primero para obtener el ID generado
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .insert({
          full_name: data.fullName!,
          nationality: data.nationality || null,
          date_of_birth: data.dateOfBirth || null,
          email: data.email!,
          phone: data.phone || null,
          wants_whatsapp: data.wantsWhatsApp ?? false,
          is_coming_alone: data.isComingAlone,
          dietary_restrictions: data.dietaryRestrictions ?? [],
          dietary_details: data.dietaryDetails ?? "",
          bio: data.bio ?? "",
          needs_invoice: data.needsInvoice ?? false,
          payment_method_id: data.paymentMethod || null,
          accepted_terms: data.acceptedTerms ?? false,
        })
        .select("id")
        .single();

      if (guestError) throw guestError;
      const guestId = guest.id;

      // Subir fotos en paralelo
      const uploads: Promise<void>[] = [];

      if (data.idPhoto) {
        const ext = data.idPhoto.name.split(".").pop() ?? "jpg";
        uploads.push(
          uploadFile("guest-id-photos", `${guestId}/id.${ext}`, data.idPhoto)
            .then((path) =>
              supabase.from("guests").update({ id_photo_url: path }).eq("id", guestId)
            )
            .then(() => undefined)
        );
      }

      if (data.profilePhoto) {
        const ext = data.profilePhoto.name.split(".").pop() ?? "jpg";
        uploads.push(
          uploadFile("guest-profile-photos", `${guestId}/profile.${ext}`, data.profilePhoto)
            .then((path) =>
              supabase.from("guests").update({ profile_photo_url: path }).eq("id", guestId)
            )
            .then(() => undefined)
        );
      }

      if (data.paymentProof) {
        const ext = data.paymentProof.name.split(".").pop() ?? "jpg";
        uploads.push(
          uploadFile("guest-payment-proofs", `${guestId}/comprobante.${ext}`, data.paymentProof)
            .then((path) =>
              supabase.from("guests").update({ payment_proof_url: path }).eq("id", guestId)
            )
            .then(() => undefined)
        );
      }

      // Insertar acompañante si corresponde
      if (data.isComingAlone === false && data.companion?.fullName) {
        uploads.push(
          supabase
            .from("companions")
            .insert({
              guest_id: guestId,
              full_name: data.companion.fullName,
              nationality: data.companion.nationality || null,
              date_of_birth: data.companion.dateOfBirth || null,
              email: data.companion.email || null,
              phone: data.companion.phone || null,
              wants_whatsapp: data.companion.wantsWhatsApp ?? false,
            })
            .then(() => undefined) as Promise<void>
        );
      }

      await Promise.all(uploads);
      set({ isSubmitting: false, isSubmitted: true });
    } catch (err) {
      console.error("[onboarding] submit error:", err);
      set({ isSubmitting: false });
      throw err;
    }
  },

  reset: () =>
    set({
      step: 1,
      data: { ...initialData },
      isSubmitting: false,
      isSubmitted: false,
    }),
}));
