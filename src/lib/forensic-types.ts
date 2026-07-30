export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';

export interface IPGeolocation {
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
}

export interface ImpossibleTravelSignal {
  detected: boolean;
  previousLocation: string;
  currentLocation: string;
  distanceKm: number;
  timeDeltaMinutes: number;
  requiredVelocityKph: number;
}

export interface VelocityMetric {
  windowMinutes: number;
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
  velocityZScore: number;
}

export interface TemporalAnomalySignal {
  isAnomaly: boolean;
  localHour: number;
  expectedRange: string;
  confidenceScore: number;
}

export interface CrossChainLink {
  linkedAddress: string;
  network: string;
  confidence: number;
  reason: 'SHARED_IP' | 'SAME_FINGERPRINT' | 'SEQUENTIAL_TX';
}

export interface BehavioralBiometricSignal {
  keystrokeDynamicsScore: number;
  mouseTrajectoryEntropy: number;
  scrollPatternConsistency: number;
  isBotLikely: boolean;
}

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  canvasHash: string;
  webGLRenderer: string;
}

export interface KernelForensics {
  isVirtualMachine: boolean;
  isDebuggerPresent: boolean;
  syscallHookingDetected: boolean;
  integrityHash: string;
  osBuild: string;
}

export interface PeerNetworkAnalysis {
  proximityScore: number;
  peerCount: number;
  isExitNode: boolean;
  networkCongestion: number;
}

export interface SessionReplaySignal {
  detected: boolean;
  replayLikelihood: number;
  eventSequenceAnomaly: boolean;
  recordingBufferDetected: boolean;
}

export interface ASNReputation {
  asn: number;
  name: string;
  type: 'ISP' | 'Business' | 'Hosting' | 'Proxy' | 'Wireless' | 'Unknown';
  abuseScore: number;
}

export interface ForensicIntelligence {
  geolocation: IPGeolocation;
  asnReputation?: ASNReputation;
  impossibleTravel?: ImpossibleTravelSignal;
  velocityMetrics: VelocityMetric;
  temporalAnomaly?: TemporalAnomalySignal;
  fingerprintEntropy: number;
  behavioralBiometricSignature: string;
  behavioralBiometrics?: BehavioralBiometricSignal;
  deviceFingerprint?: DeviceFingerprint;
  crossChainLinks?: CrossChainLink[];
  sessionReplay?: SessionReplaySignal;
  kernelForensics?: KernelForensics;
  peerAnalysis?: PeerNetworkAnalysis;
}
