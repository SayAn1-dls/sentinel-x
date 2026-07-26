import { IPGeolocation, ImpossibleTravelSignal, VelocityMetric, RiskLevel, TemporalAnomalySignal } from './forensic-types';

/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Detects impossible travel between two geolocations.
 */
export function detectImpossibleTravel(
  prev: IPGeolocation,
  curr: IPGeolocation,
  timeDeltaMinutes: number
): ImpossibleTravelSignal {
  const distance = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
  const requiredVelocity = distance / (timeDeltaMinutes / 60);

  // Consider it impossible if required velocity > 900 km/h (typical commercial flight speed)
  const detected = requiredVelocity > 900 && distance > 50;

  return {
    detected,
    previousLocation: `${prev.city}, ${prev.country}`,
    currentLocation: `${curr.city}, ${curr.country}`,
    distanceKm: Math.round(distance),
    timeDeltaMinutes,
    requiredVelocityKph: Math.round(requiredVelocity),
  };
}

/**
 * Detects temporal anomalies based on transaction time.
 * Compares current hour against "normal" business hours (9 AM - 6 PM).
 */
export function detectTemporalAnomaly(
  timestamp: string,
  timezoneOffset: number = 0
): TemporalAnomalySignal {
  const date = new Date(timestamp);
  const localHour = (date.getUTCHours() + timezoneOffset + 24) % 24;

  // Normal business hours: 09:00 to 18:00
  const isBusinessHours = localHour >= 9 && localHour <= 18;
  const isAnomaly = !isBusinessHours;

  return {
    isAnomaly,
    localHour,
    expectedRange: '09:00 - 18:00',
    confidenceScore: isAnomaly ? 0.85 : 0.95,
  };
}

/**
 * Advanced Risk Scoring Engine
 * Incorporates multi-dimensional forensic signals.
 */
export function calculateAdvancedRiskScore(
  baseScore: number,
  travelSignal?: ImpossibleTravelSignal,
  isProxy?: boolean,
  velocityZScore?: number,
  temporalAnomaly?: TemporalAnomalySignal
): { score: number; level: RiskLevel } {
  let score = baseScore;

  if (travelSignal?.detected) score += 40;
  if (isProxy) score += 20;
  if (velocityZScore && velocityZScore > 3) score += 25;
  if (temporalAnomaly?.isAnomaly) score += 15;

  score = Math.min(100, score);

  let level: RiskLevel = 'CLEAR';
  if (score > 85) level = 'CRITICAL';
  else if (score > 70) level = 'HIGH';
  else if (score > 45) level = 'MEDIUM';
  else if (score > 20) level = 'LOW';

  return { score, level };
}

/**
 * Kernel-level Memory Integrity Check (Mock Logic)
 * Simulates low-level verification of process memory.
 */
export function verifyKernelIntegrity(pageHashes: string[]): boolean {
  // Logic to verify memory pages against known good state
  return pageHashes.every(hash => !hash.startsWith('0xDEAD'));
}
