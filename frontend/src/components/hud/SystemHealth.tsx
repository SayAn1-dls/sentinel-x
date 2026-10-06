'use client';
import { SiliconCard } from '@/components/ui/SiliconCard';

const SYSTEMS = [
  { name: 'FORENSIC ENGINE', health: 99, color: '#00FF88' },
  { name: 'AI SCANNER', health: 97, color: '#00FF88' },
  { name: 'AUDIT LOGGER', health: 100, color: '#00FF88' },
  { name: 'NETWORK MONITOR', health: 94, color: '#FFD700' },
  { name: 'THREAT ANALYZER', health: 98, color: '#00FF88' },
  { name: 'DATA PIPELINE', health: 91, color: '#FFD700' },
];

export function SystemHealth() {
  return (
    <SiliconCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm">SYSTEM HEALTH</h2>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs uppercase tracking-widest">NOMINAL</span>
        </div>
      </div>
      <div className="space-y-3">
        {SYSTEMS.map(({ name, health, color }) => (
          <div key={name}>
            <div className="flex justify-between mb-1">
              <span className="text-white/50 text-xs uppercase tracking-widest">{name}</span>
              <span className="text-xs font-bold" style={{ color }}>{health}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full">
              <div
                className="h-full rounded-full"
                style={{ width: `${health}%`, background: color, boxShadow: `0 0 6px ${color}` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SiliconCard>
  );
}
