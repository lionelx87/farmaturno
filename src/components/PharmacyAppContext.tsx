import { createContext, use, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { enrichWithPlaces } from '../lib/places';
import { getDistance } from '../lib/distance';
import type { Pharmacy, PharmacyEnriched, PlacesCache } from '../types/pharmacy';
import type { DistanceResult } from '../lib/distance';

export type LocationStatus = 'idle' | 'loading' | 'denied' | 'unavailable';
export type TravelMode = 'DRIVING' | 'WALKING';

export interface RouteInfo {
  result: google.maps.DirectionsResult;
  durationText: string;
  distanceText: string;
}

export type RouteResults = Partial<Record<TravelMode, RouteInfo>>;

const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const REROUTE_THRESHOLD_METERS = 50;

function gpsDisplacementMeters(
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral,
): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getClosingTime(hour: number): { time: string; tomorrow: boolean } {
  if (hour < 9) return { time: '09:00 h', tomorrow: false };
  return { time: '09:00 h', tomorrow: true };
}

function getActivePharmacies(pharmacies: Pharmacy[], selectedDate: string, today: string): Pharmacy[] {
  if (selectedDate !== today) return pharmacies.filter(p => p.date === selectedDate);
  const hour = new Date().getHours();
  if (hour < 9) return pharmacies.filter(p => p.date === localYesterday()).slice(0, 2);
  const forToday = pharmacies.filter(p => p.date === today);
  return hour >= 23 ? forToday.slice(0, 2) : forToday;
}

function applyCache(pharmacies: Pharmacy[], cache: PlacesCache): PharmacyEnriched[] {
  return pharmacies.map((p, index) => ({
    ...p,
    phone: cache[p.name]?.phone ?? null,
    lat: cache[p.name]?.lat ?? 0,
    lng: cache[p.name]?.lng ?? 0,
    shift: index < 2 ? 'overnight' : 'day',
  }));
}

function sortByDistance(
  pharmacies: PharmacyEnriched[],
  distances: Record<string, DistanceResult>,
): PharmacyEnriched[] {
  if (Object.keys(distances).length === 0) return pharmacies;
  return [...pharmacies].sort(
    (a, b) => (distances[a.name]?.meters ?? Infinity) - (distances[b.name]?.meters ?? Infinity)
  );
}

function mostRecentAvailable(dates: string[], target: string): string {
  const past = dates.filter(d => d <= target);
  return past.length > 0 ? past[past.length - 1] : (dates[0] ?? target);
}

// ── Context interface ─────────────────────────────────────────────────────────

export interface PharmacyAppContextValue {
  // Derived
  availableDates: string[];
  pharmaciesForDate: PharmacyEnriched[];
  showDirections: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  closingTime: { time: string; tomorrow: boolean } | null;
  isOvernightMix: boolean;
  today: string;

  // State
  selectedDate: string;
  selectedPharmacy: PharmacyEnriched | null;
  isDark: boolean;
  locationStatus: LocationStatus;
  distances: Record<string, DistanceResult>;
  travelMode: TravelMode;
  routeOrigin: google.maps.LatLngLiteral | null;
  userLocation: google.maps.LatLngLiteral | null;
  routeResults: RouteResults;

  // Actions
  onDateChange: (date: string) => void;
  onPharmacySelect: (pharmacy: PharmacyEnriched) => void;
  onPharmacyDeselect: () => void;
  onToggleTheme: () => void;
  onRequestLocation: () => void;
  onGetDirections: () => void;
  onCancelDirections: () => void;
  onTravelModeChange: (mode: TravelMode) => void;
  onRouteResult: (mode: TravelMode, info: RouteInfo) => void;
}

const PharmacyAppContext = createContext<PharmacyAppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function PharmacyAppProvider({
  pharmacies,
  children,
}: {
  pharmacies: Pharmacy[];
  children: React.ReactNode;
}) {
  const today = localToday();
  const availableDates = useMemo(() => {
    const d7back = new Date(today + 'T12:00:00');
    d7back.setDate(d7back.getDate() - 7);
    const minDate = d7back.toISOString().slice(0, 10);
    return [...new Set(pharmacies.map(p => p.date))].filter(d => d >= minDate).sort();
  }, [pharmacies]);

  const [selectedDate, setSelectedDate] = useState(() =>
    mostRecentAvailable(availableDates, today)
  );
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyEnriched | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [placesCache, setPlacesCache] = useState<PlacesCache>({});
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [distances, setDistances] = useState<Record<string, DistanceResult>>({});
  const [distanceOrigin, setDistanceOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');
  const [routeActive, setRouteActive] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [routeResults, setRouteResults] = useState<RouteResults>({});
  const watchIdRef = useRef<number | null>(null);
  const lastRouteOriginRef = useRef<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const saved = localStorage.getItem('travelMode') as TravelMode | null;
    if (saved) setTravelMode(saved);
    const dateParam = new URLSearchParams(window.location.search).get('fecha');
    if (dateParam && availableDates.includes(dateParam)) setSelectedDate(dateParam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pharmaciesForDay = getActivePharmacies(pharmacies, selectedDate, today);

  useEffect(() => {
    if (!API_KEY || pharmaciesForDay.length === 0) return;
    enrichWithPlaces(pharmaciesForDay.map(p => ({ name: p.name, address: p.address })), API_KEY)
      .then(setPlacesCache);
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const pharmaciesForDate = sortByDistance(applyCache(pharmaciesForDay, placesCache), distances);

  useEffect(() => {
    if (!distanceOrigin) return;
    const located = applyCache(pharmaciesForDay, placesCache).filter(p => p.lat !== 0);
    Promise.all(
      located.map(p =>
        getDistance(distanceOrigin, { lat: p.lat, lng: p.lng }).then(r => [p.name, r] as const)
      )
    ).then(entries => setDistances(Object.fromEntries(entries)));
  }, [distanceOrigin, selectedDate, placesCache]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!routeActive) setRouteResults({});
  }, [routeActive]);

  useEffect(() => {
    if (!routeActive || !selectedPharmacy || !userLocation || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    lastRouteOriginRef.current = userLocation;
    setRouteOrigin(userLocation);

    const id = navigator.geolocation.watchPosition(
      pos => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newPos);
        if (
          lastRouteOriginRef.current &&
          gpsDisplacementMeters(newPos, lastRouteOriginRef.current) > REROUTE_THRESHOLD_METERS
        ) {
          lastRouteOriginRef.current = newPos;
          setRouteOrigin(newPos);
        }
      },
      () => {},
      { enableHighAccuracy: true },
    );

    watchIdRef.current = id;

    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [routeActive, selectedPharmacy]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentIndex = availableDates.indexOf(selectedDate);

  const deactivateRoute = useCallback(() => {
    setRouteActive(false);
    setRouteOrigin(null);
  }, []);

  const onDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedPharmacy(null);
    deactivateRoute();
    const url = new URL(window.location.href);
    url.searchParams.set('fecha', date);
    history.replaceState(null, '', url);
  }, [deactivateRoute]);

  const onPharmacySelect = useCallback((pharmacy: PharmacyEnriched) => {
    setSelectedPharmacy(pharmacy);
    deactivateRoute();
  }, [deactivateRoute]);

  const onPharmacyDeselect = useCallback(() => {
    setSelectedPharmacy(null);
    deactivateRoute();
  }, [deactivateRoute]);

  const onToggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const acquireLocation = useCallback((activateRoute: boolean) => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(location);
        setDistanceOrigin(location);
        setLocationStatus('idle');
        if (activateRoute) setRouteActive(true);
      },
      err => setLocationStatus(err.code === 1 ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true },
    );
  }, []);

  const onRequestLocation = useCallback(() => acquireLocation(false), [acquireLocation]);

  const onGetDirections = useCallback(() => {
    if (userLocation) {
      setRouteActive(true);
      return;
    }
    acquireLocation(true);
  }, [userLocation, acquireLocation]);

  const onCancelDirections = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    deactivateRoute();
    setLocationStatus('idle');
  }, [deactivateRoute]);

  const onRouteResult = useCallback((mode: TravelMode, info: RouteInfo) => {
    setRouteResults(prev => ({ ...prev, [mode]: info }));
  }, []);

  const onTravelModeChange = useCallback((mode: TravelMode) => {
    setTravelMode(mode);
    localStorage.setItem('travelMode', mode);
  }, []);

  const hour = new Date().getHours();
  const isOvernightMix = selectedDate === today && hour >= 9 && hour < 23 && pharmaciesForDay.length > 2;
  const closingTime = selectedDate === today && !isOvernightMix ? getClosingTime(hour) : null;

  const value: PharmacyAppContextValue = {
    availableDates,
    pharmaciesForDate,
    showDirections: routeActive && routeOrigin !== null && selectedPharmacy !== null && selectedPharmacy.lat !== 0,
    canGoPrev: currentIndex > 0,
    canGoNext: currentIndex < availableDates.length - 1,
    closingTime,
    isOvernightMix,
    today,
    selectedDate,
    selectedPharmacy,
    isDark,
    locationStatus,
    distances,
    travelMode,
    routeOrigin,
    userLocation,
    routeResults,
    onDateChange,
    onPharmacySelect,
    onPharmacyDeselect,
    onToggleTheme,
    onRequestLocation,
    onGetDirections,
    onCancelDirections,
    onTravelModeChange,
    onRouteResult,
  };

  return <PharmacyAppContext value={value}>{children}</PharmacyAppContext>;
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function usePharmacyApp(): PharmacyAppContextValue {
  const ctx = use(PharmacyAppContext);
  if (!ctx) throw new Error('usePharmacyApp must be used within PharmacyAppProvider');
  return ctx;
}
