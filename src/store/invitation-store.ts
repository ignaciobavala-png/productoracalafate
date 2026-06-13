import { create } from "zustand";

interface InvitationState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useInvitationStore = create<InvitationState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
