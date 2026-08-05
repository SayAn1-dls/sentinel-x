import { Transaction, ThreatLevel, ScanFinding, ForensicScan } from './types';
import { generateId, getRiskLevel } from './utils';

interface VelocityWindow {
  count: number;
  totalAmount: number;
  timeWindowMs: number;
}

export class ForensicEngine {
  private static readonly VELOCITY_THRESHOLD = 5;
  private static readonly AMOUNT_THRESHOLD = 1_000_000;
  private static readonly LAYERING_DEPTH = 3;
  private static readonly CRYPTO_PENALTY = 15;
  private static readonly ENTITY_PENALTY = 20;

  static analyzeTransaction(tx: Transaction): ThreatLevel {
    const flags = this.runRuleSet(tx);
    const score = this.computeRiskScore(tx, flags);
    return getRiskLevel(score);
  }

  static runRuleSet(tx: Transaction): string[] {
    const flags: string[] = [];
    if (tx.amount > this.AMOUNT_THRESHOLD) flags.push('LARGE_AMOUNT');
    if (tx.riskScore > 85) flags.push('HIGH_RISK_SCORE');
    if (tx.flags.includes('VELOCITY_BREACH')) flags.push('VELOCITY_BREACH');
    if (tx.flags.includes('GEO_ANOMALY')) flags.push('GEO_ANOMALY');
    if (tx.flags.includes('PATTERN_MATCH')) flags.push('PATTERN_MATCH');
    if (tx.currency === 'BTC' || tx.currency === 'ETH') flags.push('CRYPTO_TRANSFER');
    if (tx.sender.includes('GHOST') || tx.sender.includes('DARK')) flags.push('SUSPICIOUS_ENTITY');
    if (tx.status === 'FLAGGED') flags.push('FLAGGED_STATUS');
    return flags;
  }

  static computeRiskScore(tx: Transaction, flags: string[]): number {
    if (flags.length === 0) return tx.riskScore;
    let score = tx.riskScore;
    score += flags.length * 4;
    if (flags.includes('SUSPICIOUS_ENTITY')) score += this.ENTITY_PENALTY;
    if (flags.includes('LARGE_AMOUNT') && flags.includes('CRYPTO_TRANSFER')) score += this.CRYPTO_PENALTY;
    if (flags.includes('VELOCITY_BREACH') && flags.includes('GEO_ANOMALY')) score += 10;
    return Math.min(score, 100);
  }

  static checkVelocity(transactions: Transaction[], window: VelocityWindow): boolean {
    const recent = transactions.filter(t => Date.now() - t.timestamp < window.timeWindowMs);
    return recent.length > window.count ||
      recent.reduce((sum, t) => sum + t.amount, 0) > window.totalAmount;
  }

  static detectLayering(transactions: Transaction[]): ScanFinding[] {
    const findings: ScanFinding[] = [];
    const senderMap = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const existing = senderMap.get(tx.sender) ?? [];
      senderMap.set(tx.sender, [...existing, tx]);
    }
    senderMap.forEach((txs, sender) => {
      if (txs.length >= this.LAYERING_DEPTH) {
        findings.push({
          id: generateId(),
          type: 'LAYERING',
          description: `Entity ${sender} detected in ${txs.length}-layer transaction chain`,
          severity: txs.length > 5 ? 'CRITICAL' : 'HIGH',
          evidence: txs.map(t => t.id),
        });
      }
    });
    return findings;
  }

  static initiateScan(target: string, transactions: Transaction[]): ForensicScan {
    const targetTxs = transactions.filter(t => t.sender === target || t.receiver === target);
    const findings = this.detectLayering(targetTxs);
    const order: ThreatLevel[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const maxSeverity = findings.reduce(
      (max, f) => order.indexOf(f.severity) > order.indexOf(max) ? f.severity : max,
      'CLEAR' as ThreatLevel
    );
    return {
      id: generateId(),
      timestamp: Date.now(),
      target,
      status: 'COMPLETE',
      threatLevel: maxSeverity,
      findings,
      confidence: Math.min(60 + findings.length * 10, 99),
    };
  }
}
