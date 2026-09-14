'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockCounterClockwise, Funnel, Export, MagnifyingGlass,
  ArrowDown, CaretLeft, CaretRight, Cpu, Activity, ChartLine,
  TreeStructure, ShieldCheck, GearSix, Warning, CheckCircle,
  XCircle, Info, Eye, ArrowUp, Calendar, UserCircle
} from '@phosphor-icons/react';
import Link from 'next/link';

/* ─── Shared Sidebar ─── */
const navItems = [
  { href: '/dashboard', icon: Activity, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log', active: true },
  { href: '/network', icon: TreeStructure, label: 'Network' },
  { href: '/security', icon: ShieldCheck, label: 'Security' },
];

function MiniSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-[#0C0C14] border-r border-white/[0.06] flex flex-col z-40">
      <div className="p-3 flex items-center justify-center border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
          <Cpu weight="bold" className="w-5 h-5 text-[#0A0A0F]" />
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(n => (
          <Link key={n.href} href={n.href}
            className={`flex items-center justify-center w-full h-10 rounded-lg transition-all ${
              n.active ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
            title={n.label}>
            <n.icon weight={n.active ? 'fill' : 'regular'} className="w-5 h-5" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}

/* ─── Activity Timeline Chart (SVG) ─── */
function ActivityChart() {
  const hourlyData = [4, 7, 3, 2, 1, 5, 12, 18, 22, 15, 9, 14, 20, 16, 11, 8, 13, 19, 24, 17, 10, 6, 8, 5];
  const maxVal = Math.max(...hourlyData);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-6 text-[10px] text-white/30">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-400/60" /> Events</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400/60" /> Alerts</span>
      </div>
      <div className="flex items-end gap-[3px] h-20">
        {hourlyData.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(v / maxVal) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
            className={`flex-1 rounded-sm ${v > 18 ? 'bg-red-400/60' : 'bg-cyan-400/40'}`}
            title={`${String(i).padStart(2, '0')}:00 — ${v} events`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-white/20 font-mono">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}

/* ─── Types & Data ─── */
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  severity: Severity;
  details: string;
  ipAddress: string;
}

const mockAuditLogs: AuditEntry[] = [
  { id: 'AUD-001', timestamp: '2026-09-14T23:45:00Z', action: 'LOGIN', actor: 'admin@sentinel.io', target: 'user_a8f3b2', severity: 'LOW', details: 'Google OAuth login successful', ipAddress: '103.24.78.121' },
  { id: 'AUD-002', timestamp: '2026-09-14T23:42:00Z', action: 'THREAT_DETECTED', actor: 'ai-engine', target: 'TXN-4821', severity: 'CRITICAL', details: 'Velocity anomaly detected: 47 transactions in 2min window', ipAddress: 'system' },
  { id: 'AUD-003', timestamp: '2026-09-14T23:38:00Z', action: 'PASSKEY_REGISTERED', actor: 'analyst@corp.io', target: 'pk_89af2c', severity: 'MEDIUM', details: 'Biometric passkey registered for account', ipAddress: '192.168.1.45' },
  { id: 'AUD-004', timestamp: '2026-09-14T23:33:00Z', action: 'SCAN_COMPLETED', actor: 'ai-engine', target: 'SCAN-2847', severity: 'LOW', details: 'Full network scan completed — 12 entities analyzed', ipAddress: 'system' },
  { id: 'AUD-005', timestamp: '2026-09-14T23:28:00Z', action: 'ALERT_ESCALATED', actor: 'admin@sentinel.io', target: 'ALT-391', severity: 'HIGH', details: 'Alert escalated to critical — manual review initiated', ipAddress: '103.24.78.121' },
  { id: 'AUD-006', timestamp: '2026-09-14T23:22:00Z', action: 'CONFIG_CHANGED', actor: 'admin@sentinel.io', target: 'threshold_config', severity: 'MEDIUM', details: 'Anomaly threshold updated from 0.75 to 0.80', ipAddress: '103.24.78.121' },
  { id: 'AUD-007', timestamp: '2026-09-14T23:18:00Z', action: 'PASSKEY_LOGIN', actor: 'analyst@corp.io', target: 'user_c2d4e6', severity: 'CLEAR', details: 'Biometric passkey authentication successful', ipAddress: '192.168.1.45' },
  { id: 'AUD-008', timestamp: '2026-09-14T23:10:00Z', action: 'USER_CREATED', actor: 'system', target: 'user_f9a1b3', severity: 'LOW', details: 'New user account created via OAuth', ipAddress: 'system' },
  { id: 'AUD-009', timestamp: '2026-09-14T23:05:00Z', action: 'THREAT_MITIGATED', actor: 'admin@sentinel.io', target: 'THR-289', severity: 'HIGH', details: 'Threat marked as mitigated — entity flagged for monitoring', ipAddress: '103.24.78.121' },
  { id: 'AUD-010', timestamp: '2026-09-14T22:58:00Z', action: 'LOGOUT', actor: 'analyst@corp.io', target: 'user_c2d4e6', severity: 'CLEAR', details: 'Session terminated by user', ipAddress: '192.168.1.45' },
  { id: 'AUD-011', timestamp: '2026-09-14T22:50:00Z', action: 'ENTITY_FROZEN', actor: 'ai-engine', target: 'ENT-7X8', severity: 'CRITICAL', details: 'Entity frozen — sanctions list match confirmed', ipAddress: 'system' },
  { id: 'AUD-012', timestamp: '2026-09-14T22:45:00Z', action: 'REPORT_GENERATED', actor: 'admin@sentinel.io', target: 'RPT-0914', severity: 'LOW', details: 'Daily compliance report generated and archived', ipAddress: '103.24.78.121' },
];

const severityColors: Record<Severity, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  CLEAR: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const severityIcons: Record<Severity, typeof Warning> = {
  CRITICAL: XCircle,
  HIGH: Warning,
  MEDIUM: Info,
  LOW: CheckCircle,
  CLEAR: ShieldCheck,
};

/* ─── Summary Stats ─── */
function SummaryCards() {
  const stats = [
    { label: 'Total Events', value: '2,847', change: '+12%', up: true, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
    { label: 'Critical Alerts', value: '14', change: '+3', up: true, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
    { label: 'Auth Events', value: '892', change: '-5%', up: false, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
    { label: 'Active Users', value: '23', change: '+2', up: true, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`bg-[#0C0C14] rounded-xl border ${s.borderColor} p-4`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40 uppercase tracking-wider">{s.label}</span>
            <div className={`flex items-center gap-0.5 text-[10px] ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {s.up ? <ArrowUp weight="bold" className="w-2.5 h-2.5" /> : <ArrowDown weight="bold" className="w-2.5 h-2.5" />}
              {s.change}
            </div>
          </div>
          <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const perPage = 8;

  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return mockAuditLogs.filter(log => {
      if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return log.action.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.target.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, severityFilter]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Actor', 'Target', 'Severity', 'Details', 'IP'];
    const rows = filtered.map(l => [l.id, l.timestamp, l.action, l.actor, l.target, l.severity, l.details, l.ipAddress]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MiniSidebar />

      <main className="ml-16 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ClockCounterClockwise weight="duotone" className="w-7 h-7 text-cyan-400" />
              Audit Log
            </h1>
            <p className="text-white/40 text-sm mt-1">Immutable record of all system events · AES-256 encrypted</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Eye weight="fill" className="w-3 h-3 text-white/30" />
              <span className="text-cyan-400 text-xs font-mono tabular-nums">{currentTime}</span>
            </div>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-medium hover:bg-white/[0.1] transition-all">
              <Export weight="bold" className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        {/* Activity Timeline */}
        <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity weight="bold" className="w-4 h-4 text-cyan-400" />
            24h Activity Timeline
          </h3>
          <ActivityChart />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0C0C14] border border-white/[0.06] flex-1 max-w-sm">
            <MagnifyingGlass weight="bold" className="w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search actions, actors, details..."
              className="bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Funnel weight="bold" className="w-4 h-4 text-white/30" />
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'] as const).map(sev => (
              <button key={sev} onClick={() => { setSeverityFilter(sev); setPage(0); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  severityFilter === sev
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'
                }`}>
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/[0.06] text-xs text-white/30 uppercase tracking-wider">
            <div className="col-span-2 flex items-center gap-1"><Calendar weight="bold" className="w-3 h-3" /> Timestamp</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-2 flex items-center gap-1"><UserCircle weight="bold" className="w-3 h-3" /> Actor</div>
            <div className="col-span-1">Severity</div>
            <div className="col-span-3">Details</div>
            <div className="col-span-2">IP Address</div>
          </div>

          {/* Rows */}
          {paged.length === 0 ? (
            <div className="p-12 text-center">
              <Warning weight="duotone" className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No audit entries match your filter</p>
              <p className="text-white/20 text-xs mt-1">Try adjusting your search or severity filter</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {paged.map((log, i) => {
                const SevIcon = severityIcons[log.severity];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <div className="col-span-2 text-xs text-white/50 font-mono flex items-center gap-2">
                      <SevIcon weight="fill" className={`w-3.5 h-3.5 shrink-0 ${severityColors[log.severity].split(' ')[0]}`} />
                      {formatTime(log.timestamp)}
                    </div>
                    <div className="col-span-2 text-xs text-white/80 font-medium flex items-center">
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">{log.action}</span>
                    </div>
                    <div className="col-span-2 text-xs text-white/50 truncate">{log.actor}</div>
                    <div className="col-span-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${severityColors[log.severity]}`}>
                        {log.severity}
                      </span>
                    </div>
                    <div className="col-span-3 text-xs text-white/40 truncate">{log.details}</div>
                    <div className="col-span-2 text-xs text-white/30 font-mono flex items-center justify-between">
                      <span>{log.ipAddress}</span>
                      <CaretRight weight="bold" className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
              <span className="text-xs text-white/30">{filtered.length} total entries</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 disabled:opacity-30 transition-all">
                  <CaretLeft weight="bold" className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-white/50 font-mono">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 disabled:opacity-30 transition-all">
                  <CaretRight weight="bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-white/20 text-xs mt-4 text-center">
          Showing mock data — connect MongoDB for live audit trail
        </p>
      </main>
    </div>
  );
}
