"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Eye, XCircle, CaretDown, type Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useUserStore } from "@/lib/store/userStore";
import { getInvaderById, invadersByCity } from "@/lib/data/invaders";
import { getCityName } from "@/lib/data/cityNames";
import type { ScanStatus } from "@/lib/types/scan";
import type { Invader } from "@/lib/types/invader";
import { AuthModal } from "@/components/auth/AuthModal";

type FilterTab = "Tous" | "Scannés" | "Vus" | "Introuvables";

const TAB_TO_STATUS: Record<FilterTab, ScanStatus | null> = {
  Tous: null,
  Scannés: "scanned",
  Vus: "seen",
  Introuvables: "not_found",
};

const SCAN_LEFT_BORDER: Record<ScanStatus, string> = {
  scanned:   "border-l-accent-2",
  seen:      "border-l-accent",
  not_found: "border-l-[var(--text-muted)]",
};

const SCAN_ICON: Record<ScanStatus, PhosphorIcon> = {
  scanned:   CheckCircle,
  seen:      Eye,
  not_found: XCircle,
};

const SCAN_ICON_CLASS: Record<ScanStatus, string> = {
  scanned:   "text-accent-2",
  seen:      "text-accent",
  not_found: "text-[--text-muted]",
};

const TABS: FilterTab[] = ["Tous", "Scannés", "Vus", "Introuvables"];

const EMPTY_STATE: Record<FilterTab, { title: string; sub: string }> = {
  Tous:         { title: "aucun invader tracké",  sub: "explorez la carte pour commencer." },
  Scannés:      { title: "aucun invader scanné",  sub: "marquez les invaders que vous avez scannés." },
  Vus:          { title: "aucun invader vu",       sub: "marquez les invaders que vous avez aperçus." },
  Introuvables: { title: "aucun introuvable",      sub: "les invaders signalés absents apparaîtront ici." },
};

type CollectionItem = { invader: Invader; scanStatus: ScanStatus };

function InvaderCard({ invader, scanStatus }: CollectionItem) {
  const Icon = SCAN_ICON[scanStatus];
  return (
    <Link href={`/invader/${invader.id}`}>
      <div className={`bg-[--surface] border border-[--border] border-l-4 ${SCAN_LEFT_BORDER[scanStatus]} rounded-lg p-2.5 flex flex-col gap-1 active:scale-[0.97] transition-transform duration-150`}>
        <p className="text-xs font-bold text-[--text] leading-tight truncate">{invader.id}</p>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[10px] bg-[--accent-dim] text-accent font-mono tracking-wider px-1.5 py-0.5 rounded">
            {invader.points}
          </span>
          <Icon weight="fill" className={`h-3.5 w-3.5 ${SCAN_ICON_CLASS[scanStatus]}`} />
        </div>
      </div>
    </Link>
  );
}

function CitySection({
  cityCode,
  items,
  scannedTotal,
  cityTotal,
}: {
  cityCode: string;
  items: CollectionItem[];
  scannedTotal: number;
  cityTotal: number;
}) {
  const isComplete = cityTotal > 0 && scannedTotal === cityTotal;
  const [collapsed, setCollapsed] = useState(() => scannedTotal === 0);

  return (
    <div className="border border-[--border] rounded-lg overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[--surface] hover:bg-[--surface-2] transition-colors duration-150"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-accent text-sm truncate">{getCityName(cityCode)}</span>
          <span className="text-[10px] text-[--text-muted] uppercase tracking-wider shrink-0">{cityCode}</span>
          {isComplete && <CheckCircle weight="fill" size={14} className="text-success shrink-0" />}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[10px] text-[--text-muted] tabular-nums">{scannedTotal} / {cityTotal}</span>
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
            <CaretDown weight="bold" size={12} className="text-[--text-muted]" />
          </motion.div>
        </div>
      </button>

      {/* Collapsible grid */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-3 gap-2 p-2">
              {items.map(({ invader, scanStatus }) => (
                <InvaderCard key={invader.id} invader={invader} scanStatus={scanStatus} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionPage() {
  const user = useUserStore((s) => s.user);
  const scans = useUserStore((s) => s.scans);
  const isLoading = useUserStore((s) => s.isLoading);
  const [activeTab, setActiveTab] = useState<FilterTab>("Tous");

  const collection: CollectionItem[] = useMemo(
    () =>
      Object.entries(scans)
        .map(([invaderId, scanStatus]) => ({
          invader: getInvaderById(invaderId),
          scanStatus,
        }))
        .filter((item): item is CollectionItem => item.invader !== undefined),
    [scans]
  );

  const filterStatus = TAB_TO_STATUS[activeTab];
  const filtered = useMemo(
    () => (filterStatus ? collection.filter((i) => i.scanStatus === filterStatus) : collection),
    [collection, filterStatus]
  );

  // Group filtered items by city, sorted by id ascending within each group
  const groups = useMemo(() => {
    const map = new Map<string, CollectionItem[]>();
    for (const item of filtered) {
      const city = item.invader.city;
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(item);
    }
    for (const items of Array.from(map.values())) {
      items.sort((a, b) => a.invader.id.localeCompare(b.invader.id));
    }
    // Sort cities: most scanned first
    return [...map.entries()].sort((a, b) => {
      const aS = a[1].filter((i) => i.scanStatus === "scanned").length;
      const bS = b[1].filter((i) => i.scanStatus === "scanned").length;
      return bS - aS;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const counts = {
    scanned:   collection.filter((i) => i.scanStatus === "scanned").length,
    seen:      collection.filter((i) => i.scanStatus === "seen").length,
    not_found: collection.filter((i) => i.scanStatus === "not_found").length,
  };
  const totalScore = collection
    .filter((i) => i.scanStatus === "scanned")
    .reduce((sum, i) => sum + i.invader.points, 0);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[--bg]">
        <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[--bg] px-6 pb-16">
        <h1 className="text-sm uppercase tracking-widest text-[--text-muted]">collection</h1>
        <p className="text-xs text-[--text-muted] text-center">
          connectez-vous pour suivre vos captures et votre score.
        </p>
        <AuthModal open={true} onOpenChange={() => {}} embedded />
      </div>
    );
  }

  return (
    <div className="min-h-dvh gradient-mesh pb-20">
      <div className="sticky top-0 z-10 bg-[--bg]/90 backdrop-blur-sm border-b border-[--border] px-4 pt-10 pb-3">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-sm uppercase tracking-widest text-[--text]">collection</h1>
          <div>
            <span className="text-2xl font-bold text-accent tracking-tighter">{totalScore.toLocaleString()}</span>
            <span className="text-sm text-[--text-muted] ml-1">pts</span>
          </div>
        </div>
        <p className="text-xs text-[--text-muted] mb-3">
          {counts.scanned} scannés · {counts.seen} vus · {counts.not_found} introuvables
        </p>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors duration-150 ${
                activeTab === tab
                  ? "bg-[--accent-dim] text-accent"
                  : "bg-[--surface-2] text-[--text-muted] hover:text-[--text]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-[--text] text-xs uppercase tracking-widest">{EMPTY_STATE[activeTab].title}</p>
            <p className="text-xs text-[--text-muted] max-w-xs">{EMPTY_STATE[activeTab].sub}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map(([cityCode, items]) => {
              const cityScanned = collection.filter(
                (i) => i.invader.city === cityCode && i.scanStatus === "scanned"
              ).length;
              const cityTotal = invadersByCity[cityCode]?.length ?? 0;
              return (
                <CitySection
                  key={cityCode}
                  cityCode={cityCode}
                  items={items}
                  scannedTotal={cityScanned}
                  cityTotal={cityTotal}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
