import type { Pharmacy, PlacesCache } from '../types/pharmacy';

// Subset of real endpoint data (3 days: today + 2 ahead)
export const MOCK_PHARMACIES: Pharmacy[] = [
  // 2026-03-01
  { date: '2026-03-01', name: 'Total', address: 'Gallardo 71', url: 'https://www.barilochense.com/guia/farmacias/total' },
  { date: '2026-03-01', name: 'Cumbre 3', address: 'P. Moreno 514', url: 'https://www.barilochense.com/guia/farmacias/cumbre-3' },
  { date: '2026-03-01', name: 'Diagonal', address: 'Diagonal Capraro 1301', url: 'https://www.barilochense.com/guia/farmacias/diagonal' },
  // 2026-03-02
  { date: '2026-03-02', name: '9 de Julio', address: '9 de Julio 631', url: 'https://www.barilochense.com/guia/farmacias/9-de-julio' },
  { date: '2026-03-02', name: 'Barberis', address: 'Onelli 377', url: 'https://www.barilochense.com/guia/farmacias/barberis' },
  { date: '2026-03-02', name: 'Ruta 40', address: 'J.M. Hermann 3995', url: 'https://www.barilochense.com/guia/farmacias/ruta-40' },
  // 2026-03-03
  { date: '2026-03-03', name: 'Farmacenter', address: 'Av. San Martín 162 L.2', url: 'https://www.barilochense.com/guia/farmacias/farmacenter' },
  { date: '2026-03-03', name: 'Zona Vital', address: 'Moreno 246', url: 'https://www.barilochense.com/guia/farmacias/zona-vital' },
  { date: '2026-03-03', name: 'Dr. Elustondo', address: 'Mitre 379', url: 'https://www.barilochense.com/guia/farmacias/dr-elustondo' },
];

// Simulated localStorage Places cache
// Mirrors the structure stored after a real PlacesService.findPlaceFromQuery call:
//   result.formatted_phone_number → phone
//   result.geometry.location.lat() → lat
//   result.geometry.location.lng() → lng
export const MOCK_PLACES_CACHE: PlacesCache = {
  'Total':        { phone: '(294) 4 426550', lat: -41.1337, lng: -71.3082 },
  'Cumbre 3':     { phone: '(294) 4 430610', lat: -41.1342, lng: -71.3097 },
  'Diagonal':     { phone: '(294) 4 431220', lat: -41.1318, lng: -71.3054 },
  '9 de Julio':   { phone: '(294) 4 422300', lat: -41.1329, lng: -71.3068 },
  'Barberis':     { phone: '(294) 4 435890', lat: -41.1344, lng: -71.3085 },
  'Ruta 40':      { phone: '(294) 4 440170', lat: -41.1290, lng: -71.3150 },
  'Farmacenter':  { phone: '(294) 4 400707', lat: -41.1330, lng: -71.3060 },
  'Zona Vital':   { phone: '(294) 4 427890', lat: -41.1348, lng: -71.3075 },
  'Dr. Elustondo': { phone: '(294) 4 423890', lat: -41.1325, lng: -71.3068 },
};
