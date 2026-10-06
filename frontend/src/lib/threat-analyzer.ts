import { Transaction, ThreatAlert, ThreatLevel } from './types';
import { generateId, getRiskLevel } from './utils';

const SEVERITY_WEIGHT: Record<ThreatLevel, number> = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  CLEAR: 0,
};

export class ThreatAnalyzer {
  private alerts: ThreatAlert[] = [];

  analyze(transactions: Transaction[]): ThreatAlert[] {
    const newAlerts: ThreatAlert[] = transactions
      .filter(tx => tx.threatLevel === 'CRITICAL' || tx.threatLevel === 'HIGH')
      .map(tx => this.createAlert(tx));
    this.alerts = [...newAlerts, ...this.alerts];
    return newAlerts;
  }

  private createAlert(tx: Transaction): ThreatAlert {
    return {
      id: generateId(),
      timestamp: Date.now(),
      level: tx.threatLevel,
      message: this.buildAlertMessage(tx),
      source: 'THREAT_ANALYZER_V4',
      resolved: false,
      transactionId: tx.id,
    };
  }

  private buildAlertMessage(tx: Transaction): string {
    const msgs: Record<ThreatLevel, string> = {
      CRITICAL: `CRITICAL: TX ${tx.id.slice(0, 16)} from ${tx.sender} — risk ${tx.riskScore}/100`,
      HIGH: `HIGH ALERT: Suspicious transfer of ${tx.amount} ${tx.currency}`,
      MEDIUM: `MEDIUM: Pattern anomaly in TX ${tx.id.slice(0, 16)}`,
      LOW: `LOW: Minor flag on TX ${tx.id.slice(0, 16)}`,
      CLEAR: `CLEAR: TX ${tx.id.slice(0, 16)} passed all checks`,
    };
    return msgs[tx.threatLevel];
  }

  computeGlobalThreatIndex(transactions: Transaction[]): number {
    if (!transactions.length) return 0;
    const total = transactions.reduce((sum, tx) => sum + SEVERITY_WEIGHT[tx.threatLevel], 0);
    return Math.round(total / transactions.length);
  }

  resolve(alertId: string): void {
    this.alerts = this.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a);
  }

  getActive(): ThreatAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  getBySeverity(level: ThreatLevel): ThreatAlert[] {
    return this.alerts.filter(a => a.level === level);
  }

  getStats(): Record<ThreatLevel, number> {
    return this.alerts.reduce((acc, a) => {
      acc[a.level] = (acc[a.level] || 0) + 1;
      return acc;
    }, {} as Record<ThreatLevel, number>);
  }

  get all(): ThreatAlert[] { return this.alerts; }
}

export const threatAnalyzer = new ThreatAnalyzer();
