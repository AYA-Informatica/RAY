// Centroid coordinates for each Kigali neighborhood.
// Used as fallback when GPS is unavailable or user selects location manually.
// Coordinates sourced from OpenStreetMap centroids.

export const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kimihurura, Kigali':   { lat: -1.9441, lng: 30.0882 },
  'Remera, Kigali':       { lat: -1.9569, lng: 30.1127 },
  'Kacyiru, Kigali':      { lat: -1.9333, lng: 30.0667 },
  'Gisozi, Kigali':       { lat: -1.9167, lng: 30.0833 },
  'Kibagabaga, Kigali':   { lat: -1.9262, lng: 30.1089 },
  'Kanombe, Kigali':      { lat: -1.9833, lng: 30.1333 },
  'Jabana, Kigali':       { lat: -1.9000, lng: 30.1167 },
  'Rusororo, Kigali':     { lat: -1.8833, lng: 30.1000 },
  'Bumbogo, Kigali':      { lat: -1.8667, lng: 30.0833 },
  'Kicukiro, Kigali':     { lat: -2.0000, lng: 30.1000 },
  'Gikondo, Kigali':      { lat: -1.9833, lng: 30.0667 },
  'Niboye, Kigali':       { lat: -2.0167, lng: 30.0833 },
  'Kagarama, Kigali':     { lat: -2.0000, lng: 30.0833 },
  'Masaka, Kigali':       { lat: -2.0333, lng: 30.0667 },
  'Gahanga, Kigali':      { lat: -2.0500, lng: 30.0833 },
  'Nyamirambo, Kigali':   { lat: -1.9833, lng: 30.0333 },
  'Downtown, Kigali':     { lat: -1.9500, lng: 30.0589 },
  'Biryogo, Kigali':      { lat: -1.9600, lng: 30.0500 },
  'Muhima, Kigali':       { lat: -1.9500, lng: 30.0500 },
  'Nyakabanda, Kigali':   { lat: -1.9667, lng: 30.0333 },
}

/**
 * Get coordinates for a neighborhood display label.
 * Returns null if the neighborhood is not in the lookup table.
 */
export function getCoordsForNeighborhood(
  displayLabel: string
): { lat: number; lng: number } | null {
  return NEIGHBORHOOD_COORDS[displayLabel] ?? null
}