import type { Transaction, AuditLog } from './types';
import type { GraphAnalysisResult } from './graph-engine';
import type { VelocityResult } from './velocity-engine';

export interface ForensicReport {
  id: string;
  generatedAt: string;
  caseReference: string;
  subject: string;
  summary: string;
  riskScore: number;
  transactions: Transaction[];
  auditLogs: AuditLog[];
  graphAnalysis: GraphAnalysisResult | null;
  velocityAnalysis: VelocityResult | null;
  findings: string[];
  recommendation: 'CLEAR' | 'MONITOR' | 'ESCALATE' | 'BLOCK';
}

export class ReportGenerator {
  generate(params: {
    subject: string;
    transactions: Transaction[];
    auditLogs: AuditLog[];
    graphAnalysis?: GraphAnalysisResult;
    velocityAnalysis?: VelocityResult;
    riskScore: number;
  }): ForensicReport {
    const findings: string[] = [];

    if (params.velocityAnalysis?.pattern === 'ATTACK') {
      findings.push('Transaction velocity indicates automated attack pattern');
    }
    if (params.graphAnalysis?.cycles.length) {
      findings.push(`Detected ${params.graphAnalysis.cycles.length} circular fund flows`);
    }
    if (params.graphAnalysis?.smurfingDetected) {
      findings.push('Smurfing pattern detected — multiple micro-transactions below reporting threshold');
    }
    if (params.riskScore > 75) {
      findings.push('Critical risk score — immediate review required');
    }

    let recommendation: ForensicReport['recommendation'] = 'CLEAR';
    if (params.riskScore > 75) recommendation = 'BLOCK';
    else if (params.riskScore > 50) recommendation = 'ESCALATE';
    else if (params.riskScore > 25) recommendation = 'MONITOR';

    return {
      id: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      caseReference: `CASE-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      subject: params.subject,
      summary: `Forensic analysis of ${params.transactions.length} transactions. Risk score: ${params.riskScore}/100.`,
      riskScore: params.riskScore,
      transactions: params.transactions,
      auditLogs: params.auditLogs,
      graphAnalysis: params.graphAnalysis ?? null,
      velocityAnalysis: params.velocityAnalysis ?? null,
      findings,
      recommendation,
    };
  }

  toJSON(report: ForensicReport): string {
    return JSON.stringify(report, null, 2);
  }
}

export const reportGenerator = new ReportGenerator();
