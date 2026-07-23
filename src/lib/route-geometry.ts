export interface LatLng {
  lat: number;
  lng: number;
}

export interface SnapResult {
  point: LatLng;
  deviationMeters: number;
  segmentIndex: number;
}

export const METERS_PER_DEG_LAT = 111_320;

export function metersPerDegLng(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const dy = (b.lat - a.lat) * METERS_PER_DEG_LAT;
  const dx = (b.lng - a.lng) * metersPerDegLng((a.lat + b.lat) / 2);
  return Math.hypot(dx, dy);
}

export function bearingBetween(a: LatLng, b: LatLng): number {
  const dy = (b.lat - a.lat) * METERS_PER_DEG_LAT;
  const dx = (b.lng - a.lng) * metersPerDegLng((a.lat + b.lat) / 2);
  return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
}

export function moveByBearing(point: LatLng, bearing: number, meters: number): LatLng {
  const rad = (bearing * Math.PI) / 180;
  return {
    lat: point.lat + (Math.cos(rad) * meters) / METERS_PER_DEG_LAT,
    lng: point.lng + (Math.sin(rad) * meters) / metersPerDegLng(point.lat),
  };
}

export function snapToRoute(position: LatLng, path: LatLng[]): SnapResult | null {
  if (path.length < 2) return null;
  const mLng = metersPerDegLng(position.lat);
  const toXY = (p: LatLng) => ({
    x: (p.lng - position.lng) * mLng,
    y: (p.lat - position.lat) * METERS_PER_DEG_LAT,
  });
  let best: SnapResult | null = null;
  for (let i = 0; i < path.length - 1; i++) {
    const a = toXY(path[i]);
    const b = toXY(path[i + 1]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, (-a.x * dx - a.y * dy) / lengthSq));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const deviation = Math.hypot(px, py);
    if (!best || deviation < best.deviationMeters) {
      best = {
        point: {
          lat: position.lat + py / METERS_PER_DEG_LAT,
          lng: position.lng + px / mLng,
        },
        deviationMeters: deviation,
        segmentIndex: i,
      };
    }
  }
  return best;
}
