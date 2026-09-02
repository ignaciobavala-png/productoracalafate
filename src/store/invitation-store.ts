import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface InvitationState {
  isOpen: boolean;
  isUnlocked: boolean;
  validatedCode: string | null;
  tripId: string | null;
  open: () => void;
  close: () => void;
  unlock: (code: string, tripId: string) => void;
}

export const useInvitationStore = create<InvitationState>()(
  persist(
    (set) => ({
      isOpen: false,
      isUnlocked: false,
      validatedCode: null,
      tripId: null,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      unlock: (code, tripId) => set({ isUnlocked: true, validatedCode: code, tripId }),
    }),
    {
      name: "summit-invitation",
      storage: createJSONStorage(() => localStorage),
      // La hidratación la dispara OnboardingPage en un efecto. Si el store se
      // rehidratara solo al cargar el módulo, el primer render del cliente no
      // coincidiría con el del server (portón vs. formulario) y React tiraría
      // un hydration mismatch.
      skipHydration: true,
      // Solo el desbloqueo. `isOpen` es estado de UI: persistirlo abriría el
      // modal solo al entrar.
      partialize: (s) => ({
        isUnlocked: s.isUnlocked,
        validatedCode: s.validatedCode,
        tripId: s.tripId,
      }),
    }
  )
);
