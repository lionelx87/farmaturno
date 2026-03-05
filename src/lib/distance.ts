export interface DistanceResult {
  meters: number;
  label: string; // e.g. "850 m" | "1.4 km"
}

export interface LatLng {
  lat: number;
  lng: number;
}

// Contract for any distance provider.
// Async signature ensures compatibility with future API-based providers (e.g. Distance Matrix).
export type DistanceFn = (from: LatLng, to: LatLng) => Promise<DistanceResult>;

function haversineMeters(from: LatLng, to: LatLng): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

const haversineProvider: DistanceFn = async (from, to) => {
  const meters = haversineMeters(from, to);
  return { meters, label: formatDistance(meters) };
};

// Single swap point: replace haversineProvider with a Distance Matrix implementation to migrate.
export const getDistance: DistanceFn = haversineProvider;
