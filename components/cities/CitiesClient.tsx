"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";

export type CityStats = {
  code: string;
  total: number;
  ok: number;
  damaged: number;
  destroyed: number;
  activePct: number;
};

type SortKey = "az" | "count" | "active";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "count",  label: "Plus d'invaders" },
  { key: "az",     label: "A→Z" },
  { key: "active", label: "% actifs" },
];

function MiniStatusBar({ ok, damaged, destroyed, total }: {
  ok: number; damaged: number; destroyed: number; total: number;
}) {
  const okW      = `${(ok / total) * 100}%`;
  const damagedW = `${(damaged / total) * 100}%`;
  const destroyedW = `${(destroyed / total) * 100}%`;
  return (
    <div className="w-full h-1 bg-[--surface-2] rounded-full overflow-hidden flex">
      {ok        > 0 && <div className="h-full bg-success  shrink-0" style={{ width: okW }}       />}
      {damaged   > 0 && <div className="h-full bg-warning  shrink-0" style={{ width: damagedW }}   />}
      {destroyed > 0 && <div className="h-full bg-danger   shrink-0" style={{ width: destroyedW }} />}
    </div>
  );
}

export function CitiesClient({ cities }: { cities: CityStats[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("count");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? cities.filter((c) => c.code.toLowerCase().includes(q)) : cities;
    switch (sort) {
      case "az":     return [...list].sort((a, b) => a.code.localeCompare(b.code));
      case "active": return [...list].sort((a, b) => b.activePct - a.activePct);
      case "count":  // fallthrough
      default:       return [...list].sort((a, b) => b.total - a.total);
    }
  }, [cities, search, sort]);

  return (
    <>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[--bg]/90 backdrop-blur-sm border-b border-[--border] px-4 pt-10 pb-3">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-sm uppercase tracking-widest text-[--text]">Villes</h1>
          <span className="text-xs text-[--text-muted]">{cities.length} villes</span>
        </div>

        {/* Search */}
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

        {/* Sort pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors duration-150 ${
                sort === key
                  ? "bg-[--accent-dim] text-accent"
                  : "bg-[--surface-2] text-[--text-muted] hover:text-[--text]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* City grid */}
      <div className="px-3 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-xs uppercase tracking-widest text-[--text]">aucune ville trouvée</p>
            <p className="text-xs text-[--text-muted]">essayez un autre terme de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map((city) => (
              <Link key={city.code} href={`/city/${city.code}`}>
                <div className="bg-[--surface] border border-[--border] rounded-lg p-3 flex flex-col gap-2 hover:border-[--border-hover] transition-colors duration-150 active:scale-[0.97]">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-lg font-bold text-accent tracking-tight leading-none">{city.code}</p>
                    <span className="text-[10px] text-[--text-muted] leading-none mt-0.5 shrink-0 tabular-nums">
                      {city.activePct}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[--text-muted]">{city.total} invaders</p>
                  <MiniStatusBar
                    ok={city.ok}
                    damaged={city.damaged}
                    destroyed={city.destroyed}
                    total={city.total}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
