'use client';
import { AuditLog } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { formatTimestamp, maskSensitive } from '@/lib/utils';

interface AuditLogTableProps {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function AuditLogTable({ logs, total, page, totalPages, onPageChange }: AuditLogTableProps) {
  return (
    <SiliconCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm">AUDIT LOG — DEEP TRACE</h2>
        <span className="text-white/40 text-xs">{total} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {['TIME', 'ACTION', 'ACTOR', 'TARGET', 'SEVERITY', 'SESSION'].map(h => (
                <th key={h} className="text-left text-white/40 tracking-widest uppercase pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2 pr-4 text-white/50 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                <td className="py-2 pr-4 font-mono text-orange-400">{log.action}</td>
                <td className="py-2 pr-4 text-white/70">{log.actor}</td>
                <td className="py-2 pr-4 text-white/50 font-mono">{maskSensitive(log.target)}</td>
                <td className="py-2 pr-4"><StatusBadge level={log.severity} /></td>
                <td className="py-2 text-white/30 font-mono">{log.sessionId.slice(0, 12)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-white/30 text-xs">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="text-xs px-3 py-1 rounded border border-white/10 text-white/50 hover:border-orange-500/50 disabled:opacity-30 transition-all">PREV</button>
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-xs px-3 py-1 rounded border border-white/10 text-white/50 hover:border-orange-500/50 disabled:opacity-30 transition-all">NEXT</button>
        </div>
      </div>
    </SiliconCard>
  );
}
