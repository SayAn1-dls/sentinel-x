import { Transaction, BiometricSignal, NetworkForensics, IdentityProof, BehavioralTelemetry, RiskLevel, EntityType, TransactionStatus } from './types';

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

const GEO_HOPS = [
  'New York, US', 'London, UK', 'Frankfurt, DE', 'Singapore, SG', 'Tokyo, JP',
  'Hong Kong, HK', 'Sydney, AU', 'Zurich, CH', 'Toronto, CA', 'Mumbai, IN',
  'São Paulo, BR', 'Dubai, AE', 'Seoul, KR', 'Amsterdam, NL', 'Paris, FR'
];

const WEBGL_RENDERERS = [
  'ANGLE (NVIDIA GeForce RTX 4090)', 'ANGLE (AMD Radeon RX 7900 XTX)',
  'ANGLE (Intel UHD Graphics 770)', 'Apple M3 Max GPU', 'ANGLE (NVIDIA A100)',
  'Mesa Intel Xe Graphics', 'SwiftShader', 'llvmpipe (LLVM 15.0.7)'
];

const SCREEN_RESOLUTIONS = [
  '3840x2160', '2560x1440', '1920x1080', '3440x1440',
  '2560x1600', '1440x900', '1366x768', '5120x2880'
];

const LANGUAGES = [
  'en-US,en;q=0.9', 'en-GB,en;q=0.9', 'ja-JP,ja;q=0.9,en;q=0.8',
  'de-DE,de;q=0.9,en;q=0.8', 'zh-CN,zh;q=0.9', 'fr-FR,fr;q=0.9,en;q=0.8',
  'ko-KR,ko;q=0.9', 'pt-BR,pt;q=0.9,en;q=0.8'
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

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
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

function generateNetworkForensics(isSynthetic: boolean): NetworkForensics {
  const hopCount = isSynthetic ? randomInt(8, 22) : randomInt(3, 8);
  const baseHops = randomInt(3, 6);
  return {
    hopCount,
    packetJitter: isSynthetic ? randomFloat(12.0, 85.0) : randomFloat(0.5, 8.0),
    latencyMs: isSynthetic ? randomFloat(180, 950) : randomFloat(2, 65),
    tlsVersion: isSynthetic ? pick(['TLS 1.0', 'TLS 1.1', 'TLS 1.2']) : 'TLS 1.3',
    asnPath: Array.from({ length: randomInt(3, 6) }, () => `AS${randomInt(1000, 65535)}`).join(' → '),
    geoHops: pickN(GEO_HOPS, baseHops),
    packetLoss: isSynthetic ? randomFloat(2.0, 15.0) : randomFloat(0, 0.5),
    mtu: isSynthetic ? pick([1400, 1420, 1460]) : 1500,
    dnsResolutionMs: isSynthetic ? randomFloat(80, 500) : randomFloat(1, 25),
    protocolStack: isSynthetic
      ? pick(['HTTP/1.1 · TCP', 'HTTP/2 · TCP (no ALPN)', 'SOCKS5 · TCP'])
      : pick(['HTTP/3 · QUIC', 'HTTP/2 · TCP · ALPN', 'gRPC · HTTP/2 · TLS 1.3']),
  };
}

function generateIdentityProof(isSynthetic: boolean): IdentityProof {
  return {
    deviceFingerprintMatch: isSynthetic ? randomFloat(5, 35) : randomFloat(85, 99.9),
    canvasHash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    webglRenderer: isSynthetic ? pick(['SwiftShader', 'llvmpipe (LLVM 15.0.7)', 'Mesa DRI Intel(R)']) : pick(WEBGL_RENDERERS),
    audioFingerprint: `AF-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
    screenResolution: pick(SCREEN_RESOLUTIONS),
    timezoneOffset: pick([-5, -4, 0, 1, 5.5, 8, 9, 10]),
    languageProfile: pick(LANGUAGES),
    pluginHash: `PH-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    fontEnumeration: isSynthetic ? randomInt(2, 12) : randomInt(45, 280),
    hardwareConcurrency: isSynthetic ? pick([1, 2]) : pick([4, 8, 12, 16, 24, 32]),
  };
}

function generateBehavioralTelemetry(isSynthetic: boolean): BehavioralTelemetry {
  if (isSynthetic) {
    return {
      keystrokeIntervalMean: randomFloat(45, 55),
      keystrokeIntervalStdDev: randomFloat(0.2, 3.0),
      keystrokeFlightTime: randomFloat(0, 5),
      keystrokeDwellTime: randomFloat(48, 52),
      mouseVelocityMean: randomFloat(800, 1200),
      mouseVelocityStdDev: randomFloat(1, 15),
      mouseAcceleration: randomFloat(0, 50),
      scrollPatternEntropy: randomFloat(0.1, 1.5),
      clickPrecision: randomFloat(95, 100),
      idleTimeRatio: randomFloat(0, 0.05),
      copyPasteFrequency: randomFloat(0.6, 0.95),
      tabSwitchCount: randomInt(0, 2),
    };
  }
  return {
    keystrokeIntervalMean: randomFloat(80, 250),
    keystrokeIntervalStdDev: randomFloat(25, 80),
    keystrokeFlightTime: randomFloat(30, 120),
    keystrokeDwellTime: randomFloat(60, 180),
    mouseVelocityMean: randomFloat(200, 600),
    mouseVelocityStdDev: randomFloat(50, 200),
    mouseAcceleration: randomFloat(100, 450),
    scrollPatternEntropy: randomFloat(4.0, 8.5),
    clickPrecision: randomFloat(60, 88),
    idleTimeRatio: randomFloat(0.15, 0.45),
    copyPasteFrequency: randomFloat(0.02, 0.15),
    tabSwitchCount: randomInt(5, 35),
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
    networkForensics: generateNetworkForensics(isSynthetic),
    identityProof: generateIdentityProof(isSynthetic),
    behavioralTelemetry: generateBehavioralTelemetry(isSynthetic),
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
