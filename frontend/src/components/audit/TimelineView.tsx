'use client';
import { AuditLog } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface TimelineViewProps {
  logs: AuditLog[];
  maxItems?: number;
}

export function TimelineView({ logs, maxItems = 15 }: TimelineViewProps) {
  const items = logs.slice(0, maxItems);

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-6">FORENSIC TIMELINE</h2>
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/50 via-white/10 to-transparent" />
        <div className="space-y-5">
          {items.map((log, i) => {
            const color = THREAT_COLORS[log.severity];
            return (
              <div key={log.id} className="relative">
                <div
                  className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-black"
                  style={{ background: color }}
                />
                <div className="">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black tracking-widest uppercase" style={{ color }}>{log.action}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/50 text-xs">{log.actor}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/30 text-xs font-mono">{log.ipAddress}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{log.details}</p>
                  <span className="text-white/20 text-xs">{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiliconCard>
  );
}
