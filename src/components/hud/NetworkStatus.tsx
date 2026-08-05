'use client';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { SiliconCard } from '@/components/ui/SiliconCard';

export function NetworkStatus() {
  const { gateways, healthScore, avgLatency } = useNetwork();
  const statusColor = healthScore >= 90 ? '#00FF88' : healthScore >= 70 ? '#FFD700' : '#FF0033';

  return (
    <SiliconCard padding="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/40 text-xs tracking-widest uppercase">NETWORK STATUS</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor }} />
          <span className="text-xs font-bold" style={{ color: statusColor }}>
            {healthScore >= 90 ? 'NOMINAL' : healthScore >= 70 ? 'DEGRADED' : 'CRITICAL'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[['ONLINE', gateways.filter(g => g.status === 'ONLINE').length, '#00FF88'],
          ['DEGRADED', gateways.filter(g => g.status === 'DEGRADED').length, '#FFD700'],
          ['OFFLINE', gateways.filter(g => g.status === 'OFFLINE').length, '#FF0033'],
        ].map(([label, count, color]) => (
          <div key={label as string} className="text-center">
            <div className="font-black text-lg" style={{ color: color as string }}>{count as number}</div>
            <div className="text-white/30 text-xs">{label as string}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>AVG LATENCY: <span className="text-cyan-400 font-bold">{avgLatency}ms</span></span>
        <span>HEALTH: <span className="font-bold" style={{ color: statusColor }}>{healthScore}%</span></span>
      </div>
    </SiliconCard>
  );
}
