'use client';

import { useState } from 'react';
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
  Warning,
  Crosshair,
  Broadcast,
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

type NodeData = {
  id: string;
  x: number;
  y: number;
  risk: string;
  conn: number;
  txns: number;
};

const NODES: NodeData[] = [
  { id: 'N-01', x: 80, y: 60, risk: 'CRITICAL', conn: 8, txns: 234 },
  { id: 'N-02', x: 200, y: 40, risk: 'HIGH', conn: 5, txns: 156 },
  { id: 'N-03', x: 350, y: 80, risk: 'MEDIUM', conn: 7, txns: 89 },
  { id: 'N-04', x: 450, y: 50, risk: 'LOW', conn: 3, txns: 42 },
  { id: 'N-05', x: 100, y: 160, risk: 'CLEAR', conn: 6, txns: 311 },
  { id: 'N-06', x: 250, y: 140, risk: 'HIGH', conn: 9, txns: 178 },
  { id: 'N-07', x: 400, y: 160, risk: 'CRITICAL', conn: 12, txns: 445 },
  { id: 'N-08', x: 60, y: 260, risk: 'MEDIUM', conn: 4, txns: 67 },
  { id: 'N-09', x: 180, y: 240, risk: 'LOW', conn: 6, txns: 93 },
  { id: 'N-10', x: 320, y: 270, risk: 'CLEAR', conn: 5, txns: 201 },
  { id: 'N-11', x: 460, y: 240, risk: 'HIGH', conn: 7, txns: 134 },
  { id: 'N-12', x: 100, y: 360, risk: 'LOW', conn: 3, txns: 55 },
  { id: 'N-13', x: 240, y: 350, risk: 'MEDIUM', conn: 8, txns: 122 },
  { id: 'N-14', x: 380, y: 350, risk: 'CRITICAL', conn: 10, txns: 389 },
  { id: 'N-15', x: 480, y: 330, risk: 'CLEAR', conn: 4, txns: 77 },
];

const EDGES: [string, string][] = [
  ['N-01', 'N-06'], ['N-01', 'N-05'], ['N-02', 'N-06'], ['N-03', 'N-07'], ['N-04', 'N-07'],
  ['N-05', 'N-09'], ['N-06', 'N-10'], ['N-07', 'N-11'], ['N-08', 'N-13'], ['N-09', 'N-13'],
  ['N-10', 'N-14'], ['N-11', 'N-15'], ['N-12', 'N-13'], ['N-13', 'N-14'], ['N-14', 'N-15'],
  ['N-01', 'N-02'], ['N-02', 'N-03'], ['N-03', 'N-04'], ['N-08', 'N-09'], ['N-12', 'N-08'],
];

