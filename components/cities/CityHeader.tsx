"use client";

import { useUserStore } from "@/lib/store/userStore";
import type { Invader } from "@/lib/types/invader";

interface CityHeaderProps {
  cityCode: string;
  cityName: string;
  invaders: Invader[];
  totalPoints: number;
  ok: number;
  damaged: number;
  destroyed: number;
  activePct: number;
}

function MiniStatusBar({ ok, damaged, destroyed, total }: {
  ok: number; damaged: number; destroyed: number; total: number;
}) {
  return (
    <div className="w-full h-1 bg-[--surface-2] rounded-full overflow-hidden flex mt-2">
      {ok        > 0 && <div className="h-full bg-success  shrink-0" style={{ width: `${(ok / total) * 100}%` }}        />}
      {damaged   > 0 && <div className="h-full bg-warning  shrink-0" style={{ width: `${(damaged / total) * 100}%` }}   />}
      {destroyed > 0 && <div className="h-full bg-danger   shrink-0" style={{ width: `${(destroyed / total) * 100}%` }} />}
    </div>
  );
}

export function CityHeader({
  cityCode,
  cityName,
  invaders,
  totalPoints,
  ok,
  damaged,
  destroyed,
  activePct,
}: CityHeaderProps) {
  const user = useUserStore((s) => s.user);
  const userScans = useUserStore((s) => s.scans);

  const scannedCount = invaders.filter((inv) => userScans[inv.id] === "scanned").length;

  return (
    <>
      <p className="text-xs text-[--text-muted]">
        <span className="text-[--text]">{invaders.length}</span> invaders ·{" "}
        <span className="text-success">{activePct}%</span> actifs ·{" "}
        <span className="text-accent">{totalPoints.toLocaleString()}</span> pts
        {user && scannedCount > 0 && (
          <>
            {" "}·{" "}
            <span className="text-success">{scannedCount} / {invaders.length}</span> scannés
          </>
        )}
      </p>

      <MiniStatusBar ok={ok} damaged={damaged} destroyed={destroyed} total={invaders.length} />
    </>
  );
}
