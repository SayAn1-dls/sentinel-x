'use client';
import { getRiskLevel, getThreatColor } from '@/lib/utils';

interface RiskMeterProps {
  score: number;
  size?: number;
  label?: string;
}

export function RiskMeter({ score, size = 120, label }: RiskMeterProps) {
  const level = getRiskLevel(score);
  const color = getThreatColor(level);
  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs tracking-widest uppercase" style={{ color, opacity: 0.7 }}>{level}</span>
        </div>
      </div>
      {label && <span className="text-xs text-white/50 uppercase tracking-widest">{label}</span>}
    </div>
  );
}
