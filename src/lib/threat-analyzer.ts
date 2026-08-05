import { Transaction, ThreatAlert, ThreatLevel } from './types';
import { generateId, getRiskLevel } from './utils';
import { RISK_THRESHOLDS } from './constants';

export class ThreatAnalyzer {
  private alerts: ThreatAlert[] = [];

  analyze(transactions: Transaction[]): ThreatAlert[] {
    const newAlerts: ThreatAlert[] = [];
    transactions.forEach(tx => {
      if (tx.threatLevel === 'CRITICAL' || tx.threatLevel === 'HIGH') {
        newAlerts.push(this.createAlert(tx));
      }
    });
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
      CRITICAL: `CRITICAL: Transaction ${tx.id} from ${tx.sender} — risk score ${tx.riskScore}/100`,
      HIGH: `HIGH ALERT: Suspicious transfer of ${tx.amount} ${tx.currency} detected`,
      MEDIUM: `MEDIUM: Pattern anomaly in transaction ${tx.id}`,
      LOW: `LOW: Minor flag on ${tx.id}`,
      CLEAR: `CLEAR: Transaction ${tx.id} passed all checks`,
    };
    return msgs[tx.threatLevel];
  }

  computeGlobalThreatIndex(transactions: Transaction[]): number {
    if (!transactions.length) return 0;
    const weights: Record<ThreatLevel, number> = { CRITICAL: 100, HIGH: 75, MEDIUM: 50, LOW: 25, CLEAR: 0 };
    const total = transactions.reduce((sum, tx) => sum + weights[tx.threatLevel], 0);
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

  get all(): ThreatAlert[] { return this.alerts; }
}

export const threatAnalyzer = new ThreatAnalyzer();
