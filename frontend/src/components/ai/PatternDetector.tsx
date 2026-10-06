'use client';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThreatLevel } from '@/lib/types';

const KNOWN_PATTERNS = [
  { id: 'P001', name: 'STRUCTURING / SMURFING', confidence: 94, severity: 'HIGH' as ThreatLevel, matches: 7 },
  { id: 'P002', name: 'LAYERING CASCADE', confidence: 87, severity: 'HIGH' as ThreatLevel, matches: 3 },
  { id: 'P003', name: 'ROUND-TRIP RECYCLING', confidence: 79, severity: 'MEDIUM' as ThreatLevel, matches: 2 },
  { id: 'P004', name: 'GEO-HOP OBFUSCATION', confidence: 71, severity: 'MEDIUM' as ThreatLevel, matches: 5 },
  { id: 'P005', name: 'VELOCITY BREACH', confidence: 99, severity: 'CRITICAL' as ThreatLevel, matches: 1 },
];

export function PatternDetector() {
  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">PATTERN DETECTOR</h2>
      <div className="space-y-3">
        {KNOWN_PATTERNS.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-xs font-mono">{p.id}</span>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wide">{p.name}</p>
                <p className="text-white/30 text-xs">{p.matches} transaction{p.matches > 1 ? 's' : ''} matched</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 text-xs font-bold">{p.confidence}%</span>
              <StatusBadge level={p.severity} />
            </div>
          </div>
        ))}
      </div>
    </SiliconCard>
  );
}
