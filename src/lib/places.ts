import type { PlacesCache, PlacesData } from '../types/pharmacy';

const CACHE_KEY = 'farmaturno_places_cache_v1';
const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
const BARILOCHE_CENTER = { latitude: -41.1335, longitude: -71.3103 };

function loadCache(): PlacesCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: PlacesCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable (private mode quota, etc.) — no-op
  }
}

async function fetchPlaceData(
  name: string,
  address: string,
  apiKey: string
): Promise<PlacesData | null> {
  try {
    const response = await fetch(PLACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.nationalPhoneNumber,places.location',
      },
      body: JSON.stringify({
        textQuery: `farmacia ${name} ${address} Bariloche`,
        locationBias: {
          circle: {
            center: BARILOCHE_CENTER,
            radius: 10000.0,
          },
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const place = data.places?.[0];
    if (!place?.location) return null;

    return {
      phone: place.nationalPhoneNumber ?? null,
      lat: place.location.latitude,
      lng: place.location.longitude,
    };
  } catch {
    return null;
  }
}

export async function enrichWithPlaces(
  pharmacies: { name: string; address: string }[],
  apiKey: string
): Promise<PlacesCache> {
  const cache = loadCache();
  const missing = pharmacies.filter(p => !cache[p.name]);

  if (missing.length === 0) return cache;

  const results = await Promise.all(
    missing.map(p => fetchPlaceData(p.name, p.address, apiKey))
  );

  missing.forEach((p, i) => {
    if (results[i]) cache[p.name] = results[i]!;
  });

  saveCache(cache);
  return cache;
}