export default function NetworkPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string>('N-07');
  const [nodeOverrides, setNodeOverrides] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const getNode = (id: string) => NODES.find((n) => n.id === id)!;
  const getNodeRisk = (id: string) => nodeOverrides[id] || getNode(id).risk;

  const selected = getNode(selectedNode);
  const selectedRisk = getNodeRisk(selectedNode);
  const isFlagged = nodeOverrides[selectedNode] === 'CRITICAL';

  const toggleFlag = () => {
    setNodeOverrides((prev) => {
      const current = prev[selectedNode];
      if (current === 'CRITICAL') {
        const copy = { ...prev };
        delete copy[selectedNode];
        return copy;
      }
      return { ...prev, [selectedNode]: 'CRITICAL' };
    });
  };

  const isolateNode = () => {
    setToast(`Node ${selectedNode} isolated from network`);
    setTimeout(() => setToast(null), 3000);
  };

  const nodeMap = new Map(NODES.map((n) => [n.id, n]));

  const trafficStats = [
    { label: 'Tx/sec', value: '1,247', color: '#00D4FF' },
    { label: 'Blocked', value: '23', color: '#FF2D55' },
    { label: 'Flagged', value: '156', color: '#FF6B00' },
    { label: 'Clean', value: '1,068', color: '#00FFB3' },
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
            const active = item.href === '/network';
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
          {/* Toast */}
          {toast && (
            <div className="fixed top-6 right-6 z-[100] px-4 py-3 rounded-lg bg-[#00FFB3]/10 border border-[#00FFB3]/20 text-sm text-[#00FFB3] font-medium animate-pulse">
              {toast}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold tracking-wider text-white">NETWORK TOPOLOGY</h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFB3]/10 border border-[#00FFB3]/20">
              <Broadcast size={14} color="#00FFB3" />
              <span className="text-xs font-bold text-[#00FFB3]">893 Active Nodes</span>
            </span>
          </div>

          {/* Traffic Stats */}
          <div className="flex items-center gap-6 mb-6 px-1">
            {trafficStats.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-xs text-white/40">{s.label}:</span>
                <span className="text-sm font-mono font-bold" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-5 gap-4">
            {/* SVG Visualization */}
            <div className="col-span-3">
              <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-4">
                <svg
                  viewBox="0 0 540 420"
                  className="w-full rounded-lg"
                  style={{ backgroundColor: '#0D0D14' }}
                  key={refreshKey}
                >
                  <defs>
                    <style>{`
                      @keyframes nodePulse {
                        0%, 100% { opacity: 0.4; }
                        50% { opacity: 1; }
                      }
                      .critical-pulse { animation: nodePulse 2s ease-in-out infinite; }
                    `}</style>
                  </defs>
                  {/* Edges */}
                  {EDGES.map(([a, b], i) => {
                    const na = nodeMap.get(a)!;
                    const nb = nodeMap.get(b)!;
                    return (
                      <line
                        key={i}
                        x1={na.x}
                        y1={na.y}
                        x2={nb.x}
                        y2={nb.y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={1}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {NODES.map((node) => {
                    const risk = getNodeRisk(node.id);
                    const color = RISK_COLORS[risk];
                    const isSelected = selectedNode === node.id;
                    const isCritical = risk === 'CRITICAL';
                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {isCritical && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={24}
                            fill={`${color}15`}
                            className="critical-pulse"
                          />
                        )}
                        {isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={22}
                            fill="none"
                            stroke={color}
                            strokeWidth={1}
                            strokeDasharray="4 2"
                            opacity={0.5}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={16}
                          fill={`${color}30`}
                          stroke={color}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                        />
                        <text
                          x={node.x}
                          y={node.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={8}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <button
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="mt-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-[#00D4FF]/30 transition-all"
                >
                  Refresh Topology
                </button>
              </div>
            </div>

            {/* Node Detail Panel */}
            <div className="col-span-2">
              <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5">
                <h2 className="text-sm font-bold tracking-wider text-white/80 uppercase mb-5">Node Details</h2>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Node ID</span>
                    <span className="text-sm font-mono font-bold text-[#00D4FF]">{selected.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Risk Level</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        color: RISK_COLORS[selectedRisk],
                        backgroundColor: `${RISK_COLORS[selectedRisk]}15`,
                        border: `1px solid ${RISK_COLORS[selectedRisk]}30`,
                      }}
                    >
                      {selectedRisk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Connections</span>
                    <span className="text-sm font-mono text-white/70">{selected.conn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Transactions</span>
                    <span className="text-sm font-mono text-white/70">{selected.txns}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Status</span>
                    <span className="text-xs font-bold text-[#00FFB3]">ACTIVE</span>
                  </div>
                </div>

                <div className="border-t border-white/5 mt-5 pt-5 flex flex-col gap-3">
                  <button
                    onClick={toggleFlag}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                      isFlagged
                        ? 'bg-[#FF2D55]/10 border border-[#FF2D55]/20 text-[#FF2D55] hover:bg-[#FF2D55]/20'
                        : 'bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00]/20'
                    }`}
                  >
                    <Warning size={14} className="inline mr-1" />
                    {isFlagged ? 'Unflag Node' : 'Flag Node'}
                  </button>
                  <button
                    onClick={isolateNode}
                    className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#FF2D55]/10 border border-[#FF2D55]/20 text-[#FF2D55] hover:bg-[#FF2D55]/20 transition-all"
                  >
                    <Crosshair size={14} className="inline mr-1" />
                    Isolate Node
                  </button>
                </div>

                {/* Legend */}
                <div className="border-t border-white/5 mt-5 pt-5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Risk Legend</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(RISK_COLORS).map(([label, color]) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-white/40">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
