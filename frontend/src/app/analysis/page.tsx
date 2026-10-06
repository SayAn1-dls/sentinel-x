'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Eye,
  Lightning,
  ChartBar,
  Globe,
  Lock,
  Gear,
  User,
  CaretRight,
  CaretLeft,
  House,
  List,
  Warning,
  Check,
  CircleNotch,
  Play,
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
  CLEAR: '#00D4FF',
};

const RISK_DIST = [
  { label: 'CRITICAL', pct: 2.1, color: '#FF2D55' },
  { label: 'HIGH', pct: 8.4, color: '#FF6B00' },
  { label: 'MEDIUM', pct: 19.2, color: '#FFB800' },
  { label: 'LOW', pct: 31.8, color: '#00FFB3' },
  { label: 'CLEAR', pct: 38.5, color: '#00D4FF' },
];

const ANOMALY_DATA = [
  { entity: 'ENT-0091', cluster: 'CL-7X', score: 0.97, type: 'SANCTIONS_HIT', status: 'CRITICAL', action: 'Investigate' },
  { entity: 'ENT-0001', cluster: 'CL-2A', score: 0.94, type: 'VELOCITY_BREACH', status: 'CRITICAL', action: 'Investigate' },
  { entity: 'ENT-0567', cluster: 'CL-5F', score: 0.82, type: 'GEO_MISMATCH', status: 'HIGH', action: 'Review' },
  { entity: 'ENT-0445', cluster: 'CL-1B', score: 0.71, type: 'STRUCTURING', status: 'HIGH', action: 'Review' },
  { entity: 'ENT-0234', cluster: 'CL-9C', score: 0.58, type: 'UNUSUAL_HOUR', status: 'MEDIUM', action: 'Monitor' },
  { entity: 'ENT-0312', cluster: 'CL-3D', score: 0.44, type: 'RAPID_MOVEMENT', status: 'MEDIUM', action: 'Monitor' },
  { entity: 'ENT-0673', cluster: 'CL-8E', score: 0.31, type: 'ROUND_AMOUNT', status: 'LOW', action: 'Watch' },
  { entity: 'ENT-0892', cluster: 'CL-4G', score: 0.18, type: 'MINOR_FLAG', status: 'LOW', action: 'Watch' },
];

const PIPELINE_STEPS = [
  { label: 'INGEST', status: 'LIVE', color: '#00FFB3', pulse: false },
  { label: 'ANALYZE', status: 'PROCESSING', color: '#00D4FF', pulse: true },
  { label: 'ALERT', status: 'READY', color: '#00FFB3', pulse: false },
];

export default function AnalysisPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rowStatuses, setRowStatuses] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  const handleAction = (entity: string) => {
    setRowStatuses((prev) => ({ ...prev, [entity]: 'OPENED' }));
  };

  const handleScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      setTimeout(() => setScanDone(false), 5000);
    }, 2000);
  };

  const metrics = [
    { label: 'Detection Rate', value: '99.7%', color: '#00FFB3' },
    { label: 'False Positive Rate', value: '0.3%', color: '#00D4FF' },
    { label: 'Avg Inference', value: '47ms', color: '#FFB800' },
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
            const active = item.href === '/analysis';
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
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold tracking-wider text-white">AI FORENSICS ENGINE</h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFB3]/10 border border-[#00FFB3]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFB3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFB3]" />
              </span>
              <span className="text-xs font-bold text-[#00FFB3]">ACTIVE</span>
            </span>
          </div>

          {/* Model Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">{m.label}</div>
                <div className="text-3xl font-bold font-mono" style={{ color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Distribution */}
          <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 mb-6">
            <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase mb-4">Risk Distribution</h2>
            <div className="flex flex-col gap-3">
              {RISK_DIST.map((r) => (
                <div key={r.label} className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono text-white/50 text-right">{r.label}</span>
                  <div className="flex-1 h-6 bg-white/[0.03] rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-1000"
                      style={{ width: `${r.pct * 2.5}%`, backgroundColor: r.color }}
                    />
                  </div>
                  <span className="w-12 text-xs font-mono text-right" style={{ color: r.color }}>
                    {r.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Detection Table */}
          <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 mb-6">
            <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase mb-4">Anomaly Detection</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 border-b border-white/5">
                  <th className="text-left py-2 font-medium">Entity</th>
                  <th className="text-left py-2 font-medium">Cluster</th>
                  <th className="text-center py-2 font-medium">Score</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-center py-2 font-medium">Status</th>
                  <th className="text-center py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {ANOMALY_DATA.map((row) => {
                  const currentStatus = rowStatuses[row.entity] || row.status;
                  const statusColor = currentStatus === 'OPENED' ? '#00D4FF' : RISK_COLORS[row.status];
                  return (
                    <tr key={row.entity} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono text-[#00D4FF]">{row.entity}</td>
                      <td className="py-3 font-mono text-white/50">{row.cluster}</td>
                      <td className="py-3 text-center">
                        <span
                          className="font-mono font-bold"
                          style={{ color: row.score > 0.8 ? '#FF2D55' : row.score > 0.5 ? '#FFB800' : '#00FFB3' }}
                        >
                          {row.score.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-white/60">{row.type}</td>
                      <td className="py-3 text-center">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: statusColor,
                            backgroundColor: `${statusColor}15`,
                            border: `1px solid ${statusColor}30`,
                          }}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {currentStatus === 'OPENED' ? (
                          <span className="text-[10px] text-[#00D4FF]/60 font-mono">OPENED</span>
                        ) : (
                          <button
                            onClick={() => handleAction(row.entity)}
                            className="px-3 py-1 rounded text-[10px] font-bold transition-all hover:opacity-80"
                            style={{
                              color: statusColor,
                              backgroundColor: `${statusColor}15`,
                              border: `1px solid ${statusColor}30`,
                            }}
                          >
                            {row.action}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ML Pipeline Status */}
          <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 mb-6">
            <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase mb-4">ML Pipeline Status</h2>
            <div className="flex items-center justify-center gap-8">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        step.pulse ? 'animate-pulse' : ''
                      }`}
                      style={{ borderColor: step.color, backgroundColor: `${step.color}10` }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: step.color }} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-white/80">{step.label}</div>
                      <div className="text-[10px] font-mono" style={{ color: step.color }}>
                        {step.status}
                      </div>
                    </div>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="w-16 h-px bg-white/10 relative">
                      <div
                        className="absolute inset-0 h-px"
                        style={{ background: `linear-gradient(90deg, ${step.color}40, ${PIPELINE_STEPS[i + 1].color}40)` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Run Full Scan */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-6 py-3 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] font-bold text-sm hover:bg-[#00D4FF]/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {scanning ? (
                <>
                  <CircleNotch size={18} className="animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <MagnifyingGlass size={18} weight="bold" />
                  Run Full Scan
                </>
              )}
            </button>
            {scanDone && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FFB3]/10 border border-[#00FFB3]/20">
                <Check size={16} color="#00FFB3" weight="bold" />
                <span className="text-sm text-[#00FFB3] font-medium">Scan Complete — 0 new threats detected</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
