export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';
export type TransactionStatus = 'FLAGGED' | 'CLEAN' | 'PENDING' | 'BLOCKED';
export type NetworkProtocol = 'TLS_1_3' | 'TLS_1_2' | 'ENCRYPTED' | 'PLAIN';

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  currency: string;
  sender: string;
  receiver: string;
  status: TransactionStatus;
  threatLevel: ThreatLevel;
  riskScore: number;
  flags: string[];
  metadata: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  action: string;
  actor: string;
  target: string;
  severity: ThreatLevel;
  details: string;
  ipAddress: string;
  sessionId: string;
}

export interface ThreatAlert {
  id: string;
  timestamp: number;
  level: ThreatLevel;
  message: string;
  source: string;
  resolved: boolean;
  transactionId?: string;
}

export interface NetworkGateway {
  id: string;
  name: string;
  protocol: NetworkProtocol;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  latency: number;
  encryptionBits: number;
  lastChecked: number;
}

export interface ForensicScan {
  id: string;
  timestamp: number;
  target: string;
  status: 'RUNNING' | 'COMPLETE' | 'FAILED';
  threatLevel: ThreatLevel;
  findings: ScanFinding[];
  confidence: number;
}

export interface ScanFinding {
  id: string;
  type: string;
  description: string;
  severity: ThreatLevel;
  evidence: string[];
}

export interface DashboardStats {
  totalTransactions: number;
  flaggedToday: number;
  blockedThreats: number;
  activeScans: number;
  networkHealth: number;
  threatIndex: number;
}
