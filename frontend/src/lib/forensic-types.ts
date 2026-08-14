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
  heapSprayDetected: boolean;
  stackCanaryCorrupted: boolean;
  aslrDisabled: boolean;
  codeInjectionDetected: boolean;
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

export interface SecureEnclaveForensics {
  isEnclaveActive: boolean;
  enclaveType: 'Apple_SEP' | 'Intel_SGX' | 'ARM_TrustZone' | 'None';
  attestationTokenPresent: boolean;
  keyIsolationVerified: boolean;
  memoryEncryptionActive: boolean;
  tamperResistanceScore: number;
}

export interface AIAgentDetectionSignal {
  isAIAgent: boolean;
  promptInjectionRisk: number;
  responseSyntacticEntropy: number;
  reasoningChainDetected: boolean;
  agentSignature: string;
}

export interface SmartContractForensics {
  interactionCount: number;
  knownDrainersContacted: boolean;
  mixerUsageDetected: boolean;
  unverifiedContractRatio: number;
  lastContractAddress: string;
}

export interface BrowserIntegritySignal {
  isAutomationDetected: boolean;
  webdriverPresent: boolean;
  inconsistentPermissions: boolean;
  cdcPropsPresent: boolean;
  chromeObjectMissing: boolean;
  automationScore: number;
}

export interface DarkWebExposure {
  isExposed: boolean;
  breachCount: number;
  lastExposureDate?: string;
  exposureSource?: string;
  riskRating: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface NetworkPacketAnalysis {
  tcpWindowSize: number;
  ttlValue: number;
  isNmapScanDetected: boolean;
  isMitmLikely: boolean;
  packetInterArrivalTimeJitter: number;
}

export interface CloudInfrastructureSignal {
  provider: 'AWS' | 'GCP' | 'Azure' | 'DigitalOcean' | 'Oracle' | 'None';
  instanceType?: string;
  region?: string;
  isKnownTorRelay: boolean;
  datacenterRiskScore: number;
}

export interface DNSIntegritySignal {
  dnsServer: string;
  isPublicResolver: boolean;
  dnsLatencyMs: number;
  isHijackedLikely: boolean;
  resolvedIpMatchesExpected: boolean;
}

export interface CrossChainForensics {
  linkedWallets: string[];
  bridgeProtocols: string[];
  crossChainVelocity: number;
  hopCount: number;
  isMixerAssociated: boolean;
}

export interface SteganographyAnalysis {
  detected: boolean;
  carrierType: 'IMAGE' | 'AUDIO' | 'DOCUMENT' | 'NETWORK_PACKET';
  hiddenPayloadSize?: number;
  encryptionDetected: boolean;
  stegoToolSignature?: string;
  leakLikelihood: number;
}

export interface HIDForensics {
  isKeystrokeInjectionDetected: boolean;
  reportingRateAnomaly: boolean;
  pollingRateHz: number;
  isRubberDuckySignaturePresent: boolean;
  syntheticEventRatio: number;
}

export interface ZKPForensics {
  proofSystem: 'Groth16' | 'Plonk' | 'STARK' | 'Bulletproofs';
  isSoundnessRiskDetected: boolean;
  trustedSetupHash?: string;
  verificationLatencyMs: number;
  isInvalidProof: boolean;
}

export interface OpticalAirGapForensics {
  screenBrightnessAnomalies: boolean;
  highFrequencyFlickerDetected: boolean;
  qrRapidExfiltrationLikely: boolean;
  visualSteganographyConfidence: number;
}

export interface ForensicIntelligence {
  zkpForensics?: ZKPForensics;
  opticalAirGapForensics?: OpticalAirGapForensics;
  hidForensics?: HIDForensics;
  crossChainForensics?: CrossChainForensics;
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
  secureEnclave?: SecureEnclaveForensics;
  browserIntegrity?: BrowserIntegritySignal;
  aiAgentDetection?: AIAgentDetectionSignal;
  smartContractForensics?: SmartContractForensics;
  darkWebExposure?: DarkWebExposure;
  networkPacketAnalysis?: NetworkPacketAnalysis;
  cloudInfrastructure?: CloudInfrastructureSignal;
  dnsIntegrity?: DNSIntegritySignal;
  steganography?: SteganographyAnalysis;
}
