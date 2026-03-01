import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import Sidebar from './Sidebar';
import { MOCK_PLACES_CACHE } from '../lib/mocks';
import type { Pharmacy, PharmacyEnriched, PlacesCache } from '../types/pharmacy';

const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const BARILOCHE_CENTER = { lat: -41.1335, lng: -71.3103 };

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function enrichPharmacies(pharmacies: Pharmacy[], cache: PlacesCache): PharmacyEnriched[] {
  return pharmacies.map(p => ({
    ...p,
    phone: cache[p.name]?.phone ?? null,
    lat: cache[p.name]?.lat ?? 0,
    lng: cache[p.name]?.lng ?? 0,
  }));
}

interface Props {
  pharmacies: Pharmacy[];
}

export default function PharmacyMap({ pharmacies }: Props) {
  const [selectedDate, setSelectedDate] = useState(localToday());
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyEnriched | null>(null);

  // TODO: replace with real localStorage Places cache
  const placesCache = MOCK_PLACES_CACHE;

  const allEnriched = enrichPharmacies(pharmacies, placesCache);
  const pharmaciesForDate = allEnriched.filter(p => p.date === selectedDate);
  const availableDates = [...new Set(pharmacies.map(p => p.date))].sort();

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedPharmacy(null);
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">

        <Sidebar
          pharmacies={pharmaciesForDate}
          selectedDate={selectedDate}
          selectedPharmacy={selectedPharmacy}
          availableDates={availableDates}
          onDateChange={handleDateChange}
          onPharmacySelect={setSelectedPharmacy}
        />

        {/* Map area — hidden on mobile (bottom sheet pattern handles mobile) */}
        <div className="flex-1 relative hidden md:block">
          {API_KEY ? (
            <Map
              defaultCenter={BARILOCHE_CENTER}
              defaultZoom={13}
              mapId="farmaturno-map"
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
