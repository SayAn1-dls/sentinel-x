'use client';
import { AuthGate } from '@/components/auth/AuthGate';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { ScanEngine } from '@/components/ai/ScanEngine';
import { AnomalyChart } from '@/components/ai/AnomalyChart';
import { PatternDetector } from '@/components/ai/PatternDetector';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { useForensic } from '@/lib/hooks/useForensic';
import { useScans } from '@/lib/hooks/useAI';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimestamp } from '@/lib/utils';

function AnalysisContent() {
  const { transactions } = useForensic();
  const { scans, reload } = useScans();

  return (
    <div className="min-h-screen" data-testid="analysis-page">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        <div className="py-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">AI ANALYSIS LAB</h1>
            <p className="text-white/40 text-sm mt-1">Neural forensic scanner · SX-FORENSIC-AI-V4.0</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs tracking-widest uppercase">AI ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ScanEngine onComplete={reload} />
            <AnomalyChart transactions={transactions} />
            <PatternDetector />
          </div>
          <div className="space-y-4">
            <SiliconCard>
              <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">RECENT SCANS</h2>
              {scans.length === 0 && (
                <p className="text-white/30 text-xs uppercase tracking-wider">No scans yet. Initiate one to build history.</p>
              )}
              {scans.map(scan => (
                <div key={scan.id} className="p-3 rounded-lg border border-white/5 mb-3" data-testid="recent-scan-item">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-bold">{scan.target}</span>
                    <StatusBadge level={scan.threatLevel} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{formatTimestamp(scan.timestamp)}</span>
                    <span className="text-cyan-400 font-bold">{scan.confidence}%</span>
                    <span>{scan.findings.length} findings</span>
                  </div>
                </div>
              ))}
            </SiliconCard>
            <SiliconCard padding="p-4">
              <h3 className="text-white/50 text-xs tracking-widest uppercase mb-3">AI MODULES ACTIVE</h3>
              <div className="space-y-2">
                {[
                  { name: 'SMURFING_DETECTOR', uptime: '99.8%' },
                  { name: 'LAYERING_ANALYZER', uptime: '99.5%' },
                  { name: 'ROUND_TRIP_TRACER', uptime: '98.9%' },
                  { name: 'VELOCITY_ENGINE', uptime: '100%' },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between">
                    <span className="text-white/50 text-xs font-mono">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xs">{m.uptime}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </SiliconCard>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <AuthGate>
      <AnalysisContent />
    </AuthGate>
  );
}
