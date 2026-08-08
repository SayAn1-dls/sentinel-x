import { ThreatLevel } from './types';

export const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: '#FF0033',
  HIGH: '#FF6B00',
  MEDIUM: '#FFD700',
  LOW: '#00FF88',
  CLEAR: '#00CFFF',
};

export const THREAT_BG: Record<ThreatLevel, string> = {
  CRITICAL: 'rgba(255,0,51,0.15)',
  HIGH: 'rgba(255,107,0,0.15)',
  MEDIUM: 'rgba(255,215,0,0.15)',
  LOW: 'rgba(0,255,136,0.15)',
  CLEAR: 'rgba(0,207,255,0.15)',
};

export const RISK_THRESHOLDS = {
  CRITICAL: 90,
  HIGH: 70,
  MEDIUM: 45,
  LOW: 20,
} as const;

export const PLATFORM_NAME = 'SENTINEL-X';
export const PLATFORM_VERSION = '4.0.0';
export const PLATFORM_CODENAME = 'FORENSIC GUARD';
export const PLATFORM_BUILD = `${PLATFORM_NAME}-${PLATFORM_VERSION}-BUILD-${Date.now().toString(36).toUpperCase()}`;

export const API_ENDPOINTS = {
  TRANSACTIONS: '/api/transactions',
  AUDIT: '/api/audit',
  NETWORK: '/api/network',
  SCAN: '/api/scan',
  ALERTS: '/api/alerts',
} as const;

export const REFRESH_INTERVAL = 3000;
export const MAX_AUDIT_RECORDS = 10000;
export const SCAN_TIMEOUT_MS = 30000;

export const ENCRYPTION_LEVELS = {
  AES_256: 256,
  AES_128: 128,
  RSA_4096: 4096,
} as const;

export const STATUS_LABELS = {
  FLAGGED: 'FLAGGED',
  CLEAN: 'CLEAN',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
} as const;

export const KNOWN_ENTITIES = {
  SUSPICIOUS: ['GHOST-WALLET', 'DARK-POOL', 'SHADOW-FUND', 'ANON-VAULT'],
  CLEAN: ['ALPHA-CORP', 'NEXUS-LLC', 'SIGMA-FUND', 'LEDGER-X'],
} as const;

export const SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'DASHBOARD', icon: '⚡' },
  { href: '/audit', label: 'AUDIT LOG', icon: '📋' },
  { href: '/network', label: 'NETWORK', icon: '🔒' },
  { href: '/analysis', label: 'AI LAB', icon: '🧠' },
] as const;
