import { bearingBetween, distanceMeters, moveByBearing } from './route-geometry';
import type { LatLng } from './route-geometry';

export interface GeolocationProvider {
  isSupported(): boolean;
  getCurrentPosition(
    onSuccess: PositionCallback,
    onError?: PositionErrorCallback,
    options?: PositionOptions,
  ): void;
  watchPosition(
    onSuccess: PositionCallback,
    onError?: PositionErrorCallback,
    options?: PositionOptions,
  ): number;
  clearWatch(watchId: number): void;
}

export const browserGeolocation: GeolocationProvider = {
  isSupported: () => typeof navigator !== 'undefined' && 'geolocation' in navigator,
  getCurrentPosition: (onSuccess, onError, options) =>
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options),
  watchPosition: (onSuccess, onError, options) =>
    navigator.geolocation.watchPosition(onSuccess, onError, options),
  clearWatch: watchId => navigator.geolocation.clearWatch(watchId),
};

// ── Simulation ────────────────────────────────────────────────────────────────

export interface SimulationState {
  playing: boolean;
  multiplier: 1 | 4;
  lateralOffset: boolean;
  hasRoute: boolean;
  finished: boolean;
}

const SIM_START: LatLng = { lat: -41.1335, lng: -71.3103 };
const FIX_INTERVAL_MS = 1000;
const LATERAL_OFFSET_METERS = 45;
const GET_POSITION_DELAY_MS = 800;

function pointAlong(path: LatLng[], distance: number): { point: LatLng; bearing: number; finished: boolean } {
  let remaining = distance;
  for (let i = 0; i < path.length - 1; i++) {
    const length = distanceMeters(path[i], path[i + 1]);
    if (remaining <= length && length > 0) {
      const t = remaining / length;
      return {
        point: {
          lat: path[i].lat + (path[i + 1].lat - path[i].lat) * t,
          lng: path[i].lng + (path[i + 1].lng - path[i].lng) * t,
        },
        bearing: bearingBetween(path[i], path[i + 1]),
        finished: false,
      };
    }
    remaining -= length;
  }
  const last = path[path.length - 1];
  const prev = path.length > 1 ? path[path.length - 2] : last;
  return { point: last, bearing: bearingBetween(prev, last), finished: true };
}

function makePosition(point: LatLng, heading: number | null, speed: number): GeolocationPosition {
  return {
    coords: {
      latitude: point.lat,
      longitude: point.lng,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading,
      speed,
    },
    timestamp: Date.now(),
  } as GeolocationPosition;
}

let simState: SimulationState = {
  playing: true,
  multiplier: 1,
  lateralOffset: false,
  hasRoute: false,
  finished: false,
};
const stateListeners = new Set<() => void>();
const watchers = new Map<number, PositionCallback>();
let nextWatchId = 1;
let ticker: ReturnType<typeof setInterval> | null = null;

let route: LatLng[] | null = null;
let speedKmh = 30;
let traveled = 0;
let currentPoint: LatLng = SIM_START;
let currentHeading: number | null = null;
let currentSpeed = 0;

function setSimState(patch: Partial<SimulationState>) {
  simState = { ...simState, ...patch };
  stateListeners.forEach(listener => listener());
}

function emittedPoint(): LatLng {
  return simState.lateralOffset && currentHeading !== null
    ? moveByBearing(currentPoint, currentHeading + 90, LATERAL_OFFSET_METERS)
    : currentPoint;
}

function emitFix() {
  const position = makePosition(emittedPoint(), currentHeading, currentSpeed);
  watchers.forEach(onSuccess => onSuccess(position));
}

function tick() {
  if (route && simState.playing && !simState.finished) {
    traveled += (speedKmh / 3.6) * simState.multiplier * (FIX_INTERVAL_MS / 1000);
    const { point, bearing, finished } = pointAlong(route, traveled);
    currentPoint = point;
    currentHeading = bearing;
    currentSpeed = finished ? 0 : (speedKmh / 3.6) * simState.multiplier;
    if (finished) setSimState({ finished: true });
  } else {
    currentSpeed = 0;
  }
  emitFix();
}

function ensureTicker() {
  if (ticker === null && watchers.size > 0) {
    ticker = setInterval(tick, FIX_INTERVAL_MS);
  }
}

function stopTickerIfIdle() {
  if (ticker !== null && watchers.size === 0) {
    clearInterval(ticker);
    ticker = null;
  }
}

export const simulation = {
  isActive(): boolean {
    return (
      import.meta.env.DEV &&
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('sim')
    );
  },
  setRoute(path: LatLng[], kmh: number) {
    if (path.length < 2) return;
    route = path;
    speedKmh = kmh;
    traveled = 0;
    setSimState({ hasRoute: true, finished: false });
  },
  clearRoute() {
    route = null;
    currentSpeed = 0;
    setSimState({ hasRoute: false, finished: false });
  },
  setPlaying(playing: boolean) {
    setSimState({ playing });
  },
  setMultiplier(multiplier: 1 | 4) {
    setSimState({ multiplier });
  },
  setLateralOffset(lateralOffset: boolean) {
    setSimState({ lateralOffset });
  },
  getSnapshot(): SimulationState {
    return simState;
  },
  subscribe(listener: () => void): () => void {
    stateListeners.add(listener);
    return () => stateListeners.delete(listener);
  },
};

export const simulatedGeolocation: GeolocationProvider = {
  isSupported: () => true,
  getCurrentPosition: onSuccess => {
    setTimeout(() => onSuccess(makePosition(emittedPoint(), currentHeading, currentSpeed)), GET_POSITION_DELAY_MS);
  },
  watchPosition: onSuccess => {
    const id = nextWatchId++;
    watchers.set(id, onSuccess);
    ensureTicker();
    return id;
  },
  clearWatch: watchId => {
    watchers.delete(watchId);
    stopTickerIfIdle();
  },
};

export function getGeolocationProvider(): GeolocationProvider {
  return simulation.isActive() ? simulatedGeolocation : browserGeolocation;
}
