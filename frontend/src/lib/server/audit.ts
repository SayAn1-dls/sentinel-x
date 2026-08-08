import { Db } from 'mongodb';
import { ThreatLevel } from '../types';
import { generateId } from '../utils';

interface AuditEntry {
  action: string;
  actor: string;
  target: string;
  severity: ThreatLevel;
  details: string;
  ipAddress?: string;
  sessionId?: string;
}

export async function recordAudit(db: Db, entry: AuditEntry) {
  await db.collection('audit_logs').insertOne({
    id: generateId(),
    timestamp: Date.now(),
    action: entry.action,
    actor: entry.actor,
    target: entry.target,
    severity: entry.severity,
    details: entry.details,
    ipAddress: entry.ipAddress ?? '127.0.0.1',
    sessionId: entry.sessionId ?? 'SYSTEM',
  });
}
