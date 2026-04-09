"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import type { Invader } from "@/lib/types/invader";
import { getStatusDotClass } from "@/lib/utils/statusStyle";

interface CityInvadersGridProps {
  invaders: Invader[];
}

function naturalSort(a: string, b: string): number {
  const [cityA, numA] = a.split("_");
  const [cityB, numB] = b.split("_");
  return parseInt(numA, 10) - parseInt(numB, 10);
}

export function CityInvadersGrid({ invaders }: CityInvadersGridProps) {
  const [ascending, setAscending] = useState(false);

  const sorted = [...invaders].sort((a, b) => {
    return ascending ? naturalSort(a.id, b.id) : naturalSort(b.id, a.id);
  });

  return (
    <>
      {/* Sort Toggle Button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setAscending(!ascending)}
          className="flex items-center gap-1.5 text-[--text-muted] hover:text-[--text] transition-colors duration-150 text-xs px-2 py-1 rounded hover:bg-[--surface-2]"
          aria-label={ascending ? "Tri croissant" : "Tri décroissant"}
        >
          {ascending ? (
            <ArrowUp size={14} weight="bold" />
          ) : (
            <ArrowDown size={14} weight="bold" />
          )}
          <span className="text-[10px] uppercase tracking-wider">
            {ascending ? "Croissant" : "Décroissant"}
          </span>
        </button>
      </div>

      {/* Invaders Grid */}
      <div className="grid grid-cols-3 gap-2">
        {sorted.map((inv) => (
          <Link key={inv.id} href={`/invader/${inv.id}`}>
            <div className="bg-[--surface] border border-[--border] rounded-lg p-2.5 flex flex-col gap-1 hover:border-[--border-hover] transition-colors duration-150 active:scale-[0.97]">
              <p className="text-xs font-bold text-[--text] leading-tight truncate">
                {inv.id}
              </p>

              <div className="flex items-center gap-1">
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${getStatusDotClass(
                    inv.status
                  )}`}
                />
                <span className="text-[9px] text-[--text-muted] truncate">
                  {inv.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-[10px] bg-[--accent-dim] text-accent font-mono tracking-wider px-1.5 py-0.5 rounded">
                  {inv.points}
                </span>
                {!inv.hasLocation && (
                  <span className="text-[9px] text-[--text-muted]">no gps</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
