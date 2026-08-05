import { NetworkSecurityMonitor } from '@/lib/network-security';

describe('NetworkSecurityMonitor', () => {
  let monitor: NetworkSecurityMonitor;

  beforeEach(() => {
    monitor = new NetworkSecurityMonitor();
  });

  it('returns all gateways', () => {
    const gateways = monitor.getAll();
    expect(gateways.length).toBeGreaterThan(0);
  });

  it('returns only online gateways', () => {
    const online = monitor.getOnline();
    expect(online.every(g => g.status === 'ONLINE')).toBe(true);
  });

  it('computes health score as percentage', () => {
    const score = monitor.getHealthScore();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns encryption status for valid gateway', () => {
    const gateways = monitor.getAll();
    const { secure, protocol, bits } = monitor.checkEncryption(gateways[0].id);
    expect(typeof secure).toBe('boolean');
    expect(typeof protocol).toBe('string');
    expect(typeof bits).toBe('number');
  });

  it('returns insecure status for unknown gateway', () => {
    const { secure, protocol } = monitor.checkEncryption('UNKNOWN-GW');
    expect(secure).toBe(false);
    expect(protocol).toBe('PLAIN');
  });

  it('adds a new gateway', () => {
    const before = monitor.getAll().length;
    monitor.addGateway('TEST-GW', 'TLS_1_3', 256);
    expect(monitor.getAll().length).toBe(before + 1);
  });

  it('simulates heartbeat without errors', () => {
    expect(() => monitor.simulateHeartbeat()).not.toThrow();
  });
});
