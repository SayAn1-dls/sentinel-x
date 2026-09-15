'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldWarning,
  Warning,
  Lock,
  LockOpen,
  Key,
  Fingerprint,
  Eye,
  Clock,
  Globe,
  Gear,
  User,
  Users,
  Cpu,
  List,
  House,
  CaretRight,
  CaretLeft,
  CheckCircle,
  WarningCircle,
  Lightning,
  Fire,
  Timer,
  WifiHigh,
  Database,
  Power,
  X,
  Pulse,
} from '@phosphor-icons/react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/analysis', label: 'AI Analysis', icon: Cpu },
  { href: '/audit', label: 'Audit Log', icon: List },
  { href: '/network', label: 'Network', icon: Globe },
  { href: '/security', label: 'Security', icon: Lock },
  { href: '/admin', label: 'Admin', icon: Gear },
];

interface HealthCard {
  id: string;
  label: string;
  value: number;
  max: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  icon: typeof Shield;
  color: string;
  detail: string;
}

interface Session {
  id: string;
  user: string;
  role: string;
  ip: string;
  location: string;
  device: string;
  started: string;
  lastActive: string;
  status: 'ACTIVE' | 'IDLE' | 'LOCKED';
}

interface TimelineEvent {
  id: number;
  time: string;
  type: 'AUTH' | 'THREAT' | 'POLICY' | 'SYSTEM' | 'ACCESS';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
}

interface ComplianceItem {
  id: string;
  standard: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'REVIEW';
  lastAudit: string;
  score: number;
  controls: number;
  passed: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#FF2D55',
  HIGH: '#FF6B00',
  MEDIUM: '#FFB800',
  LOW: '#00FFB3',
  INFO: '#00D4FF',
};

const STATUS_COLORS: Record<string, string> = {
  HEALTHY: '#00FFB3',
  WARNING: '#FFB800',
  CRITICAL: '#FF2D55',
  ACTIVE: '#00FFB3',
  IDLE: '#FFB800',
  LOCKED: '#FF2D55',
  COMPLIANT: '#00FFB3',
  NON_COMPLIANT: '#FF2D55',
  PARTIAL: '#FFB800',
  REVIEW: '#00D4FF',
};

const INITIAL_HEALTH: HealthCard[] = [
  { id: 'fw', label: 'Firewall Status', value: 98.7, max: 100, status: 'HEALTHY', icon: ShieldCheck, color: '#00FFB3', detail: 'All 12 firewall zones active, 0 policy violations' },
  { id: 'enc', label: 'Encryption Layer', value: 100, max: 100, status: 'HEALTHY', icon: Lock, color: '#00D4FF', detail: 'AES-256 active on all channels, TLS 1.3 enforced' },
  { id: 'ids', label: 'IDS/IPS Engine', value: 94.2, max: 100, status: 'HEALTHY', icon: Eye, color: '#00FFB3', detail: '847 rules active, 12 triggered in last 24h' },
  { id: 'auth', label: 'Auth System', value: 76.5, max: 100, status: 'WARNING', icon: Fingerprint, color: '#FFB800', detail: '3 failed MFA attempts detected from unusual geo' },
  { id: 'net', label: 'Network Health', value: 99.1, max: 100, status: 'HEALTHY', icon: WifiHigh, color: '#00FFB3', detail: 'Latency 2.3ms avg, 0 packet loss, all nodes up' },
  { id: 'db', label: 'Data Integrity', value: 62.8, max: 100, status: 'CRITICAL', icon: Database, color: '#FF2D55', detail: 'Hash mismatch detected in 4 audit log entries' },
];

