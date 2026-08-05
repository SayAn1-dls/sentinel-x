'use client';
import { ThreatLevel } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface ThreatScoreProps {
  score: number;
  level: ThreatLevel;
  confidence: number;
  findings: number;
}

export function ThreatScore({ score, level, confidence, findings }: ThreatScoreProps) {
  const color = THREAT_COLORS[level];
  return (
    <SiliconCard glow={level === 'CRITICAL' ? 'red' : level === 'HIGH' ? 'orange' : 'none'}>
      <h3 className="text-white/50 text-xs tracking-widest uppercase mb-4">THREAT ASSESSMENT</h3>
      <div className="flex items-center gap-6">
        <RiskMeter score={score} size={100} />
        <div className="space-y-3">
          <div>
            <div className="text-white/40 text-xs uppercase tracking-widest">AI Confidence</div>
            <div className="text-xl font-black" style={{ color: '#00CFFF' }}>{confidence}%</div>
          </div>
          <div>
            <div className="text-white/40 text-xs uppercase tracking-widest">Findings</div>
            <div className="text-xl font-black" style={{ color }}>{findings}</div>
          </div>
        </div>
      </div>
    </SiliconCard>
  );
}
