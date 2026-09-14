'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, ChartLine, TreeStructure, Warning, ShieldCheck, ArrowRight,
  Cpu, Activity, TrendUp, Funnel, Lightning, Eye, CaretRight,
  MagnifyingGlass, CalendarBlank, Export
} from '@phosphor-icons/react';
import Link from 'next/link';

/* ─── Shared Sidebar (lightweight inline for standalone page) ─── */
const navItems = [
  { href: '/dashboard', icon: Activity, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis', active: true },
  { href: '/audit', icon: ShieldCheck, label: 'Audit Log' },
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

/* ─── Mock ML Pipeline Data ─── */
const pipelineStages = [
  { name: 'Data Ingestion', status: 'complete', latency: '12ms', throughput: '2.4K/s' },
  { name: 'Feature Extraction', status: 'complete', latency: '45ms', throughput: '1.8K/s' },
  { name: 'Anomaly Detection', status: 'running', latency: '78ms', throughput: '1.2K/s' },
  { name: 'Risk Scoring', status: 'complete', latency: '23ms', throughput: '2.1K/s' },
  { name: 'Alert Generation', status: 'complete', latency: '8ms', throughput: '3.0K/s' },
];

const anomalyData = [
  { entity: 'Meridian Capital Group', score: 0.94, type: 'Velocity Anomaly', txns: 47, amount: '$2.4M', severity: 'CRITICAL' },
  { entity: 'Apex Holdings Ltd', score: 0.87, type: 'Pattern Deviation', txns: 23, amount: '$890K', severity: 'HIGH' },
  { entity: 'Shadow Creek Finance', score: 0.76, type: 'Graph Clustering', txns: 12, amount: '$340K', severity: 'HIGH' },
  { entity: 'Nordic Trade Co', score: 0.62, type: 'Time Series Spike', txns: 8, amount: '$120K', severity: 'MEDIUM' },
  { entity: 'Pacific Rim Ventures', score: 0.48, type: 'Behavioral Shift', txns: 5, amount: '$67K', severity: 'MEDIUM' },
  { entity: 'Quantum Retail Inc', score: 0.31, type: 'Statistical Outlier', txns: 3, amount: '$28K', severity: 'LOW' },
];

const modelMetrics = [
  { name: 'Precision', value: 96.4, color: '#00D4FF' },
  { name: 'Recall', value: 93.8, color: '#00FFB3' },
  { name: 'F1 Score', value: 95.1, color: '#A78BFA' },
  { name: 'AUC-ROC', value: 98.2, color: '#FBBF24' },
];

const riskColors: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

/* ─── Risk Distribution Chart (Pure SVG) ─── */
function RiskChart() {
  const data = [
    { label: 'Low', value: 45, color: '#00FFB3' },
    { label: 'Medium', value: 28, color: '#FBBF24' },
    { label: 'High', value: 18, color: '#F97316' },
    { label: 'Critical', value: 9, color: '#EF4444' },
  ];
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">{d.label}</span>
            <span className="text-xs text-white/40 font-mono">{d.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.1 * i }}
              className="h-full rounded-full"
              style={{ backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Time Series Chart (SVG) ─── */
function TimeSeriesChart() {
  const normal = [20, 22, 19, 25, 23, 28, 24, 22, 26, 30, 27, 32, 29, 35, 31, 28, 33, 30, 27, 34];
  const anomalous = [null, null, null, null, null, null, null, null, null, null, null, null, 45, null, null, 52, null, null, null, 48];

  const max = 60;
  const w = 400;
  const h = 120;

  const normalPath = normal.map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${(i / (normal.length - 1)) * w} ${h - (v / max) * h}`
  ).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Normal line area */}
      <path d={`${normalPath} L ${w} ${h} L 0 ${h} Z`} fill="url(#normalGrad)" />
      <path d={normalPath} fill="none" stroke="#00D4FF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {/* Anomalous points */}
      {anomalous.map((v, i) => v !== null ? (
        <g key={i}>
          <circle cx={(i / (anomalous.length - 1)) * w} cy={h - (v / max) * h} r="4" fill="#EF4444" />
          <circle cx={(i / (anomalous.length - 1)) * w} cy={h - (v / max) * h} r="8" fill="#EF4444" opacity="0.2" />
        </g>
      ) : null)}
    </svg>
  );
}

export default function AnalysisPage() {
  const [pipelineActive, setPipelineActive] = useState(true);

  // Simulate pipeline running
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineActive(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MiniSidebar />

      <main className="ml-16 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Brain weight="duotone" className="w-7 h-7 text-cyan-400" />
              AI Analysis Engine
            </h1>
            <p className="text-white/40 text-sm mt-1">Deep learning anomaly detection & risk assessment</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className={`w-1.5 h-1.5 rounded-full ${pipelineActive ? 'bg-cyan-400 animate-pulse' : 'bg-white/30'}`} />
              <span className="text-cyan-400 text-xs font-medium">Pipeline {pipelineActive ? 'Active' : 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* ML Pipeline Visualization */}
        <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Lightning weight="fill" className="w-4 h-4 text-cyan-400" />
            ML Pipeline Status
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {pipelineStages.map((stage, i) => (
              <div key={stage.name} className="flex items-center gap-2 shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`px-4 py-3 rounded-xl border ${
                    stage.status === 'running'
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-white/[0.03] border-white/[0.06]'
                  }`}
                >
                  <p className="text-xs font-medium text-white/80">{stage.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-white/40">⏱ {stage.latency}</span>
                    <span className="text-[10px] text-white/40">⚡ {stage.throughput}</span>
                  </div>
                  {stage.status === 'running' && (
                    <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1/2 h-full bg-cyan-400 rounded-full"
                      />
                    </div>
                  )}
                </motion.div>
                {i < pipelineStages.length - 1 && (
                  <CaretRight weight="bold" className="w-4 h-4 text-white/20 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Anomaly Detection Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Time Series */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendUp weight="bold" className="w-4 h-4 text-cyan-400" />
                  Transaction Anomaly Timeline
                </h3>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2 h-0.5 rounded bg-cyan-400" /> Normal
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Anomaly
                  </span>
                </div>
              </div>
              <TimeSeriesChart />
              <p className="text-white/30 text-xs mt-2">Mock visualization — connect database for live data</p>
            </div>

            {/* Detected Anomalies Table */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06]">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Eye weight="fill" className="w-4 h-4 text-cyan-400" />
                  Detected Anomalies
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <MagnifyingGlass weight="bold" className="w-3.5 h-3.5 text-white/30" />
                    <input placeholder="Search entities..." className="bg-transparent text-xs text-white/70 placeholder:text-white/20 outline-none w-24" />
                  </div>
                  <button className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
                    <Funnel weight="bold" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {anomalyData.map((a, i) => (
                  <motion.div
                    key={a.entity}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold border ${riskColors[a.severity]}`}>
                        {a.severity}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white/90 font-medium truncate">{a.entity}</p>
                        <p className="text-xs text-white/40">{a.type} · {a.txns} transactions · {a.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-mono text-white/80">{(a.score * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-white/30">confidence</p>
                      </div>
                      <CaretRight weight="bold" className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Model Performance */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Model Performance</h3>
              <div className="space-y-4">
                {modelMetrics.map((m, i) => (
                  <div key={m.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/60">{m.name}</span>
                      <span className="text-xs font-mono" style={{ color: m.color }}>{m.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Risk Distribution</h3>
              <RiskChart />
            </div>

            {/* Model Info */}
            <div className="bg-[#0C0C14] rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Active Models</h3>
              <div className="space-y-2">
                {[
                  { name: 'Isolation Forest', version: 'v2.4.1', status: 'Active' },
                  { name: 'LSTM Autoencoder', version: 'v1.8.0', status: 'Active' },
                  { name: 'Graph Neural Net', version: 'v3.1.2', status: 'Training' },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <p className="text-xs text-white/80 font-medium">{m.name}</p>
                      <p className="text-[10px] text-white/30">{m.version}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {m.status}
                    </span>
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