const INITIAL_SESSIONS: Session[] = [
  { id: 'SES-001', user: 'sayan.bhattacharya', role: 'ANALYST', ip: '192.168.1.101', location: 'Mumbai, IN', device: 'Chrome / macOS', started: '08:14:22', lastActive: '09:12:34', status: 'ACTIVE' },
  { id: 'SES-002', user: 'priya.sharma', role: 'ADMIN', ip: '10.0.12.55', location: 'Delhi, IN', device: 'Firefox / Windows', started: '07:45:10', lastActive: '09:10:58', status: 'ACTIVE' },
  { id: 'SES-003', user: 'raj.patel', role: 'VIEWER', ip: '172.16.3.201', location: 'Bangalore, IN', device: 'Safari / iOS', started: '08:30:44', lastActive: '08:55:12', status: 'IDLE' },
  { id: 'SES-004', user: 'anita.desai', role: 'ANALYST', ip: '192.168.2.78', location: 'Pune, IN', device: 'Chrome / Windows', started: '06:12:33', lastActive: '07:30:45', status: 'LOCKED' },
  { id: 'SES-005', user: 'vikram.singh', role: 'OPERATOR', ip: '10.0.8.112', location: 'Chennai, IN', device: 'Edge / Windows', started: '09:01:15', lastActive: '09:11:02', status: 'ACTIVE' },
  { id: 'SES-006', user: 'meera.joshi', role: 'ANALYST', ip: '192.168.4.33', location: 'Hyderabad, IN', device: 'Chrome / Linux', started: '08:50:22', lastActive: '09:08:44', status: 'ACTIVE' },
  { id: 'SES-007', user: 'arjun.nair', role: 'VIEWER', ip: '172.16.7.88', location: 'Kochi, IN', device: 'Firefox / macOS', started: '07:20:10', lastActive: '08:15:33', status: 'IDLE' },
  { id: 'SES-008', user: 'deepa.kumar', role: 'ADMIN', ip: '10.0.1.200', location: 'Mumbai, IN', device: 'Chrome / macOS', started: '08:05:55', lastActive: '09:12:11', status: 'ACTIVE' },
];

const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: 1, time: '09:12:34', type: 'THREAT', severity: 'CRITICAL', title: 'Brute Force Detected', description: 'IP 45.33.32.156 — 847 failed login attempts in 120s. Auto-blocked.' },
  { id: 2, time: '09:10:11', type: 'AUTH', severity: 'HIGH', title: 'MFA Bypass Attempt', description: 'User raj.patel — Token replay attack from unknown device. Session terminated.' },
  { id: 3, time: '09:08:45', type: 'POLICY', severity: 'MEDIUM', title: 'Policy Violation', description: 'Outbound data transfer exceeded 500MB threshold by ENT-0091.' },
  { id: 4, time: '09:06:22', type: 'SYSTEM', severity: 'LOW', title: 'Certificate Renewal', description: 'TLS certificate for api.sentinel-x.io renewed — expires 2027-09-15.' },
  { id: 5, time: '09:04:55', type: 'ACCESS', severity: 'INFO', title: 'Privilege Escalation', description: 'User priya.sharma elevated to SUPER_ADMIN for maintenance window.' },
  { id: 6, time: '09:02:18', type: 'THREAT', severity: 'HIGH', title: 'SQL Injection Blocked', description: 'WAF intercepted malicious payload on /api/v3/transactions endpoint.' },
  { id: 7, time: '08:58:33', type: 'SYSTEM', severity: 'INFO', title: 'Backup Completed', description: 'Full database snapshot v4.2.1 — 12.4GB encrypted and stored.' },
  { id: 8, time: '08:55:01', type: 'AUTH', severity: 'MEDIUM', title: 'Geo-Anomaly Login', description: 'User vikram.singh logged from Chennai (usual: Mumbai). MFA verified.' },
  { id: 9, time: '08:50:44', type: 'THREAT', severity: 'CRITICAL', title: 'Zero-Day Signature', description: 'IDS matched CVE-2026-4412 signature on inbound traffic. Quarantined.' },
  { id: 10, time: '08:47:12', type: 'POLICY', severity: 'LOW', title: 'Password Expiry Notice', description: '14 accounts have passwords expiring within 7 days.' },
  { id: 11, time: '08:42:30', type: 'ACCESS', severity: 'MEDIUM', title: 'API Key Rotation', description: 'Service account svc-analytics rotated API key. Old key revoked.' },
  { id: 12, time: '08:38:15', type: 'SYSTEM', severity: 'INFO', title: 'Rule Update', description: 'IDS ruleset updated to v2026.09.15 — 23 new signatures added.' },
];

const INITIAL_COMPLIANCE: ComplianceItem[] = [
  { id: 'pci', standard: 'PCI DSS 4.0', status: 'COMPLIANT', lastAudit: '2026-09-10', score: 98, controls: 312, passed: 306 },
  { id: 'gdpr', standard: 'GDPR', status: 'COMPLIANT', lastAudit: '2026-09-08', score: 95, controls: 88, passed: 84 },
  { id: 'sox', standard: 'SOX Compliance', status: 'PARTIAL', lastAudit: '2026-09-05', score: 82, controls: 156, passed: 128 },
  { id: 'iso', standard: 'ISO 27001:2022', status: 'COMPLIANT', lastAudit: '2026-09-01', score: 97, controls: 114, passed: 111 },
  { id: 'rbi', standard: 'RBI KYC/AML', status: 'REVIEW', lastAudit: '2026-08-28', score: 89, controls: 64, passed: 57 },
  { id: 'nist', standard: 'NIST CSF 2.0', status: 'PARTIAL', lastAudit: '2026-08-25', score: 78, controls: 108, passed: 84 },
];

