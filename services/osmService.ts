import { LocationResult } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Searches for a location using OpenStreetMap's Nominatim API.
 * Rate Limiting Note: Nominatim is free but has strict usage policies.
 * In a production app, you should cache results and debounce inputs heavily.
 */
export const searchLocation = async (query: string): Promise<LocationResult[]> => {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    polygon_geojson: '0',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data as LocationResult[];
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
};