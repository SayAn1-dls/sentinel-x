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

export interface ZKPForensics {
  proofType: 'Groth16' | 'Plonk' | 'Halo2' | 'STARK';
  circuitComplexity: number;
  verificationTimeMs: number;
  isProofValid: boolean;
  isTrustedSetupRequired: boolean;
  setupIntegrityVerified: boolean;
  isSoundnessRiskDetected: boolean;
}

export interface MemorySwapForensics {
  isSwapEnabled: boolean;
  swapEncrypted: boolean;
  sensitiveDataInSwap: boolean;
  swapUsagePercentage: number;
  unauthorizedAccessDetected: boolean;
}

export interface TLSFingerprintSignal {
  ja3Hash: string;
  ja3sHash: string;
  isCommonBrowser: boolean;
  isKnownBot: boolean;
  isSuspiciousMatch: boolean;
}

export interface BGPRouteLeakSignal {
  isLeaked: boolean;
  originASN: number;
  detectedPath: number[];
  expectedPath: number[];
  leakSeverity: number;
}

export interface HardwareSupplyChainSignal {
  isCompromised: boolean;
  tamperEvidentSealBroken: boolean;
  unexpectedPeripheralFound: boolean;
  firmwareVersionMismatch: boolean;
  factoryAttestationValid: boolean;
  riskScore: number;
}

export interface PeripheralBusForensics {
  dmaAttackDetected: boolean;
  untrustedPCIeDeviceFound: boolean;
  thunderboltSecurityLevel: 'NONE' | 'USER' | 'SECURE' | 'DP_ONLY';
  iommuEnabled: boolean;
  unauthorizedMemoryAccessAttempts: number;
}


export interface SyntheticIdentitySignal {
  isSynthetic: boolean;
  identityAgeDays: number;
  socialValidationScore: number;
  isHighRiskClusterMember: boolean;
  activityConsistencyScore: number;
}

export interface LinguisticForensics {
  syntacticComplexity: number;
  punctuationEntropy: number;
  sentimentVolatility: number;
  vocabularyBreadth: number;
  isSocialEngineeringLikely: boolean;
}

export interface ISAAttestationForensics {
  isHardwareAESSupported: boolean;
  isSHANISupported: boolean;
  isRDRANDIntegrityVerified: boolean;
  instructionEmulationDetected: boolean;
  spectreMitigationActive: boolean;
  meltdownMitigationActive: boolean;
  isaLevelSecurityScore: number;
}

export interface OpticalAirGapForensics {
  highFrequencyFlickerDetected: boolean;
  qrRapidExfiltrationDetected: boolean;
  visualSteganographyFound: boolean;
  screenCaptureActivity: boolean;
  leakConfidence: number;
}

export interface ForensicIntelligence {
  isaAttestation?: ISAAttestationForensics;
  linguisticForensics?: LinguisticForensics;
  syntheticIdentity?: SyntheticIdentitySignal;
  hardwareSupplyChain?: HardwareSupplyChainSignal;
  bgpRouteLeak?: BGPRouteLeakSignal;
  peripheralBus?: PeripheralBusForensics;
  memorySwap?: MemorySwapForensics;
  hidForensics?: HIDForensics;
  zkpForensics?: ZKPForensics;
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
  quantumForensics?: QuantumForensics;
  sideChannelForensics?: SideChannelForensics;
  tlsFingerprint?: TLSFingerprintSignal;
  opticalAirGap?: OpticalAirGapForensics;
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
  suspiciousHIDDeviceDetected: boolean;
  keystrokeTimingAnomaly: boolean;
  pollingRateHertz: number;
  isVirtualKeyboard: boolean;
  unrecognizedVendorId: boolean;
  hidReportDescriptorIntegrity: boolean;
}

export interface QuantumForensics {
  isQuantumResistant: boolean;
  signatureAlgorithm: 'ECDSA' | 'Ed25519' | 'Dilithium' | 'Falcon' | 'SPHINCS+';
  shorsAlgorithmVulnerability: number;
  isGroverAttackResistant: boolean;
  keySizeBits: number;
}

export interface SideChannelForensics {
  timingVarianceDetected: boolean;
  operationType: 'CRYPTOGRAPHIC_VERIFICATION' | 'MEMORY_ACCESS' | 'NETWORK_RESPONSE';
  observedLatencyMs: number;
  expectedLatencyMs: number;
  varianceScore: number;
  isHighRisk: boolean;
}
