'use client';
import { ThreatLevel } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface ThreatMeterProps {
  level: ThreatLevel;
  index: number;
  label?: string;
}

const LEVEL_SCORES: Record<ThreatLevel, number> = {
  CRITICAL: 95,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  CLEAR: 5,
};

export function ThreatMeter({ level, index, label = 'GLOBAL THREAT INDEX' }: ThreatMeterProps) {
  const color = THREAT_COLORS[level];
  const score = LEVEL_SCORES[level];
  const bars = 20;
  const activeBars = Math.round((score / 100) * bars);

  return (
    <SiliconCard padding="p-4">
      <div className="text-white/40 text-xs tracking-widest uppercase mb-2">{label}</div>
      <div className="flex items-end gap-1 h-12 mb-2">
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${40 + (i / bars) * 60}%`,
              background: i < activeBars ? color : 'rgba(255,255,255,0.05)',
              boxShadow: i < activeBars ? `0 0 4px ${color}` : 'none',
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-black text-xl" style={{ color }}>{level}</span>
        <span className="text-white/40 text-sm">{index}/100</span>
      </div>
    </SiliconCard>
  );
}
