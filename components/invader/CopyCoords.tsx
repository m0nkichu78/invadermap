"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

export function CopyCoords({ lat, lng }: { lat: number; lng: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* unavailable */ }
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-[--text-muted] hover:text-[--text] transition-colors duration-150 group"
      title="Copier les coordonnées"
    >
      <span className="font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
      {copied
        ? <Check weight="regular" className="h-3 w-3 text-success shrink-0" />
        : <Copy weight="regular" className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      }
    </button>
  );
}
