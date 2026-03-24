/**
 * Creates a GeoJSON polygon approximating a circle centered at `center`
 * with radius `radiusMeters` (using equirectangular approximation).
 */
export function createGeoJSONCircle(
  center: [number, number],
  radiusMeters: number,
  steps = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const coords: [number, number][] = [];

  // Earth's radius in meters
  const R = 6371000;
  const latRad = (lat * Math.PI) / 180;

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusMeters * Math.cos(angle)) / R;
    const dLng = (radiusMeters * Math.sin(angle)) / (R * Math.cos(latRad));
    coords.push([
      lng + (dLng * 180) / Math.PI,
      lat + (dLat * 180) / Math.PI,
    ]);
  }

  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
}
