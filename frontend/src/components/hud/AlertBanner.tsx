'use client';
import { ThreatAlert } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils';

interface AlertBannerProps {
  alert: ThreatAlert;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertBanner({ alert, onResolve, onDismiss }: AlertBannerProps) {
  const color = THREAT_COLORS[alert.level];

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg border"
      style={{
        background: `${color}11`,
        borderColor: `${color}44`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase" style={{ color }}>{alert.level}</span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-white/50 text-xs">{alert.source}</span>
          </div>
          <p className="text-white/80 text-sm mt-0.5">{alert.message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-xs">{formatTimestamp(alert.timestamp)}</span>
        {!alert.resolved && (
          <button onClick={() => onResolve(alert.id)} className="text-xs px-2 py-1 rounded border border-white/20 text-white/60 hover:text-white transition-colors">
            RESOLVE
          </button>
        )}
        <button onClick={() => onDismiss(alert.id)} className="text-xs px-2 py-1 rounded border border-white/20 text-white/60 hover:text-red-400 transition-colors">
          ✕
        </button>
      </div>
    </div>
  );
}
