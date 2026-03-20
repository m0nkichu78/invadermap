import type { InvaderStatus } from "@/lib/types/invader";
import type { ScanStatus } from "@/lib/types/scan";
import { STATUS_HEX } from "@/lib/utils/statusStyle";

const SCAN_COLOR: Record<ScanStatus, string> = {
  scanned:   "#34d399",
  seen:      "#f97316",
  not_found: "#4a5568",
};

const CHECK_SVG = `<svg class="invader-marker__check" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="1.5,5.5 4,7.5 8.5,2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function createMarkerElement(
  status: InvaderStatus,
  scanStatus: ScanStatus | null
): HTMLElement {
  const color = scanStatus ? SCAN_COLOR[scanStatus] : (STATUS_HEX[status] ?? "#4a5568");

  const el = document.createElement("div");
  el.className = "invader-marker";
  el.dataset.status = status;
  if (scanStatus) el.classList.add(`invader-marker--${scanStatus.replace("_", "-")}`);

  const dot = document.createElement("div");
  dot.className = "invader-marker__dot";
  dot.style.setProperty("--dot-color", color);
  dot.innerHTML = CHECK_SVG;

  el.appendChild(dot);
  return el;
}

export function setMarkerScan(el: HTMLElement, scanStatus: ScanStatus | null): void {
  const dot = el.querySelector(".invader-marker__dot") as HTMLElement | null;
  if (!dot) return;

  el.classList.remove("invader-marker--scanned", "invader-marker--seen", "invader-marker--not-found");

  if (scanStatus) {
    dot.style.setProperty("--dot-color", SCAN_COLOR[scanStatus]);
    el.classList.add(`invader-marker--${scanStatus.replace("_", "-")}`);
  } else {
    const status = el.dataset.status as InvaderStatus;
    dot.style.setProperty("--dot-color", STATUS_HEX[status] ?? "#4a5568");
  }
}
