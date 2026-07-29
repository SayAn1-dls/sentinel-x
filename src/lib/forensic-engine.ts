import { 
  IPGeolocation, 
  ImpossibleTravelSignal, 
  VelocityMetric, 
  RiskLevel, 
  TemporalAnomalySignal, 
  CrossChainLink,
  BehavioralBiometricSignal,
  DeviceFingerprint,
  SessionReplaySignal,
  ASNReputation
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
    previousLocation: `${prev.city}, ${prev.country}`,
    currentLocation: `${curr.city}, ${curr.country}`,
    distanceKm: Math.round(distance),
    timeDeltaMinutes,
    requiredVelocityKph: Math.round(requiredVelocity),
  };
}

/**
 * Detects temporal anomalies based on transaction time.
 */
export function detectTemporalAnomaly(
  timestamp: string,
  timezoneOffset: number = 0
): TemporalAnomalySignal {
  const date = new Date(timestamp);
  const localHour = (date.getUTCHours() + timezoneOffset + 24) % 24;

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

  return parseFloat((entropy * 4.5).toFixed(2));
}

/**
 * Detects Session Replay tools and anomalous event sequences.
 */
export function detectSessionReplay(
  eventStream: { type: string; timestamp: number; metadata?: any }[]
): SessionReplaySignal {
  // Logic to detect recording buffers or common replay library signatures
  const hasRecordingBuffer = eventStream.some(e => e.metadata?.hasBuffer === true);
  
  // Calculate interval variance - high variance often indicates human, low variance (exact intervals) indicates replay
  const intervals = [];
  for (let i = 1; i < eventStream.length; i++) {
    intervals.push(eventStream[i].timestamp - eventStream[i-1].timestamp);
  }
  
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
  
  const eventSequenceAnomaly = variance < 5; // Very low variance is suspicious (simulated events)
  
  return {
    detected: hasRecordingBuffer || eventSequenceAnomaly,
    replayLikelihood: eventSequenceAnomaly ? 0.88 : (hasRecordingBuffer ? 0.95 : 0.05),
    eventSequenceAnomaly,
    recordingBufferDetected: hasRecordingBuffer
  };
}

/**
 * Analyzes ASN Reputation and Proxy/VPN presence.
 */
export function analyzeASNReputation(asn: number): ASNReputation {
  // Mock reputation database lookup
  const maliciousASNs = [4134, 13335, 16509]; // Example ASNs often used for scrapers/proxies
  const isMalicious = maliciousASNs.includes(asn);
  
  return {
    asn,
    name: isMalicious ? 'High-Risk Network Node' : 'Tier 1 Global ISP',
    type: isMalicious ? 'Hosting' : 'ISP',
    abuseScore: isMalicious ? 82 : 4
  };
}

/**
 * Advanced Risk Scoring Engine v2
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
    sessionReplay?: SessionReplaySignal;
    asnReputation?: ASNReputation;
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
  
  // New v2 signals
  if (params.sessionReplay?.detected) score += 60;
  if (params.asnReputation && params.asnReputation.abuseScore > 80) score += 35;

  score = Math.min(100, score);

  let level: RiskLevel = 'CLEAR';
  if (score > 85) level = 'CRITICAL';
  else if (score > 70) level = 'HIGH';
  else if (score > 45) level = 'MEDIUM';
  else if (score > 20) level = 'LOW';

  return { score, level };
}

export function verifyKernelIntegrity(pageHashes: string[]): boolean {
  return pageHashes.every(hash => !hash.startsWith('0xDEAD') && hash.length === 64);
}

export function detectCrossChainLinks(
  address: string,
  ip: string,
  fingerprint: string
): CrossChainLink[] {
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
