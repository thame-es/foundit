// ===========================================
// Geographic Utility Functions
// ===========================================

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two points on Earth
 * using the Haversine formula. Returns distance in kilometers.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Calculates a bounding box around a given coordinate with a specific radius.
 * This is useful for pre-filtering database queries before applying precise Haversine.
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param radiusKm Radius in kilometers
 */
export function getBoundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  // 1 degree of latitude is approximately 111.32 km
  const latDelta = radiusKm / 111.32;
  
  // 1 degree of longitude varies based on latitude: 111.32 * cos(lat)
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Reverse geocodes coordinates to a human-readable address using Nominatim (OpenStreetMap).
 * Returns the display_name or null on failure.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'User-Agent': 'FoundIt App (Educational)',
        'Accept-Language': 'en'
      },
      next: { revalidate: 86400 } // cache for 24h to avoid hitting rate limits for the same location
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}
