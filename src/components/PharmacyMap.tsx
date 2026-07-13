import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import Sidebar from './Sidebar';
import { PharmacyAppProvider, usePharmacyApp } from './PharmacyAppContext';
import type { Pharmacy, PharmacyEnriched } from '../types/pharmacy';
import type { TravelMode } from './PharmacyAppContext';

// Re-exported for Sidebar until step 3 migrates it to read from context
export type { LocationStatus, TravelMode } from './PharmacyAppContext';

const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = import.meta.env.PUBLIC_GOOGLE_MAP_ID ?? '';
const BARILOCHE_CENTER = { lat: -41.1335, lng: -71.3103 };
const ROUTE_COLOR = '#1a73e8';

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
            strokeOpacity: 1,
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
    userLocation,
    isDark,
    showDirections,
    travelMode,
    routeResults,
    onPharmacySelect,
  } = usePharmacyApp();

  const activeRoute = routeResults[travelMode];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">

      <Sidebar />

      <div className="flex-1 relative">
        {API_KEY ? (
          <Map
            defaultCenter={BARILOCHE_CENTER}
            defaultZoom={13}
            mapId={MAP_ID}
            colorScheme={isDark ? 'DARK' : 'LIGHT'}
            gestureHandling="greedy"
            streetViewControl={false}
            reuseMaps
            style={{ width: '100%', height: '100%' }}
          >
            {pharmaciesForDate.map(p =>
              p.lat !== 0 && (
                <AdvancedMarker
                  key={p.name}
                  position={{ lat: p.lat, lng: p.lng }}
                  onClick={() => onPharmacySelect(p)}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-md transition-transform duration-150 ${
                    selectedPharmacy?.name === p.name
                      ? 'bg-green-600 border-white scale-125'
                      : 'bg-white border-green-500'
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={selectedPharmacy?.name === p.name ? 'white' : '#16a34a'}>
                      <rect x="10" y="3" width="4" height="18" rx="1.5" />
                      <rect x="3" y="10" width="18" height="4" rx="1.5" />
                    </svg>
                  </div>
                </AdvancedMarker>
              )
            )}
            {userLocation && (
              <AdvancedMarker position={userLocation}>
                {USER_LOCATION_MARKER}
              </AdvancedMarker>
            )}
            <MapCenterer pharmacy={selectedPharmacy} />
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
