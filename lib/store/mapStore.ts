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
  hideScanned: boolean;
  lastCenter: [number, number] | null;
  lastZoom: number;
  isTracking: boolean;

  setUserPosition: (pos: [number, number] | null) => void;
  setProximityRadius: (radius: RadiusStep) => void;
  setProximityActive: (active: boolean) => void;
  setStatusFilter: (filter: StatusFilterKey) => void;
  setHideScanned: (v: boolean) => void;
  setLastView: (center: [number, number], zoom: number) => void;
  setTracking: (v: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  userPosition: null,
  proximityRadius: 500,
  proximityActive: false,
  statusFilter: "Tous",
  hideScanned: false,
  lastCenter: null,
  lastZoom: 12,
  isTracking: false,

  setUserPosition: (pos) => set({ userPosition: pos }),
  setProximityRadius: (radius) => set({ proximityRadius: radius }),
  setProximityActive: (active) => set({ proximityActive: active }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setHideScanned: (v) => set({ hideScanned: v }),
  setLastView: (center, zoom) => set({ lastCenter: center, lastZoom: zoom }),
  setTracking: (v) => set({ isTracking: v }),
}));
