'use client';
import { NeonButton } from '@/components/ui/NeonButton';
import { SiliconCard } from '@/components/ui/SiliconCard';

const ACTIONS = [
  { label: 'FULL SCAN', icon: '🧠', color: 'orange' as const, desc: 'Run AI deep scan on all transactions' },
  { label: 'LOCK GATEWAYS', icon: '🔒', color: 'red' as const, desc: 'Emergency lock all network gateways' },
  { label: 'EXPORT REPORT', icon: '📋', color: 'cyan' as const, desc: 'Export full forensic audit report' },
  { label: 'CLEAR ALERTS', icon: '✓', color: 'green' as const, desc: 'Resolve all non-critical alerts' },
];

export function QuickActions() {
  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">QUICK ACTIONS</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(action => (
          <button
            key={action.label}
            className="flex flex-col items-start p-3 rounded-lg border border-white/5 hover:border-white/20 transition-all hover:bg-white/5 text-left"
          >
            <span className="text-xl mb-2">{action.icon}</span>
            <span className="text-xs font-black tracking-widest uppercase text-white/80">{action.label}</span>
            <span className="text-white/30 text-xs mt-1 leading-tight">{action.desc}</span>
          </button>
        ))}
      </div>
    </SiliconCard>
  );
}
