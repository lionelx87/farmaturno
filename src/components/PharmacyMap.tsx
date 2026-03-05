import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import Sidebar from './Sidebar';
import { enrichWithPlaces } from '../lib/places';
import type { Pharmacy, PharmacyEnriched, PlacesCache } from '../types/pharmacy';

const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = import.meta.env.PUBLIC_GOOGLE_MAP_ID ?? '';
const BARILOCHE_CENTER = { lat: -41.1335, lng: -71.3103 };

export type LocationStatus = 'idle' | 'loading' | 'denied' | 'unavailable';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function applyCache(pharmacies: Pharmacy[], cache: PlacesCache): PharmacyEnriched[] {
  return pharmacies.map(p => ({
    ...p,
    phone: cache[p.name]?.phone ?? null,
    lat: cache[p.name]?.lat ?? 0,
    lng: cache[p.name]?.lng ?? 0,
  }));
}

function mostRecentAvailable(dates: string[], target: string): string {
  const past = dates.filter(d => d <= target);
  return past.length > 0 ? past[past.length - 1] : (dates[0] ?? target);
}

// ── DirectionsLayer ──────────────────────────────────────────────────────────
// Must render inside <Map> to access the map instance via useMap()

interface DirectionsLayerProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

function DirectionsLayer({ origin, destination }: DirectionsLayerProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true, // we use our own AdvancedMarkers
    });
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(renderer);
    return () => renderer.setMap(null);
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !routesLibrary) return;
    directionsService
      .route({ origin, destination, travelMode: routesLibrary.TravelMode.DRIVING })
      .then(result => directionsRenderer.setDirections(result))
      .catch(() => {});
  }, [directionsService, directionsRenderer, routesLibrary, origin, destination]);

  return null;
}

function MapCenterer({ pharmacy }: { pharmacy: PharmacyEnriched | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && pharmacy && pharmacy.lat !== 0) {
      map.panTo({ lat: pharmacy.lat, lng: pharmacy.lng });
    }
  }, [map, pharmacy]);
  return null;
}

// ── PharmacyMap ──────────────────────────────────────────────────────────────

interface Props {
  pharmacies: Pharmacy[];
}

export default function PharmacyMap({ pharmacies }: Props) {
  const today = localToday();
  const d7back = new Date(today + 'T12:00:00');
  d7back.setDate(d7back.getDate() - 7);
  const minDate = d7back.toISOString().slice(0, 10);
  const availableDates = [...new Set(pharmacies.map(p => p.date))]
    .filter(d => d >= minDate)
    .sort();

  const [selectedDate, setSelectedDate] = useState(() =>
    mostRecentAvailable(availableDates, today)
  );
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyEnriched | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [placesCache, setPlacesCache] = useState<PlacesCache>({});
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const pharmaciesForDay = pharmacies.filter(p => p.date === selectedDate);

  useEffect(() => {
    if (!API_KEY || pharmaciesForDay.length === 0) return;
    enrichWithPlaces(pharmaciesForDay.map(p => ({ name: p.name, address: p.address })), API_KEY).then(setPlacesCache);
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const pharmaciesForDate = applyCache(pharmaciesForDay, placesCache);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedPharmacy(null);
  }

  function handleGetDirections() {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('idle');
      },
      err => {
        setLocationStatus(err.code === 1 ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: true }
    );
  }

  const showDirections =
    userLocation !== null &&
    selectedPharmacy !== null &&
    selectedPharmacy.lat !== 0;

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">

        <Sidebar
          pharmacies={pharmaciesForDate}
          selectedDate={selectedDate}
          selectedPharmacy={selectedPharmacy}
          availableDates={availableDates}
          isDark={isDark}
          locationStatus={locationStatus}
          onDateChange={handleDateChange}
          onPharmacySelect={setSelectedPharmacy}
          onPharmacyDeselect={() => setSelectedPharmacy(null)}
          onToggleTheme={toggleTheme}
          onGetDirections={handleGetDirections}
        />

        <div className="flex-1 relative">
          {API_KEY ? (
            <Map
              defaultCenter={BARILOCHE_CENTER}
              defaultZoom={13}
              mapId={MAP_ID}
              colorScheme={isDark ? 'DARK' : 'LIGHT'}
              gestureHandling="greedy"
              reuseMaps
              style={{ width: '100%', height: '100%' }}
            >
              {pharmaciesForDate.map(p =>
                p.lat !== 0 && (
                  <AdvancedMarker
                    key={p.name}
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => setSelectedPharmacy(p)}
                  />
                )
              )}
              <MapCenterer pharmacy={selectedPharmacy} />
              {showDirections && (
                <DirectionsLayer
                  origin={userLocation!}
                  destination={{ lat: selectedPharmacy!.lat, lng: selectedPharmacy!.lng }}
                />
              )}
            </Map>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mapa no disponible — configurar PUBLIC_GOOGLE_MAPS_API_KEY
              </p>
            </div>
          )}
        </div>

      </div>
    </APIProvider>
  );
}
