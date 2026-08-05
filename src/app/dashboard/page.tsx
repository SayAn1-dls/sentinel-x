'use client';
import { useForensic } from '@/lib/hooks/useForensic';
import { useThreat } from '@/lib/hooks/useThreat';
import { MOCK_AUDIT_LOGS } from '@/lib/mock-data';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { LiveStats } from '@/components/hud/LiveStats';
import { AlertBanner } from '@/components/hud/AlertBanner';
import { TransactionFeed } from '@/components/dashboard/TransactionFeed';
import { ThreatMatrix } from '@/components/dashboard/ThreatMatrix';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';

export default function DashboardPage() {
  const { transactions, stats, blockTransaction } = useForensic();
  const { active, resolve, dismiss } = useThreat();

  return (
    <div className="min-h-screen">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="py-6">
          <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">COMMAND CENTER</h1>
          <p className="text-white/40 text-sm mt-1">Real-time forensic transaction monitoring</p>
        </div>

        {/* Active Alerts */}
        {active.length > 0 && (
          <div className="space-y-2 mb-6">
            {active.slice(0, 3).map(alert => (
              <AlertBanner key={alert.id} alert={alert} onResolve={resolve} onDismiss={dismiss} />
            ))}
          </div>
        )}

        {/* KPI Stats */}
        {stats && <div className="mb-6"><LiveStats stats={stats} /></div>}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionFeed transactions={transactions} onBlock={blockTransaction} />
          </div>
          <div className="space-y-6">
            <ThreatMatrix transactions={transactions} />
            <ActivityTimeline logs={MOCK_AUDIT_LOGS} />
          </div>
        </div>
      </main>
    </div>
  );
}
