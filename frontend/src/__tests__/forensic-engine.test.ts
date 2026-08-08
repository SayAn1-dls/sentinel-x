import { ForensicEngine } from '@/lib/forensic-engine';
import { Transaction } from '@/lib/types';
import { generateMockTransaction } from '@/lib/mock-data';

describe('ForensicEngine', () => {
  describe('analyzeTransaction', () => {
    it('returns CRITICAL for high-risk score transactions', () => {
      const tx = generateMockTransaction({ riskScore: 95, flags: ['VELOCITY_BREACH', 'GEO_ANOMALY'] });
      const level = ForensicEngine.analyzeTransaction(tx);
      expect(['CRITICAL', 'HIGH']).toContain(level);
    });

    it('returns CLEAR for low-risk transactions', () => {
      const tx = generateMockTransaction({ riskScore: 5, flags: [], sender: 'ALPHA-CORP', currency: 'USD' });
      const level = ForensicEngine.analyzeTransaction(tx);
      expect(['CLEAR', 'LOW']).toContain(level);
    });
  });

  describe('runRuleSet', () => {
    it('flags ghost wallet entities as SUSPICIOUS_ENTITY', () => {
      const tx = generateMockTransaction({ sender: 'GHOST-WALLET-7' });
      const flags = ForensicEngine.runRuleSet(tx);
      expect(flags).toContain('SUSPICIOUS_ENTITY');
    });

    it('flags BTC transactions as CRYPTO_TRANSFER', () => {
      const tx = generateMockTransaction({ currency: 'BTC' });
      const flags = ForensicEngine.runRuleSet(tx);
      expect(flags).toContain('CRYPTO_TRANSFER');
    });

    it('flags large amounts over 1M threshold', () => {
      const tx = generateMockTransaction({ amount: 5_000_000 });
      const flags = ForensicEngine.runRuleSet(tx);
      expect(flags).toContain('LARGE_AMOUNT');
    });
  });

  describe('detectLayering', () => {
    it('detects layering chains with 3+ transactions from same sender', () => {
      const txs = Array.from({ length: 4 }, () => generateMockTransaction({ sender: 'DARK-POOL-7' }));
      const findings = ForensicEngine.detectLayering(txs);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].type).toBe('LAYERING');
    });

    it('returns empty findings for clean transaction set', () => {
      const txs = [
        generateMockTransaction({ sender: 'ALPHA-CORP' }),
        generateMockTransaction({ sender: 'NEXUS-LLC' }),
      ];
      const findings = ForensicEngine.detectLayering(txs);
      expect(findings).toHaveLength(0);
    });
  });
});
