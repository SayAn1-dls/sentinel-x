export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';
export type EntityType = 'Human' | 'Synthetic AI';
export type TransactionStatus = 'FLAGGED' | 'UNDER_REVIEW' | 'VERIFIED' | 'BLOCKED';

export interface BiometricSignal {
  keystrokeCadence: number;
  temporalJitter: number;
  biometricLiveness: number;
  mouseEntropy: number;
  sessionFingerprint: string;
  ipReputation: number;
  deviceTrust: number;
  behavioralScore: number;
}

export interface NetworkForensics {
  hopCount: number;
  packetJitter: number;
  latencyMs: number;
  tlsVersion: string;
  asnPath: string;
  geoHops: string[];
  packetLoss: number;
  mtu: number;
  dnsResolutionMs: number;
  protocolStack: string;
}

export interface IdentityProof {
  deviceFingerprintMatch: number;
  canvasHash: string;
  webglRenderer: string;
  audioFingerprint: string;
  screenResolution: string;
  timezoneOffset: number;
  languageProfile: string;
  pluginHash: string;
  fontEnumeration: number;
  hardwareConcurrency: number;
}

export interface BehavioralTelemetry {
  keystrokeIntervalMean: number;
  keystrokeIntervalStdDev: number;
  keystrokeFlightTime: number;
  keystrokeDwellTime: number;
  mouseVelocityMean: number;
  mouseVelocityStdDev: number;
  mouseAcceleration: number;
  scrollPatternEntropy: number;
  clickPrecision: number;
  idleTimeRatio: number;
  copyPasteFrequency: number;
  tabSwitchCount: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  sender: string;
  senderAccount: string;
  receiver: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  corridor: string;
  entityType: EntityType;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  confidence: number;
  biometrics: BiometricSignal;
  networkForensics: NetworkForensics;
  identityProof: IdentityProof;
  behavioralTelemetry: BehavioralTelemetry;
  flags: string[];
  network: string;
  settlementTime: string;
  memo: string;
}
