'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, WifiHigh, WifiSlash, Lock, ShieldCheck, ArrowsClockwise,
  Lightning, CaretRight, ArrowUp, ArrowDown, Eye, Warning,
  Cpu, Activity, ChartLine, TreeStructure, CloudArrowUp, CloudArrowDown,
  CellSignalFull, Certificate, Timer, Pulse, Broadcast
} from '@phosphor-icons/react';
import Link from 'next/link';

/* ─── Shared Sidebar ─── */
const navItems = [
  { href: '/dashboard', icon: Activity, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ShieldCheck, label: 'Audit Log' },
  { href: '/network', icon: TreeStructure, label: 'Network', active: true },
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

/* ─── Mock Network Data ─── */
const gateways = [
  { id: 'gw-01', name: 'US-East Primary', region: 'Virginia', status: 'online', latency: 12, uptime: 99.98, protocol: 'TLS 1.3', bits: 256, throughput: '2.4 Gbps', connections: 1847 },
  { id: 'gw-02', name: 'EU-West Primary', region: 'Frankfurt', status: 'online', latency: 24, uptime: 99.95, protocol: 'TLS 1.3', bits: 256, throughput: '1.8 Gbps', connections: 1203 },
  { id: 'gw-03', name: 'AP-South Primary', region: 'Mumbai', status: 'online', latency: 8, uptime: 99.99, protocol: 'TLS 1.3', bits: 256, throughput: '1.2 Gbps', connections: 892 },
  { id: 'gw-04', name: 'US-West Failover', region: 'Oregon', status: 'standby', latency: 18, uptime: 99.92, protocol: 'TLS 1.3', bits: 256, throughput: '0.4 Gbps', connections: 124 },
  { id: 'gw-05', name: 'EU-North Backup', region: 'Stockholm', status: 'offline', latency: 0, uptime: 98.70, protocol: 'TLS 1.2', bits: 128, throughput: '0 Gbps', connections: 0 },
];

const trafficTimeline = [
  340, 290, 180, 120, 90, 110, 280, 520, 680, 740, 820, 780,
  850, 790, 710, 640, 590, 620, 700, 650, 580, 490, 420, 360
];

const packetTypes = [
  { type: 'HTTPS', percentage: 68, color: '#00D4FF' },
  { type: 'WSS', percentage: 18, color: '#00FFB3' },
  { type: 'gRPC', percentage: 9, color: '#A78BFA' },
  { type: 'DNS', percentage: 5, color: '#FBBF24' },
];

const securityEvents = [
  { time: '23:42', event: 'DDoS mitigation activated', severity: 'HIGH', source: 'gw-01' },
  { time: '23:38', event: 'Certificate rotation completed', severity: 'LOW', source: 'gw-03' },
  { time: '23:25', event: 'Rate limit triggered', severity: 'MEDIUM', source: 'gw-02' },
  { time: '23:18', event: 'New TLS session established', severity: 'LOW', source: 'gw-01' },
  { time: '22:55', event: 'Suspicious IP blocked', severity: 'HIGH', source: 'gw-04' },
];

const statusColors: Record<string, string> = {
  online: 'text-emerald-400 bg-emerald-500/10',
  standby: 'text-yellow-400 bg-yellow-500/10',
  offline: 'text-red-400 bg-red-500/10',
};

const severityAccent: Record<string, string> = {
  HIGH: 'text-orange-400',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-emerald-400',
};

/* ─── Traffic Chart (Pure SVG) ─── */
function TrafficChart() {
  const maxVal = Math.max(...trafficTimeline);
  const w = 460;
  const h = 100;
  const points = trafficTimeline.map((v, i) => ({
    x: (i / (trafficTimeline.length - 1)) * w,
    y: h - (v / maxVal) * h,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#trafficGrad)" />
      <path d={linePath} fill="none" stroke="#00D4FF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {/* Peak marker */}
      {points.map((p, i) => trafficTimeline[i] === maxVal ? (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#00D4FF" />
          <circle cx={p.x} cy={p.y} r="6" fill="#00D4FF" opacity="0.2" />
        </g>
      ) : null)}
    </svg>
  );
}

/* ─── Network Topology (Simplified SVG) ─── */
function TopologyMap() {
  const nodes = [
    { x: 200, y: 50, label: 'CDN Edge', status: 'online' },
    { x: 80, y: 130, label: 'GW-01', status: 'online' },
    { x: 200, y: 130, label: 'GW-02', status: 'online' },
    { x: 320, y: 130, label: 'GW-03', status: 'online' },
    { x: 140, y: 210, label: 'GW-04', status: 'standby' },
    { x: 260, y: 210, label: 'GW-05', status: 'offline' },
    { x: 200, y: 280, label: 'Core DB', status: 'online' },
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3], [1, 3], [2, 4], [3, 5], [1, 6], [2, 6], [3, 6],
  ];
  const statusColor: Record<string, string> = { online: '#00FFB3', standby: '#FBBF24', offline: '#EF4444' };

  return (
    <svg viewBox="0 0 400 320" className="w-full h-48">
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="18"
            fill={n.status === 'online' ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)'}
            stroke={statusColor[n.status]} strokeWidth="1.5"
          />
          <circle cx={n.x} cy={n.y} r="4" fill={statusColor[n.status]} />
          <text x={n.x} y={n.y + 30} textAnchor="middle"
            fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Protocol Distribution ─── */
function ProtocolBars() {
  return (
    <div className="space-y-3">
      {packetTypes.map((p, i) => (
        <div key={p.type}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">{p.type}</span>
            <span className="text-xs text-white/40 font-mono">{p.percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p.percentage}%` }}
              transition={{ duration: 0.7, delay: 0.1 * i }}
              className="h-full rounded-full"
              style={{ backgroundColor: p.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NetworkPage() {
  const [selectedGw, setSelectedGw] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = gateways.filter(g => g.status === 'online').length;
  const totalConnections = gateways.reduce((s, g) => s + g.connections, 0);
  const avgLatency = Math.round(gateways.filter(g => g.status === 'online').reduce((s, g) => s + g.latency, 0) / onlineCount);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MiniSidebar />

      <main className="ml-16 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Globe weight="duotone" className="w-7 h-7 text-cyan-400" />
              Network Security
            </h1>
            <p className="text-white/40 text-sm mt-1">Encrypted gateway monitoring · TLS 1.3 enforced</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">{onlineCount}/{gateways.length} Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Pulse weight="bold" className="w-3 h-3 text-white/30" />
              <span className="text-cyan-400 text-xs font-mono tabular-nums">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Connections', value: totalConnections.toLocaleString(), icon: CellSignalFull, color: 'text-cyan-400', border: 'border-cyan-500/20' },
            { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Timer, color: 'text-emerald-400', border: 'border-emerald-500/20' },
            { label: 'Certificates', value: '12 Valid', icon: Certificate, color: 'text-violet-400', border: 'border-violet-500/20' },
            { label: 'Threat Blocks', value: '847', icon: ShieldCheck, color: 'text-orange-400', border: 'border-orange-500/20' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-[#0C0C14] rounded-xl border ${s.border} p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <s.icon weight="duotone" className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-white/40 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Traffic Chart */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Broadcast weight="bold" className="w-4 h-4 text-cyan-400" />
                  Network Traffic (24h)
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-white/30">
                    <CloudArrowUp weight="bold" className="w-3 h-3" /> 4.2 TB
                  </span>
                  <span className="flex items-center gap-1 text-white/30">
                    <CloudArrowDown weight="bold" className="w-3 h-3" /> 6.8 TB
                  </span>
                </div>
              </div>
              <TrafficChart />
              <div className="flex justify-between text-[9px] text-white/20 font-mono mt-1">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
              </div>
            </div>

            {/* Gateway Table */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <WifiHigh weight="bold" className="w-4 h-4 text-cyan-400" />
                  Gateway Nodes
                </h3>
                <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 text-xs transition-colors">
                  <ArrowsClockwise weight="bold" className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-8 gap-4 px-4 py-2.5 border-b border-white/[0.04] text-[10px] text-white/30 uppercase tracking-wider">
                <div className="col-span-2">Gateway</div>
                <div>Status</div>
                <div>Latency</div>
                <div>Uptime</div>
                <div>Protocol</div>
                <div>Throughput</div>
                <div>Connections</div>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {gateways.map((gw, i) => (
                  <motion.div
                    key={gw.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedGw(selectedGw === gw.id ? null : gw.id)}
                    className={`grid grid-cols-1 lg:grid-cols-8 gap-2 lg:gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer group ${
                      selectedGw === gw.id ? 'bg-cyan-500/[0.03]' : ''
                    }`}
                  >
                    <div className="col-span-2">
                      <p className="text-sm text-white/90 font-medium">{gw.name}</p>
                      <p className="text-[10px] text-white/30">{gw.region} · {gw.id}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[gw.status]}`}>
                        {gw.status === 'online' ? (
                          <WifiHigh weight="bold" className="w-2.5 h-2.5" />
                        ) : gw.status === 'offline' ? (
                          <WifiSlash weight="bold" className="w-2.5 h-2.5" />
                        ) : (
                          <ArrowsClockwise weight="bold" className="w-2.5 h-2.5" />
                        )}
                        {gw.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-white/50">
                      {gw.status !== 'offline' ? `${gw.latency}ms` : '—'}
                    </div>
                    <div className="text-xs font-mono text-white/50">{gw.uptime}%</div>
                    <div>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Lock weight="bold" className="w-2.5 h-2.5 text-emerald-400/60" />
                        {gw.protocol}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-white/50">{gw.throughput}</div>
                    <div className="text-xs font-mono text-white/50 flex items-center justify-between">
                      <span>{gw.connections.toLocaleString()}</span>
                      <CaretRight weight="bold" className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Topology Map */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TreeStructure weight="bold" className="w-4 h-4 text-cyan-400" />
                Network Topology
              </h3>
              <TopologyMap />
              <div className="flex items-center justify-center gap-6 mt-2 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Online</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Standby</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Offline</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Protocol Distribution */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Protocol Distribution</h3>
              <ProtocolBars />
            </div>

            {/* Security Events */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Eye weight="fill" className="w-4 h-4 text-cyan-400" />
                Security Events
              </h3>
              <div className="space-y-3">
                {securityEvents.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="mt-0.5">
                      <Warning weight="fill" className={`w-3.5 h-3.5 ${severityAccent[ev.severity]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/80">{ev.event}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/30 font-mono">{ev.time}</span>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-white/30">{ev.source}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Encryption Status */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Lock weight="fill" className="w-4 h-4 text-emerald-400" />
                Encryption Status
              </h3>
              <div className="space-y-2">
                {gateways.filter(g => g.status !== 'offline').map(gw => (
                  <div key={gw.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <p className="text-xs text-white/80 font-medium">{gw.name}</p>
                      <p className="text-[10px] text-white/30">{gw.protocol} · {gw.bits}-bit</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Secured
                    </span>
                  </div>
                ))}
                {gateways.filter(g => g.status === 'offline').map(gw => (
                  <div key={gw.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-red-500/10">
                    <div>
                      <p className="text-xs text-white/80 font-medium">{gw.name}</p>
                      <p className="text-[10px] text-white/30">{gw.protocol} · {gw.bits}-bit</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                      Offline
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bandwidth Summary */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Bandwidth Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <CloudArrowUp weight="duotone" className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-cyan-400">4.2 TB</p>
                  <p className="text-[10px] text-white/30">Upload (24h)</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <CloudArrowDown weight="duotone" className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-emerald-400">6.8 TB</p>
                  <p className="text-[10px] text-white/30">Download (24h)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-white/20 text-xs mt-6 text-center">
          Showing mock data — connect infrastructure APIs for live network monitoring
        </p>
      </main>
    </div>
  );
}
