'use client';
import { ThreatLevel } from '@/lib/types';
import { NeonButton } from '@/components/ui/NeonButton';
import { SiliconCard } from '@/components/ui/SiliconCard';

const LEVELS: Array<ThreatLevel | 'ALL'> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'];

interface FilterPanelProps {
  severity: ThreatLevel | 'ALL';
  onSeverityChange: (v: ThreatLevel | 'ALL') => void;
  search: string;
  onSearchChange: (v: string) => void;
  onExport: () => void;
}

export function FilterPanel({ severity, onSeverityChange, search, onSearchChange, onExport }: FilterPanelProps) {
  return (
    <SiliconCard padding="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="SEARCH LOGS..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 text-xs tracking-widest uppercase placeholder-white/20 focus:outline-none focus:border-orange-500/50"
        />
        <div className="flex gap-1">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => onSeverityChange(l)}
              className={`px-3 py-1.5 text-xs rounded-lg tracking-widest uppercase transition-all border ${
                severity === l ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <NeonButton variant="ghost" size="sm" onClick={onExport}>EXPORT CSV</NeonButton>
      </div>
    </SiliconCard>
  );
}