const TYPE_ICONS: Record<string, typeof Shield> = {
  AUTH: Key,
  THREAT: Fire,
  POLICY: ShieldWarning,
  SYSTEM: Gear,
  ACCESS: LockOpen,
};

export default function SecurityPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clock, setClock] = useState('');
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [compliance, setCompliance] = useState(INITIAL_COMPLIANCE);
  const [activeTab, setActiveTab] = useState<'sessions' | 'timeline' | 'compliance'>('sessions');
  const [terminatedSessions, setTerminatedSessions] = useState<Set<string>>(new Set());
  const [scanRunning, setScanRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [timelineFilter, setTimelineFilter] = useState<string>('ALL');
  const [dismissedEvents, setDismissedEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const terminateSession = (sid: string) => {
    setTerminatedSessions((prev) => new Set(prev).add(sid));
    setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, status: 'LOCKED' as const } : s)));
  };

  const runSecurityScan = () => {
    if (scanRunning) return;
    setScanRunning(true);
    setScanProgress(0);
    const id = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(id);
          setScanRunning(false);
          setHealth((prev) =>
            prev.map((h) =>
              h.id === 'db'
                ? { ...h, value: 99.4, status: 'HEALTHY' as const, color: '#00FFB3', detail: 'All audit log hashes verified — integrity restored' }
                : h.id === 'auth'
                ? { ...h, value: 97.1, status: 'HEALTHY' as const, color: '#00FFB3', detail: 'MFA anomaly resolved — all auth channels nominal' }
                : h
            )
          );
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  };

  const dismissEvent = (id: number) => {
    setDismissedEvents((prev) => new Set(prev).add(id));
  };

  const filteredTimeline = timeline.filter(
    (e) => !dismissedEvents.has(e.id) && (timelineFilter === 'ALL' || e.type === timelineFilter)
  );

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE').length;
  const criticalEvents = timeline.filter((e) => e.severity === 'CRITICAL').length;
  const overallScore = Math.round(health.reduce((a, h) => a + h.value, 0) / health.length * 10) / 10;

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
            const active = item.href === '/security';
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
              <h1 className="text-2xl font-bold tracking-wider text-white">SECURITY CENTER</h1>
              <p className="text-white/40 text-sm mt-1">System health, sessions, threat timeline & compliance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={runSecurityScan}
                disabled={scanRunning}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  scanRunning
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF]/50 cursor-not-allowed'
                    : 'bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20'
                }`}
              >
                <ShieldCheck size={16} weight="fill" />
                {scanRunning ? `Scanning... ${scanProgress}%` : 'Run Security Scan'}
              </button>
              <div className="px-4 py-2 rounded-lg bg-[#0D0D14] border border-white/5 font-mono text-[#00D4FF] text-sm">
                <Clock size={14} className="inline mr-2" />
                {clock}
              </div>
            </div>
          </div>

          {/* Scan Progress Bar */}
          {scanRunning && (
            <div className="mb-6 rounded-xl bg-[#0D0D14] border border-[#00D4FF]/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#00D4FF] font-medium uppercase tracking-wider">Security Scan in Progress</span>
                <span className="text-xs font-mono text-[#00D4FF]">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#00FFB3] transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Overall Score</span>
                <Pulse size={20} color="#00D4FF" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#00D4FF]">{overallScore}%</div>
            </div>
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Active Sessions</span>
                <Users size={20} color="#00FFB3" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#00FFB3]">{activeSessions}</div>
            </div>
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Critical Events</span>
                <Fire size={20} color="#FF2D55" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#FF2D55]">{criticalEvents}</div>
            </div>
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Compliance</span>
                <CheckCircle size={20} color="#00FFB3" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#00FFB3]">
                {compliance.filter((c) => c.status === 'COMPLIANT').length}/{compliance.length}
              </div>
            </div>
          </div>

          {/* Health Cards */}
          <div className="mb-6">
            <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase mb-4">System Health</h2>
            <div className="grid grid-cols-3 gap-4">
              {health.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.id} className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon size={18} color={h.color} weight="fill" />
                        <span className="text-sm font-medium text-white/80">{h.label}</span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          color: STATUS_COLORS[h.status],
                          backgroundColor: `${STATUS_COLORS[h.status]}15`,
                          border: `1px solid ${STATUS_COLORS[h.status]}30`,
                        }}
                      >
                        {h.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold font-mono" style={{ color: h.color }}>
                          {h.value}
                        </span>
                        <span className="text-xs text-white/30 mb-1">/ {h.max}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${(h.value / h.max) * 100}%`,
                          backgroundColor: h.color,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-white/30">{h.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="rounded-xl bg-[#0D0D14] border border-white/5">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {[
                { key: 'sessions' as const, label: 'Active Sessions', count: sessions.length },
                { key: 'timeline' as const, label: 'Security Timeline', count: filteredTimeline.length },
                { key: 'compliance' as const, label: 'Compliance Status', count: compliance.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'text-[#00D4FF] border-[#00D4FF]'
                      : 'text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs font-mono opacity-50">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="p-5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      <th className="text-left py-2 font-medium">Session</th>
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-left py-2 font-medium">Role</th>
                      <th className="text-left py-2 font-medium">IP Address</th>
                      <th className="text-left py-2 font-medium">Location</th>
                      <th className="text-left py-2 font-medium">Device</th>
                      <th className="text-left py-2 font-medium">Started</th>
                      <th className="text-center py-2 font-medium">Status</th>
                      <th className="text-center py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono text-[#00D4FF]">{s.id}</td>
                        <td className="py-3 text-white/70">{s.user}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-white/50">
                            {s.role}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-white/40">{s.ip}</td>
                        <td className="py-3 text-white/40">{s.location}</td>
                        <td className="py-3 text-white/40">{s.device}</td>
                        <td className="py-3 font-mono text-white/40">{s.started}</td>
                        <td className="py-3 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              color: STATUS_COLORS[s.status],
                              backgroundColor: `${STATUS_COLORS[s.status]}15`,
                              border: `1px solid ${STATUS_COLORS[s.status]}30`,
                            }}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {s.status !== 'LOCKED' && !terminatedSessions.has(s.id) ? (
                            <button
                              onClick={() => terminateSession(s.id)}
                              className="px-2 py-1 rounded text-[10px] font-medium bg-[#FF2D55]/10 text-[#FF2D55] hover:bg-[#FF2D55]/20 transition-colors border border-[#FF2D55]/20"
                            >
                              Terminate
                            </button>
                          ) : (
                            <span className="text-[10px] text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="p-5">
                <div className="flex gap-2 mb-4">
                  {['ALL', 'AUTH', 'THREAT', 'POLICY', 'SYSTEM', 'ACCESS'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimelineFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        timelineFilter === f
                          ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                          : 'bg-white/5 text-white/40 hover:text-white/60 border border-transparent'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredTimeline.map((event) => {
                    const TypeIcon = TYPE_ICONS[event.type] || Warning;
                    return (
                      <div
                        key={event.id}
                        className="flex gap-4 p-4 rounded-lg border transition-all hover:bg-white/[0.02]"
                        style={{
                          borderColor: `${SEVERITY_COLORS[event.severity]}15`,
                          backgroundColor: `${SEVERITY_COLORS[event.severity]}03`,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${SEVERITY_COLORS[event.severity]}10` }}
                        >
                          <TypeIcon size={18} color={SEVERITY_COLORS[event.severity]} weight="fill" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{
                                color: SEVERITY_COLORS[event.severity],
                                backgroundColor: `${SEVERITY_COLORS[event.severity]}15`,
                              }}
                            >
                              {event.severity}
                            </span>
                            <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                              {event.type}
                            </span>
                            <span className="text-sm font-medium text-white/80">{event.title}</span>
                            <span className="ml-auto text-[11px] font-mono text-white/30 flex items-center gap-1">
                              <Timer size={12} />
                              {event.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/40 leading-relaxed">{event.description}</p>
                        </div>
                        <button
                          onClick={() => dismissEvent(event.id)}
                          className="text-white/15 hover:text-white/40 transition-colors flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {filteredTimeline.length === 0 && (
                    <div className="text-center py-12 text-white/20 text-sm">No events match the current filter</div>
                  )}
                </div>
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  {compliance.map((c) => (
                    <div key={c.id} className="rounded-lg bg-[#0A0A0F] border border-white/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white/80">{c.standard}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: STATUS_COLORS[c.status],
                            backgroundColor: `${STATUS_COLORS[c.status]}15`,
                            border: `1px solid ${STATUS_COLORS[c.status]}30`,
                          }}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-2xl font-bold font-mono" style={{ color: STATUS_COLORS[c.status] }}>
                          {c.score}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${c.score}%`,
                            backgroundColor: STATUS_COLORS[c.status],
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-white/30">
                        <span>Controls: {c.passed}/{c.controls} passed</span>
                        <span>Audited: {c.lastAudit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
