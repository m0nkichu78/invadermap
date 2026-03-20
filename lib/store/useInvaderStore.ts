import { create } from "zustand";

interface Invader {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  points: number;
  flashed: boolean;
}

interface InvaderStore {
  invaders: Invader[];
  flashedIds: Set<string>;
  setInvaders: (invaders: Invader[]) => void;
  toggleFlash: (id: string) => void;
}

export const useInvaderStore = create<InvaderStore>((set) => ({
  invaders: [],
  flashedIds: new Set(),
  setInvaders: (invaders) => set({ invaders }),
  toggleFlash: (id) =>
    set((state) => {
      const flashedIds = new Set(state.flashedIds);
      if (flashedIds.has(id)) {
        flashedIds.delete(id);
      } else {
        flashedIds.add(id);
      }
      return { flashedIds };
    }),
}));
