import { Transaction, ThreatLevel, ScanFinding, ForensicScan } from './types';
import { generateId, getRiskLevel } from './utils';

interface VelocityWindow {
  count: number;
  totalAmount: number;
  timeWindowMs: number;
}

export class ForensicEngine {
  private static readonly VELOCITY_THRESHOLD = 5;
  private static readonly AMOUNT_THRESHOLD = 1000000;
  private static readonly LAYERING_DEPTH = 3;

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
    if (tx.currency === 'BTC' || tx.currency === 'ETH') flags.push('CRYPTO_TRANSFER');
    if (tx.sender.includes('GHOST') || tx.sender.includes('DARK')) flags.push('SUSPICIOUS_ENTITY');
    return flags;
  }

  static computeRiskScore(tx: Transaction, flags: string[]): number {
    let score = tx.riskScore;
    score += flags.length * 5;
    if (flags.includes('SUSPICIOUS_ENTITY')) score += 20;
    if (flags.includes('LARGE_AMOUNT') && flags.includes('CRYPTO_TRANSFER')) score += 15;
    return Math.min(score, 100);
  }

  static checkVelocity(transactions: Transaction[], window: VelocityWindow): boolean {
    const recent = transactions.filter(t => Date.now() - t.timestamp < window.timeWindowMs);
    return recent.length > window.count || recent.reduce((sum, t) => sum + t.amount, 0) > window.totalAmount;
  }

  static detectLayering(transactions: Transaction[]): ScanFinding[] {
    const findings: ScanFinding[] = [];
    const senderMap = new Map<string, Transaction[]>();
    transactions.forEach(tx => {
      const existing = senderMap.get(tx.sender) || [];
      senderMap.set(tx.sender, [...existing, tx]);
    });
    senderMap.forEach((txs, sender) => {
      if (txs.length >= this.LAYERING_DEPTH) {
        findings.push({
          id: generateId(),
          type: 'LAYERING',
          description: `Entity ${sender} involved in ${txs.length}-layer transaction chain`,
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
    const maxSeverity = findings.reduce((max, f) => {
      const order: ThreatLevel[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      return order.indexOf(f.severity) > order.indexOf(max) ? f.severity : max;
    }, 'CLEAR' as ThreatLevel);
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
