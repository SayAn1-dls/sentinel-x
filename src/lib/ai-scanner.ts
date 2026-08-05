import { Transaction, ForensicScan, ScanFinding, ThreatLevel } from './types';
import { generateId, getRiskLevel } from './utils';

type PatternType = 'SMURFING' | 'LAYERING' | 'INTEGRATION' | 'PLACEMENT' | 'ROUND_TRIPPING';

interface PatternMatch {
  type: PatternType;
  confidence: number;
  transactions: string[];
  severity: ThreatLevel;
}

export class AIScanner {
  private modelVersion = 'SX-FORENSIC-AI-V4.0';

  async scan(target: string, transactions: Transaction[]): Promise<ForensicScan> {
    await this.simulateProcessing(1200);
    const patterns = this.detectPatterns(transactions);
    const findings = this.buildFindings(patterns);
    const maxLevel = this.getMaxSeverity(findings);
    return {
      id: generateId(),
      timestamp: Date.now(),
      target,
      status: 'COMPLETE',
      threatLevel: maxLevel,
      findings,
      confidence: this.computeConfidence(patterns),
    };
  }

  private detectPatterns(transactions: Transaction[]): PatternMatch[] {
    const patterns: PatternMatch[] = [];
    patterns.push(...this.detectSmurfing(transactions));
    patterns.push(...this.detectRoundTripping(transactions));
    return patterns;
  }

  private detectSmurfing(transactions: Transaction[]): PatternMatch[] {
    const subThreshold = transactions.filter(t => t.amount < 10000 && t.amount > 8000);
    if (subThreshold.length >= 3) {
      return [{
        type: 'SMURFING',
        confidence: Math.min(60 + subThreshold.length * 5, 95),
        transactions: subThreshold.map(t => t.id),
        severity: subThreshold.length > 5 ? 'HIGH' : 'MEDIUM',
      }];
    }
    return [];
  }

  private detectRoundTripping(transactions: Transaction[]): PatternMatch[] {
    const senders = new Set(transactions.map(t => t.sender));
    const receivers = new Set(transactions.map(t => t.receiver));
    const overlap = [...senders].filter(s => receivers.has(s));
    if (overlap.length > 0) {
      return [{
        type: 'ROUND_TRIPPING',
        confidence: 78,
        transactions: transactions.filter(t => overlap.includes(t.sender)).map(t => t.id),
        severity: 'HIGH',
      }];
    }
    return [];
  }

  private buildFindings(patterns: PatternMatch[]): ScanFinding[] {
    return patterns.map(p => ({
      id: generateId(),
      type: p.type,
      description: this.describePattern(p.type),
      severity: p.severity,
      evidence: p.transactions,
    }));
  }

  private describePattern(type: PatternType): string {
    const descriptions: Record<PatternType, string> = {
      SMURFING: 'Multiple transactions structured below reporting threshold',
      LAYERING: 'Complex multi-layer transaction chain to obscure origin',
      INTEGRATION: 'Illicit funds being integrated into legitimate assets',
      PLACEMENT: 'Initial placement of illicit funds detected',
      ROUND_TRIPPING: 'Funds cycling through same entities detected',
    };
    return descriptions[type];
  }

  private getMaxSeverity(findings: ScanFinding[]): ThreatLevel {
    const order: ThreatLevel[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return findings.reduce((max, f) => order.indexOf(f.severity) > order.indexOf(max) ? f.severity : max, 'CLEAR' as ThreatLevel);
  }

  private computeConfidence(patterns: PatternMatch[]): number {
    if (!patterns.length) return 10;
    return Math.round(patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length);
  }

  private simulateProcessing(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get version(): string { return this.modelVersion; }
}

export const aiScanner = new AIScanner();
