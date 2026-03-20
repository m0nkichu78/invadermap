"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "@phosphor-icons/react";
import {
  useMapStore,
  RADIUS_STEPS,
  formatRadius,
  type RadiusStep,
} from "@/lib/store/mapStore";

export function ProximityButton() {
  const userPosition = useMapStore((s) => s.userPosition);
  const proximityActive = useMapStore((s) => s.proximityActive);
  const proximityRadius = useMapStore((s) => s.proximityRadius);
  const setProximityActive = useMapStore((s) => s.setProximityActive);
  const setProximityRadius = useMapStore((s) => s.setProximityRadius);

  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const stepIndex = RADIUS_STEPS.indexOf(proximityRadius as RadiusStep);

  function showToast() {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 3000);
  }

  function handlePillClick() {
    if (!userPosition) { showToast(); return; }
    if (proximityActive) {
      setPanelOpen((o) => !o);
    } else {
      setProximityActive(true);
      setPanelOpen(true);
    }
  }

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProximityRadius(RADIUS_STEPS[Number(e.target.value)]);
  }

  useEffect(() => {
    if (!panelOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [panelOpen]);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  return (
    <>
      {/* Toast */}
      <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}>
        <div className="bg-[--surface] border border-[--border] text-[--text] text-xs px-4 py-2 rounded shadow-xl tracking-wide">
          activez la géolocalisation
        </div>
      </div>

      <div ref={panelRef} className="fixed top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        {/* Pill */}
        <button
          onClick={handlePillClick}
          className={`flex items-center gap-2 rounded px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors duration-150 ${
            proximityActive
              ? "bg-[--accent-dim] text-accent"
              : "bg-[--surface] border border-[--border] text-[--text-muted] hover:text-[--text]"
          }`}
        >
          <MapPin weight="regular" className="h-3.5 w-3.5 shrink-0" />
          <span>
            proximité{proximityActive && ` · ${formatRadius(proximityRadius)}`}
          </span>
        </button>

        {/* Panel */}
        {panelOpen && (
          <div className="bg-[--surface] border border-[--border] rounded-lg p-4 w-64 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[--text] uppercase tracking-widest">rayon</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-accent">
                  {formatRadius(proximityRadius)}
                </span>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="text-[--text-muted] hover:text-[--text] transition-colors"
                >
                  <X weight="regular" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={RADIUS_STEPS.length - 1}
              step={1}
              value={stepIndex === -1 ? 2 : stepIndex}
              onChange={handleSliderChange}
              className="accent-slider w-full cursor-pointer"
            />

            <div className="flex justify-between mt-2">
              {RADIUS_STEPS.map((r) => (
                <span key={r} className="text-[9px] text-[--text-muted]">
                  {formatRadius(r)}
                </span>
              ))}
            </div>

            <button
              onClick={() => { setProximityActive(false); setPanelOpen(false); }}
              className="mt-4 w-full rounded py-2 text-xs text-[--text-muted] hover:text-danger hover:bg-danger/5 transition-colors duration-150"
            >
              désactiver
            </button>
          </div>
        )}
      </div>
    </>
  );
}
