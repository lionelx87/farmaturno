import type { Pharmacy } from '../types/pharmacy';

// Endpoint URL to be configured via environment variable
const ENDPOINT_URL = import.meta.env.PHARMACIES_ENDPOINT;

export async function fetchPharmacies(): Promise<Pharmacy[]> {
  // TODO: implement daily cache + fetch logic
  const response = await fetch(ENDPOINT_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch pharmacies: ${response.status}`);
  }
  return response.json();
}
