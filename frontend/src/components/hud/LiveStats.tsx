'use client';
import { DashboardStats } from '@/lib/types';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface LiveStatsProps {
  stats: DashboardStats;
}

const STAT_CONFIG = [
  { key: 'totalTransactions' as const, label: 'TOTAL TX', color: '#00CFFF', suffix: '' },
  { key: 'flaggedToday' as const, label: 'FLAGGED TODAY', color: '#FF6B00', suffix: '' },
  { key: 'blockedThreats' as const, label: 'BLOCKED', color: '#FF0033', suffix: '' },
  { key: 'activeScans' as const, label: 'ACTIVE SCANS', color: '#FFD700', suffix: '' },
  { key: 'networkHealth' as const, label: 'NET HEALTH', color: '#00FF88', suffix: '%' },
  { key: 'threatIndex' as const, label: 'THREAT INDEX', color: '#FF6B00', suffix: '/100' },
];

export function LiveStats({ stats }: LiveStatsProps) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_CONFIG.map(({ key, label, color, suffix }) => (
        <SiliconCard key={key} padding="p-4">
          <div className="text-white/40 text-xs tracking-widest uppercase mb-1">{label}</div>
          <div className="font-black text-2xl" style={{ color }}>
            {stats[key]}{suffix}
          </div>
        </SiliconCard>
      ))}
    </div>
  );
}
