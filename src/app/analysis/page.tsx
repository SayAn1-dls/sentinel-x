'use client';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { ScanEngine } from '@/components/ai/ScanEngine';
import { AnomalyChart } from '@/components/ai/AnomalyChart';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { useForensic } from '@/lib/hooks/useForensic';
import { MOCK_SCANS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimestamp } from '@/lib/utils';

export default function AnalysisPage() {
  const { transactions } = useForensic();

  return (
    <div className="min-h-screen">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        <div className="py-6">
          <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">AI ANALYSIS LAB</h1>
          <p className="text-white/40 text-sm mt-1">Neural forensic scanner · SX-FORENSIC-AI-V4.0</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ScanEngine />
            <AnomalyChart transactions={transactions} />
          </div>
          <div className="space-y-4">
            <SiliconCard>
              <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">RECENT SCANS</h2>
              {MOCK_SCANS.map(scan => (
                <div key={scan.id} className="p-3 rounded-lg border border-white/5 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-bold">{scan.target}</span>
                    <StatusBadge level={scan.threatLevel} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{formatTimestamp(scan.timestamp)}</span>
                    <span>·</span>
                    <span>{scan.confidence}% confidence</span>
                    <span>·</span>
                    <span>{scan.findings.length} findings</span>
                  </div>
                </div>
              ))}
            </SiliconCard>
            <SiliconCard padding="p-4">
              <h3 className="text-white/50 text-xs tracking-widest uppercase mb-3">AI MODEL STATUS</h3>
              <div className="space-y-2">
                {['SMURFING_DETECTOR', 'LAYERING_ANALYZER', 'ROUND_TRIP_TRACER', 'VELOCITY_ENGINE'].map(m => (
                  <div key={m} className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">{m}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-xs">ACTIVE</span>
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
