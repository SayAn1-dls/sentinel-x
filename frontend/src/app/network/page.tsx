'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Pulse, ChartLine, FingerprintSimple, Globe, GearSix,
  ClockCounterClockwise, CaretRight, CaretLeft, User, Lock, LockOpen,
  WifiHigh, WifiSlash, CloudArrowUp, Shield, Warning, Lightning,
  ArrowsClockwise, SealCheck, X
} from '@phosphor-icons/react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: Pulse, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log' },
  { href: '/network', icon: Globe, label: 'Network', active: true },
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
          {!collapsed && <div className="flex-1 min-w-0"><div className="text-xs font-medium text-white/70 truncate">Operator</div><div className="text-[10px] text-white/30">sentinel-x</div></div>}
        </div>
      </div>
    </aside>
  );
}

const MOCK_NODES = [
  { id: 'NODE-7X2', ip: '10.0.14.72', status: 'online', latency: '12ms', packets: '1.2M', encrypted: true, risk: 'HIGH', region: 'US-East', uptime: '99.97%' },
  { id: 'NODE-3K9', ip: '10.0.22.39', status: 'online', latency: '8ms', packets: '892K', encrypted: true, risk: 'CRITICAL', region: 'EU-West', uptime: '99.94%' },
  { id: 'NODE-1A8', ip: '10.0.31.18', status: 'online', latency: '23ms', packets: '2.1M', encrypted: true, risk: 'MEDIUM', region: 'AP-South', uptime: '99.99%' },
  { id: 'NODE-9F2', ip: '10.0.45.92', status: 'degraded', latency: '145ms', packets: '340K', encrypted: true, risk: 'LOW', region: 'US-West', uptime: '98.2%' },
  { id: 'NODE-5M3', ip: '10.0.18.53', status: 'online', latency: '6ms', packets: '1.8M', encrypted: true, risk: 'CLEAR', region: 'EU-Central', uptime: '100%' },
  { id: 'NODE-8W5', ip: '10.0.55.85', status: 'offline', latency: '---', packets: '0', encrypted: false, risk: 'HIGH', region: 'ME-South', uptime: '0%' },
  { id: 'NODE-4P1', ip: '10.0.12.41', status: 'online', latency: '15ms', packets: '967K', encrypted: true, risk: 'LOW', region: 'US-Central', uptime: '99.98%' },
  { id: 'NODE-2J6', ip: '10.0.67.26', status: 'online', latency: '31ms', packets: '445K', encrypted: true, risk: 'CLEAR', region: 'AP-East', uptime: '99.96%' },
];

const MOCK_GATEWAYS = [
  { name: 'Primary Gateway', status: 'active', throughput: '2.4 Gbps', connections: 1247, region: 'US-East' },
  { name: 'Failover Gateway', status: 'standby', throughput: '0 Gbps', connections: 0, region: 'EU-West' },
  { name: 'Edge Relay', status: 'active', throughput: '890 Mbps', connections: 342, region: 'AP-South' },
];

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#FF2D55', HIGH: '#FF6B00', MEDIUM: '#FFB800', LOW: '#00FFB3', CLEAR: '#00D4FF',
};

const STATUS_COLORS: Record<string, string> = { online: '#00FFB3', degraded: '#FFB800', offline: '#FF2D55' };

