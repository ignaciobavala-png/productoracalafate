import { create } from "zustand";
import type { GuestOnboardingData, CompanionData } from "@/types";
import type { Language } from "@/lib/onboarding-text";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/supabase/storage";
import { compressImage } from "@/lib/compress-image";
import { useInvitationStore } from "@/store/invitation-store";
import { consumeInvitationCode } from "@/app/actions/consume-invitation";
import { updateGuestUrl } from "@/app/actions/update-guest-urls";
import { updateCompanionUrl } from "@/app/actions/update-companion-url";
import { rollbackGuestSubmission } from "@/app/actions/rollback-guest";

// Los dropzones ya entregan webp: esto es la red de seguridad por si alguna
// imagen llega sin comprimir. No lleva catch a propósito — con el `catch
// { return file }` anterior se subía el original (un .HEIC de iPhone, que el
// bucket rechaza por allowed_mime_types) y el invitado se enteraba recién al
// final, con el alta revertida y sin saber qué archivo era el problema.
async function toUploadable(file: File): Promise<File> {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return file;
  if (file.type === "image/webp") return file;
  return compressImage(file);
}

type ContentMap = Record<string, { es: string; en: string }>

interface OnboardingState {
  step: number;
  language: Language;
  data: Partial<GuestOnboardingData>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  paymentContent: ContentMap;
  footerContent: ContentMap;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLanguage: (lang: Language) => void;
  initContent: (payment: ContentMap, footer: ContentMap) => void;
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
  toggleCompanionDietary: (restriction: string) => void;
  setCompanionProfilePhoto: (file: File | null) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

const emptyCompanion: CompanionData = {
  fullName: "",
  nationality: "",
  dateOfBirth: "",
  documentNumber: "",
  email: "",
  phone: "",
  wantsWhatsApp: false,
  bio: "",
  dietaryRestrictions: [],
  dietaryDetails: "",
  profilePhoto: null,
};

const initialData: Partial<GuestOnboardingData> = {
  fullName: "",
  nationality: "",
  dateOfBirth: "",
  documentNumber: "",
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
  paymentContent: {},
  footerContent: {},

  setStep: (step) => set({ step }),
  initContent: (payment, footer) => set({ paymentContent: payment, footerContent: footer }),
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

  toggleCompanionDietary: (restriction) =>
    set((s) => {
      const companion = s.data.companion ?? { ...emptyCompanion };
      const current = companion.dietaryRestrictions ?? [];

      if (restriction === "Ninguna") {
        return { data: { ...s.data, companion: { ...companion, dietaryRestrictions: ["Ninguna"] } } };
      }

      const withoutNone = current.filter((r) => r !== "Ninguna");

      if (withoutNone.includes(restriction)) {
        return { data: { ...s.data, companion: { ...companion, dietaryRestrictions: withoutNone.filter((r) => r !== restriction) } } };
      }

      return { data: { ...s.data, companion: { ...companion, dietaryRestrictions: [...withoutNone, restriction] } } };
    }),

  setCompanionProfilePhoto: (file) =>
    set((s) => ({
      data: {
        ...s.data,
        companion: { ...(s.data.companion ?? { ...emptyCompanion }), profilePhoto: file },
      },
    })),

  submit: async () => {
    const state = useOnboardingStore.getState();
    if (state.isSubmitting || state.isSubmitted) return;
    const { data } = state;
    set({ isSubmitting: true });

    try {
      const supabase = createClient();
      const { validatedCode, tripId } = useInvitationStore.getState();

      // Insertar guest primero para obtener el ID generado
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .insert({
          full_name: data.fullName!,
          nationality: data.nationality || null,
          date_of_birth: data.dateOfBirth || null,
          document_number: data.documentNumber || null,
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
          invitation_code: validatedCode,
          trip_id: tripId,
        })
        .select("id")
        .single();

      if (guestError) {
        if (guestError.code === "23505") {
          throw new Error("Este email ya fue registrado para este viaje.");
        }
        throw guestError;
      }
      const guestId = guest.id;

      // Marcar la invitación como usada
      if (validatedCode) {
        await consumeInvitationCode(validatedCode, guestId)
      }

      try {
        // Subir fotos en paralelo (comprimidas antes de subir)
        const uploads: Promise<void>[] = [];

        if (data.idPhoto) {
          const idPhoto = await toUploadable(data.idPhoto);
          const ext = idPhoto.name.split(".").pop() ?? "jpg";
          uploads.push(
            uploadFile("guest-id-photos", `${guestId}/id.${ext}`, idPhoto)
              .then((path) => updateGuestUrl(guestId, "id_photo_url", path))
          );
        }

        if (data.profilePhoto) {
          const profilePhoto = await toUploadable(data.profilePhoto);
          const ext = profilePhoto.name.split(".").pop() ?? "jpg";
          uploads.push(
            uploadFile("guest-profile-photos", `${guestId}/profile.${ext}`, profilePhoto)
              .then((path) => updateGuestUrl(guestId, "profile_photo_url", path))
          );
        }

        if (data.paymentProof) {
          const paymentProof = await toUploadable(data.paymentProof);
          const ext = paymentProof.name.split(".").pop() ?? "jpg";
          uploads.push(
            uploadFile("guest-payment-proofs", `${guestId}/comprobante.${ext}`, paymentProof)
              .then((path) => updateGuestUrl(guestId, "payment_proof_url", path))
          );
        }

        // Insertar acompañante si corresponde
        if (data.isComingAlone === false && data.companion?.fullName) {
          const { data: companionRow, error: companionError } = await supabase
            .from("companions")
            .insert({
              guest_id: guestId,
              full_name: data.companion.fullName,
              nationality: data.companion.nationality || null,
              date_of_birth: data.companion.dateOfBirth || null,
              document_number: data.companion.documentNumber || null,
              email: data.companion.email || null,
              phone: data.companion.phone || null,
              wants_whatsapp: data.companion.wantsWhatsApp ?? false,
              bio: data.companion.bio ?? "",
              dietary_restrictions: data.companion.dietaryRestrictions ?? [],
              dietary_details: data.companion.dietaryDetails ?? "",
            })
            .select("id")
            .single();

          if (companionError) throw companionError;

          if (companionRow?.id && data.companion.profilePhoto) {
            const companionPhoto = await toUploadable(data.companion.profilePhoto);
            const ext = companionPhoto.name.split(".").pop() ?? "jpg";
            uploads.push(
              uploadFile("guest-profile-photos", `${guestId}/companion-profile.${ext}`, companionPhoto)
                .then((path) => updateCompanionUrl(companionRow.id, "profile_photo_url", path))
            );
          }
        }

        await Promise.all(uploads);
      } catch (innerErr) {
        // Algo falló después de crear el guest (ej. foto supera el límite
        // del bucket). Revertimos el insert para que el usuario pueda
        // reintentar con el mismo email en vez de quedar bloqueado por
        // el constraint de email único.
        await rollbackGuestSubmission(guestId, validatedCode ?? null);
        throw innerErr;
      }

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
