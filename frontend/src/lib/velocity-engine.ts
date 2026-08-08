import type { Transaction } from './types';

export interface VelocityResult {
  score: number;
  pattern: 'NORMAL' | 'SUSPICIOUS' | 'ANOMALOUS' | 'ATTACK';
  indicators: string[];
  recommendation: string;
}

export class VelocityEngine {
  private readonly windowMs: number;

  constructor(windowMs = 60_000) {
    this.windowMs = windowMs;
  }

  analyze(transactions: Transaction[], address: string): VelocityResult {
    const now = Date.now();
    const window = transactions.filter(
      (tx) =>
        (tx.sender === address || tx.receiver === address) &&
        now - new Date(tx.timestamp).getTime() < this.windowMs
    );

    const txCount = window.length;
    const totalVolume = window.reduce((sum, tx) => sum + tx.amount, 0);
    const uniqueCounterparties = new Set([
      ...window.map((tx) => tx.sender),
      ...window.map((tx) => tx.receiver),
    ]).size;
    const indicators: string[] = [];

    if (txCount > 20) indicators.push('HIGH_FREQUENCY');
    if (totalVolume > 1_000_000) indicators.push('HIGH_VOLUME');
    if (uniqueCounterparties > 15) indicators.push('FAN_OUT_DETECTED');
    if (txCount > 0 && totalVolume / txCount < 1) indicators.push('MICRO_TRANSACTIONS');

    const score = Math.min(
      (txCount / 5) * 20 +
        (totalVolume / 100_000) * 20 +
        (uniqueCounterparties / 5) * 15,
      100
    );

    let pattern: VelocityResult['pattern'] = 'NORMAL';
    if (score > 75) pattern = 'ATTACK';
    else if (score > 50) pattern = 'ANOMALOUS';
    else if (score > 25) pattern = 'SUSPICIOUS';

    return {
      score: Math.round(score),
      pattern,
      indicators,
      recommendation:
        pattern === 'ATTACK'
          ? 'IMMEDIATE BLOCK RECOMMENDED'
          : pattern === 'ANOMALOUS'
          ? 'FLAG FOR MANUAL REVIEW'
          : pattern === 'SUSPICIOUS'
          ? 'MONITOR CLOSELY'
          : 'NO ACTION REQUIRED',
    };
  }
}

export const velocityEngine = new VelocityEngine();
