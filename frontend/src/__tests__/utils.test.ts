import { getRiskLevel, formatCurrency, maskSensitive, calculateThreatIndex, clamp, generateId } from '@/lib/utils';
import { generateMockTransaction } from '@/lib/mock-data';

describe('getRiskLevel', () => {
  it('returns CRITICAL for score >= 90', () => expect(getRiskLevel(92)).toBe('CRITICAL'));
  it('returns HIGH for score >= 70', () => expect(getRiskLevel(75)).toBe('HIGH'));
  it('returns MEDIUM for score >= 45', () => expect(getRiskLevel(50)).toBe('MEDIUM'));
  it('returns LOW for score >= 20', () => expect(getRiskLevel(25)).toBe('LOW'));
  it('returns CLEAR for score < 20', () => expect(getRiskLevel(10)).toBe('CLEAR'));
});

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1500, 'USD')).toContain('1,500');
  });
  it('defaults to USD', () => {
    expect(formatCurrency(1000)).toContain('1,000');
  });
});

describe('maskSensitive', () => {
  it('masks middle characters', () => {
    const result = maskSensitive('ALPHA-CORP-001');
    expect(result.startsWith('ALPH')).toBe(true);
    expect(result).toContain('*');
  });
  it('masks short strings fully', () => {
    expect(maskSensitive('AB')).toBe('****');
  });
});

describe('calculateThreatIndex', () => {
  it('returns 0 for empty array', () => {
    expect(calculateThreatIndex([])).toBe(0);
  });
  it('calculates higher index for critical transactions', () => {
    const txs = [
      generateMockTransaction({ threatLevel: 'CRITICAL' }),
      generateMockTransaction({ threatLevel: 'CRITICAL' }),
      generateMockTransaction({ threatLevel: 'CLEAR' }),
    ];
    const index = calculateThreatIndex(txs);
    expect(index).toBeGreaterThan(0);
  });
});

describe('clamp', () => {
  it('clamps to min', () => expect(clamp(-5, 0, 100)).toBe(0));
  it('clamps to max', () => expect(clamp(150, 0, 100)).toBe(100));
  it('keeps value in range', () => expect(clamp(50, 0, 100)).toBe(50));
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
  it('starts with SX- prefix', () => {
    expect(generateId().startsWith('SX-')).toBe(true);
  });
});
