'use client';
import { useState } from 'react';
import { useAI } from '@/lib/hooks/useAI';
import { NeonButton } from '@/components/ui/NeonButton';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { LoadingPulse } from '@/components/ui/LoadingPulse';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ScanEngine({ onComplete }: { onComplete?: () => void }) {
  const [target, setTarget] = useState('');
  const { scanning, currentScan, error, runScan } = useAI();

  const initiate = async () => {
    if (!target.trim()) return;
    await runScan(target);
    onComplete?.();
  };

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">AI FORENSIC SCAN ENGINE</h2>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="ENTER TARGET ENTITY..."
          value={target}
          data-testid="scan-target-input"
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && initiate()}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm tracking-widest uppercase placeholder-white/20 focus:outline-none focus:border-orange-500/50"
        />
        <NeonButton onClick={initiate} disabled={scanning} data-testid="initiate-scan-btn">
          {scanning ? 'SCANNING...' : 'INITIATE SCAN'}
        </NeonButton>
      </div>

      {scanning && (
        <div className="flex flex-col items-center py-8 gap-4" data-testid="scan-progress">
          <LoadingPulse color="#FF6B00" size="lg" label="ANALYZING PATTERNS" />
          <div className="text-white/40 text-xs tracking-widest">AI MODEL: SX-FORENSIC-AI-V4.0</div>
        </div>
      )}

      {error && !scanning && (
        <p className="text-red-400 text-xs" data-testid="scan-error">{error}</p>
      )}

      {currentScan && !scanning && (
        <div className="space-y-3" data-testid="scan-result">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-white/60 text-xs uppercase tracking-widest">TARGET: {currentScan.target}</span>
            <StatusBadge level={currentScan.threatLevel} pulse />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-orange-500">{currentScan.confidence}%</div>
              <div className="text-white/40 text-xs uppercase tracking-widest">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">{currentScan.findings.length}</div>
              <div className="text-white/40 text-xs uppercase tracking-widest">Findings</div>
            </div>
          </div>
          {currentScan.findings.map(f => (
            <div key={f.id} className="p-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge level={f.severity} />
                <span className="text-white/70 text-xs font-bold uppercase">{f.type}</span>
              </div>
              <p className="text-white/50 text-xs">{f.description}</p>
            </div>
          ))}
        </div>
      )}
    </SiliconCard>
  );
}
