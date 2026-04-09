"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useMapStore, type StatusFilterKey } from "@/lib/store/mapStore";

const FILTERS: StatusFilterKey[] = ["Tous", "Actifs", "Endommagés", "Détruits", "Cachés"];

export function StatusFilterBar() {
  const statusFilter = useMapStore((s) => s.statusFilter);
  const setStatusFilter = useMapStore((s) => s.setStatusFilter);
  const hideScanned = useMapStore((s) => s.hideScanned);
  const setHideScanned = useMapStore((s) => s.setHideScanned);

  return (
    <div className="fixed bottom-14 left-0 right-0 z-20 pointer-events-none">
      <div className="overflow-x-auto scrollbar-hide pointer-events-auto">
        <div className="flex gap-1.5 px-4 py-2.5 w-max">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`whitespace-nowrap rounded px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[--accent-dim] text-accent"
                    : "bg-[--surface-2] text-[--text-muted] hover:text-[--text]"
                }`}
              >
                {filter}
              </button>
            );
          })}

          {/* Hide Scanned Toggle */}
          <div className="w-px h-6 bg-[--border] self-center mx-0.5" />
          <button
            onClick={() => setHideScanned(!hideScanned)}
            className={`whitespace-nowrap rounded px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors duration-150 flex items-center gap-1.5 ${
              hideScanned
                ? "bg-[--accent-dim] text-accent"
                : "bg-[--surface-2] text-[--text-muted] hover:text-[--text]"
            }`}
          >
            <CheckCircle size={12} weight="fill" />
            <span>Masquer scannés</span>
          </button>
        </div>
      </div>
    </div>
  );
}
