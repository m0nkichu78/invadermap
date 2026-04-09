"use client";

import Link from "next/link";
import { formatDistance } from "@/lib/utils/distance";
import { getStatusDotClass } from "@/lib/utils/statusStyle";

export interface NearbyInvader {
  id: string;
  city: string;
  status: string;
  distance: number;
}

interface NearbyInvadersScrollProps {
  invaders: NearbyInvader[];
}

export function NearbyInvadersScroll({ invaders }: NearbyInvadersScrollProps) {
  if (!invaders.length) return null;

  return (
    <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-2 w-max pb-1">
        {invaders.map((inv) => (
          <Link
            key={inv.id}
            href={`/invader/${inv.id}`}
            className="flex flex-col gap-1 bg-[--surface] border border-[--border] rounded-lg p-3 w-28 shrink-0 hover:border-[--border-hover] transition-colors duration-150 active:scale-[0.97]"
          >
            <p className="text-xs font-bold text-[--text] truncate">{inv.id}</p>
            <p className="text-[10px] text-accent">{formatDistance(inv.distance)}</p>
            <div className="flex items-center gap-1.5 mt-auto">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getStatusDotClass(inv.status)}`} />
              <span className="text-[10px] text-[--text-muted] truncate">{inv.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
