'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Activity, Warning, Eye, ArrowRight, SignOut,
  ChartLine, FingerprintSimple, Globe, Cpu, GearSix, ClockCounterClockwise,
  Lightning, TrendUp, TrendDown, CaretRight, Bell, User, List
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/* ─── Sidebar ─── */
const navItems = [
  { href: '/dashboard', icon: Activity, label: 'Dashboard', active: true },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log' },
  { href: '/network', icon: Globe, label: 'Network' },
  { href: '/security', icon: FingerprintSimple, label: 'Security' },
  { href: '/admin', icon: GearSix, label: 'Admin' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#0C0C14] border-r border-white/[0.06] flex flex-col z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="p-4 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shrink-0">
          <Cpu weight="bold" className="w-5 h-5 text-[#0A0A0F]" />
        </div>
        {!collapsed && <span className="text-sm font-bold text-white tracking-tight">SENTINEL-X</span>}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(n => (
          <Link key={n.href} href={n.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              n.active
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
            }`}>
            <n.icon weight={n.active ? 'fill' : 'regular'} className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{n.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.06]">
        {user && !collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <User weight="fill" className="w-7 h-7 text-white/40 bg-white/10 rounded-full p-1" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{user.name}</p>
              <p className="text-[10px] text-white/30 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 text-xs transition-all">
          <SignOut weight="bold" className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <button onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0C0C14] border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
        <List weight="bold" className="w-3 h-3" />
      </button>
    </aside>
  );
}

/* ─── Mock Data ─── */
const mockTransactions = [
  { id: 'TXN-4821', amount: '$12,340.00', entity: 'Apex Holdings Ltd', risk: 'HIGH', time: '2m ago', direction: 'outbound' },
  { id: 'TXN-4820', amount: '$890.50', entity: 'Nordic Trade Co', risk: 'LOW', time: '5m ago', direction: 'inbound' },
  { id: 'TXN-4819', amount: '$45,200.00', entity: 'Meridian Capital', risk: 'CRITICAL', time: '8m ago', direction: 'outbound' },
  { id: 'TXN-4818', amount: '$3,100.00', entity: 'Stellar Payments', risk: 'MEDIUM', time: '12m ago', direction: 'inbound' },
  { id: 'TXN-4817', amount: '$780.00', entity: 'Quantum Retail Inc', risk: 'LOW', time: '18m ago', direction: 'outbound' },
  { id: 'TXN-4816', amount: '$67,500.00', entity: 'Shadow Creek Finance', risk: 'HIGH', time: '22m ago', direction: 'outbound' },
];

const riskColors: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const stats = [
  { label: 'Transactions Scanned', value: '24,891', change: '+12.4%', up: true, icon: Activity },
  { label: 'Threats Detected', value: '47', change: '+3.1%', up: true, icon: Warning },
  { label: 'Threat Score', value: '94.2', change: '-1.8%', up: false, icon: ShieldCheck },
  { label: 'Active Monitors', value: '12', change: '+2', up: true, icon: Eye },
];

/* ─── Mini Chart (pure CSS/SVG) ─── */
function MiniChart({ color = '#00D4FF' }: { color?: string }) {
  const points = [40, 35, 45, 38, 52, 48, 55, 50, 60, 58, 65, 70];
  const max = Math.max(...points);
  const svgPoints = points.map((v, i) => `${(i / (points.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${svgPoints} 100,100`} fill={`url(#grad-${color})`} />
      <polyline points={svgPoints} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ─── Session Handler ─── */
function SessionHandler() {
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Check hash for session_id (Emergent OAuth callback)
    const hash = window.location.hash;
    const hashMatch = hash.match(/session_id=([^&]+)/);
    const paramId = searchParams.get('session_id');
    const sessionId = hashMatch?.[1] || paramId;

    if (!sessionId) return;
    setProcessing(true);

    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(async res => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `Authentication failed (${res.status})`);
        }
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard');
      })
      .catch(err => {
        setSessionError(err.message);
      })
      .finally(() => setProcessing(false));
  }, [searchParams, setUser]);

  if (processing) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0F] z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-white/60 text-sm">Establishing secure session...</p>
        </motion.div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0F] z-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#0C0C14] rounded-2xl border border-red-500/20 p-8 text-center space-y-4"
        >
          <Warning weight="fill" className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
          <p className="text-white/50 text-sm">{sessionError}</p>
          <div className="flex gap-3 pt-2">
            <Link href="/auth"
              className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.1] transition-all text-center">
              Back to Sign In
            </Link>
            <button onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-all">
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

/* ─── Main Dashboard ─── */
function DashboardContent() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <ShieldCheck weight="duotone" className="w-16 h-16 text-cyan-400/40 mx-auto" />
          <h2 className="text-xl font-bold text-white">Session Required</h2>
          <p className="text-white/50 text-sm">Sign in to access the security dashboard</p>
          <Link href="/auth"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all">
            Go to Sign In <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'} p-6 lg:p-8`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Command Center</h1>
            <p className="text-white/40 text-sm mt-1">Real-time threat monitoring & analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/60 transition-colors relative">
              <Bell weight="bold" className="w-4 h-4" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">System Online</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs">{s.label}</span>
                <s.icon weight="duotone" className="w-4 h-4 text-cyan-400/50" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.up ? <TrendUp weight="bold" className="w-3 h-3" /> : <TrendDown weight="bold" className="w-3 h-3" />}
                  {s.change}
                </span>
              </div>
              <div className="mt-2">
                <MiniChart color={s.up ? '#00FFB3' : '#FF4444'} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Transaction Feed */}
          <div className="lg:col-span-2 bg-[#0C0C14] rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Lightning weight="fill" className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Live Transaction Feed</h3>
              </div>
              <span className="text-white/30 text-xs">Showing mock data — connect MongoDB for live feed</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {mockTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${riskColors[tx.risk]}`}>
                      {tx.risk[0]}
                    </div>
                    <div>
                      <p className="text-sm text-white/90 font-medium">{tx.entity}</p>
                      <p className="text-xs text-white/40">{tx.id} · {tx.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-mono ${tx.direction === 'outbound' ? 'text-red-300' : 'text-emerald-300'}`}>
                      {tx.direction === 'outbound' ? '-' : '+'}{tx.amount}
                    </span>
                    <CaretRight weight="bold" className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions + Threat Summary */}
          <div className="space-y-6">
            {/* Threat Summary */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Threat Distribution</h3>
              <div className="space-y-3">
                {[
                  { level: 'Critical', count: 3, pct: 6, color: 'bg-red-500' },
                  { level: 'High', count: 12, pct: 26, color: 'bg-orange-500' },
                  { level: 'Medium', count: 18, pct: 38, color: 'bg-yellow-500' },
                  { level: 'Low', count: 14, pct: 30, color: 'bg-emerald-500' },
                ].map(t => (
                  <div key={t.level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">{t.level}</span>
                      <span className="text-xs text-white/40">{t.count} ({t.pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full ${t.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { href: '/analysis', icon: ChartLine, label: 'Run AI Analysis', color: 'text-cyan-400' },
                  { href: '/audit', icon: ClockCounterClockwise, label: 'View Audit Log', color: 'text-emerald-400' },
                  { href: '/network', icon: Globe, label: 'Network Map', color: 'text-purple-400' },
                  { href: '/security', icon: FingerprintSimple, label: 'Security Settings', color: 'text-orange-400' },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group">
                    <div className="flex items-center gap-2.5">
                      <a.icon weight="duotone" className={`w-4 h-4 ${a.color}`} />
                      <span className="text-sm text-white/70">{a.label}</span>
                    </div>
                    <ArrowRight weight="bold" className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    }>
      <SessionHandler />
      <DashboardContent />
    </Suspense>
  );
}
