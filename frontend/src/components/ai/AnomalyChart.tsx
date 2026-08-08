'use client';
import { Transaction } from '@/lib/types';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface AnomalyChartProps {
  transactions: Transaction[];
}

export function AnomalyChart({ transactions }: AnomalyChartProps) {
  const hourly = Array.from({ length: 24 }, (_, h) => {
    const txs = transactions.filter(t => new Date(t.timestamp).getHours() === h);
    const flagged = txs.filter(t => t.threatLevel === 'HIGH' || t.threatLevel === 'CRITICAL').length;
    return { hour: h, total: txs.length, flagged };
  });

  const maxTotal = Math.max(...hourly.map(h => h.total), 1);

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">ANOMALY DETECTION — 24H</h2>
      <div className="flex items-end gap-1 h-32">
        {hourly.map(({ hour, total, flagged }) => {
          const totalH = (total / maxTotal) * 100;
          const flaggedH = (flagged / maxTotal) * 100;
          return (
            <div key={hour} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-sm transition-all"
                  style={{ height: `${totalH}%`, background: 'rgba(255,107,0,0.3)' }}
                />
                {flaggedH > 0 && (
                  <div
                    className="w-full rounded-sm absolute bottom-0"
                    style={{ height: `${flaggedH}%`, background: '#FF0033', opacity: 0.8 }}
                  />
                )}
              </div>
              <span className="text-white/20 text-xs">{hour}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-orange-500/50" />
          <span className="text-white/40 text-xs uppercase tracking-wide">Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-red-500" />
          <span className="text-white/40 text-xs uppercase tracking-wide">Flagged</span>
        </div>
      </div>
    </SiliconCard>
  );
}
