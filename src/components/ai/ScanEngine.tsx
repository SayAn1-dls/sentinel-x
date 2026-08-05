'use client';
import { useState } from 'react';
import { ForensicScan } from '@/lib/types';
import { aiScanner } from '@/lib/ai-scanner';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { NeonButton } from '@/components/ui/NeonButton';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { LoadingPulse } from '@/components/ui/LoadingPulse';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ScanEngine() {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ForensicScan | null>(null);

  const runScan = async () => {
    if (!target.trim()) return;
    setScanning(true);
    setResult(null);
    const scan = await aiScanner.scan(target.toUpperCase(), MOCK_TRANSACTIONS);
    setResult(scan);
    setScanning(false);
  };

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">AI FORENSIC SCAN ENGINE</h2>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="ENTER TARGET ENTITY..."
          value={target}
          onChange={e => setTarget(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm tracking-widest uppercase placeholder-white/20 focus:outline-none focus:border-orange-500/50"
        />
        <NeonButton onClick={runScan} disabled={scanning}>
          {scanning ? 'SCANNING...' : 'INITIATE SCAN'}
        </NeonButton>
      </div>

      {scanning && (
        <div className="flex flex-col items-center py-8 gap-4">
          <LoadingPulse color="#FF6B00" size="lg" label="ANALYZING PATTERNS" />
          <div className="text-white/40 text-xs tracking-widest">AI MODEL: SX-FORENSIC-AI-V4.0</div>
        </div>
      )}

      {result && !scanning && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-white/60 text-xs uppercase tracking-widest">TARGET: {result.target}</span>
            <StatusBadge level={result.threatLevel} pulse />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-orange-500">{result.confidence}%</div>
              <div className="text-white/40 text-xs uppercase tracking-widest">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">{result.findings.length}</div>
              <div className="text-white/40 text-xs uppercase tracking-widest">Findings</div>
            </div>
          </div>
          {result.findings.map(f => (
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
