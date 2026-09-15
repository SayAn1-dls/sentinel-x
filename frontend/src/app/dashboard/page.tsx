'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Warning,
  Bell,
  Lightning,
  Clock,
  ChartBar,
  Cpu,
  Globe,
  Eye,
  Gear,
  User,
  SignOut,
  CaretRight,
  CaretLeft,
  House,
  List,
  Lock,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/analysis', label: 'AI Analysis', icon: Cpu },
  { href: '/audit', label: 'Audit Log', icon: List },
  { href: '/network', label: 'Network', icon: Globe },
  { href: '/security', label: 'Security', icon: Lock },
  { href: '/admin', label: 'Admin', icon: Gear },
];

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#FF2D55',
  HIGH: '#FF6B00',
  MEDIUM: '#FFB800',
  LOW: '#00FFB3',
  CLEAR: '#00D4FF',
};

const MOCK_TXNS = [
  { id: 'TX-6D1F2C', amount: '₹8,91,200', from: 'ENT-0091', to: 'SHELL-44X', risk: 'CRITICAL', time: '09:12:34' },
  { id: 'TX-4F2A1B', amount: '₹4,56,000', from: 'ENT-0234', to: 'ACC-9912', risk: 'HIGH', time: '09:11:58' },
  { id: 'TX-9C3D2E', amount: '₹2,34,500', from: 'ENT-0567', to: 'ACC-1138', risk: 'MEDIUM', time: '09:11:22' },
  { id: 'TX-1A7B3F', amount: '₹12,000', from: 'ENT-0312', to: 'ACC-5501', risk: 'LOW', time: '09:10:47' },
  { id: 'TX-8E4C5D', amount: '₹78,900', from: 'ENT-0445', to: 'ACC-7723', risk: 'CLEAR', time: '09:10:11' },
  { id: 'TX-2B9F6A', amount: '₹5,67,800', from: 'ENT-0001', to: 'SHELL-12B', risk: 'CRITICAL', time: '09:09:35' },
  { id: 'TX-7D3E8C', amount: '₹3,21,400', from: 'ENT-0089', to: 'ACC-3345', risk: 'HIGH', time: '09:08:59' },
  { id: 'TX-5F1A2B', amount: '₹1,45,600', from: 'ENT-0673', to: 'ACC-8890', risk: 'MEDIUM', time: '09:08:23' },
  { id: 'TX-3C8D4E', amount: '₹56,200', from: 'ENT-0892', to: 'ACC-2267', risk: 'LOW', time: '09:07:47' },
  { id: 'TX-0A6B9F', amount: '₹9,800', from: 'ENT-0156', to: 'ACC-4412', risk: 'CLEAR', time: '09:07:11' },
  { id: 'TX-4E2C7D', amount: '₹7,23,100', from: 'ENT-0044', to: 'SHELL-77A', risk: 'CRITICAL', time: '09:06:35' },
  { id: 'TX-6A1D3B', amount: '₹2,89,300', from: 'ENT-0223', to: 'ACC-6654', risk: 'HIGH', time: '09:05:59' },
  { id: 'TX-8C5E9F', amount: '₹98,700', from: 'ENT-0345', to: 'ACC-1189', risk: 'MEDIUM', time: '09:05:23' },
  { id: 'TX-1B4A6C', amount: '₹34,100', from: 'ENT-0478', to: 'ACC-9934', risk: 'LOW', time: '09:04:47' },
  { id: 'TX-9D7F2E', amount: '₹5,600', from: 'ENT-0601', to: 'ACC-5567', risk: 'CLEAR', time: '09:04:11' },
];

const INITIAL_ALERTS = [
  { id: 1, severity: 'CRITICAL', entity: 'ENT-0091', message: 'Sanctions list match detected — OFAC SDN hit on beneficiary entity' },
  { id: 2, severity: 'CRITICAL', entity: 'TX-6D1F2C', message: 'Velocity breach — ₹8.9L transferred in under 60 seconds' },
  { id: 3, severity: 'HIGH', entity: 'CLUSTER-7X', message: 'Anomalous cluster formation — 12 entities linked in 24h' },
  { id: 4, severity: 'HIGH', entity: 'ENT-0567', message: 'Geographic mismatch — Mumbai IP accessing Delhi-registered account' },
  { id: 5, severity: 'MEDIUM', entity: 'ENT-0445', message: 'Structuring pattern — 5 transactions just below ₹10L threshold' },
];

