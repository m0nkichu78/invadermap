"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center h-8 w-8 rounded bg-[--surface] border border-[--border] text-[--text-muted] hover:text-[--text] transition-colors duration-150"
    >
      <ArrowLeft weight="regular" className="h-4 w-4" />
    </button>
  );
}
