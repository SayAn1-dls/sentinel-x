'use client';
import { ForensicScan } from '@/lib/types';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThreatScore } from './ThreatScore';
import { formatTimestamp } from '@/lib/utils';

interface AnalysisPanelProps {
  scan: ForensicScan;
}

export function AnalysisPanel({ scan }: AnalysisPanelProps) {
  return (
    <SiliconCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm">FORENSIC REPORT</h2>
          <p className="text-white/40 text-xs mt-1">Target: {scan.target} · {formatTimestamp(scan.timestamp)}</p>
        </div>
        <StatusBadge level={scan.threatLevel} pulse />
      </div>

      <ThreatScore
        score={Math.round(scan.confidence)}
        level={scan.threatLevel}
        confidence={scan.confidence}
        findings={scan.findings.length}
      />

      <div>
        <h3 className="text-white/50 text-xs tracking-widest uppercase mb-3">FINDINGS</h3>
        <div className="space-y-2">
          {scan.findings.map(f => (
            <div key={f.id} className="p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge level={f.severity} />
                <span className="text-white/70 text-xs font-bold uppercase">{f.type}</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{f.description}</p>
              {f.evidence.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.evidence.slice(0, 5).map(e => (
                    <span key={e} className="text-xs font-mono text-orange-400/60 bg-orange-400/5 px-2 py-0.5 rounded">{e.slice(0, 16)}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SiliconCard>
  );
}
