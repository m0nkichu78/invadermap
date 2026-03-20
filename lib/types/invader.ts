/**
 * Raw shape of a record in world_space_invaders.json.
 *
 * Notes on quirks:
 * - `lat` and `lng` use a comma as the decimal separator (French locale),
 *   e.g. "43,5285840236". Parse with parseFloat(v.replace(",", ".")).
 * - `lat` and `lng` are empty strings ("") for 143 invaders whose
 *   position is unknown (destroyed / hidden / unknown status).
 * - `hint` is an empty string for ~99 % of entries; only ~43 carry a value.
 * - `points` is a numeric string; valid values: "0" | "10" | "20" | "30" | "40" | "50" | "100".
 * - All 7 fields are always present on every record.
 */
export interface RawInvader {
  /** City code, e.g. "PA", "LDN", "NY" (86 unique values) */
  city: string;
  /** Unique identifier, format "<CITY>_<NN>", e.g. "PA_001" */
  id: string;
  /** Condition of the invader */
  status: InvaderStatus;
  /** Optional location hint (landmark / street name). Empty string when absent. */
  hint: string;
  /** Latitude as a French-locale decimal string, e.g. "48,8566". Empty string when unknown. */
  lat: string;
  /** Longitude as a French-locale decimal string, e.g. "2,3522". Empty string when unknown. */
  lng: string;
  /** Point value as a numeric string: "0" | "10" | "20" | "30" | "40" | "50" | "100" */
  points: string;
}

export type InvaderStatus =
  | "OK"
  | "a little damaged"
  | "damaged"
  | "very damaged"
  | "destroyed"
  | "hidden"
  | "unknown";

export type InvaderPoints = 0 | 10 | 20 | 30 | 40 | 50 | 100;

/**
 * Parsed / normalised invader — safe to use in app logic and the map.
 * Produced by `parseInvader(raw: RawInvader)` (to be implemented in lib/utils).
 */
export interface Invader {
  id: string;
  city: string;
  status: InvaderStatus;
  hint: string | null;
  /** null when coordinates are missing */
  lat: number | null;
  /** null when coordinates are missing */
  lng: number | null;
  points: InvaderPoints;
  /** Whether coordinates are available */
  hasLocation: boolean;
}
