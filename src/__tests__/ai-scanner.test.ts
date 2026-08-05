import { AIScanner } from '@/lib/ai-scanner';
import { generateMockTransaction } from '@/lib/mock-data';

describe('AIScanner', () => {
  let scanner: AIScanner;

  beforeEach(() => {
    scanner = new AIScanner();
  });

  it('exposes the model version', () => {
    expect(scanner.version).toBe('SX-FORENSIC-AI-V4.0');
  });

  it('returns a complete scan result for a target', async () => {
    const transactions = Array.from({ length: 10 }, () => generateMockTransaction());
    const result = await scanner.scan('TEST-ENTITY', transactions);
    expect(result.target).toBe('TEST-ENTITY');
    expect(result.status).toBe('COMPLETE');
    expect(result.confidence).toBeGreaterThan(0);
    expect(Array.isArray(result.findings)).toBe(true);
  }, 10000);

  it('detects smurfing in structured sub-threshold transactions', async () => {
    const transactions = Array.from({ length: 5 }, () =>
      generateMockTransaction({ amount: 9000 + Math.random() * 500, sender: 'SUSPECT-ENTITY' })
    );
    const result = await scanner.scan('SUSPECT-ENTITY', transactions);
    const types = result.findings.map(f => f.type);
    expect(types).toContain('SMURFING');
  }, 10000);

  it('returns CLEAR threat level for clean transactions', async () => {
    const transactions = [
      generateMockTransaction({ amount: 500, sender: 'CLEAN-CORP', receiver: 'LEGIT-FUND', riskScore: 5 }),
    ];
    const result = await scanner.scan('CLEAN-CORP', transactions);
    expect(['CLEAR', 'LOW']).toContain(result.threatLevel);
  }, 10000);
});
