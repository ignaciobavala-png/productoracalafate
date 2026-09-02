import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GuestOnboardingData, CompanionData } from "@/types";
import type { Language } from "@/lib/onboarding-text";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/supabase/storage";
import { compressImage } from "@/lib/compress-image";
import { useInvitationStore } from "@/store/invitation-store";
import { consumeInvitationCode } from "@/app/actions/consume-invitation";
import { updateGuestUrl } from "@/app/actions/update-guest-urls";
import { updateCompanionUrl } from "@/app/actions/update-companion-url";
import { rollbackGuestSubmission, type UploadedObject } from "@/app/actions/rollback-guest";
import { resumeGuestSubmission, type GuestFormRow } from "@/app/actions/resume-guest";

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

// Cada intento sube a un path propio. Con un path fijo y `upsert: false`, el
// segundo intento de un mismo invitado chocaba con "Duplicate" contra el
// archivo del intento anterior; además una URL repetida se queda pegada en el
// CDN y el admin sigue viendo la foto vieja.
function attemptPath(guestId: string, base: string, ext: string) {
  return `${guestId}/${base}-${Date.now()}.${ext}`;
}

/**
 * Tope de acompañantes por invitación. Cinco personas cubre familia o grupo
 * chico; sin límite, un formulario de doce personas es imposible de completar
 * de un saque en el celular.
 */
