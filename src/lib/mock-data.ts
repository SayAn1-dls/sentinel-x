import { Transaction, AuditLog, ThreatAlert, NetworkGateway, ForensicScan } from './types';
import { generateId, getRiskLevel } from './utils';

const SENDERS = ['ALPHA-CORP', 'NEXUS-LLC', 'DARK-POOL-7', 'GHOST-WALLET', 'SIGMA-FUND', 'OMEGA-TRUST'];
const RECEIVERS = ['CAYMAN-VAULT', 'SWISS-RESERVE', 'PANTERA-PRIME', 'LEDGER-X', 'COLD-STORAGE-9'];

export function generateMockTransaction(overrides?: Partial<Transaction>): Transaction {
  const riskScore = Math.floor(Math.random() * 100);
  return {
    id: generateId(),
    timestamp: Date.now() - Math.floor(Math.random() * 86400000),
    amount: Math.floor(Math.random() * 9000000) + 1000,
    currency: ['USD', 'EUR', 'BTC', 'ETH'][Math.floor(Math.random() * 4)],
    sender: SENDERS[Math.floor(Math.random() * SENDERS.length)],
    receiver: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
    status: riskScore > 80 ? 'BLOCKED' : riskScore > 60 ? 'FLAGGED' : riskScore > 40 ? 'PENDING' : 'CLEAN',
    threatLevel: getRiskLevel(riskScore),
    riskScore,
    flags: riskScore > 70 ? ['VELOCITY_BREACH', 'GEO_ANOMALY'] : riskScore > 50 ? ['PATTERN_MATCH'] : [],
    metadata: { region: 'OFFSHORE', channel: 'WIRE', encrypted: true },
    ...overrides,
  };
}

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 50 }, () => generateMockTransaction());

export const MOCK_AUDIT_LOGS: AuditLog[] = Array.from({ length: 100 }, (_, i) => ({
  id: generateId(),
  timestamp: Date.now() - i * 3600000,
  action: ['LOGIN', 'SCAN_INIT', 'FLAG_TRANSACTION', 'BLOCK_GATEWAY', 'EXPORT_REPORT'][i % 5],
  actor: `AGENT-${String(i % 10 + 1).padStart(3, '0')}`,
  target: `TX-${generateId()}`,
  severity: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'] as const)[i % 5],
  details: `Forensic trace event #${i + 1} recorded`,
  ipAddress: `10.${i % 255}.${(i * 3) % 255}.${(i * 7) % 255}`,
  sessionId: generateId(),
}));

export const MOCK_ALERTS: ThreatAlert[] = [
  { id: generateId(), timestamp: Date.now() - 300000, level: 'CRITICAL', message: 'Velocity breach detected on TX-ALPHA-7', source: 'ENGINE_V4', resolved: false },
  { id: generateId(), timestamp: Date.now() - 900000, level: 'HIGH', message: 'Geographic anomaly: 14 countries in 2 hours', source: 'GEO_MODULE', resolved: false },
  { id: generateId(), timestamp: Date.now() - 1800000, level: 'MEDIUM', message: 'Pattern match on known laundering signature', source: 'AI_SCANNER', resolved: true },
];

export const MOCK_GATEWAYS: NetworkGateway[] = [
  { id: 'GW-001', name: 'PRIMARY-VAULT', protocol: 'TLS_1_3', status: 'ONLINE', latency: 12, encryptionBits: 256, lastChecked: Date.now() },
  { id: 'GW-002', name: 'BACKUP-NODE', protocol: 'TLS_1_2', status: 'ONLINE', latency: 34, encryptionBits: 256, lastChecked: Date.now() },
  { id: 'GW-003', name: 'OFFSHORE-RELAY', protocol: 'ENCRYPTED', status: 'DEGRADED', latency: 189, encryptionBits: 128, lastChecked: Date.now() - 60000 },
];

export const MOCK_SCANS: ForensicScan[] = [
  {
    id: generateId(),
    timestamp: Date.now() - 600000,
    target: 'DARK-POOL-7',
    status: 'COMPLETE',
    threatLevel: 'HIGH',
    confidence: 92,
    findings: [
      { id: generateId(), type: 'LAYERING', description: 'Complex transaction layering detected', severity: 'HIGH', evidence: ['TX-001', 'TX-007', 'TX-023'] },
      { id: generateId(), type: 'STRUCTURING', description: 'Structured deposits below reporting threshold', severity: 'MEDIUM', evidence: ['TX-041', 'TX-045'] },
    ],
  },
];
