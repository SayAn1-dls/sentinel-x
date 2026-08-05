'use client';
import { Transaction } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { formatCurrency, formatTimestamp, maskSensitive } from '@/lib/utils';

interface TransactionFeedProps {
  transactions: Transaction[];
  onBlock?: (id: string) => void;
}

export function TransactionFeed({ transactions, onBlock }: TransactionFeedProps) {
  return (
    <SiliconCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm">LIVE TRANSACTION FEED</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/40 text-xs">LIVE</span>
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-96">
        {transactions.slice(0, 20).map(tx => (
          <div
            key={tx.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5 hover:border-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-xs font-mono truncate">{maskSensitive(tx.sender)}</span>
                <span className="text-white/30 text-xs">→</span>
                <span className="text-white/80 text-xs font-mono truncate">{maskSensitive(tx.receiver)}</span>
              </div>
              <span className="text-white/30 text-xs">{formatTimestamp(tx.timestamp)}</span>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <span className="text-white font-bold text-sm">{formatCurrency(tx.amount, tx.currency)}</span>
              <StatusBadge level={tx.threatLevel} pulse={tx.threatLevel === 'CRITICAL'} />
              {onBlock && tx.status !== 'BLOCKED' && (
                <button
                  onClick={() => onBlock(tx.id)}
                  className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  BLOCK
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SiliconCard>
  );
}
