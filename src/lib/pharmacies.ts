import type { Pharmacy, PharmacyRaw } from '../types/pharmacy';

const ENDPOINT_URL = import.meta.env.PHARMACIES_ENDPOINT;
const BASE_URL = 'https://www.barilochense.com';

// --- Parsers ---

function parseTitle(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '')     // strip HTML tags
    .replace(/&aacute;/g, 'á')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&eacute;/g, 'é')
    .replace(/&Eacute;/g, 'É')
    .replace(/&iacute;/g, 'í')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  if (raw.startsWith('/')) return `${BASE_URL}${raw}`;
  return raw;
}

function parseRaw(raw: PharmacyRaw): Pharmacy {
  return {
    date: raw.date.slice(0, 10),
    name: parseTitle(raw.title),
    address: raw.description.trim().replace(/([a-zA-ZáéíóúüÁÉÍÓÚÜñÑ])(\d)/g, '$1 $2'),
    url: normalizeUrl(raw.url),
  };
}

// --- Daily server-side cache ---

let cache: { data: Pharmacy[]; date: string } | null = null;

function today(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).slice(0, 10);
}

export async function fetchPharmacies(): Promise<Pharmacy[]> {
  if (cache && cache.date === today()) {
    return cache.data;
  }

  const response = await fetch(ENDPOINT_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch pharmacies: ${response.status}`);
  }

  const raw: PharmacyRaw[] = await response.json();
  const data = raw.map(parseRaw);

  cache = { data, date: today() };
  return data;
}