export default function NetworkPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [lockedNodes, setLockedNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const toggleLock = useCallback((nodeId: string) => {
    try {
      setLockedNodes(prev => prev.includes(nodeId) ? prev.filter(n => n !== nodeId) : [...prev, nodeId]);
    } catch (_) {}
  }, []);

  const refresh = useCallback(() => {
    try {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 2000);
    } catch (_) { setRefreshing(false); }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        <header className="sticky top-0 z-30 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Globe weight="duotone" className="w-5 h-5 text-[#FFB800]" /> Network Topology</h1>
            <p className="text-xs text-white/30">Node management & packet monitoring</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">
            <ArrowsClockwise className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </header>

        <div className="p-6 space-y-6">
          {/* Gateway Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_GATEWAYS.map((gw) => (
              <div key={gw.name} className="p-4 rounded-xl border border-white/[0.06] bg-[#0D0D14]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CloudArrowUp weight="duotone" className="w-4 h-4 text-[#00D4FF]" />
                    <span className="text-sm font-medium">{gw.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gw.status === 'active' ? 'text-[#00FFB3] bg-[#00FFB3]/10' : 'text-[#FFB800] bg-[#FFB800]/10'}`}>
                    {gw.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-xs font-bold text-white/70">{gw.throughput}</div><div className="text-[10px] text-white/20">Throughput</div></div>
                  <div><div className="text-xs font-bold text-white/70">{gw.connections.toLocaleString()}</div><div className="text-[10px] text-white/20">Connections</div></div>
                  <div><div className="text-xs font-bold text-white/70">{gw.region}</div><div className="text-[10px] text-white/20">Region</div></div>
                </div>
              </div>
            ))}
          </div>

          {/* Network Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-white/[0.06] bg-[#0D0D14] text-center">
              <div className="text-xl font-bold text-[#00FFB3]">{MOCK_NODES.filter(n => n.status === 'online').length}</div>
              <div className="text-[10px] text-white/30">Online Nodes</div>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.06] bg-[#0D0D14] text-center">
              <div className="text-xl font-bold text-[#FFB800]">{MOCK_NODES.filter(n => n.status === 'degraded').length}</div>
              <div className="text-[10px] text-white/30">Degraded</div>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.06] bg-[#0D0D14] text-center">
              <div className="text-xl font-bold text-[#FF2D55]">{MOCK_NODES.filter(n => n.status === 'offline').length}</div>
              <div className="text-[10px] text-white/30">Offline</div>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.06] bg-[#0D0D14] text-center">
              <div className="text-xl font-bold text-[#00D4FF]">{lockedNodes.length}</div>
              <div className="text-[10px] text-white/30">Locked Down</div>
            </div>
          </div>

          {/* Node Grid */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <WifiHigh weight="duotone" className="w-4 h-4 text-[#00FFB3]" />
                Active Nodes
              </h2>
              <span className="text-[10px] text-white/20">{MOCK_NODES.length} nodes registered</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.03]">
              {MOCK_NODES.map((node) => (
                <div key={node.id} className="p-4 bg-[#0D0D14] hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[node.status] || '#666' }} />
                      <span className="text-sm font-medium font-mono">{node.id}</span>
                      <span className="text-[10px] text-white/20 font-mono">{node.ip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: RISK_COLORS[node.risk], backgroundColor: `${RISK_COLORS[node.risk]}15` }}>
                        {node.risk}
                      </span>
                      <button onClick={() => toggleLock(node.id)} title={lockedNodes.includes(node.id) ? 'Unlock node' : 'Lock down node'}
                        className={`p-1.5 rounded-lg transition-colors ${lockedNodes.includes(node.id) ? 'bg-[#FF2D55]/10 text-[#FF2D55]' : 'hover:bg-white/5 text-white/20 hover:text-white/40'}`}>
                        {lockedNodes.includes(node.id) ? <Lock size={14} weight="bold" /> : <LockOpen size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div><div className="text-xs font-medium text-white/60">{node.latency}</div><div className="text-[10px] text-white/15">Latency</div></div>
                    <div><div className="text-xs font-medium text-white/60">{node.packets}</div><div className="text-[10px] text-white/15">Packets</div></div>
                    <div><div className="text-xs font-medium text-white/60">{node.region}</div><div className="text-[10px] text-white/15">Region</div></div>
                    <div><div className="text-xs font-medium text-white/60">{node.uptime}</div><div className="text-[10px] text-white/15">Uptime</div></div>
                  </div>
                  {lockedNodes.includes(node.id) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-2 rounded-lg bg-[#FF2D55]/5 border border-[#FF2D55]/10 flex items-center gap-2">
                      <Lock size={12} className="text-[#FF2D55]" />
                      <span className="text-[10px] text-[#FF2D55]">Node locked — all inbound/outbound traffic blocked</span>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
