import { create } from "zustand";

export type StatusFilterKey = "Tous" | "Actifs" | "Endommagés" | "Détruits" | "Cachés";

/** Maps each filter label to the raw status values it matches (null = no filter). */
export const STATUS_FILTER_MAP: Record<StatusFilterKey, string[] | null> = {
  Tous: null,
  Actifs: ["OK"],
  Endommagés: ["damaged", "a little damaged", "very damaged"],
  Détruits: ["destroyed"],
  Cachés: ["hidden", "unknown"],
};

export const RADIUS_STEPS = [100, 250, 500, 1000, 2000, 5000] as const;
export type RadiusStep = (typeof RADIUS_STEPS)[number];

export function formatRadius(meters: number): string {
  return meters < 1000 ? `${meters} m` : `${meters / 1000} km`;
}

interface MapState {
  userPosition: [number, number] | null; // [lng, lat]
  proximityRadius: RadiusStep;
  proximityActive: boolean;
  statusFilter: StatusFilterKey;

  setUserPosition: (pos: [number, number] | null) => void;
  setProximityRadius: (radius: RadiusStep) => void;
  setProximityActive: (active: boolean) => void;
  setStatusFilter: (filter: StatusFilterKey) => void;
}

export const useMapStore = create<MapState>((set) => ({
  userPosition: null,
  proximityRadius: 500,
  proximityActive: false,
  statusFilter: "Tous",

  setUserPosition: (pos) => set({ userPosition: pos }),
  setProximityRadius: (radius) => set({ proximityRadius: radius }),
  setProximityActive: (active) => set({ proximityActive: active }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
}));
