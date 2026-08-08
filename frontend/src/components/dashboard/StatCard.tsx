'use client';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  delta?: number;
  icon?: string;
}

export function StatCard({ label, value, subtitle, color = '#FF6B00', delta, icon }: StatCardProps) {
  return (
    <SiliconCard glow={color === '#FF0033' ? 'red' : color === '#FF6B00' ? 'orange' : 'cyan'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs tracking-widest uppercase mb-1">{label}</p>
          <p className="text-3xl font-black" style={{ color }}>{value}</p>
          {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl opacity-50">{icon}</span>}
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className={delta >= 0 ? 'text-red-400' : 'text-green-400'} style={{ fontSize: 11 }}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
          <span className="text-white/30 text-xs">vs last hour</span>
        </div>
      )}
    </SiliconCard>
  );
}
