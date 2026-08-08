import { Transaction, TransactionStatus } from '../types';
import { generateId, getRiskLevel } from '../utils';

const SENDERS = ['ALPHA-CORP', 'NEXUS-LLC', 'DARK-POOL-7', 'GHOST-WALLET', 'SIGMA-FUND', 'OMEGA-TRUST', 'HELIX-CAPITAL', 'VANTA-HOLDINGS'];
const RECEIVERS = ['CAYMAN-VAULT', 'SWISS-RESERVE', 'PANTERA-PRIME', 'LEDGER-X', 'COLD-STORAGE-9', 'MERIDIAN-BANK', 'ATLAS-CLEARING'];
const HIGH_RISK_ENTITIES = ['DARK-POOL-7', 'GHOST-WALLET', 'ANON-VAULT', 'SHADOW-FUND'];
const OFFSHORE = ['CAYMAN-VAULT', 'SWISS-RESERVE', 'PANTERA-PRIME'];
const CURRENCIES = ['USD', 'EUR', 'BTC', 'ETH', 'GBP'];
const CHANNELS = ['WIRE', 'SWIFT', 'CHAIN', 'ACH'];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function generateTransaction(overrides?: Partial<Transaction>): Transaction {
  const sender = pick(SENDERS);
  const receiver = pick(RECEIVERS);
  const roll = Math.random();
  const amount =
    roll < 0.2 ? rand(8000, 9999)
    : roll < 0.5 ? rand(1000, 80000)
    : roll < 0.85 ? rand(80000, 900000)
    : rand(900000, 9000000);

  const flags: string[] = [];
  let score = rand(5, 25);
  if (amount >= 8000 && amount < 10000) { flags.push('STRUCTURING'); score += 25; }
  if (amount >= 1000000) { flags.push('HIGH_VALUE'); score += 15; }
  if (HIGH_RISK_ENTITIES.includes(sender)) { flags.push('HIGH_RISK_ENTITY'); score += 30; }
  if (OFFSHORE.includes(receiver)) { flags.push('OFFSHORE_DESTINATION'); score += 12; }
  if (Math.random() < 0.1) { flags.push('VELOCITY_BREACH'); score += 20; }
  if (Math.random() < 0.08) { flags.push('GEO_ANOMALY'); score += 15; }
  if (Math.random() < 0.05) { flags.push('PATTERN_MATCH'); score += 18; }

  const riskScore = Math.min(100, score);
  const status: TransactionStatus =
    riskScore >= 90 ? 'BLOCKED' : riskScore >= 70 ? 'FLAGGED' : riskScore >= 45 ? 'PENDING' : 'CLEAN';

  return {
    id: generateId(),
    timestamp: Date.now(),
    amount,
    currency: pick(CURRENCIES),
    sender,
    receiver,
    status,
    threatLevel: getRiskLevel(riskScore),
    riskScore,
    flags,
    metadata: {
      region: OFFSHORE.includes(receiver) ? 'OFFSHORE' : 'DOMESTIC',
      channel: pick(CHANNELS),
      encrypted: true,
    },
    ...overrides,
  };
}
