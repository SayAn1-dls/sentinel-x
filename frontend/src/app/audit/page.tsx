'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  Cpu,
  Globe,
  Lock,
  Gear,
  User,
  CaretRight,
  CaretLeft,
  House,
  List,
  Download,
  Funnel,
  MagnifyingGlass,
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
};

const AUDIT_DATA = [
  { timestamp: '2026-09-15 09:12', actor: 'system@sentinel-x', action: 'SANCTIONS_HIT', target: 'ENT-0091', severity: 'CRITICAL', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 09:09', actor: 'ml-engine@sentinel-x', action: 'VELOCITY_BREACH', target: 'TX-6D1F2C', severity: 'CRITICAL', ip: '10.0.0.2' },
  { timestamp: '2026-09-15 09:05', actor: 'analyst@sentinel-x', action: 'ALERT_DISMISSED', target: 'ALT-006', severity: 'LOW', ip: '192.168.1.45' },
  { timestamp: '2026-09-15 08:55', actor: 'ml-engine@sentinel-x', action: 'CLUSTER_DISSOLVED', target: 'CLUSTER-3B', severity: 'HIGH', ip: '10.0.0.2' },
  { timestamp: '2026-09-15 08:41', actor: 'system@sentinel-x', action: 'GEO_FLAG', target: 'ENT-0567', severity: 'HIGH', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 08:30', actor: 'system@sentinel-x', action: 'STRUCTURING_ALERT', target: 'ENT-0445', severity: 'MEDIUM', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 08:15', actor: 'admin@sentinel-x', action: 'ADMIN_ACTION', target: 'USER-004', severity: 'LOW', ip: '192.168.1.12' },
  { timestamp: '2026-09-15 08:00', actor: 'sayan@sentinel-x', action: 'LOGIN', target: 'SYSTEM', severity: 'LOW', ip: '49.37.201.88' },
  { timestamp: '2026-09-15 07:45', actor: 'ml-engine@sentinel-x', action: 'MODEL_RETRAINED', target: 'AML-MODEL-v3', severity: 'LOW', ip: '10.0.0.2' },
  { timestamp: '2026-09-15 07:30', actor: 'system@sentinel-x', action: 'BATCH_PROCESSED', target: 'BATCH-092609', severity: 'LOW', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 07:15', actor: 'analyst@sentinel-x', action: 'TRANSACTION_FLAGGED', target: 'TX-4F2A1B', severity: 'HIGH', ip: '192.168.1.45' },
  { timestamp: '2026-09-15 07:00', actor: 'system@sentinel-x', action: 'SANCTIONS_HIT', target: 'ENT-0312', severity: 'CRITICAL', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 06:45', actor: 'admin@sentinel-x', action: 'ROLE_CHANGED', target: 'USER-003', severity: 'MEDIUM', ip: '192.168.1.12' },
  { timestamp: '2026-09-15 06:30', actor: 'ml-engine@sentinel-x', action: 'ANOMALY_DETECTED', target: 'ENT-0089', severity: 'HIGH', ip: '10.0.0.2' },
  { timestamp: '2026-09-15 06:15', actor: 'system@sentinel-x', action: 'FIREWALL_TRIGGERED', target: 'IP-203.0.113', severity: 'CRITICAL', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 06:00', actor: 'sayan@sentinel-x', action: 'LOGIN', target: 'SYSTEM', severity: 'LOW', ip: '49.37.201.88' },
  { timestamp: '2026-09-15 05:45', actor: 'analyst@sentinel-x', action: 'REPORT_GENERATED', target: 'RPT-20260915', severity: 'LOW', ip: '192.168.1.45' },
  { timestamp: '2026-09-15 05:30', actor: 'ml-engine@sentinel-x', action: 'CLUSTER_FORMED', target: 'CLUSTER-9X', severity: 'MEDIUM', ip: '10.0.0.2' },
  { timestamp: '2026-09-15 05:15', actor: 'system@sentinel-x', action: 'VELOCITY_BREACH', target: 'TX-9C3D2E', severity: 'HIGH', ip: '10.0.0.1' },
  { timestamp: '2026-09-15 05:00', actor: 'admin@sentinel-x', action: 'SYSTEM_CONFIG', target: 'MAINTENANCE', severity: 'LOW', ip: '192.168.1.12' },
];

const ALL_ACTIONS = ['ALL', 'LOGIN', 'TRANSACTION_FLAGGED', 'ALERT_DISMISSED', 'ADMIN_ACTION', 'SANCTIONS_HIT', 'CLUSTER_DISSOLVED'];

export default function AuditPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return AUDIT_DATA.filter((row) => {
      if (severityFilter !== 'ALL' && row.severity !== severityFilter) return false;
      if (actionFilter !== 'ALL' && row.action !== actionFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!row.actor.toLowerCase().includes(q) && !row.target.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [severityFilter, actionFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const exportCSV = () => {
    const header = 'Timestamp,Actor,Action,Target,Severity,IP';
    const rows = AUDIT_DATA.map(
      (r) => `${r.timestamp},${r.actor},${r.action},${r.target},${r.severity},${r.ip}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentinel-audit.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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
            const active = item.href === '/audit';
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
            <h1 className="text-2xl font-bold tracking-wider text-white">AUDIT TRAIL</h1>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-sm font-medium hover:bg-[#00D4FF]/20 transition-all"
            >
              <Download size={16} weight="bold" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Funnel size={14} className="text-white/30" />
              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                className="bg-[#0D0D14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-[#00D4FF]/30"
              >
                <option value="ALL">All Severity</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="bg-[#0D0D14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-[#00D4FF]/30"
            >
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a === 'ALL' ? 'All Actions' : a}
                </option>
              ))}
            </select>
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search actor or target..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-[#0D0D14] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white/70 outline-none focus:border-[#00D4FF]/30 placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 border-b border-white/5">
                  <th className="text-left py-2 font-medium">Timestamp</th>
                  <th className="text-left py-2 font-medium">Actor</th>
                  <th className="text-left py-2 font-medium">Action</th>
                  <th className="text-left py-2 font-medium">Target</th>
                  <th className="text-center py-2 font-medium">Severity</th>
                  <th className="text-right py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => (
                  <tr
                    key={`${row.timestamp}-${i}`}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 font-mono text-white/40">{row.timestamp}</td>
                    <td className="py-3 font-mono text-white/60">{row.actor}</td>
                    <td className="py-3">
                      <span className="font-mono text-white/70 px-2 py-0.5 rounded bg-white/[0.03]">{row.action}</span>
                    </td>
                    <td className="py-3 font-mono text-[#00D4FF]">{row.target}</td>
                    <td className="py-3 text-center">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          color: RISK_COLORS[row.severity] || '#00D4FF',
                          backgroundColor: `${RISK_COLORS[row.severity] || '#00D4FF'}15`,
                          border: `1px solid ${RISK_COLORS[row.severity] || '#00D4FF'}30`,
                        }}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-white/30">{row.ip}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/20">
                      No records match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30 font-mono">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg bg-[#0D0D14] border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:border-[#00D4FF]/30 transition-all"
              >
                <CaretLeft size={12} className="inline" /> Prev
              </button>
              <span className="text-xs text-white/40 font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#0D0D14] border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:border-[#00D4FF]/30 transition-all"
              >
                Next <CaretRight size={12} className="inline" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
