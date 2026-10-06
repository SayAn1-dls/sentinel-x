'use client';
import { ThreatLevel } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';

interface ThreatIndicatorProps {
  level: ThreatLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZES = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };

export function ThreatIndicator({ level, size = 'md', showLabel = false }: ThreatIndicatorProps) {
  const color = THREAT_COLORS[level];
  const isActive = level === 'CRITICAL' || level === 'HIGH';

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${SIZES[size]}`}>
        {isActive && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: color, opacity: 0.5 }}
          />
        )}
        <div
          className="relative w-full h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{level}</span>
      )}
    </div>
  );
}
