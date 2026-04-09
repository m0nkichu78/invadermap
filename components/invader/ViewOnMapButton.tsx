"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "@phosphor-icons/react";

export function ViewOnMapButton({ lat, lng, id }: { lat: number; lng: number; id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/?lat=${lat}&lng=${lng}&id=${id}`)}
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded border border-[--border] text-[--text-muted] text-xs uppercase tracking-wider hover:text-[--text] hover:border-[--border-hover] transition-colors duration-150"
    >
      <MapPin weight="regular" className="h-4 w-4" />
      voir sur la carte
    </button>
  );
}
