import { create } from "zustand";

interface InvitationState {
  isOpen: boolean;
  isUnlocked: boolean;
  validatedCode: string | null;
  tripId: string | null;
  open: () => void;
  close: () => void;
  unlock: (code: string, tripId: string) => void;
}

export const useInvitationStore = create<InvitationState>((set) => ({
  isOpen: false,
  isUnlocked: false,
  validatedCode: null,
  tripId: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  unlock: (code, tripId) => set({ isUnlocked: true, validatedCode: code, tripId }),
}));
