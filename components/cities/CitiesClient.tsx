"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MagnifyingGlass, ArrowDown, ArrowUp, CheckCircle } from "@phosphor-icons/react";
import { getCityName } from "@/lib/data/cityNames";
import { invadersByCity } from "@/lib/data/invaders";
import { useUserStore } from "@/lib/store/userStore";

export type CityStats = {
  code: string;
  total: number;
  ok: number;
  damaged: number;
  destroyed: number;
  activePct: number;
};

type SortKey = "az" | "count" | "active";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; labelDesc: string; labelAsc: string }[] = [
  { key: "count",  labelDesc: "Plus d'invaders", labelAsc: "Moins d'invaders" },
  { key: "az",     labelDesc: "A→Z",              labelAsc: "Z→A" },
  { key: "active", labelDesc: "% actifs ↓",       labelAsc: "% actifs ↑" },
];

function MiniStatusBar({ ok, damaged, destroyed, total }: {
  ok: number; damaged: number; destroyed: number; total: number;
}) {
  return (
    <div className="w-full h-1 bg-[--surface-2] rounded-full overflow-hidden flex">
      {ok        > 0 && <div className="h-full bg-success  shrink-0" style={{ width: `${(ok / total) * 100}%` }}        />}
      {damaged   > 0 && <div className="h-full bg-warning  shrink-0" style={{ width: `${(damaged / total) * 100}%` }}   />}
      {destroyed > 0 && <div className="h-full bg-danger   shrink-0" style={{ width: `${(destroyed / total) * 100}%` }} />}
    </div>
  );
}

export function CitiesClient({ cities }: { cities: CityStats[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const scans = useUserStore((s) => s.scans);

  // Precompute OK invader IDs per city (static data, memoized once)
  const cityOkIds = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [code, invs] of Object.entries(invadersByCity)) {
      map.set(code, invs.filter((i) => i.status === "OK").map((i) => i.id));
    }
    return map;
  }, []);

  function handleSortClick(key: SortKey) {
    if (key === sort) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(key);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? cities.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            getCityName(c.code).toLowerCase().includes(q)
        )
      : cities;

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "az":     return a.code.localeCompare(b.code);
        case "active": return a.activePct - b.activePct;
        case "count":  // fallthrough
        default:       return a.total - b.total;
      }
    });

    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [cities, search, sort, sortDir]);

  return (
    <>
      <div className="sticky top-0 z-10 bg-[--bg]/90 backdrop-blur-sm border-b border-[--border] px-4 pt-10 pb-3">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-sm uppercase tracking-widest text-[--text]">Villes</h1>
          <span className="text-xs text-[--text-muted]">{cities.length} villes</span>
        </div>

        <div className="relative mb-3">
          <MagnifyingGlass
            weight="regular"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-muted] pointer-events-none"
          />
          <input
            type="text"
            placeholder="rechercher une ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[--bg] border border-[--border] rounded text-sm text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:border-accent transition-colors duration-150"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map(({ key, labelDesc, labelAsc }) => {
            const isActive = sort === key;
            const label = isActive && sortDir === "asc" ? labelAsc : labelDesc;
            const ArrowIcon = isActive && sortDir === "asc" ? ArrowUp : ArrowDown;
            return (
              <button
                key={key}
                onClick={() => handleSortClick(key)}
                className={`whitespace-nowrap flex items-center gap-1 rounded px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-[--accent-dim] text-accent"
                    : "bg-[--surface-2] text-[--text-muted] hover:text-[--text]"
                }`}
              >
                {label}
                {isActive && <ArrowIcon size={10} weight="bold" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-xs uppercase tracking-widest text-[--text]">aucune ville trouvée</p>
            <p className="text-xs text-[--text-muted]">essayez un autre terme de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map((city) => {
              const okIds = cityOkIds.get(city.code) ?? [];
              const scannedCount = okIds.filter((id) => scans[id] === "scanned").length;
              const isComplete = okIds.length > 0 && scannedCount === okIds.length;
              const hasProgress = scannedCount > 0 && !isComplete;

              return (
                <Link key={city.code} href={`/city/${city.code}`}>
                  <div className="bg-[--surface] border border-[--border] rounded-lg p-3 flex flex-col gap-2 hover:border-[--border-hover] transition-colors duration-150 active:scale-[0.97]">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-base font-bold text-accent tracking-tight leading-tight">{getCityName(city.code)}</p>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        {isComplete && (
                          <CheckCircle weight="fill" size={14} className="text-success" />
                        )}
                        {hasProgress && (
                          <span className="text-[10px] text-success tabular-nums">{scannedCount}/{okIds.length}</span>
                        )}
                        <span className="text-[10px] text-[--text-muted] tabular-nums">{city.activePct}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[--text-muted] uppercase tracking-wider">{city.code}</span>
                      <span className="text-[10px] text-[--text-muted]">· {city.total}</span>
                    </div>
                    <MiniStatusBar
                      ok={city.ok}
                      damaged={city.damaged}
                      destroyed={city.destroyed}
                      total={city.total}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