function useCountUp(target: number, duration: number = 2000, decimals: number = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clock, setClock] = useState('');
  const [txns, setTxns] = useState(MOCK_TXNS.slice(0, 10));
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [txnIndex, setTxnIndex] = useState(10);

  const totalTx = useCountUp(4291847, 2000);
  const threats = useCountUp(12847, 2000);
  const nodes = useCountUp(893, 1800);
  const risk = useCountUp(94.2, 2000, 1);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTxnIndex((prev) => {
        const next = (prev + 1) % MOCK_TXNS.length;
        setTxns((old) => {
          const newTxn = { ...MOCK_TXNS[next], time: new Date().toLocaleTimeString('en-IN', { hour12: false }) };
          const updated = [newTxn, ...old];
          return updated.slice(0, 15);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const dismissAlert = (id: number) => setAlerts((a) => a.filter((x) => x.id !== id));

  const stats = [
    { label: 'Total Transactions', value: totalTx, icon: ChartBar, color: '#00D4FF' },
    { label: 'Threats Intercepted', value: threats, icon: Warning, color: '#FF2D55' },
    { label: 'Active Nodes', value: nodes, icon: Globe, color: '#00FFB3' },
    { label: 'System Risk', value: `${risk}%`, icon: ShieldCheck, color: '#FF6B00' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col border-r border-white/5 bg-[#0D0D14] transition-all duration-300"
        style={{ width: sidebarOpen ? 240 : 64 }}
      >
        <div className="flex items-center gap-2 px-4 h-16 border-b border-white/5">
          <Shield size={28} weight="fill" color="#00D4FF" />
          {sidebarOpen && <span className="text-lg font-bold tracking-wider text-[#00D4FF]">SENTINEL-X</span>}
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/dashboard';
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                <User size={16} color="#00D4FF" />
              </div>
              <div>
                <div className="text-xs font-medium text-white/80">Sayan Bhattacharya</div>
                <div className="text-[10px] text-white/40 font-mono">ANALYST</div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0D0D14] border border-white/10 flex items-center justify-center hover:border-[#00D4FF]/40 transition-colors"
        >
          {sidebarOpen ? <CaretLeft size={12} color="#00D4FF" /> : <CaretRight size={12} color="#00D4FF" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarOpen ? 240 : 64 }}>
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-white">SENTINEL-X DASHBOARD</h1>
              <p className="text-white/40 text-sm mt-1">Real-time financial threat intelligence</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-[#0D0D14] border border-white/5 font-mono text-[#00D4FF] text-sm">
                <Clock size={14} className="inline mr-2" />
                {clock}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40 uppercase tracking-wider">{s.label}</span>
                    <Icon size={20} color={s.color} weight="fill" />
                  </div>
                  <div className="text-3xl font-bold font-mono" style={{ color: s.color }}>
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transaction Feed + Alert Panel */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {/* Transaction Feed */}
            <div className="col-span-3 rounded-xl bg-[#0D0D14] border border-white/5 p-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase">Live Transaction Feed</h2>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFB3] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FFB3]" />
                </span>
              </div>
              <div className="overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      <th className="text-left py-2 font-medium">TX ID</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-left py-2 font-medium pl-4">From</th>
                      <th className="text-left py-2 font-medium">To</th>
                      <th className="text-center py-2 font-medium">Risk</th>
                      <th className="text-right py-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((tx, i) => (
                      <tr
                        key={`${tx.id}-${i}`}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors data-row-enter"
                      >
                        <td className="py-2.5 font-mono text-[#00D4FF]">{tx.id}</td>
                        <td className="py-2.5 text-right font-mono text-white/80">{tx.amount}</td>
                        <td className="py-2.5 pl-4 font-mono text-white/50">{tx.from}</td>
                        <td className="py-2.5 font-mono text-white/50">{tx.to}</td>
                        <td className="py-2.5 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              color: RISK_COLORS[tx.risk],
                              backgroundColor: `${RISK_COLORS[tx.risk]}15`,
                              border: `1px solid ${RISK_COLORS[tx.risk]}30`,
                            }}
                          >
                            {tx.risk}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-white/40">{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alert Panel */}
            <div className="col-span-2 rounded-xl bg-[#0D0D14] border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} color="#FF2D55" weight="fill" />
                <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase">Active Threats</h2>
                <span className="ml-auto text-xs font-mono text-white/30">{alerts.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border transition-all hover:bg-white/[0.02]"
                    style={{
                      borderColor: `${RISK_COLORS[alert.severity]}20`,
                      backgroundColor: `${RISK_COLORS[alert.severity]}05`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            color: RISK_COLORS[alert.severity],
                            backgroundColor: `${RISK_COLORS[alert.severity]}15`,
                          }}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono text-white/60">{alert.entity}</span>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-white/20 hover:text-white/60 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">{alert.message}</p>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-white/20 text-sm">All threats dismissed</div>
                )}
              </div>
              <a
                href="/audit"
                className="mt-4 flex items-center gap-1 text-xs text-[#00D4FF]/60 hover:text-[#00D4FF] transition-colors"
              >
                View All Alerts <CaretRight size={12} />
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Run Analysis', href: '/analysis', color: '#00D4FF', icon: Cpu },
              { label: 'View Network', href: '/network', color: '#00FFB3', icon: Globe },
              { label: 'Audit Log', href: '/audit', color: '#FFB800', icon: List },
              { label: 'Admin Panel', href: '/admin', color: '#FF6B00', icon: Gear },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => (window.location.href = action.href)}
                  className="rounded-xl bg-[#0D0D14] border border-white/5 p-4 flex items-center gap-3 hover:border-white/10 transition-all group card-hover"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}10` }}
                  >
                    <Icon size={20} color={action.color} weight="fill" />
                  </div>
                  <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                    {action.label}
                  </span>
                  <CaretRight size={16} className="ml-auto text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
