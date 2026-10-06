'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Database, Fingerprint, Globe, ArrowRight,
  LockKey, Bell, Graph, Clipboard, MagnifyingGlass,
  CloudArrowUp, Brain, Siren, CaretRight,
  GitBranch, Stack, Cpu,
  User, Lightbulb, Rocket, CheckCircle,
} from '@phosphor-icons/react';

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

const TX_FEED = [
  { id: 'TX-8A2F', amount: '$42,180', from: 'NODE-7X2', to: 'NODE-3K9', risk: 'LOW' },
  { id: 'TX-C91D', amount: '$128,500', from: 'NODE-1A8', to: 'NODE-9F2', risk: 'HIGH' },
  { id: 'TX-F4E7', amount: '$8,920', from: 'NODE-5M3', to: 'NODE-2J6', risk: 'CLEAR' },
  { id: 'TX-B28A', amount: '$256,000', from: 'NODE-4P1', to: 'NODE-8W5', risk: 'CRITICAL' },
  { id: 'TX-A77C', amount: '$15,340', from: 'NODE-2R9', to: 'NODE-6T1', risk: 'MEDIUM' },
];

const RISK_COLOR: Record<string, string> = {
  CRITICAL: 'text-[#FF2D55] bg-[#FF2D55]/10',
  HIGH: 'text-[#FF6B00] bg-[#FF6B00]/10',
  MEDIUM: 'text-[#FFB800] bg-[#FFB800]/10',
  LOW: 'text-[#00FFB3] bg-[#00FFB3]/10',
  CLEAR: 'text-[#00D4FF] bg-[#00D4FF]/10',
};

const FEATURES = [
  { icon: Brain, title: 'GNN Fraud Detection', desc: 'Graph Neural Networks map transaction flows and flag anomalies across 893 active nodes in real time.' },
  { icon: Globe, title: 'Network Topology', desc: 'Interactive SVG maps visualize node clusters, transaction paths, and suspicious connection patterns.' },
  { icon: Siren, title: 'Real-Time Alerts', desc: 'Sub-second threat detection with severity-ranked alerts, kill-switch isolation, and audit trails.' },
  { icon: MagnifyingGlass, title: 'Deep Audit Logs', desc: '20-level filterable event logs with CSV export, actor tracking, and tamper-proof timestamping.' },
  { icon: LockKey, title: 'Security Hardening', desc: 'Session management, compliance dashboards (SOC2, PCI-DSS, GDPR), and active threat timeline.' },
  { icon: Graph, title: 'Risk Analytics', desc: 'Risk scoring engine with confidence intervals, pipeline stage tracking, and batch scan triggers.' },
];

const STATS_DATA = [
  { label: 'Transactions Monitored', end: 4290000, suffix: '+', display: '4.29M+', icon: Database },
  { label: 'Model Accuracy', end: 997, suffix: '%', display: '99.7%', icon: CheckCircle },
  { label: 'Active Network Nodes', end: 893, suffix: '', display: '893', icon: Globe },
  { label: 'Threats Intercepted', end: 12847, suffix: '', display: '12,847', icon: ShieldCheck },
];

const TECH = [
  { icon: Brain, label: 'PyTorch GNN' },
  { icon: Stack, label: 'FastAPI' },
  { icon: Cpu, label: 'Next.js 15' },
  { icon: GitBranch, label: 'GraphQL' },
  { icon: CloudArrowUp, label: 'Render + Vercel' },
  { icon: Database, label: 'PostgreSQL' },
];

