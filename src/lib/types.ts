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
  flags: string[];
  network: string;
  settlementTime: string;
  memo: string;
}
