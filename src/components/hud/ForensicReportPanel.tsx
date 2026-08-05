'use client';
import { useState } from 'react';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { NeonButton } from '@/components/ui/NeonButton';
import type { ForensicReport } from '@/lib/report-generator';

interface ForensicReportPanelProps {
  report: ForensicReport | null;
  onGenerate?: () => void;
}

const REC_COLORS: Record<string, string> = {
  CLEAR: 'text-emerald-400',
  MONITOR: 'text-yellow-400',
  ESCALATE: 'text-orange-400',
  BLOCK: 'text-red-400',
};

export function ForensicReportPanel({ report, onGenerate }: ForensicReportPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.caseReference}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SiliconCard title="FORENSIC REPORT" glow="cyan">
      <div className="space-y-4">
        {!report ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">No report generated yet.</p>
            {onGenerate && (
              <NeonButton onClick={onGenerate} variant="primary">
                GENERATE REPORT
              </NeonButton>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-500 text-xs">CASE REF</p>
                <p className="text-cyan-400 font-mono text-sm">{report.caseReference}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">GENERATED</p>
                <p className="text-white font-mono text-xs">
                  {new Date(report.generatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">RISK SCORE</p>
                <p className="text-orange-400 font-mono font-bold">{report.riskScore}/100</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">RECOMMENDATION</p>
                <p className={`font-mono font-bold text-sm ${REC_COLORS[report.recommendation]}`}>
                  {report.recommendation}
                </p>
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-xs mb-2">FINDINGS ({report.findings.length})</p>
              <ul className="space-y-1">
                {report.findings.map((f, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-red-400">▶</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <NeonButton onClick={handleDownload} variant="secondary">
                ↓ DOWNLOAD JSON
              </NeonButton>
              <NeonButton onClick={() => setExpanded(!expanded)} variant="ghost">
                {expanded ? 'COLLAPSE' : 'EXPAND'}
              </NeonButton>
            </div>

            {expanded && (
              <pre className="bg-black/60 rounded p-3 text-xs text-green-400 font-mono overflow-auto max-h-64">
                {JSON.stringify(report, null, 2)}
              </pre>
            )}
          </>
        )}
      </div>
    </SiliconCard>
  );
}
