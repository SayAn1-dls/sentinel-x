'use client';
import { Transaction, ThreatLevel } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface ThreatMatrixProps {
  transactions: Transaction[];
}

const LEVELS: ThreatLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'];

export function ThreatMatrix({ transactions }: ThreatMatrixProps) {
  const counts = LEVELS.reduce((acc, l) => {
    acc[l] = transactions.filter(t => t.threatLevel === l).length;
    return acc;
  }, {} as Record<ThreatLevel, number>);

  const max = Math.max(...Object.values(counts), 1);

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">THREAT MATRIX</h2>
      <div className="space-y-3">
        {LEVELS.map(level => {
          const pct = (counts[level] / max) * 100;
          const color = THREAT_COLORS[level];
          return (
            <div key={level}>
              <div className="flex justify-between mb-1">
                <span className="text-xs tracking-widest uppercase" style={{ color }}>{level}</span>
                <span className="text-xs font-bold" style={{ color }}>{counts[level]}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SiliconCard>
  );
}
