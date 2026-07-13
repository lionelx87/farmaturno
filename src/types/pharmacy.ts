// Raw shape returned by the external endpoint
export interface PharmacyRaw {
  date: string;        // "YYYY-MM-DD HH:mm:ss"
  type: string;        // always "meeting", unused
  title: string;       // pharmacy name, may contain HTML tags and entities
  description: string; // street address (phone excluded — sourced from Google Places)
  url: string;         // relative or absolute URL, may be empty
}

// Normalized pharmacy — endpoint data cleaned and ready for use
export interface Pharmacy {
  date: string;        // "YYYY-MM-DD"
  name: string;        // cleaned name (HTML stripped, entities decoded)
  address: string;     // street address only
  url: string | null;  // full absolute URL or null
}

// Data fetched from Google Places API (v1) and cached in localStorage
// Fields: nationalPhoneNumber, location.latitude, location.longitude
export interface PlacesData {
  phone: string | null;
  lat: number;
  lng: number;
}

// localStorage cache keyed by pharmacy name
export type PlacesCache = Record<string, PlacesData>;

// The first two pharmacies of each day cover the overnight shift (until 09:00 next day)
export type PharmacyShift = 'overnight' | 'day';

// Pharmacy enriched with Places data — ready for use in the UI island
export interface PharmacyEnriched extends Pharmacy {
  phone: string | null;
  lat: number;
  lng: number;
  shift: PharmacyShift;
}
