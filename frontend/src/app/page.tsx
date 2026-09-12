'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Database,
  Fingerprint,
  Globe,
  ArrowRight,
  LockKey,
  Bell,
  Graph,
  Clipboard,
  MagnifyingGlass,
  CloudArrowUp,
  Brain,
  Siren,
  CaretRight,
} from '@phosphor-icons/react';

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
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
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ── Simulated transaction feed data ── */
const TX_FEED = [
  { id: 'TX-8A2F', amount: '$42,180.00', from: 'NODE-7X2', to: 'NODE-3K9', risk: 'LOW', time: '00:00:03' },
  { id: 'TX-C91D', amount: '$128,500.00', from: 'NODE-1A8', to: 'NODE-9F2', risk: 'HIGH', time: '00:00:07' },
  { id: 'TX-F4E7', amount: '$8,920.00', from: 'NODE-5M3', to: 'NODE-2J6', risk: 'CLEAR', time: '00:00:11' },
  { id: 'TX-B28A', amount: '$256,000.00', from: 'NODE-4P1', to: 'NODE-8W5', risk: 'CRITICAL', time: '00:00:15' },
  { id: 'TX-E5C3', amount: '$15,750.00', from: 'NODE-6T4', to: 'NODE-1R8', risk: 'LOW', time: '00:00:19' },
  { id: 'TX-A1D9', amount: '$89,300.00', from: 'NODE-2K7', to: 'NODE-5N3', risk: 'MEDIUM', time: '00:00:23' },
  { id: 'TX-D7F2', amount: '$3,200.00', from: 'NODE-9H6', to: 'NODE-4L1', risk: 'CLEAR', time: '00:00:27' },
  { id: 'TX-9B4E', amount: '$467,890.00', from: 'NODE-3V2', to: 'NODE-7X8', risk: 'HIGH', time: '00:00:31' },
];

const RISK_COLOR: Record<string, string> = {
  CRITICAL: 'text-[#FF2D55]',
  HIGH: 'text-[#FF6B00]',
  MEDIUM: 'text-[#FFB800]',
  LOW: 'text-[#00FFB3]',
  CLEAR: 'text-[#00D4FF]',
};

const STATS = [
  { label: 'Transactions Monitored', value: 42000000, display: '4.2Cr+', icon: Database },
  { label: 'Threats Intercepted', value: 12847, display: '12,847', icon: ShieldCheck },
  { label: 'Active Nodes', value: 893, display: '893', icon: Globe },
];

