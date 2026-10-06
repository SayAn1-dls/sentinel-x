'use client';
import { ThreatLevel, TransactionStatus } from '@/lib/types';
import { THREAT_COLORS, THREAT_BG } from '@/lib/constants';

interface StatusBadgeProps {
  level?: ThreatLevel;
  status?: TransactionStatus;
  pulse?: boolean;
}

const STATUS_COLORS: Record<TransactionStatus, string> = {
  FLAGGED: '#FF6B00',
  CLEAN: '#00FF88',
  PENDING: '#FFD700',
  BLOCKED: '#FF0033',
};

export function StatusBadge({ level, status, pulse = false }: StatusBadgeProps) {
  const label = level || status || 'CLEAR';
  const color = level ? THREAT_COLORS[level] : status ? STATUS_COLORS[status] : '#00CFFF';
  const bg = level ? THREAT_BG[level] : `${color}22`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase`}
      style={{ color, background: bg, border: `1px solid ${color}44` }}
    >
      {pulse && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color }}
        />
      )}
      {label}
    </span>
  );
}
