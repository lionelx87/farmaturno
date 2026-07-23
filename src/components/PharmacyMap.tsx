import { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, RenderingType, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import Sidebar from './Sidebar';
import SimulationPanel from './SimulationPanel';
import { simulation } from '../lib/geolocation';
import { moveByBearing } from '../lib/route-geometry';
import { PharmacyAppProvider, usePharmacyApp } from './PharmacyAppContext';
import type { Pharmacy, PharmacyEnriched } from '../types/pharmacy';
import type { TravelMode } from './PharmacyAppContext';

// Re-exported for Sidebar until step 3 migrates it to read from context
export type { LocationStatus, TravelMode } from './PharmacyAppContext';

const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = import.meta.env.PUBLIC_GOOGLE_MAP_ID ?? '';
const BARILOCHE_CENTER = { lat: -41.1335, lng: -71.3103 };
const ROUTE_COLOR = '#1a73e8';
const NAV_ZOOM = 17.5;
const NAV_TILT = 45;
const NAV_LOOKAHEAD_METERS = 60;
const ARRIVAL_ZOOM = 18;
const ARRIVAL_DISMISS_MS = 4000;

// ── RoutesController — requests both travel modes, stores results in context ──

function RoutesController() {
  const routesLibrary = useMapsLibrary('routes');
  const { showDirections, routeOrigin, selectedPharmacy, onRouteResult } = usePharmacyApp();

  useEffect(() => {
    if (!routesLibrary || !showDirections || !routeOrigin || !selectedPharmacy) return;
    const service = new routesLibrary.DirectionsService();
    const destination = { lat: selectedPharmacy.lat, lng: selectedPharmacy.lng };
    let cancelled = false;

    (['WALKING', 'DRIVING'] as const).forEach(mode => {
      service
        .route({ origin: routeOrigin, destination, travelMode: routesLibrary.TravelMode[mode] })
        .then(result => {
          if (cancelled) return;
          const leg = result.routes[0]?.legs[0];
          if (!leg) return;
          onRouteResult(mode, {
            result,
            durationText: leg.duration?.text ?? '',
            distanceText: leg.distance?.text ?? '',
          });
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [routesLibrary, showDirections, routeOrigin, selectedPharmacy]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// ── DirectionsLayer — renders an in-memory result, no requests of its own ─────

interface DirectionsLayerProps {
  result: google.maps.DirectionsResult;
  travelMode: TravelMode;
}

function DirectionsLayer({ result, travelMode }: DirectionsLayerProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    const polylineOptions: google.maps.PolylineOptions =
      travelMode === 'WALKING'
        ? {
            strokeOpacity: 0,
            icons: [{
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 1,
                fillColor: ROUTE_COLOR,
                strokeOpacity: 0,
                scale: 3,
              },
              offset: '0',
              repeat: '12px',
            }],
          }
        : {
            strokeColor: ROUTE_COLOR,
            strokeOpacity: 0.7,
            strokeWeight: 5,
          };

    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions,
    });
    setDirectionsRenderer(renderer);
    return () => renderer.setMap(null);
  }, [routesLibrary, map, travelMode]);

  useEffect(() => {
    if (directionsRenderer) directionsRenderer.setDirections(result);
  }, [directionsRenderer, result]);

  return null;
}

// ── NavigationCamera — follows the user with heading/tilt while navigating ────

interface NavigationCameraProps {
  suspended: boolean;
  onUserGesture: () => void;
}

function headingDelta(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function NavigationCamera({ suspended, onUserGesture }: NavigationCameraProps) {
  const map = useMap();
  const { navigationMode, displayLocation, travelHeading, arrivedPharmacy } = usePharmacyApp();
  const wasNavigatingRef = useRef(false);
  const commandedRef = useRef<{ heading: number; tilt: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    if (navigationMode) {
      wasNavigatingRef.current = true;
      return;
    }
    if (wasNavigatingRef.current) {
      wasNavigatingRef.current = false;
      commandedRef.current = null;
      map.moveCamera({ heading: 0, tilt: 0 });
    }
  }, [map, navigationMode]);

  useEffect(() => {
    if (!map || !navigationMode) return;
    const isManualCameraChange = () => {
      const commanded = commandedRef.current;
      if (!commanded) return false;
      return (
        headingDelta(map.getHeading() ?? 0, commanded.heading) > 1 ||
        Math.abs((map.getTilt() ?? 0) - commanded.tilt) > 1
      );
    };
    const listeners = [
      map.addListener('dragstart', onUserGesture),
      map.addListener('heading_changed', () => {
        if (isManualCameraChange()) onUserGesture();
      }),
      map.addListener('tilt_changed', () => {
        if (isManualCameraChange()) onUserGesture();
      }),
    ];
    return () => listeners.forEach(listener => listener.remove());
  }, [map, navigationMode, onUserGesture]);

  useEffect(() => {
    if (!map || !navigationMode || suspended || !displayLocation || arrivedPharmacy) return;
    const heading = travelHeading ?? 0;
    commandedRef.current = { heading, tilt: NAV_TILT };
    map.moveCamera({
      center: moveByBearing(displayLocation, heading, NAV_LOOKAHEAD_METERS),
      zoom: NAV_ZOOM,
      tilt: NAV_TILT,
      heading,
    });
  }, [map, navigationMode, suspended, displayLocation, travelHeading, arrivedPharmacy]);

  return null;
}

// ── Arrival — camera close-up and celebratory overlay when reaching the goal ──

function ArrivalCamera() {
  const map = useMap();
  const { arrivedPharmacy } = usePharmacyApp();

  useEffect(() => {
    if (!map || !arrivedPharmacy || arrivedPharmacy.lat === 0) return;
    map.moveCamera({
      center: { lat: arrivedPharmacy.lat, lng: arrivedPharmacy.lng },
      zoom: ARRIVAL_ZOOM,
      heading: 0,
      tilt: 0,
    });
  }, [map, arrivedPharmacy]);

  return null;
}

function ArrivalOverlay() {
  const { arrivedPharmacy, onDismissArrival } = usePharmacyApp();

  useEffect(() => {
    if (!arrivedPharmacy) return;
    const timer = setTimeout(onDismissArrival, ARRIVAL_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [arrivedPharmacy, onDismissArrival]);

  return (
    <div aria-live="polite">
      {arrivedPharmacy && (
        <div className="absolute top-3 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-40">
        <button
          onClick={onDismissArrival}
          className="w-full flex items-center gap-3 rounded-2xl bg-green-600 text-white px-4 py-3.5 shadow-xl motion-safe:animate-[arrival-pop_400ms_ease-out] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </span>
          <span className="flex-1 min-w-0 text-left">
            <span className="block text-sm font-bold truncate">Llegaste a {arrivedPharmacy.name}</span>
            <span className="block text-xs text-green-100">{arrivedPharmacy.address}</span>
          </span>
        </button>
        </div>
      )}
    </div>
  );
}

// ── NavigationBanner — destination, ETA and exit control while navigating ─────

function NavigationBanner() {
  const { selectedPharmacy, travelMode, routeResults, onExitNavigation } = usePharmacyApp();
  const route = routeResults[travelMode];

  if (!selectedPharmacy) return null;

  return (
    <div className="absolute top-3 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-30 flex items-center gap-3 rounded-2xl bg-green-700/95 text-white pl-4 pr-2 py-3 shadow-xl backdrop-blur-sm">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate leading-snug">{selectedPharmacy.name}</p>
        <p className="text-xs text-green-100 leading-snug">
          {route ? `${route.durationText} · ${route.distanceText}` : 'Calculando ruta…'}
        </p>
      </div>
      <button
        onClick={onExitNavigation}
        aria-label="Salir de navegación"
        className="shrink-0 p-2 rounded-full hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  );
}

// ── DebugMapHandle — dev-only escape hatch for runtime inspection ─────────────

function DebugMapHandle() {
  const map = useMap();
  useEffect(() => {
    if (import.meta.env.DEV && map) (window as unknown as { __map: google.maps.Map }).__map = map;
  }, [map]);
  return null;
}

// ── MapCenterer ───────────────────────────────────────────────────────────────

function MapCenterer({ pharmacy }: { pharmacy: PharmacyEnriched | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && pharmacy && pharmacy.lat !== 0) {
      map.panTo({ lat: pharmacy.lat, lng: pharmacy.lng });
    }
  }, [map, pharmacy]);
  return null;
}

// ── User location marker (static JSX, no re-renders) ─────────────────────────

const USER_LOCATION_MARKER = (
  <div className="relative flex items-center justify-center w-5 h-5">
    <div className="absolute w-5 h-5 rounded-full bg-blue-400 opacity-75 motion-safe:animate-ping" />
    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
  </div>
);

// ── MapLayout — reads from context, renders map + sidebar ─────────────────────

function MapLayout() {
  const {
    pharmaciesForDate,
    selectedPharmacy,
    displayLocation,
    isDark,
    showDirections,
    travelMode,
    routeResults,
    navigationMode,
    arrivedPharmacy,
    onPharmacySelect,
  } = usePharmacyApp();

  const activeRoute = routeResults[travelMode];
  const [simActive, setSimActive] = useState(false);
  const [cameraSuspended, setCameraSuspended] = useState(false);

  useEffect(() => {
    setSimActive(simulation.isActive());
  }, []);

  useEffect(() => {
    if (!navigationMode) setCameraSuspended(false);
  }, [navigationMode]);

  const suspendCamera = useCallback(() => setCameraSuspended(true), []);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">

      <Sidebar />

      <div className="flex-1 relative">
        {simActive && <SimulationPanel />}
        {navigationMode && !arrivedPharmacy && <NavigationBanner />}
        <ArrivalOverlay />
        {navigationMode && cameraSuspended && (
          <button
            onClick={() => setCameraSuspended(false)}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 text-sm font-semibold shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 3h-1.07A8.006 8.006 0 0 0 13 4.07V3a1 1 0 1 0-2 0v1.07A8.006 8.006 0 0 0 4.07 11H3a1 1 0 1 0 0 2h1.07A8.006 8.006 0 0 0 11 19.93V21a1 1 0 1 0 2 0v-1.07A8.006 8.006 0 0 0 19.93 13H21a1 1 0 1 0 0-2zm-9 7a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
            </svg>
            Recentrar
          </button>
        )}
        {API_KEY ? (
          <Map
            defaultCenter={BARILOCHE_CENTER}
            defaultZoom={13}
            mapId={MAP_ID}
            renderingType={RenderingType.VECTOR}
            colorScheme={isDark ? 'DARK' : 'LIGHT'}
            gestureHandling="greedy"
            headingInteractionEnabled
            tiltInteractionEnabled
            streetViewControl={false}
            reuseMaps
            style={{ width: '100%', height: '100%' }}
          >
            {pharmaciesForDate.map(p => {
              const isArrived = arrivedPharmacy?.name === p.name;
              return p.lat !== 0 && (
                <AdvancedMarker
                  key={p.name}
                  position={{ lat: p.lat, lng: p.lng }}
                  onClick={() => onPharmacySelect(p)}
                >
                  <div className="relative">
                    {isArrived && (
                      <>
                        <div className="absolute -inset-3 rounded-full bg-green-500/40 motion-safe:animate-ping" />
                        <div className="absolute -inset-6 rounded-full bg-green-400/25 motion-safe:animate-ping [animation-delay:250ms]" />
                      </>
                    )}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-md transition-transform duration-150 ${
                      selectedPharmacy?.name === p.name
                        ? 'bg-green-600 border-white scale-125'
                        : 'bg-white border-green-500'
                    } ${isArrived ? 'motion-safe:animate-bounce' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={selectedPharmacy?.name === p.name ? 'white' : '#16a34a'} aria-hidden="true">
                        <rect x="10" y="3" width="4" height="18" rx="1.5" />
                        <rect x="3" y="10" width="18" height="4" rx="1.5" />
                      </svg>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
            {displayLocation && (
              <AdvancedMarker position={displayLocation}>
                {USER_LOCATION_MARKER}
              </AdvancedMarker>
            )}
            <MapCenterer pharmacy={selectedPharmacy} />
            <NavigationCamera suspended={cameraSuspended} onUserGesture={suspendCamera} />
            <ArrivalCamera />
            {import.meta.env.DEV && <DebugMapHandle />}
            <RoutesController />
            {showDirections && activeRoute && (
              <DirectionsLayer result={activeRoute.result} travelMode={travelMode} />
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
  );
}

// ── PharmacyMap — entry point, sets up providers ──────────────────────────────

interface Props {
  pharmacies: Pharmacy[];
}

export default function PharmacyMap({ pharmacies }: Props) {
  return (
    <PharmacyAppProvider pharmacies={pharmacies}>
      <APIProvider apiKey={API_KEY}>
        <MapLayout />
      </APIProvider>
    </PharmacyAppProvider>
  );
}
