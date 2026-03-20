"use client";

import { MapPin } from "@phosphor-icons/react";
import { useMapStore } from "@/lib/store/mapStore";
import { haversineDistance, formatDistance } from "@/lib/utils/distance";

interface DistanceDisplayProps {
  lat: number;
  lng: number;
}

export function DistanceDisplay({ lat, lng }: DistanceDisplayProps) {
  const userPosition = useMapStore((s) => s.userPosition);
  if (!userPosition) return null;

  const meters = haversineDistance(userPosition[1], userPosition[0], lat, lng);
  return (
    <span className="flex items-center gap-1 text-xs text-[--text-muted]">
      <MapPin weight="regular" className="h-3 w-3 shrink-0" />
      {formatDistance(meters)} de vous
    </span>
  );
}
