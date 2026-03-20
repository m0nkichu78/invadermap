"use client";

import { useState } from "react";
import { CheckCircle, Eye, XCircle, type Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useUserStore } from "@/lib/store/userStore";
import { upsertScan } from "@/lib/actions/scans";
import type { ScanStatus } from "@/lib/types/scan";

const BUTTONS: {
  status: ScanStatus;
  label: string;
  Icon: PhosphorIcon;
  activeTextClass: string;
  activeBgClass: string;
}[] = [
  {
    status: "scanned",
    label: "scanné",
    Icon: CheckCircle,
    activeTextClass: "text-accent",
    activeBgClass: "bg-[--accent-dim]",
  },
  {
    status: "seen",
    label: "vu",
    Icon: Eye,
    activeTextClass: "text-accent",
    activeBgClass: "bg-[--accent-dim]",
  },
  {
    status: "not_found",
    label: "introuvable",
    Icon: XCircle,
    activeTextClass: "text-[--text-muted]",
    activeBgClass: "bg-[--surface-2]",
  },
];

export function ScanButtons({ invaderId }: { invaderId: string }) {
  const user = useUserStore((s) => s.user);
  const scans = useUserStore((s) => s.scans);
  const setScan = useUserStore((s) => s.setScan);
  const setAuthModalOpen = useUserStore((s) => s.setAuthModalOpen);
  const isLoading = useUserStore((s) => s.isLoading);
  const [pending, setPending] = useState<ScanStatus | null>(null);
  const currentScan = scans[invaderId] ?? null;

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-11 rounded bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => setAuthModalOpen(true)}
        className="w-full py-3 rounded text-[--text-muted] text-xs uppercase tracking-wider hover:text-[--text] hover:bg-[--surface-2] transition-colors duration-150"
      >
        connexion pour tracker →
      </button>
    );
  }

  async function handleScan(status: ScanStatus) {
    if (pending) return;
    setPending(status);
    const { error } = await upsertScan(invaderId, status);
    if (!error) setScan(invaderId, status);
    setPending(null);
  }

  return (
    <div className="flex gap-2">
      {BUTTONS.map(({ status, label, Icon, activeTextClass, activeBgClass }) => {
        const isActive = currentScan === status;
        const isThisPending = pending === status;
        return (
          <button
            key={status}
            onClick={() => handleScan(status)}
            disabled={!!pending}
            className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded text-xs uppercase tracking-wider transition-colors duration-150 disabled:opacity-50 ${
              isActive
                ? `${activeBgClass} ${activeTextClass}`
                : "bg-transparent text-[--text-muted] hover:bg-[--surface-2] hover:text-[--text]"
            }`}
          >
            {isThisPending
              ? <span className="text-sm opacity-60">·</span>
              : <Icon weight={isActive ? "fill" : "regular"} className="h-4 w-4" />
            }
            {label}
          </button>
        );
      })}
    </div>
  );
}
