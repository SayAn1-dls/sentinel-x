'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClockCounterClockwise, Funnel, Export, MagnifyingGlass,
  ArrowDown, CaretLeft, CaretRight, Cpu, Activity, ChartLine,
  TreeStructure, ShieldCheck, GearSix, Warning
} from '@phosphor-icons/react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: Activity, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log', active: true },
  { href: '/network', icon: TreeStructure, label: 'Network' },
  { href: '/security', icon: ShieldCheck, label: 'Security' },
  { href: '/admin', icon: GearSix, label: 'Admin' },
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
  { id: 'AUD-001', timestamp: '2026-09-14T21:30:00Z', action: 'LOGIN', actor: 'admin@sentinel.io', target: 'user_a8f3b2', severity: 'LOW', details: 'Google OAuth login successful', ipAddress: '103.24.78.121' },
  { id: 'AUD-002', timestamp: '2026-09-14T21:28:00Z', action: 'THREAT_DETECTED', actor: 'ai-engine', target: 'TXN-4821', severity: 'CRITICAL', details: 'Velocity anomaly detected: 47 transactions in 2min window', ipAddress: 'system' },
  { id: 'AUD-003', timestamp: '2026-09-14T21:25:00Z', action: 'PASSKEY_REGISTERED', actor: 'analyst@corp.io', target: 'pk_89af2c', severity: 'MEDIUM', details: 'Biometric passkey registered for account', ipAddress: '192.168.1.45' },
  { id: 'AUD-004', timestamp: '2026-09-14T21:20:00Z', action: 'SCAN_COMPLETED', actor: 'ai-engine', target: 'SCAN-2847', severity: 'LOW', details: 'Full network scan completed — 12 entities analyzed', ipAddress: 'system' },
  { id: 'AUD-005', timestamp: '2026-09-14T21:15:00Z', action: 'ALERT_ESCALATED', actor: 'admin@sentinel.io', target: 'ALT-391', severity: 'HIGH', details: 'Alert escalated to critical — manual review initiated', ipAddress: '103.24.78.121' },
  { id: 'AUD-006', timestamp: '2026-09-14T21:10:00Z', action: 'CONFIG_CHANGED', actor: 'admin@sentinel.io', target: 'threshold_config', severity: 'MEDIUM', details: 'Anomaly threshold updated from 0.75 to 0.80', ipAddress: '103.24.78.121' },
  { id: 'AUD-007', timestamp: '2026-09-14T21:05:00Z', action: 'PASSKEY_LOGIN', actor: 'analyst@corp.io', target: 'user_c2d4e6', severity: 'CLEAR', details: 'Biometric passkey authentication successful', ipAddress: '192.168.1.45' },
  { id: 'AUD-008', timestamp: '2026-09-14T21:00:00Z', action: 'USER_CREATED', actor: 'system', target: 'user_f9a1b3', severity: 'LOW', details: 'New user account created via OAuth', ipAddress: 'system' },
  { id: 'AUD-009', timestamp: '2026-09-14T20:55:00Z', action: 'THREAT_MITIGATED', actor: 'admin@sentinel.io', target: 'THR-289', severity: 'HIGH', details: 'Threat marked as mitigated — entity flagged for monitoring', ipAddress: '103.24.78.121' },
  { id: 'AUD-010', timestamp: '2026-09-14T20:50:00Z', action: 'LOGOUT', actor: 'analyst@corp.io', target: 'user_c2d4e6', severity: 'CLEAR', details: 'Session terminated by user', ipAddress: '192.168.1.45' },
];

const severityColors: Record<Severity, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  CLEAR: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const perPage = 8;

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
            <p className="text-white/40 text-sm mt-1">Immutable record of all system events</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-medium hover:bg-white/[0.1] transition-all">
            <Export weight="bold" className="w-4 h-4" />
            Export CSV
          </button>
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
          <div className="flex items-center gap-2">
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
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-2">Actor</div>
            <div className="col-span-1">Severity</div>
            <div className="col-span-3">Details</div>
            <div className="col-span-2">IP Address</div>
          </div>

          {/* Rows */}
          {paged.length === 0 ? (
            <div className="p-12 text-center">
              <Warning weight="duotone" className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No audit entries match your filter</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {paged.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-2 text-xs text-white/50 font-mono">{formatTime(log.timestamp)}</div>
                  <div className="col-span-2 text-xs text-white/80 font-medium">{log.action}</div>
                  <div className="col-span-2 text-xs text-white/50 truncate">{log.actor}</div>
                  <div className="col-span-1">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${severityColors[log.severity]}`}>
                      {log.severity}
                    </span>
                  </div>
                  <div className="col-span-3 text-xs text-white/40 truncate">{log.details}</div>
                  <div className="col-span-2 text-xs text-white/30 font-mono">{log.ipAddress}</div>
                </motion.div>
              ))}
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
                <span className="text-xs text-white/50">{page + 1} / {totalPages}</span>
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
