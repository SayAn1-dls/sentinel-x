import { AuditTrace } from '@/lib/audit-trace';

describe('AuditTrace', () => {
  let trace: AuditTrace;

  beforeEach(() => {
    trace = new AuditTrace();
  });

  it('records a log entry', () => {
    const log = trace.record('LOGIN', 'AGENT-001', 'SYSTEM', 'LOW', 'Test login event');
    expect(log.action).toBe('LOGIN');
    expect(log.actor).toBe('AGENT-001');
    expect(log.severity).toBe('LOW');
    expect(log.id).toBeDefined();
  });

  it('queries by action', () => {
    trace.record('SCAN_INIT', 'AGENT-001', 'TX-001', 'MEDIUM', 'Scan started');
    trace.record('LOGIN', 'AGENT-002', 'SYSTEM', 'LOW', 'Login event');
    const scans = trace.query({ action: 'SCAN_INIT' });
    expect(scans.length).toBeGreaterThan(0);
    expect(scans.every(l => l.action === 'SCAN_INIT')).toBe(true);
  });

  it('queries by severity', () => {
    trace.record('BLOCK_GATEWAY', 'AGENT-001', 'GW-001', 'CRITICAL', 'Emergency block');
    const critical = trace.query({ severity: 'CRITICAL' });
    expect(critical.some(l => l.severity === 'CRITICAL')).toBe(true);
  });

  it('returns all logs via .all getter', () => {
    trace.record('ACTION_1', 'AGENT-001', 'TARGET-1', 'LOW', 'Event 1');
    trace.record('ACTION_2', 'AGENT-002', 'TARGET-2', 'MEDIUM', 'Event 2');
    expect(trace.all.length).toBeGreaterThanOrEqual(2);
  });

  it('exports valid JSON', () => {
    trace.record('LOGIN', 'AGENT-001', 'SYS', 'LOW', 'Login');
    const exported = trace.export();
    expect(() => JSON.parse(exported)).not.toThrow();
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('provides stats with bySeverity breakdown', () => {
    trace.record('ACTION', 'AGENT-001', 'T', 'HIGH', 'High event');
    trace.record('ACTION', 'AGENT-001', 'T', 'CRITICAL', 'Critical event');
    const stats = trace.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.bySeverity).toBeDefined();
  });
});