export const MAX_COMPANIONS = 4;

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
  setComingAlone: (alone: boolean) => void;
  addCompanion: () => void;
  removeCompanion: (index: number) => void;
  updateCompanionField: <K extends keyof CompanionData>(
    index: number,
    key: K,
    value: CompanionData[K]
  ) => void;
  setIdPhoto: (file: File | null) => void;
  setProfilePhoto: (file: File | null) => void;
  setPaymentProof: (file: File | null) => void;
  toggleDietary: (restriction: string) => void;
  toggleCompanionDietary: (index: number, restriction: string) => void;
  setCompanionPhoto: (
    index: number,
    kind: "idPhoto" | "profilePhoto",
    file: File | null
  ) => void;
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
  idPhoto: null,
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
  companions: [],
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

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
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

      // Marcar "voy acompañado" arranca con un pasajero ya abierto: si no, la
      // sección aparece vacía y no se entiende que hay que agregarlo.
      setComingAlone: (alone) =>
        set((s) => ({
          data: {
            ...s.data,
            isComingAlone: alone,
            companions: alone
              ? []
              : (s.data.companions?.length ?? 0) > 0
                ? s.data.companions
                : [{ ...emptyCompanion }],
          },
        })),

      addCompanion: () =>
        set((s) => {
          const current = s.data.companions ?? [];
          if (current.length >= MAX_COMPANIONS) return {};
          return {
            data: { ...s.data, companions: [...current, { ...emptyCompanion }] },
          };
        }),

      removeCompanion: (index) =>
        set((s) => {
          const rest = (s.data.companions ?? []).filter((_, i) => i !== index);
          return {
            data: {
              ...s.data,
              companions: rest,
              // Quedarse sin acompañantes es viajar solo. Sin esto el paso 1
              // queda inválido para siempre y el botón de siguiente no vuelve
              // a habilitarse nunca.
              isComingAlone: rest.length === 0 ? true : s.data.isComingAlone,
            },
          };
        }),

      updateCompanionField: (index, key, value) =>
        set((s) => ({
          data: {
            ...s.data,
            companions: (s.data.companions ?? []).map((c, i) =>
              i === index ? { ...c, [key]: value } : c
            ),
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

      toggleCompanionDietary: (index, restriction) =>
        set((s) => ({
          data: {
            ...s.data,
            companions: (s.data.companions ?? []).map((c, i) => {
              if (i !== index) return c;
              const current = c.dietaryRestrictions ?? [];
              if (restriction === "Ninguna") {
                return { ...c, dietaryRestrictions: ["Ninguna"] };
              }
              const withoutNone = current.filter((r) => r !== "Ninguna");
              return {
                ...c,
                dietaryRestrictions: withoutNone.includes(restriction)
                  ? withoutNone.filter((r) => r !== restriction)
                  : [...withoutNone, restriction],
              };
            }),
          },
        })),

      setCompanionPhoto: (index, kind, file) =>
        set((s) => ({
          data: {
            ...s.data,
            companions: (s.data.companions ?? []).map((c, i) =>
              i === index ? { ...c, [kind]: file } : c
            ),
          },
        })),


      submit: async () => {
        const state = useOnboardingStore.getState();
        if (state.isSubmitting || state.isSubmitted) return;
        const { data } = state;
        set({ isSubmitting: true });

        const { validatedCode, tripId } = useInvitationStore.getState();

        const guestRow: GuestFormRow = {
          full_name: data.fullName!.trim(),
          nationality: data.nationality || null,
          date_of_birth: data.dateOfBirth || null,
          document_number: data.documentNumber || null,
          email: data.email!.trim(),
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
        };

        // El id lo genera el cliente: el rol anon puede INSERT en guests pero no
        // SELECT, y un `.select()` encadenado hace que Postgres evalúe la policy
        // de SELECT sobre el RETURNING y devuelva "new row violates row-level
        // security policy". Sin `.select()` no hay RETURNING y el insert pasa.
        let guestId = crypto.randomUUID();
        // Si la fila ya existía (retomar un intento anterior) no se puede borrar
        // en el rollback: destruiría datos que el invitado ya había cargado.
        let createdNow = true;
        // Lo que este intento alcanzó a subir, para poder limpiarlo si falla.
        const uploaded: UploadedObject[] = [];

        try {
          const supabase = createClient();

          const { error: guestError } = await supabase
            .from("guests")
            .insert({ id: guestId, ...guestRow });

          if (guestError) {
            if (guestError.code === "23505") {
              // UNIQUE (trip_id, email). Antes esto era un callejón sin salida:
              // el que había quedado a medias en un intento anterior no podía
              // volver a entrar nunca más. Ahora se retoma la fila propia.
              const resumed = await resumeGuestSubmission(guestRow);
              if (!resumed.ok) throw new Error(resumed.error);
              guestId = resumed.guestId;
              createdNow = false;
            } else {
              throw guestError;
            }
          }

          // Todo lo que sigue va adentro del try protegido. Antes el consumo del
          // código quedaba afuera: si esa server action fallaba (deploy nuevo con
          // la pestaña vieja abierta, red del celular), el guest quedaba creado,
          // sin fotos y sin rollback — y el invitado bloqueado por el UNIQUE.
          try {
            if (validatedCode) {
              const consumed = await consumeInvitationCode(validatedCode, guestId);
              if (!consumed.ok) throw new Error(consumed.error);
            }

            // Subir fotos en paralelo (comprimidas antes de subir)
            const uploads: Promise<void>[] = [];

            const pushUpload = (
              bucket: string,
              base: string,
              file: File,
              field: "id_photo_url" | "profile_photo_url" | "payment_proof_url"
            ) => {
              uploads.push(
                (async () => {
                  const uploadable = await toUploadable(file);
                  const ext = uploadable.name.split(".").pop() ?? "jpg";
                  const path = await uploadFile(
                    bucket,
                    attemptPath(guestId, base, ext),
                    uploadable
                  );
                  uploaded.push({ bucket, path });
                  const saved = await updateGuestUrl(guestId, field, path);
                  if (!saved.ok) throw new Error(saved.error);
                })()
              );
            };

            if (data.idPhoto) pushUpload("guest-id-photos", "id", data.idPhoto, "id_photo_url");
            if (data.profilePhoto) pushUpload("guest-profile-photos", "profile", data.profilePhoto, "profile_photo_url");
            if (data.paymentProof) pushUpload("guest-payment-proofs", "comprobante", data.paymentProof, "payment_proof_url");

            // Insertar acompañantes. Se insertan todos de una: si uno falla,
            // el catch de afuera revierte el envío entero en vez de dejar el
            // grupo cargado a medias.
            const companions = (data.companions ?? []).filter((c) => c.fullName.trim());

            if (data.isComingAlone === false && companions.length > 0) {
              // Mismo motivo que en guests: sin `.select()`, ids generados acá.
              const withIds = companions.map((c) => ({ id: crypto.randomUUID(), data: c }));

              const { error: companionError } = await supabase
                .from("companions")
                .insert(
                  withIds.map(({ id, data: c }) => ({
                    id,
                    guest_id: guestId,
                    full_name: c.fullName.trim(),
                    nationality: c.nationality || null,
                    date_of_birth: c.dateOfBirth || null,
                    document_number: c.documentNumber || null,
                    email: c.email?.trim() || null,
                    phone: c.phone || null,
                    wants_whatsapp: c.wantsWhatsApp ?? false,
                    bio: c.bio ?? "",
                    dietary_restrictions: c.dietaryRestrictions ?? [],
                    dietary_details: c.dietaryDetails ?? "",
                  }))
                );

              if (companionError) throw companionError;

              withIds.forEach(({ id, data: c }, index) => {
                const photos = [
                  { file: c.idPhoto, bucket: "guest-id-photos", base: `companion-${index + 1}-id`, field: "id_photo_url" as const },
                  { file: c.profilePhoto, bucket: "guest-profile-photos", base: `companion-${index + 1}-profile`, field: "profile_photo_url" as const },
                ];

                for (const { file, bucket, base, field } of photos) {
                  if (!file) continue;
                  uploads.push(
                    (async () => {
                      const uploadable = await toUploadable(file);
                      const ext = uploadable.name.split(".").pop() ?? "jpg";
                      const path = await uploadFile(bucket, attemptPath(guestId, base, ext), uploadable);
                      uploaded.push({ bucket, path });
                      const saved = await updateCompanionUrl(id, field, path);
                      if (!saved.ok) throw new Error(saved.error);
                    })()
                  );
                }
              });
            }


            await Promise.all(uploads);
          } catch (innerErr) {
            // Algo falló después de crear el guest (ej. foto supera el límite
            // del bucket, o la app se redeployó con esta pestaña abierta).
            // Revertimos para que el invitado pueda reintentar con el mismo email
            // en vez de quedar bloqueado por el constraint de email único.
            await rollbackGuestSubmission(guestId, validatedCode ?? null, createdNow, uploaded);
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
    }),
    {
      name: "summit-onboarding",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Los borradores guardados antes de admitir varios pasajeros tienen un
      // `companion` suelto. Sin esto, el que había cargado a su acompañante lo
      // perdía al volver.
      migrate: (persisted, version) => {
        if (version >= 1) return persisted;
        const state = (persisted ?? {}) as { data?: Record<string, unknown> };
        const legacy = state.data?.companion;
        if (state.data) {
          delete state.data.companion;
          state.data.companions = legacy ? [legacy] : [];
        }
        return state;
      },
      // Ver la nota en invitation-store: la rehidratación se dispara desde un
      // efecto para no romper la hidratación de React.
      skipHydration: true,
      // Borrador local: el formulario no guardaba nada, así que cualquier
      // refresh, cierre de pestaña o crash del navegador obligaba a empezar
      // de cero (de ahí los "quedé a la mitad").
      //
      // Los File no son serializables y se persisten como null a propósito:
      // las fotos hay que volver a elegirlas, pero el resto del formulario
      // sobrevive. Tampoco se persiste `isSubmitting` (estado de UI que
      // dejaría el botón trabado) ni el contenido del CMS (llega del server
      // en cada carga).
      partialize: (s) => ({
        step: s.step,
        language: s.language,
        isSubmitted: s.isSubmitted,
        data: {
          ...s.data,
          idPhoto: null,
          profilePhoto: null,
          paymentProof: null,
          companions: (s.data.companions ?? []).map((c) => ({
            ...c,
            idPhoto: null,
            profilePhoto: null,
          })),
        },
      }),
    }
  )
);
