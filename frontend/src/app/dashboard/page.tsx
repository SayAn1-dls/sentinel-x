'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Pulse, Warning, Eye, ArrowRight,
  ChartLine, FingerprintSimple, Globe, Cpu, GearSix, ClockCounterClockwise,
  Lightning, TrendUp, TrendDown, CaretRight, Bell, User, List,
  CaretLeft, SignOut, X
} from '@phosphor-icons/react';
import Link from 'next/link';

/* ── Sidebar ── */
const navItems = [
  { href: '/dashboard', icon: Pulse, label: 'Dashboard', active: true },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log' },
  { href: '/network', icon: Globe, label: 'Network' },
  { href: '/security', icon: FingerprintSimple, label: 'Security' },
  { href: '/admin', icon: GearSix, label: 'Admin' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#0C0C14] border-r border-white/[0.04] transition-all duration-300 z-40 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.04]">
        <ShieldCheck weight="duotone" className="w-7 h-7 text-[#00D4FF] flex-shrink-0" />
        {!collapsed && <span className="text-sm font-bold tracking-tight text-white">SENTINEL-X</span>}
        <button onClick={onToggle} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
          {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
        </button>
      </div>
      <nav className="mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${item.active ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-medium' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}>
            <item.icon weight={item.active ? 'duotone' : 'regular'} className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.04]">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#00FFB3]/20 flex items-center justify-center flex-shrink-0">
            <User weight="bold" className="w-4 h-4 text-[#00D4FF]" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/70 truncate">Operator</div>
              <div className="text-[10px] text-white/30">sentinel-x</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ── Mock Data ── */
const MOCK_STATS = [
  { label: 'Transactions Today', value: '24,891', change: '+12.4%', up: true, icon: Pulse, color: '#00D4FF' },
  { label: 'Threats Blocked', value: '47', change: '+8.2%', up: true, icon: ShieldCheck, color: '#00FFB3' },
  { label: 'Risk Score', value: '23.4', change: '-5.1%', up: false, icon: Warning, color: '#FFB800' },
  { label: 'Active Nodes', value: '893', change: '+2.1%', up: true, icon: Globe, color: '#00D4FF' },
];

const MOCK_TRANSACTIONS = [
  { id: 'TX-8A2F', amount: '$42,180.00', from: 'NODE-7X2', to: 'NODE-3K9', risk: 'LOW', time: '2 min ago', status: 'Cleared' },
  { id: 'TX-C91D', amount: '$128,500.00', from: 'NODE-1A8', to: 'NODE-9F2', risk: 'HIGH', time: '5 min ago', status: 'Under Review' },
  { id: 'TX-F4E7', amount: '$8,920.00', from: 'NODE-5M3', to: 'NODE-2J6', risk: 'CLEAR', time: '8 min ago', status: 'Cleared' },
  { id: 'TX-B28A', amount: '$256,000.00', from: 'NODE-4P1', to: 'NODE-8W5', risk: 'CRITICAL', time: '12 min ago', status: 'Blocked' },
  { id: 'TX-E5C3', amount: '$15,750.00', from: 'NODE-6T4', to: 'NODE-1R8', risk: 'LOW', time: '15 min ago', status: 'Cleared' },
  { id: 'TX-A1D9', amount: '$89,300.00', from: 'NODE-2K7', to: 'NODE-5N3', risk: 'MEDIUM', time: '18 min ago', status: 'Flagged' },
  { id: 'TX-D7F2', amount: '$3,200.00', from: 'NODE-9H6', to: 'NODE-4L1', risk: 'CLEAR', time: '22 min ago', status: 'Cleared' },
  { id: 'TX-9B4E', amount: '$467,890.00', from: 'NODE-3V2', to: 'NODE-7X8', risk: 'HIGH', time: '25 min ago', status: 'Escalated' },
];

const MOCK_ALERTS = [
  { id: 1, severity: 'CRITICAL', message: 'Anomalous cluster #7 detected — 12 linked entities', time: '3 min ago', color: '#FF2D55' },
  { id: 2, severity: 'HIGH', message: 'Sanctions hit on NODE-3K9 (OFAC SDN match)', time: '8 min ago', color: '#FF6B00' },
  { id: 3, severity: 'MEDIUM', message: 'Velocity threshold exceeded — NODE-1A8', time: '14 min ago', color: '#FFB800' },
  { id: 4, severity: 'HIGH', message: 'PEP match pending review — Entity #2847', time: '21 min ago', color: '#FF6B00' },
  { id: 5, severity: 'LOW', message: 'Routine watchlist refresh completed', time: '30 min ago', color: '#00FFB3' },
];

const RISK_COLOR: Record<string, string> = {
  CRITICAL: 'text-[#FF2D55] bg-[#FF2D55]/10', HIGH: 'text-[#FF6B00] bg-[#FF6B00]/10',
  MEDIUM: 'text-[#FFB800] bg-[#FFB800]/10', LOW: 'text-[#00FFB3] bg-[#00FFB3]/10', CLEAR: 'text-[#00D4FF] bg-[#00D4FF]/10',
};

const MOCK_TIMELINE = [
  { time: '23:41', event: 'Cluster #7 quarantined — 3 accounts frozen', type: 'action' },
  { time: '23:39', event: 'L3 escalation triggered for TX-B28A', type: 'alert' },
  { time: '23:35', event: 'AI scan completed — 2,847 transactions clear', type: 'info' },
  { time: '23:30', event: 'New sanctions list loaded (OFAC update)', type: 'system' },
  { time: '23:24', event: 'Network anomaly resolved — NODE-5M3', type: 'resolved' },
];

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const dismissAlert = useCallback((id: number) => {
    try { setDismissedAlerts(prev => [...prev, id]); } catch (_) {}
  }, []);

  const activeAlerts = MOCK_ALERTS.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Dashboard</h1>
            <p className="text-xs text-white/30">Real-time threat monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAlertPanel(!showAlertPanel)} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Bell weight="duotone" className="w-5 h-5 text-white/50" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF2D55] text-[10px] font-bold flex items-center justify-center">{activeAlerts.length}</span>
              )}
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FFB3]/10 border border-[#00FFB3]/20">
              <span className="w-2 h-2 rounded-full bg-[#00FFB3] animate-pulse" />
              <span className="text-xs text-[#00FFB3] font-medium">System Online</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_STATS.map((stat) => (
              <motion.div key={stat.label} whileHover={{ y: -2 }}
                className="p-5 rounded-xl border border-white/[0.06] bg-[#0D0D14] hover:border-white/[0.1] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon weight="duotone" className="w-5 h-5" style={{ color: stat.color }} />
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-[#00FFB3]' : 'text-[#FF2D55]'}`}>
                    {stat.up ? <TrendUp size={12} /> : <TrendDown size={12} />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-xs text-white/30 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Feed */}
            <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Lightning weight="duotone" className="w-4 h-4 text-[#00D4FF]" />
                  Live Transaction Feed
                </h2>
                <Link href="/analysis" className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 flex items-center gap-1">
                  View All <CaretRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="text-xs font-mono text-white/60 w-16">{tx.id}</span>
                    <span className="text-xs text-white/30 w-24">{tx.from} → {tx.to}</span>
                    <span className="text-sm font-medium text-white/80 flex-1">{tx.amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_COLOR[tx.risk] || ''}`}>{tx.risk}</span>
                    <span className="text-xs text-white/30 w-20 text-right">{tx.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pulse Timeline */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <ClockCounterClockwise weight="duotone" className="w-4 h-4 text-[#00FFB3]" />
                  Pulse Timeline
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {MOCK_TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'alert' ? 'bg-[#FF6B00]' : item.type === 'action' ? 'bg-[#FF2D55]' : item.type === 'resolved' ? 'bg-[#00FFB3]' : 'bg-[#00D4FF]'}`} />
                      {i < MOCK_TIMELINE.length - 1 && <div className="w-px flex-1 bg-white/[0.06] mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-white/60">{item.event}</p>
                      <span className="text-[10px] text-white/20">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Run AI Scan', icon: Cpu, href: '/analysis', color: '#00D4FF' },
              { label: 'View Audit Log', icon: ClockCounterClockwise, href: '/audit', color: '#00FFB3' },
              { label: 'Network Map', icon: Globe, href: '/network', color: '#FFB800' },
              { label: 'Security Panel', icon: FingerprintSimple, href: '/security', color: '#FF6B00' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl border border-white/[0.06] bg-[#0D0D14] hover:border-white/[0.1] transition-colors cursor-pointer flex items-center gap-3">
                  <action.icon weight="duotone" className="w-5 h-5" style={{ color: action.color }} />
                  <span className="text-sm text-white/60">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Alert Side Panel */}
        <AnimatePresence>
          {showAlertPanel && (
            <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              className="fixed right-0 top-0 h-screen w-[380px] bg-[#0C0C14] border-l border-white/[0.06] z-50 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Bell weight="duotone" className="w-4 h-4 text-[#FF6B00]" />
                  Active Alerts ({activeAlerts.length})
                </h3>
                <button onClick={() => setShowAlertPanel(false)} className="p-1 rounded hover:bg-white/5"><X size={16} className="text-white/40" /></button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-65px)]">
                {activeAlerts.map((alert) => (
                  <motion.div key={alert.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-white/[0.06] bg-[#0D0D14]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: alert.color, backgroundColor: `${alert.color}15` }}>{alert.severity}</span>
                      <span className="text-[10px] text-white/20">{alert.time}</span>
                    </div>
                    <p className="text-xs text-white/60 mb-3">{alert.message}</p>
                    <div className="flex gap-2">
                      <button onClick={() => dismissAlert(alert.id)} className="text-[10px] px-3 py-1 rounded bg-white/5 text-white/40 hover:bg-white/10 transition-colors">Dismiss</button>
                      <button className="text-[10px] px-3 py-1 rounded bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors">Investigate</button>
                    </div>
                  </motion.div>
                ))}
                {activeAlerts.length === 0 && (
                  <div className="text-center py-12 text-white/20 text-sm">All clear. No active alerts.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
