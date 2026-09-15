'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Pulse, ChartLine, FingerprintSimple, Globe, GearSix,
  ClockCounterClockwise, CaretRight, CaretLeft, User, Shield,
  Key, LockKey, Fingerprint, Eye, EyeSlash, Check, X, Lightning,
  Warning, CheckCircle
} from '@phosphor-icons/react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: Pulse, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log' },
  { href: '/network', icon: Globe, label: 'Network' },
  { href: '/security', icon: FingerprintSimple, label: 'Security', active: true },
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
          {!collapsed && <div className="flex-1 min-w-0"><div className="text-xs font-medium text-white/70 truncate">Operator</div><div className="text-[10px] text-white/30">sentinel-x</div></div>}
        </div>
      </div>
    </aside>
  );
}

const MOCK_PASSKEYS = [
  { id: 'PK-001', name: 'MacBook Pro — Touch ID', registered: '2025-08-20', lastUsed: '2 min ago', type: 'FIDO2 Platform', status: 'active' },
  { id: 'PK-002', name: 'YubiKey 5 NFC', registered: '2025-07-15', lastUsed: '3 days ago', type: 'FIDO2 Roaming', status: 'active' },
  { id: 'PK-003', name: 'iPhone 15 — Face ID', registered: '2025-09-01', lastUsed: '1 hour ago', type: 'FIDO2 Platform', status: 'active' },
];

const MOCK_SESSIONS = [
  { id: 'SES-001', device: 'Chrome / macOS Sonoma', ip: '192.168.1.42', location: 'Mumbai, IN', started: '23:05', current: true },
  { id: 'SES-002', device: 'Safari / iOS 18', ip: '192.168.1.55', location: 'Mumbai, IN', started: '22:30', current: false },
  { id: 'SES-003', device: 'Firefox / Ubuntu', ip: '10.0.14.72', location: 'US-East Datacenter', started: '21:15', current: false },
];

const MOCK_POLICIES = [
  { name: 'Multi-Factor Authentication', status: true, description: 'Require MFA for all login attempts' },
  { name: 'IP Allowlist', status: true, description: 'Restrict access to approved IP ranges' },
  { name: 'Session Timeout', status: true, description: 'Auto-logout after 30 minutes of inactivity' },
  { name: 'Rate Limiting', status: true, description: 'Max 100 API calls per minute per user' },
  { name: 'Geo-blocking', status: false, description: 'Block access from sanctioned jurisdictions' },
  { name: 'Data Export Controls', status: true, description: 'Require approval for bulk data exports' },
];

const MOCK_THREAT_INTEL = [
  { source: 'OFAC SDN', lastSync: '2 min ago', entries: '12,847', status: 'synced' },
  { source: 'EU Sanctions', lastSync: '15 min ago', entries: '8,234', status: 'synced' },
  { source: 'UN Consolidated', lastSync: '1 hour ago', entries: '6,891', status: 'synced' },
  { source: 'Custom Watchlist', lastSync: '30 min ago', entries: '342', status: 'synced' },
  { source: 'PEP Database', lastSync: '4 hours ago', entries: '1.4M', status: 'stale' },
];

export default function SecurityPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [revokedSessions, setRevokedSessions] = useState<string[]>([]);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(null);

  const togglePolicy = useCallback((index: number) => {
    try {
      setPolicies(prev => prev.map((p, i) => i === index ? { ...p, status: !p.status } : p));
    } catch (_) {}
  }, []);

  const revokeSession = useCallback((id: string) => {
    try {
      setRevokedSessions(prev => [...prev, id]);
      setShowRevokeConfirm(null);
    } catch (_) {}
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        <header className="sticky top-0 z-30 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Shield weight="duotone" className="w-5 h-5 text-[#FF6B00]" /> Security Center</h1>
            <p className="text-xs text-white/30">Authentication, policies & threat intelligence</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FFB3]/10 border border-[#00FFB3]/20">
            <CheckCircle weight="fill" className="w-4 h-4 text-[#00FFB3]" />
            <span className="text-xs text-[#00FFB3] font-medium">All Systems Secure</span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Security Score */}
          <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0D0D14]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Security Posture Score</h3>
              <span className="text-2xl font-bold text-[#00FFB3]">94/100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#00FFB3]" />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/20">
              <span>MFA: Active</span><span>Encryption: AES-256</span><span>FIDO2: 3 keys</span><span>Compliance: SOC2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passkeys / WebAuthn */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Key weight="duotone" className="w-4 h-4 text-[#00D4FF]" /> FIDO2 Passkeys</h2>
                <button className="text-[10px] px-3 py-1 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors">+ Register New</button>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {MOCK_PASSKEYS.map((pk) => (
                  <div key={pk.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
                          {pk.type.includes('Platform') ? <Fingerprint weight="duotone" className="w-4 h-4 text-[#00D4FF]" /> : <Key weight="duotone" className="w-4 h-4 text-[#FFB800]" />}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white/70">{pk.name}</div>
                          <div className="text-[10px] text-white/20">{pk.type} — Registered {pk.registered}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/20">Used {pk.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Eye weight="duotone" className="w-4 h-4 text-[#00FFB3]" /> Active Sessions</h2>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {MOCK_SESSIONS.filter(s => !revokedSessions.includes(s.id)).map((session) => (
                  <div key={session.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white/70">{session.device}</span>
                          {session.current && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00FFB3]/10 text-[#00FFB3] font-bold">CURRENT</span>}
                        </div>
                        <div className="text-[10px] text-white/20 mt-0.5">{session.ip} — {session.location} — Since {session.started}</div>
                      </div>
                      {!session.current && (
                        showRevokeConfirm === session.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => revokeSession(session.id)} className="text-[10px] px-2 py-1 rounded bg-[#FF2D55]/10 text-[#FF2D55]">Confirm</button>
                            <button onClick={() => setShowRevokeConfirm(null)} className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/30">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setShowRevokeConfirm(session.id)} className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/30 hover:bg-[#FF2D55]/10 hover:text-[#FF2D55] transition-colors">
                            Revoke
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Policies */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold flex items-center gap-2"><LockKey weight="duotone" className="w-4 h-4 text-[#FFB800]" /> Security Policies</h2>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {policies.map((policy, i) => (
                  <div key={policy.name} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <div className="text-xs text-white/60">{policy.name}</div>
                      <div className="text-[10px] text-white/20">{policy.description}</div>
                    </div>
                    <button onClick={() => togglePolicy(i)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${policy.status ? 'bg-[#00FFB3]/30' : 'bg-white/10'}`}>
                      <motion.div animate={{ x: policy.status ? 20 : 2 }}
                        className={`absolute top-0.5 w-4 h-4 rounded-full ${policy.status ? 'bg-[#00FFB3]' : 'bg-white/30'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Intel Feeds */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Lightning weight="duotone" className="w-4 h-4 text-[#FF6B00]" /> Threat Intelligence Feeds</h2>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {MOCK_THREAT_INTEL.map((feed) => (
                  <div key={feed.source} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${feed.status === 'synced' ? 'bg-[#00FFB3]' : 'bg-[#FFB800] animate-pulse'}`} />
                      <div>
                        <div className="text-xs text-white/60">{feed.source}</div>
                        <div className="text-[10px] text-white/20">{feed.entries} entries — Synced {feed.lastSync}</div>
                      </div>
                    </div>
                    <button className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/30 hover:bg-white/10 transition-colors">Sync Now</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
