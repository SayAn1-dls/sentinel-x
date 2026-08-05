'use client';
import { Transaction } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface RiskHeatmapProps {
  transactions: Transaction[];
}

export function RiskHeatmap({ transactions }: RiskHeatmapProps) {
  const entityRisk = transactions.reduce((acc, tx) => {
    const existing = acc.get(tx.sender) ?? { total: 0, risk: 0, count: 0 };
    acc.set(tx.sender, {
      total: existing.total + tx.amount,
      risk: Math.max(existing.risk, tx.riskScore),
      count: existing.count + 1,
    });
    return acc;
  }, new Map<string, { total: number; risk: number; count: number }>());

  const topEntities = [...entityRisk.entries()]
    .sort((a, b) => b[1].risk - a[1].risk)
    .slice(0, 8);

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">ENTITY RISK HEATMAP</h2>
      <div className="grid grid-cols-4 gap-2">
        {topEntities.map(([entity, data]) => {
          const level = data.risk >= 90 ? 'CRITICAL' : data.risk >= 70 ? 'HIGH' : data.risk >= 45 ? 'MEDIUM' : 'LOW';
          const color = THREAT_COLORS[level as keyof typeof THREAT_COLORS];
          return (
            <div
              key={entity}
              className="p-2 rounded-lg border flex flex-col"
              style={{ background: `${color}11`, borderColor: `${color}33` }}
            >
              <span className="text-white/40 text-xs truncate">{entity.split('-')[0]}</span>
              <span className="font-black text-lg" style={{ color }}>{data.risk}</span>
              <span className="text-white/30 text-xs">{data.count} tx</span>
            </div>
          );
        })}
      </div>
    </SiliconCard>
  );
}
