import type { RawInvader, Invader, InvaderPoints } from "@/lib/types/invader";

const VALID_POINTS = new Set([0, 10, 20, 30, 40, 50, 100]);

function parseCoord(raw: string): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace(",", "."));
  return isFinite(n) ? n : null;
}

function parsePoints(raw: string): InvaderPoints {
  const n = parseInt(raw, 10);
  return VALID_POINTS.has(n) ? (n as InvaderPoints) : 0;
}

export function normalizeInvader(raw: RawInvader): Invader {
  const lat = parseCoord(raw.lat);
  const lng = parseCoord(raw.lng);
  return {
    id: raw.id,
    city: raw.city,
    status: raw.status,
    hint: raw.hint || null,
    lat,
    lng,
    points: parsePoints(raw.points),
    hasLocation: lat !== null && lng !== null,
  };
}
