'use client';
import { AuditLog } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface ActivityTimelineProps {
  logs: AuditLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">ACTIVITY TIMELINE</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-4">
          {logs.slice(0, 10).map((log, i) => {
            const color = THREAT_COLORS[log.severity];
            return (
              <div key={log.id} className="flex gap-4 pl-10 relative">
                <div
                  className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-black"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{log.action}</span>
                    <span className="text-white/30 text-xs">•</span>
                    <span className="text-white/50 text-xs">{log.actor}</span>
                  </div>
                  <p className="text-white/60 text-xs mt-0.5">{log.details}</p>
                  <span className="text-white/30 text-xs">{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiliconCard>
  );
}
