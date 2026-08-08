import { AuditLog, ThreatLevel } from './types';
import { generateId, groupByDate } from './utils';

export class AuditTrace {
  private logs: AuditLog[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = generateId();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sx_audit_logs');
      if (stored) this.logs = JSON.parse(stored);
    }
  }

  record(action: string, actor: string, target: string, severity: ThreatLevel, details: string): AuditLog {
    const log: AuditLog = {
      id: generateId(),
      timestamp: Date.now(),
      action,
      actor,
      target,
      severity,
      details,
      ipAddress: '127.0.0.1',
      sessionId: this.sessionId,
    };
    this.logs.unshift(log);
    this.persist();
    return log;
  }

  query(filters: Partial<Pick<AuditLog, 'action' | 'actor' | 'severity'>>): AuditLog[] {
    return this.logs.filter(log => {
      if (filters.action && log.action !== filters.action) return false;
      if (filters.actor && log.actor !== filters.actor) return false;
      if (filters.severity && log.severity !== filters.severity) return false;
      return true;
    });
  }

  getByDateRange(from: number, to: number): AuditLog[] {
    return this.logs.filter(l => l.timestamp >= from && l.timestamp <= to);
  }

  groupByDate(): Record<string, AuditLog[]> {
    return groupByDate(this.logs);
  }

  getStats(): { total: number; bySeverity: Record<ThreatLevel, number> } {
    const bySeverity = this.logs.reduce((acc, l) => {
      acc[l.severity] = (acc[l.severity] || 0) + 1;
      return acc;
    }, {} as Record<ThreatLevel, number>);
    return { total: this.logs.length, bySeverity };
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private persist(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sx_audit_logs', JSON.stringify(this.logs.slice(0, 1000)));
    }
  }

  get all(): AuditLog[] { return this.logs; }
}

export const auditTrace = new AuditTrace();
