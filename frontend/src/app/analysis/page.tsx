'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Pulse, ChartLine, FingerprintSimple, Globe, GearSix,
  ClockCounterClockwise, Cpu, Brain, Lightning, CaretRight, CaretLeft,
  User, MagnifyingGlass, Warning, Eye, Funnel, ArrowsClockwise
} from '@phosphor-icons/react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: Pulse, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis', active: true },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log' },
  { href: '/network', icon: Globe, label: 'Network' },
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

const MOCK_SCAN_RESULTS = [
  { id: 'SCN-001', entity: 'NODE-7X2', type: 'Isolation Forest', risk: 92, status: 'Anomaly Detected', detail: 'Unusual transaction velocity — 847 TXs in 60s, 12x baseline. Graph cluster #7 flagged.' },
  { id: 'SCN-002', entity: 'NODE-3K9', type: 'GNN Pattern Match', risk: 78, status: 'Pattern Match', detail: 'Circular flow detected: NODE-3K9 → NODE-8W5 → NODE-1A8 → NODE-3K9. Layering signature.' },
  { id: 'SCN-003', entity: 'NODE-1A8', type: 'Velocity Check', risk: 65, status: 'Threshold Breach', detail: 'Cumulative transfer volume $2.4M in 24h exceeds $1M threshold for this entity class.' },
  { id: 'SCN-004', entity: 'NODE-9F2', type: 'Behavioral', risk: 41, status: 'Deviation', detail: 'Transaction timing shifted 6h from established pattern. Low-confidence anomaly.' },
  { id: 'SCN-005', entity: 'NODE-5M3', type: 'Sanctions Match', risk: 15, status: 'Clear', detail: 'No matches against OFAC, EU, UN consolidated lists. Fuzzy match score 0.12.' },
];

const MOCK_PATTERNS = [
  { name: 'Circular Flow', count: 3, severity: 'HIGH', color: '#FF6B00' },
  { name: 'Velocity Spike', count: 7, severity: 'MEDIUM', color: '#FFB800' },
  { name: 'Fan-out', count: 2, severity: 'HIGH', color: '#FF6B00' },
  { name: 'Dormant Activation', count: 1, severity: 'CRITICAL', color: '#FF2D55' },
  { name: 'Micro-structuring', count: 5, severity: 'MEDIUM', color: '#FFB800' },
  { name: 'Jurisdictional Hop', count: 4, severity: 'LOW', color: '#00FFB3' },
];

export default function AnalysisPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const runScan = useCallback(() => {
    try {
      setScanning(true);
      setScanComplete(false);
      setTimeout(() => { setScanning(false); setScanComplete(true); }, 3000);
    } catch (_) { setScanning(false); }
  }, []);

  const filteredResults = filterRisk === 'all'
    ? MOCK_SCAN_RESULTS
    : MOCK_SCAN_RESULTS.filter(r => {
        if (filterRisk === 'high') return r.risk >= 70;
        if (filterRisk === 'medium') return r.risk >= 40 && r.risk < 70;
        return r.risk < 40;
      });

  const riskColor = (r: number) => r >= 70 ? '#FF2D55' : r >= 40 ? '#FFB800' : '#00FFB3';

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        <header className="sticky top-0 z-30 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Brain weight="duotone" className="w-5 h-5 text-[#00D4FF]" /> AI Analysis Engine</h1>
            <p className="text-xs text-white/30">Neural pattern detection & forensic scanning</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={runScan}
            disabled={scanning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scanning ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-[#00D4FF] text-black hover:bg-[#00D4FF]/90'}`}>
            {scanning ? <ArrowsClockwise className="w-4 h-4 animate-spin" /> : <Lightning weight="bold" className="w-4 h-4" />}
            {scanning ? 'Scanning...' : 'Run Full Scan'}
          </motion.button>
        </header>

        <div className="p-6 space-y-6">
          {/* Scan Progress */}
          <AnimatePresence>
            {scanning && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-[#00D4FF]/20 bg-[#00D4FF]/5">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu weight="duotone" className="w-5 h-5 text-[#00D4FF] animate-pulse" />
                  <span className="text-sm font-medium text-[#00D4FF]">Neural scan in progress...</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#00FFB3] rounded-full"
                    initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'easeInOut' }} />
                </div>
                <p className="text-[10px] text-white/30 mt-2">Analyzing 24,891 transactions across 893 nodes...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pattern Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOCK_PATTERNS.map((p) => (
              <motion.div key={p.name} whileHover={{ y: -2 }}
                className="p-3 rounded-xl border border-white/[0.06] bg-[#0D0D14] hover:border-white/[0.1] transition-colors cursor-pointer">
                <div className="text-lg font-bold" style={{ color: p.color }}>{p.count}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{p.name}</div>
                <div className="text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full inline-block" style={{ color: p.color, backgroundColor: `${p.color}15` }}>{p.severity}</div>
              </motion.div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <Funnel weight="duotone" className="w-4 h-4 text-white/30" />
            {['all', 'high', 'medium', 'low'].map((f) => (
              <button key={f} onClick={() => setFilterRisk(f)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterRisk === f ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-medium' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)} Risk
              </button>
            ))}
          </div>

          {/* Scan Results */}
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <motion.div key={result.id} layout whileHover={{ y: -1 }}
                className="rounded-xl border border-white/[0.06] bg-[#0D0D14] hover:border-white/[0.1] transition-colors overflow-hidden">
                <button onClick={() => setSelectedScan(selectedScan === result.id ? null : result.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${riskColor(result.risk)}10` }}>
                    <MagnifyingGlass weight="duotone" className="w-5 h-5" style={{ color: riskColor(result.risk) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{result.entity}</span>
                      <span className="text-[10px] text-white/20 font-mono">{result.id}</span>
                    </div>
                    <span className="text-xs text-white/30">{result.type} — {result.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: riskColor(result.risk) }}>{result.risk}</div>
                    <div className="text-[10px] text-white/20">risk score</div>
                  </div>
                  <CaretRight className={`w-4 h-4 text-white/20 transition-transform ${selectedScan === result.id ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {selectedScan === result.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.04] overflow-hidden">
                      <div className="px-5 py-4">
                        <p className="text-xs text-white/50 leading-relaxed">{result.detail}</p>
                        <div className="flex gap-2 mt-3">
                          <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors">Deep Analyze</button>
                          <button className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors">Export Report</button>
                          <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 transition-colors">Flag for Review</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Risk Distribution */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] p-5">
            <h3 className="text-sm font-semibold mb-4">Risk Distribution</h3>
            <div className="flex items-end gap-1 h-32">
              {[12, 45, 78, 34, 92, 56, 23, 67, 41, 88, 15, 63, 29, 71, 50, 37, 84, 19, 55, 43].map((v, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${v}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="flex-1 rounded-t-sm min-w-[8px]"
                  style={{ backgroundColor: v >= 70 ? '#FF2D55' : v >= 40 ? '#FFB800' : '#00FFB3', opacity: 0.7 }}
                  title={`Score: ${v}`} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/20">
              <span>24h ago</span><span>Now</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
