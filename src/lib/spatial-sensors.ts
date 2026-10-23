/**
 * AutoCom Spatial Sensor Engine
 * Provides native Capacitor-ready sensor abstractions with browser fallbacks:
 * - GPS/GNSS Geolocation tracking
 * - Magnetometer Compass Heading (DeviceOrientation)
 * - Haversine distance calculations (20m - 50m proximity filtering)
 * - Heading vs. Bearing cone geometry
 */

export interface SpatialCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}

// 5 South African Shopping Malls
export const BEL_AIR_SHOPPING_CENTRE = {
  id: "bel-air",
  name: "Bel Air Shopping Centre",
  subtitle: "North Riding, Randburg, Johannesburg",
  address: "Bellairs Dr & Malibongwe Dr, North Riding, Randburg, 2162, South Africa",
  latitude: -26.05941834252426,
  longitude: 27.95827226170294,
  googleMapsUrl: "https://maps.app.goo.gl/GQsaq4NcCUjDWZEt8",
  radiusMeters: 450,
};

export const JACKAL_CREEK_SHOPPING_CENTRE = {
  id: "jackal-creek",
  name: "Jackal Creek Corner Shopping Mall",
  subtitle: "Boundary Rd & Aureole Ave, North Riding",
  address: "Boundary Rd & Aureole Ave, Jackal Creek, Roodepoort, 2169, South Africa",
  latitude: -26.0594,
  longitude: 27.9256,
  googleMapsUrl: "https://maps.app.goo.gl/UUnJgkXS8RxqGthD8",
  radiusMeters: 450,
};

export const BLUEBERRY_SQUARE_SHOPPING_CENTRE = {
  id: "blueberry-square",
  name: "Blueberry Square Shopping Mall",
  subtitle: "Blueberry St & Beyers Naudé Dr, Honeydew",
  address: "Blueberry St & Beyers Naudé Dr, Honeydew, Roodepoort, 2040, South Africa",
  latitude: -26.0827,
  longitude: 27.9209,
  googleMapsUrl: "https://maps.app.goo.gl/gspZcgHJez7hQP3u5",
  radiusMeters: 450,
};

export const NORTHGATE_SHOPPING_CENTRE = {
  id: "northgate",
  name: "Northgate Shopping Centre",
  subtitle: "Northumberland Ave & Olievenhout Ave, North Riding",
  address: "Northumberland Ave, North Riding, Randburg, 2162, South Africa",
  latitude: -26.0628,
  longitude: 27.9525,
  googleMapsUrl: "https://maps.app.goo.gl/mmXeNnXRzaMtgnKS7",
  radiusMeters: 500,
};

export const FOURWAYS_SHOPPING_CENTRE = {
  id: "fourways",
  name: "Fourways Mall",
  subtitle: "William Nicol & Witkoppen, Fourways, Sandton",
  address: "William Nicol Dr & Witkoppen Rd, Fourways, Sandton, 2055, South Africa",
  latitude: -26.0189,
  longitude: 28.0068,
  googleMapsUrl: "https://maps.app.goo.gl/XsNqkLzo6to33TPLA",
  radiusMeters: 600,
};

export const ALL_MALL_LOCATIONS = [
  BEL_AIR_SHOPPING_CENTRE,
  JACKAL_CREEK_SHOPPING_CENTRE,
  BLUEBERRY_SQUARE_SHOPPING_CENTRE,
  NORTHGATE_SHOPPING_CENTRE,
  FOURWAYS_SHOPPING_CENTRE,
];

export const BEL_AIR_USER_COORDS: SpatialCoordinates = {
  latitude: -26.05941834252426,
  longitude: 27.95827226170294,
  accuracy: 3.5,
};

// Cape Town Mall / City Center Reference Origin
export const DEFAULT_USER_COORDS: SpatialCoordinates = {
  latitude: -26.05941834252426,
  longitude: 27.95827226170294,
  accuracy: 3.5,
};

/**
 * Checks whether given coordinates are within the Bel Air Shopping Centre geofence
 */
export function checkIsAtBelAir(
  lat: number,
  lon: number,
): { isAtBelAir: boolean; distanceMeters: number } {
  const distanceMeters = getDistanceInMeters(
    lat,
    lon,
    BEL_AIR_SHOPPING_CENTRE.latitude,
    BEL_AIR_SHOPPING_CENTRE.longitude,
  );
  return {
    isAtBelAir: distanceMeters <= BEL_AIR_SHOPPING_CENTRE.radiusMeters,
    distanceMeters,
  };
}

/**
 * Checks whether given coordinates are within a specific shopping mall geofence
 */
export function checkIsAtMallLocation(
  mall: { latitude: number; longitude: number; radiusMeters: number },
  lat: number,
  lon: number,
): { isInside: boolean; distanceMeters: number } {
  const distanceMeters = getDistanceInMeters(lat, lon, mall.latitude, mall.longitude);
  return {
    isInside: distanceMeters <= mall.radiusMeters,
    distanceMeters,
  };
}

/**
 * Calculates physical distance in meters between two GPS coordinates using Haversine formula
 */
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates initial target bearing in degrees (0° - 360° True North) from origin to target
 */
export function getBearingAngle(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = (θ * 180) / Math.PI;

  return Math.round((bearing + 360) % 360);
}

/**
 * Computes shortest angular distance between user device heading and target bearing (-180° to +180°)
 */
export function getAngleDifference(heading: number, bearing: number): number {
  let diff = ((bearing - heading + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * Checks if target is within the user's facing cone (e.g. ±35° cone of sight)
 */
export function isFacingTarget(heading: number, bearing: number, coneThreshold = 35): boolean {
  const diff = Math.abs(getAngleDifference(heading, bearing));
  return diff <= coneThreshold;
}

/**
 * Converts degree heading to cardinal name (e.g. N, NNE, E, SSW)
 */
export function formatCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return `${directions[index]} ${Math.round(normalized)}°`;
}

/**
 * Capacitor bridge detection & helper
 */
export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (
      window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
    )?.Capacitor?.isNativePlatform?.(),
  );
}
