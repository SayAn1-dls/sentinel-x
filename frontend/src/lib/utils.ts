import { ThreatLevel, Transaction, AuditLog } from './types';
import { RISK_THRESHOLDS, THREAT_COLORS } from './constants';

export function getRiskLevel(score: number): ThreatLevel {
  if (score >= RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (score >= RISK_THRESHOLDS.LOW) return 'LOW';
  return 'CLEAR';
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts));
}

export function generateId(): string {
  return `SX-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export function maskSensitive(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
}

export function calculateThreatIndex(transactions: Transaction[]): number {
  if (!transactions.length) return 0;
  const flagged = transactions.filter(t => t.threatLevel === 'CRITICAL' || t.threatLevel === 'HIGH').length;
  return Math.round((flagged / transactions.length) * 100);
}

export function groupByDate(logs: AuditLog[]): Record<string, AuditLog[]> {
  return logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>);
}

export function getThreatColor(level: ThreatLevel): string {
  return THREAT_COLORS[level];
}

export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, ms: number): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
