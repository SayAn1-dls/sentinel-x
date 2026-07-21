import { Transaction, BiometricSignal, RiskLevel, EntityType, TransactionStatus } from './types';

const SENDERS = [
  'Kinexys Treasury Ops', 'Goldman Sachs Int\'l', 'Morgan Stanley FX Desk',
  'BlackRock Aladdin', 'Citadel Securities', 'Bridgewater Associates',
  'Two Sigma Investments', 'Renaissance Technologies', 'DE Shaw & Co',
  'Point72 Asset Mgmt', 'AQR Capital', 'Jane Street Capital',
  'Virtu Financial', 'Susquehanna Int\'l', 'Jump Trading LLC',
  'DRW Holdings', 'IMC Trading', 'Flow Traders',
  'Optiver BV', 'Tower Research Capital'
];

const RECEIVERS = [
  'JPM London Clearing', 'HSBC Hong Kong', 'Deutsche Bank AG',
  'Barclays Capital', 'BNP Paribas SA', 'UBS Group AG',
  'Credit Suisse Int\'l', 'Nomura Holdings', 'Standard Chartered',
  'Citigroup Global', 'Bank of America', 'Wells Fargo Securities',
  'RBC Capital Markets', 'TD Securities', 'Mizuho Securities',
  'MUFG Bank Ltd', 'Société Générale', 'Commerzbank AG',
  'ANZ Banking Group', 'Macquarie Group'
];

const CORRIDORS = [
  'USD → EUR', 'USD → GBP', 'USD → JPY', 'EUR → USD', 'GBP → USD',
  'USD → CHF', 'EUR → GBP', 'USD → SGD', 'USD → HKD', 'EUR → JPY',
  'GBP → EUR', 'USD → AUD', 'USD → CAD', 'CHF → EUR', 'SGD → USD'
];

const NETWORKS = ['Kinexys Mainnet', 'SWIFT gpi', 'FedNow', 'TARGET2', 'CHAPS'];

const MEMOS = [
  'FX Spot Settlement T+1', 'Cross-border repo unwind', 'Margin call settlement',
  'Collateral transfer - CSA', 'Bond coupon payment', 'Dividend repatriation',
  'Trade finance LC', 'Intraday liquidity sweep', 'Nostro reconciliation',
  'CLS settlement leg', 'Prime brokerage margin', 'Securities lending return',
  'OTC derivative settlement', 'Structured product payoff', 'Syndicated loan drawdown'
];

const FLAGS_POOL = [
  'Temporal anomaly detected', 'Keystroke pattern irregular', 'Session replay suspected',
  'Velocity breach (3σ)', 'Geolocation mismatch', 'Device fingerprint novel',
  'Behavioral drift detected', 'API latency anomalous', 'TLS cert mismatch',
  'Browser automation markers', 'Clipboard injection detected', 'WebGL fingerprint spoofed',
  'Canvas hash anomaly', 'Mouse movement linear', 'Typing cadence robotic',
  'IP reputation critical', 'ASN change mid-session', 'Cookie jar tampering'
];

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBiometrics(isSynthetic: boolean): BiometricSignal {
  if (isSynthetic) {
    return {
      keystrokeCadence: randomFloat(0.1, 3.5),
      temporalJitter: randomFloat(0.01, 1.2),
      biometricLiveness: randomFloat(0.05, 0.45),
      mouseEntropy: randomFloat(0.1, 2.0),
      sessionFingerprint: `SYN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      ipReputation: randomFloat(5, 35),
      deviceTrust: randomFloat(8, 30),
      behavioralScore: randomFloat(5, 35),
    };
  }
  return {
    keystrokeCadence: randomFloat(65, 98),
    temporalJitter: randomFloat(12, 45),
    biometricLiveness: randomFloat(0.82, 0.99),
    mouseEntropy: randomFloat(55, 95),
    sessionFingerprint: `HUM-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
    ipReputation: randomFloat(70, 99),
    deviceTrust: randomFloat(75, 98),
    behavioralScore: randomFloat(72, 99),
  };
}

function determineRisk(entityType: EntityType, biometrics: BiometricSignal): RiskLevel {
  if (entityType === 'Synthetic AI') {
    if (biometrics.behavioralScore < 15) return 'CRITICAL';
    if (biometrics.behavioralScore < 25) return 'HIGH';
    return 'MEDIUM';
  }
  if (biometrics.behavioralScore > 90) return 'CLEAR';
  if (biometrics.behavioralScore > 80) return 'LOW';
  return 'MEDIUM';
}

function determineStatus(riskLevel: RiskLevel): TransactionStatus {
  switch (riskLevel) {
    case 'CRITICAL': return 'BLOCKED';
    case 'HIGH': return 'FLAGGED';
    case 'MEDIUM': return 'UNDER_REVIEW';
    default: return 'VERIFIED';
  }
}

function generateFlags(entityType: EntityType): string[] {
  if (entityType === 'Human') return [];
  const count = randomInt(2, 5);
  const shuffled = [...FLAGS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateTransaction(): Transaction {
  const isSynthetic = Math.random() < 0.35;
  const entityType: EntityType = isSynthetic ? 'Synthetic AI' : 'Human';
  const biometrics = generateBiometrics(isSynthetic);
  const riskLevel = determineRisk(entityType, biometrics);
  const status = determineStatus(riskLevel);
  const confidence = entityType === 'Synthetic AI'
    ? randomFloat(78, 99.5)
    : randomFloat(85, 99.9);

  const now = new Date();
  now.setSeconds(now.getSeconds() - randomInt(0, 300));

  return {
    id: `KNX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    timestamp: now.toISOString(),
    sender: pick(SENDERS),
    senderAccount: `${pick(['IBAN', 'SWIFT'])}:${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
    receiver: pick(RECEIVERS),
    receiverAccount: `${pick(['IBAN', 'SWIFT'])}:${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
    amount: isSynthetic
      ? randomFloat(5000000, 250000000)
      : randomFloat(100000, 50000000),
    currency: 'USD',
    corridor: pick(CORRIDORS),
    entityType,
    riskLevel,
    status,
    confidence,
    biometrics,
    flags: generateFlags(entityType),
    network: pick(NETWORKS),
    settlementTime: `${randomInt(1, 45)}ms`,
    memo: pick(MEMOS),
  };
}

export function generateInitialTransactions(count: number = 25): Transaction[] {
  return Array.from({ length: count }, () => generateTransaction())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