function StatCard({ label, end, suffix, display, icon: Icon }: typeof STATS_DATA[0]) {
  const { count, ref } = useCounter(end, 2200);
  const formatted = end > 10000
    ? count.toLocaleString()
    : suffix === '%' ? (count / 10).toFixed(1) : count.toString();
  return (
    <div ref={ref} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#00D4FF]/30 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center">
        <Icon size={20} className="text-[#00D4FF]" />
      </div>
      <div className="text-3xl font-bold text-white font-mono tracking-tight">
        {suffix === '%' ? `${formatted}%` : `${formatted}${suffix}`}
      </div>
      <div className="text-xs text-white/40 font-medium uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function SentinelXPage() {
  const [txIndex, setTxIndex] = useState(0);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTxIndex(i => (i + 1) % TX_FEED.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#05050D] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#05050D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
              <ShieldCheck size={16} className="text-[#00D4FF]" weight="fill" />
            </div>
            <span className="font-bold text-sm tracking-wider text-white">SENTINEL<span className="text-[#00D4FF]">-X</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-white/40 font-medium">
            <span>Features</span>
            <span>Architecture</span>
            <span>Security</span>
          </div>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 bg-[#00D4FF] text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#00BBEE] transition-colors">
              Launch Dashboard <ArrowRight size={14} weight="bold" />
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="text-[#00D4FF] text-xs font-semibold tracking-widest uppercase">Live System Active</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6">
              AI-Powered<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#00FFB3]">Fraud Detection</span><br />
              Infrastructure
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-lg">
              Sentinel-X uses Graph Neural Networks to monitor 4.29M+ transactions across 893 active nodes — detecting anomalies, isolating threats, and generating audit trails in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <button className="flex items-center gap-2 bg-[#00D4FF] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#00BBEE] transition-all text-sm">
                  Get Started <ArrowRight size={16} weight="bold" />
                </button>
              </Link>
              <Link href="/analysis">
                <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 font-semibold px-6 py-3 rounded-xl hover:bg-white/8 hover:border-white/20 transition-all text-sm">
                  View Analysis <CaretRight size={14} />
                </button>
              </Link>
            </div>
          </div>

          {/* LIVE FEED CARD */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#00D4FF]/5 rounded-3xl blur-3xl" />
            <div className="relative bg-[#0D0D1A] border border-white/10 rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="border-b border-white/5 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FFB3] animate-pulse" />
                  <span className="text-xs text-white/50 font-mono">LIVE TRANSACTION FEED</span>
                </div>
                <span className="text-xs font-mono text-[#00D4FF]">{time}</span>
              </div>
              {/* Ticker */}
              <div className="px-5 py-4 space-y-3">
                {TX_FEED.map((tx, i) => {
                  const isActive = i === txIndex;
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${isActive ? 'bg-[#00D4FF]/5 border-[#00D4FF]/20' : 'bg-white/[0.02] border-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-8 rounded-full transition-all duration-500 ${isActive ? 'bg-[#00D4FF]' : 'bg-white/10'}`} />
                        <div>
                          <div className="text-xs font-mono text-white/80 font-semibold">{tx.id}</div>
                          <div className="text-[10px] text-white/30">{tx.from} → {tx.to}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold font-mono text-white">{tx.amount}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_COLOR[tx.risk]}`}>{tx.risk}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Footer stats */}
              <div className="border-t border-white/5 px-5 py-3 grid grid-cols-3 gap-4">
                {[['893', 'Nodes'], ['99.7%', 'Accuracy'], ['<50ms', 'Latency']].map(([val, lbl]) => (
                  <div key={lbl} className="text-center">
                    <div className="text-sm font-bold font-mono text-[#00D4FF]">{val}</div>
                    <div className="text-[10px] text-white/30">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-[#00D4FF] font-semibold tracking-widest uppercase mb-3">By The Numbers</p>
            <h2 className="text-3xl font-black">System at Scale</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS_DATA.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#00D4FF] font-semibold tracking-widest uppercase mb-3">Capabilities</p>
          <h2 className="text-3xl font-black">Everything You Need</h2>
          <p className="text-white/40 text-sm mt-3 max-w-lg mx-auto">End-to-end fraud intelligence — from raw transaction ingestion to compliance reporting.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-white/[0.02] border border-white/8 rounded-2xl p-6 hover:border-[#00D4FF]/25 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/8 border border-[#00D4FF]/15 flex items-center justify-center mb-4 group-hover:bg-[#00D4FF]/15 transition-colors">
                <Icon size={20} className="text-[#00D4FF]" />
              </div>
              <h3 className="font-bold text-sm text-white mb-2">{title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs text-white/30 font-semibold tracking-widest uppercase mb-8">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {TECH.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5">
                <Icon size={16} className="text-[#00D4FF]" />
                <span className="text-xs font-semibold text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/25 items-center justify-center mb-6">
            <Rocket size={28} className="text-[#00D4FF]" weight="fill" />
          </div>
          <h2 className="text-4xl font-black mb-4">Ready to Deploy?</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Enter the live dashboard and monitor your entire financial network — alerts, audits, topology, and analytics in one place.
          </p>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-3 bg-[#00D4FF] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#00BBEE] transition-all text-base">
              <ShieldCheck size={20} weight="fill" />
              Launch Dashboard
              <ArrowRight size={18} weight="bold" />
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#00D4FF]" weight="fill" />
            <span className="text-xs font-bold text-white/40 tracking-wider">SENTINEL-X</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-white/20">
            {['Dashboard', 'Analysis', 'Audit', 'Network', 'Security', 'Admin'].map(p => (
              <Link key={p} href={`/${p.toLowerCase()}`} className="hover:text-white/50 transition-colors">{p}</Link>
            ))}
          </div>
          <span className="text-[10px] text-white/20">© 2025 Sentinel-X. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