const FEATURES = [
  { icon: Fingerprint, title: 'Biometric Auth', desc: 'WebAuthn FIDO2 passkeys with fingerprint and Face ID for zero-password access.' },
  { icon: MagnifyingGlass, title: 'AI Forensics', desc: 'Neural pattern detection across transaction graphs with sub-second risk scoring.' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Instant threat notifications with severity-based routing and escalation protocols.' },
  { icon: Graph, title: 'Network Graph', desc: 'Interactive entity relationship mapping with anomaly clustering and flow analysis.' },
  { icon: Clipboard, title: 'Audit Trail', desc: 'Immutable, timestamped logs for every action, query, and system event.' },
  { icon: LockKey, title: 'Sanctions Screening', desc: 'Live PEP and sanctions list screening with fuzzy matching across global watchlists.' },
];

/* ── How It Works pipeline steps ── */
const PIPELINE_STEPS = [
  {
    icon: CloudArrowUp,
    step: '01',
    title: 'INGEST',
    desc: 'Upload transaction data, connect APIs, or stream real-time feeds. Sentinel-X normalizes and indexes every data point instantly.',
  },
  {
    icon: Brain,
    step: '02',
    title: 'ANALYZE',
    desc: 'Neural pattern detection runs across transaction graphs. ML models score risk, detect anomalies, and map entity relationships in real-time.',
  },
  {
    icon: Siren,
    step: '03',
    title: 'ALERT',
    desc: 'Instant threat notifications with severity-based routing. Flagged transactions are quarantined and escalated for human review.',
  },
];

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' UTC'
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const stat1 = useCounter(42, 2000);
  const stat2 = useCounter(12847, 2500);
  const stat3 = useCounter(893, 1800);
  const statCounters = [stat1, stat2, stat3];

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-[#E2E8F0] overflow-hidden font-sans grid-bg">
      {/* Scanlines overlay */}
      <div className="scanlines-overlay" />

      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,212,255,0.06),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,255,179,0.04),transparent_70%)]" />
      </div>

      {/* ── Top Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-[200] border-b border-[rgba(0,212,255,0.08)]" style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] glow-cyan">
              <ShieldCheck size={22} weight="fill" className="text-[#00D4FF]" />
            </div>
            <span className="text-xl font-bold tracking-tight terminal-text">
              SENTINEL<span className="text-[#00D4FF]">-X</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.05)]">
              <div className="w-2 h-2 rounded-full bg-[#00FFB3] animate-pulse" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#00FFB3] terminal-text font-bold">System Operational</span>
            </div>
            <span className="text-xs text-[rgba(148,163,184,0.5)] terminal-text">{currentTime}</span>
          </div>

          <Link href="/auth">
            <button
              data-testid="access-hq-btn"
              className="px-6 py-2.5 rounded-lg text-[11px] font-bold tracking-[0.2em] uppercase terminal-text border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.5)] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all duration-300"
            >
              Request Access
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 z-10">
        <div className="absolute inset-0 overflow-hidden opacity-[0.06] pointer-events-none">
          <div className="ticker-scroll terminal-text text-xs leading-8 text-[#00D4FF] whitespace-pre-wrap px-8 pt-20">
            {[...TX_FEED, ...TX_FEED, ...TX_FEED, ...TX_FEED].map((tx, i) => (
              <div key={i} className="py-1">
                [{tx.time}] {tx.id} | {tx.from} \u2192 {tx.to} | {tx.amount} | RISK: {tx.risk}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] px-5 py-2 rounded-full mb-10 backdrop-blur-xl"
          >
            <div className="w-2 h-2 bg-[#00D4FF] rounded-full" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span className="terminal-text font-bold text-[10px] tracking-[0.4em] uppercase text-[rgba(0,212,255,0.7)]">
              v4.0.2 // Threat Intelligence Active
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="terminal-text text-5xl md:text-7xl lg:text-8xl font-bold leading-[1] mb-6 tracking-tight"
          >
            <span className="text-[#E2E8F0]">THREAT</span>{' '}
            <span className="text-[#E2E8F0]">INTELLIGENCE</span>
            <br />
            <span className="neon-text-cyan">ACTIVE</span>
            <span className="terminal-cursor text-[#00D4FF] ml-1" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-[rgba(148,163,184,0.6)] max-w-2xl mx-auto mb-14 leading-relaxed"
          >
            Institutional-grade AI forensics for elite financial operations.
            Real-time transaction monitoring, anomaly detection, and compliance enforcement.
          </motion.p>

          {/* ── Stat Cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16"
          >
            {STATS.map((stat, i) => {
              const counter = statCounters[i];
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  ref={counter.ref}
                  className="relative border border-[rgba(0,212,255,0.1)] bg-[rgba(10,15,30,0.7)] rounded-xl p-6 backdrop-blur-xl card-hover"
                >
                  <Icon size={20} className="text-[#00D4FF] mb-3 opacity-60" />
                  <div className="terminal-text text-3xl font-bold text-[#00D4FF] counter-animate mb-1">
                    {i === 0
                      ? `${(counter.count / 10).toFixed(1)}Cr+`
                      : counter.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.5)] terminal-text">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* ── Live Transaction Feed Preview ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="max-w-3xl mx-auto mb-16 border border-[rgba(0,212,255,0.1)] rounded-xl bg-[rgba(10,15,30,0.7)] backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FFB3] animate-pulse" />
                <span className="terminal-text text-[10px] tracking-[0.3em] uppercase text-[rgba(148,163,184,0.5)]">Live Feed</span>
              </div>
              <span className="terminal-text text-[10px] text-[rgba(148,163,184,0.3)]">{currentTime}</span>
            </div>
            <div className="h-[180px] overflow-hidden relative">
              <div className="ticker-scroll terminal-text text-xs px-4 py-2">
                {[...TX_FEED, ...TX_FEED].map((tx, i) => (
                  <div key={i} className="flex items-center gap-4 py-1.5 border-b border-[rgba(0,212,255,0.04)]">
                    <span className="text-[rgba(148,163,184,0.4)] w-16">{tx.time}</span>
                    <span className="text-[#00D4FF]">{tx.id}</span>
                    <span className="text-[rgba(148,163,184,0.5)]">{tx.from} \u2192 {tx.to}</span>
                    <span className="text-[#E2E8F0] ml-auto">{tx.amount}</span>
                    <span className={`${RISK_COLOR[tx.risk]} text-[10px] tracking-wider w-16 text-right`}>{tx.risk}</span>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0A0F1E] to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="terminal-text text-[10px] tracking-[0.5em] uppercase text-[rgba(0,212,255,0.5)] block mb-3">
              // OPERATIONAL PIPELINE
            </span>
            <h2 className="terminal-text text-3xl md:text-5xl font-bold text-[#E2E8F0]">
              HOW IT <span className="neon-text-cyan">WORKS</span>
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
            {PIPELINE_STEPS.flatMap((step, i) => {
              const Icon = step.icon;
              const elements = [
                <motion.div
                  key={`step-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  className="relative flex-1 max-w-xs border border-[rgba(0,212,255,0.12)] bg-[rgba(10,15,30,0.7)] rounded-xl p-8 backdrop-blur-xl card-hover text-center"
                >
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-[#0A0F1E] border border-[rgba(0,212,255,0.2)] rounded-full">
                    <span className="terminal-text text-[10px] tracking-[0.3em] text-[#00D4FF]">STEP {step.step}</span>
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] mb-5 glow-cyan">
                    <Icon size={28} weight="duotone" className="text-[#00D4FF]" />
                  </div>
                  <h3 className="terminal-text text-lg font-bold tracking-[0.15em] text-[#E2E8F0] mb-3">{step.title}</h3>
                  <p className="text-sm text-[rgba(148,163,184,0.5)] leading-relaxed">{step.desc}</p>
                </motion.div>,
              ];
              if (i < PIPELINE_STEPS.length - 1) {
                elements.push(
                  <motion.div
                    key={`conn-${i}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 + 0.3 }}
                    className="hidden md:flex items-center mx-2"
                  >
                    <div className="flex items-center gap-1 text-[#00D4FF] opacity-40">
                      <div className="w-8 h-[1px] bg-[rgba(0,212,255,0.3)]" />
                      <CaretRight size={16} weight="bold" />
                      <div className="w-8 h-[1px] bg-[rgba(0,212,255,0.3)]" />
                    </div>
                  </motion.div>
                );
              }
              return elements;
            })}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="border border-[rgba(0,212,255,0.08)] bg-[rgba(10,15,30,0.6)] rounded-xl p-6 backdrop-blur-xl card-hover text-left"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.06)] mb-4">
                  <Icon size={18} className="text-[#00D4FF]" />
                </div>
                <h3 className="terminal-text text-sm font-bold tracking-wide mb-2 text-[#E2E8F0]">{title}</h3>
                <p className="text-xs text-[rgba(148,163,184,0.5)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link href="/auth">
            <button
              data-testid="enter-dashboard-btn"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-xl terminal-text font-bold text-base tracking-[0.15em] uppercase bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.18)] hover:border-[rgba(0,212,255,0.5)] glow-cyan transition-all duration-300"
            >
              Enter Command Center
              <ArrowRight size={22} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-[rgba(0,212,255,0.06)] text-center relative z-10">
        <p className="terminal-text text-[10px] tracking-[0.5em] uppercase text-[rgba(148,163,184,0.3)]">
          SENTINEL-X \u00A9 2026 | CLASSIFIED | Version 4.0.2
        </p>
      </footer>
    </main>
  );
}
