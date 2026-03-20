/** Shared status styling utilities — map popup (inline), detail page, city page. */

/** Hex colors for Mapbox GL expressions */
export const STATUS_HEX: Record<string, string> = {
  OK: "#34d399",
  destroyed: "#f87171",
  damaged: "#fb923c",
  "a little damaged": "#fb923c",
  "very damaged": "#fb923c",
  hidden: "#4a5568",
  unknown: "#4a5568",
};

/** Inline styles for Mapbox popup badges — no borders */
export const STATUS_BADGE_INLINE: Record<string, string> = {
  OK:               "background:rgba(52,211,153,0.1);color:#34d399",
  destroyed:        "background:rgba(248,113,113,0.1);color:#f87171",
  damaged:          "background:rgba(251,146,60,0.1);color:#fb923c",
  "a little damaged":"background:rgba(251,146,60,0.1);color:#fb923c",
  "very damaged":   "background:rgba(251,146,60,0.1);color:#fb923c",
  hidden:           "background:#141428;color:#4a5568",
  unknown:          "background:#141428;color:#4a5568",
};

/** Tailwind classes for Tailwind-rendered status badge — no borders */
export const STATUS_BADGE_CLASS: Record<string, string> = {
  OK:               "bg-success/10 text-success",
  destroyed:        "bg-danger/10 text-danger",
  damaged:          "bg-warning/10 text-warning",
  "a little damaged":"bg-warning/10 text-warning",
  "very damaged":   "bg-warning/10 text-warning",
  hidden:           "bg-surface-2 text-[--text-muted]",
  unknown:          "bg-surface-2 text-[--text-muted]",
};

/** Tailwind bg class for small dot indicator */
export const STATUS_DOT_CLASS: Record<string, string> = {
  OK:               "bg-success",
  destroyed:        "bg-danger",
  damaged:          "bg-warning",
  "a little damaged":"bg-warning",
  "very damaged":   "bg-warning",
  hidden:           "bg-[--text-muted]",
  unknown:          "bg-[--text-muted]",
};

export function getStatusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASS[status] ?? STATUS_BADGE_CLASS["unknown"];
}

export function getStatusDotClass(status: string): string {
  return STATUS_DOT_CLASS[status] ?? STATUS_DOT_CLASS["unknown"];
}
