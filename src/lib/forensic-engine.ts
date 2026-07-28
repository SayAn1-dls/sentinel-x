import { 
  IPGeolocation, 
  ImpossibleTravelSignal, 
  VelocityMetric, 
  RiskLevel, 
  TemporalAnomalySignal, 
  CrossChainLink,
  BehavioralBiometricSignal,
  DeviceFingerprint
} from './forensic-types';

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
    previousLocation: `\${prev.city}, \${prev.country}`,
    currentLocation: `\${curr.city}, \${curr.country}`,
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
 * Calculates Shannon Entropy for a device fingerprint.
 * Higher entropy indicates a more unique (and potentially suspicious) device configuration.
 */
export function calculateFingerprintEntropy(fingerprint: DeviceFingerprint): number {
  const values = Object.values(fingerprint).map(String);
  const totalLength = values.join('').length;
  if (totalLength === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (const val of values) {
    frequencies[val] = (frequencies[val] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const p = count / values.length;
    entropy -= p * Math.log2(p);
  }

  // Normalize and scale to a typical fingerprint entropy range (e.g., 10-25 bits)
  return parseFloat((entropy * 4.5).toFixed(2));
}

/**
 * Analyzes behavioral biometrics to detect bots or non-human patterns.
 */
export function analyzeBehavioralBiometrics(
  events: { type: string; timestamp: number }[]
): BehavioralBiometricSignal {
  // Mock analysis logic for keystroke and mouse jitter
  const mouseEvents = events.filter(e => e.type === 'mousemove');
  const keyEvents = events.filter(e => e.type === 'keydown');

  // Bots often have zero jitter or perfectly linear trajectories
  const mouseTrajectoryEntropy = mouseEvents.length > 20 ? 0.82 : 0.15;
  const keystrokeDynamicsScore = keyEvents.length > 5 ? 0.91 : 0.22;

  return {
    keystrokeDynamicsScore,
    mouseTrajectoryEntropy,
    scrollPatternConsistency: 0.88,
    isBotLikely: mouseTrajectoryEntropy < 0.3 && keyEvents.length > 0
  };
}

/**
 * Analyzes transaction velocity to detect rapid-fire laundering patterns.
 */
export function analyzeTransactionVelocity(
  transactions: { amount: number; timestamp: number }[],
  windowMinutes: number = 60
): VelocityMetric {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const recentTxs = transactions.filter(tx => now - tx.timestamp <= windowMs);

  const count = recentTxs.length;
  const total = recentTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const average = count > 0 ? total / count : 0;

  // Simple Z-Score mock: deviation from "normal" 5 transactions/hour
  const velocityZScore = count > 10 ? (count - 5) / 2 : 0.5;

  return {
    windowMinutes,
    transactionCount: count,
    totalAmount: total,
    averageAmount: average,
    velocityZScore: parseFloat(velocityZScore.toFixed(2))
  };
}

/**
 * Advanced Risk Scoring Engine
 * Incorporates multi-dimensional forensic signals.
 */
export function calculateAdvancedRiskScore(
  baseScore: number,
  params: {
    travelSignal?: ImpossibleTravelSignal;
    isProxy?: boolean;
    velocityZScore?: number;
    temporalAnomaly?: TemporalAnomalySignal;
    crossChainLinks?: CrossChainLink[];
    behavioralBiometrics?: BehavioralBiometricSignal;
    fingerprintEntropy?: number;
  }
): { score: number; level: RiskLevel } {
  let score = baseScore;

  if (params.travelSignal?.detected) score += 40;
  if (params.isProxy) score += 20;
  if (params.velocityZScore && params.velocityZScore > 3) score += 25;
  if (params.temporalAnomaly?.isAnomaly) score += 15;
  
  if (params.crossChainLinks && params.crossChainLinks.length > 0) {
    const maxConfidence = Math.max(...params.crossChainLinks.map(l => l.confidence));
    score += maxConfidence * 30;
  }

  if (params.behavioralBiometrics?.isBotLikely) score += 50;
  if (params.fingerprintEntropy && params.fingerprintEntropy > 20) score += 10;

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

/**
 * Detects cross-chain forensic links based on behavioral patterns.
 * (Heuristic-based linkage analysis)
 */
export function detectCrossChainLinks(
  address: string,
  ip: string,
  fingerprint: string
): CrossChainLink[] {
  // Mock linkage logic for demonstration
  const links: CrossChainLink[] = [];
  
  if (fingerprint.length > 5) {
    links.push({
      linkedAddress: '0x' + Math.random().toString(16).slice(2, 42),
      network: 'Ethereum Mainnet',
      confidence: 0.98,
      reason: 'SAME_FINGERPRINT'
    });
  }

  if (ip.startsWith('103.')) {
    links.push({
      linkedAddress: 'bc1q' + Math.random().toString(36).slice(2, 42),
      network: 'Bitcoin',
      confidence: 0.75,
      reason: 'SHARED_IP'
    });
  }

  return links;
}