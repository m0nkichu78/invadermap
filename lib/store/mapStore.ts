import { create } from "zustand";

export type StatusFilterKey = "Tous" | "Actifs" | "Endommagés" | "Détruits" | "Cachés";

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
  userPosition: [number, number] | null;
  proximityRadius: RadiusStep;
  proximityActive: boolean;
  statusFilter: StatusFilterKey;
  lastCenter: [number, number] | null;
  lastZoom: number;

  setUserPosition: (pos: [number, number] | null) => void;
  setProximityRadius: (radius: RadiusStep) => void;
  setProximityActive: (active: boolean) => void;
  setStatusFilter: (filter: StatusFilterKey) => void;
  setLastView: (center: [number, number], zoom: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  userPosition: null,
  proximityRadius: 500,
  proximityActive: false,
  statusFilter: "Tous",
  lastCenter: null,
  lastZoom: 12,

  setUserPosition: (pos) => set({ userPosition: pos }),
  setProximityRadius: (radius) => set({ proximityRadius: radius }),
  setProximityActive: (active) => set({ proximityActive: active }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setLastView: (center, zoom) => set({ lastCenter: center, lastZoom: zoom }),
}));
