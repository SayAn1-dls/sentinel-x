'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ShieldCheck, Database, Fingerprint, Globe, ArrowRight,
  LockKey, Bell, Graph, Clipboard, MagnifyingGlass,
  CloudArrowUp, Brain, Siren, CaretRight, Code,
  GitBranch, Stack, Cpu, GithubLogo,
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

/* ── data ─────────────────────────────────────────────────────── */

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
  CRITICAL: 'text-[#FF2D55]', HIGH: 'text-[#FF6B00]',
  MEDIUM: 'text-[#FFB800]', LOW: 'text-[#00FFB3]', CLEAR: 'text-[#00D4FF]',
};

const STATS = [
  { label: 'Transactions Monitored', value: 42, display: '4.2Cr+', icon: Database },
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

const PIPELINE_STEPS = [
  { step: '01', icon: CloudArrowUp, title: 'Ingest', desc: 'Transaction streams ingested via WebSocket from banking nodes. Multi-source aggregation with deduplication and schema normalization.', color: '#00D4FF' },
  { step: '02', icon: Brain, title: 'Analyze', desc: 'ML pipeline scores each transaction in <50ms. Isolation Forest + Graph Neural Network detect anomalous clusters and entity relationships.', color: '#00FFB3' },
  { step: '03', icon: Siren, title: 'Alert', desc: 'Severity-ranked alerts dispatched instantly to analysts. Sanctions screening, PEP matching, and audit trail written atomically.', color: '#FF6B00' },
];

const TECH_STACK = [
  { name: 'Next.js 15', icon: Code, color: '#00D4FF' },
  { name: 'TypeScript', icon: Code, color: '#3178C6' },
  { name: 'FastAPI', icon: Stack, color: '#00FFB3' },
  { name: 'Python 3.12', icon: Code, color: '#FFD43B' },
  { name: 'MongoDB Atlas', icon: Database, color: '#00ED64' },
  { name: 'WebAuthn / FIDO2', icon: Fingerprint, color: '#FF6B00' },
  { name: 'Framer Motion', icon: Rocket, color: '#FF2D55' },
  { name: 'Tailwind CSS', icon: Cpu, color: '#38BDF8' },
  { name: 'Vercel', icon: GitBranch, color: '#E2E8F0' },
];

const THREAT_TIMELINE = [
  { ts: '2026-09-12 23:41:08', cluster: '#7', node: 'NODE-8X2', risk: 'HIGH', action: 'Quarantined', color: 'text-[#FF6B00]' },
  { ts: '2026-09-12 23:39:52', cluster: '#12', node: 'NODE-3K9', risk: 'CRITICAL', action: 'Escalated to L3', color: 'text-[#FF2D55]' },
  { ts: '2026-09-12 23:38:01', cluster: '#4', node: 'NODE-1A8', risk: 'MEDIUM', action: 'Flagged for review', color: 'text-[#FFB800]' },
  { ts: '2026-09-12 23:35:44', cluster: '#9', node: 'NODE-9F2', risk: 'CLEAR', action: 'Released', color: 'text-[#00D4FF]' },
  { ts: '2026-09-12 23:33:17', cluster: '#2', node: 'NODE-5M3', risk: 'LOW', action: 'Monitoring', color: 'text-[#00FFB3]' },
  { ts: '2026-09-12 23:30:08', cluster: '#15', node: 'NODE-7X8', risk: 'CRITICAL', action: 'Entity frozen', color: 'text-[#FF2D55]' },
  { ts: '2026-09-12 23:27:33', cluster: '#6', node: 'NODE-4L1', risk: 'HIGH', action: 'Sanctions hit confirmed', color: 'text-[#FF6B00]' },
  { ts: '2026-09-12 23:24:59', cluster: '#11', node: 'NODE-2K7', risk: 'MEDIUM', action: 'PEP match pending', color: 'text-[#FFB800]' },
  { ts: '2026-09-12 23:21:12', cluster: '#3', node: 'NODE-6T4', risk: 'CLEAR', action: 'Whitelisted', color: 'text-[#00D4FF]' },
  { ts: '2026-09-12 23:18:47', cluster: '#8', node: 'NODE-1R8', risk: 'LOW', action: 'Audit logged', color: 'text-[#00FFB3]' },
  { ts: '2026-09-12 23:15:02', cluster: '#20', node: 'NODE-4P1', risk: 'CRITICAL', action: 'Emergency halt triggered', color: 'text-[#FF2D55]' },
  { ts: '2026-09-12 23:11:38', cluster: '#5', node: 'NODE-9H6', risk: 'HIGH', action: 'Cluster dissolved', color: 'text-[#FF6B00]' },
];

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Tech Stack', href: '#tech-stack' },
  { label: 'About', href: '#genesis' },
];

/* ── fade-in wrapper ──────────────────────────────────────────── */

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── page component ───────────────────────────────────────────── */

export default function SentinelXPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans antialiased">
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <ShieldCheck weight="duotone" className="w-7 h-7 text-[#00D4FF] group-hover:text-[#00FFB3] transition-colors" />
            <span className="text-lg font-bold tracking-tight">SENTINEL-X</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
            <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors border border-[#00D4FF]/20">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#00FFB3]/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFB3] animate-pulse" />
              v2.0 — Real-time Threat Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Financial Crime
              <br />
              <span className="bg-gradient-to-r from-[#00D4FF] via-[#00FFB3] to-[#00D4FF] bg-clip-text text-transparent">
                Stops Here.
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mb-10 leading-relaxed">
              AI-powered transaction monitoring, biometric authentication, and real-time threat detection.
              Built for the next generation of financial security.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00D4FF] text-black font-semibold hover:bg-[#00D4FF]/90 transition-colors">
                Get Started <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors">
                See How It Works
              </a>
            </div>
          </motion.div>

          {/* live tx feed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-16 relative rounded-2xl border border-white/5 bg-[#0D0D14] p-6 overflow-hidden"
          >
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FFB3]/60" />
            </div>
            <div className="pt-4 font-mono text-xs space-y-1.5">
              {TX_FEED.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 text-white/40">
                  <span className="text-white/20">[{tx.time}]</span>
                  <span className="text-white/60">{tx.id}</span>
                  <span>{tx.from} → {tx.to}</span>
                  <span className="ml-auto text-white/60">{tx.amount}</span>
                  <span className={`font-semibold ${RISK_COLOR[tx.risk] || 'text-white/40'}`}>{tx.risk}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {STATS.map((s) => {
            const { count, ref } = useCounter(s.value);
            return (
              <div key={s.label} ref={ref} className="text-center">
                <s.icon weight="duotone" className="w-8 h-8 mx-auto mb-3 text-[#00D4FF]/60" />
                <div className="text-3xl font-bold tracking-tight">{s.display}</div>
                <div className="text-sm text-white/40 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection>
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-white/40 max-w-xl mb-16">Three-stage pipeline from ingestion to alert, processing millions of transactions in real time.</p>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line on desktop */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#00D4FF]/30 via-[#00FFB3]/30 to-[#FF6B00]/30" />
            {PIPELINE_STEPS.map((s, i) => (
              <FadeSection key={s.step}>
                <motion.div whileHover={{ y: -4 }} className="relative p-6 rounded-2xl border border-white/5 bg-[#0D0D14] hover:border-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.color}15` }}>
                    <s.icon weight="duotone" className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <div className="text-xs font-mono text-white/30 mb-2">STEP {s.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                </motion.div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection>
            <h2 className="text-3xl font-bold mb-4">Core Modules</h2>
            <p className="text-white/40 max-w-xl mb-16">Six pillars of financial threat detection, from biometric access control to global sanctions screening.</p>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <FadeSection key={f.title}>
                <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl border border-white/5 bg-[#0D0D14] hover:border-[#00D4FF]/20 transition-colors group">
                  <f.icon weight="duotone" className="w-8 h-8 mb-4 text-[#00D4FF]/60 group-hover:text-[#00D4FF] transition-colors" />
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREAT TIMELINE ─────────────────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection>
            <h2 className="text-3xl font-bold mb-4">Threat Timeline</h2>
            <p className="text-white/40 max-w-xl mb-12">Live scrollable audit log of detected threats, escalations, and resolutions.</p>
          </FadeSection>
          <FadeSection>
            <div className="rounded-2xl border border-white/5 bg-[#0D0D14] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FFB3]/60" />
                <span className="ml-4 text-xs font-mono text-white/30">sentinel-x://threat-monitor</span>
              </div>
              <div className="max-h-80 overflow-y-auto p-4 font-mono text-xs space-y-2">
                {THREAT_TIMELINE.map((t, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/40">
                    <span className="text-white/20">[{t.ts}]</span>
                    <span className={`font-semibold ${t.color}`}>{t.risk}</span>
                    <span>Cluster {t.cluster}</span>
                    <span className="text-white/50">{t.node}</span>
                    <span className="text-white/60">{t.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────── */}
      <section id="tech-stack" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection>
            <h2 className="text-3xl font-bold mb-4">Tech Stack</h2>
            <p className="text-white/40 max-w-xl mb-12">Modern, production-grade tooling from frontend to ML pipeline.</p>
          </FadeSection>
          <FadeSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {TECH_STACK.map((t) => (
                <motion.div
                  key={t.name}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-[#0D0D14] hover:border-white/10 transition-colors"
                >
                  <t.icon weight="duotone" className="w-5 h-5 flex-shrink-0" style={{ color: t.color }} />
                  <span className="text-sm font-medium text-white/70">{t.name}</span>
                </motion.div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── GENESIS / ABOUT ─────────────────────────────────── */}
      <section id="genesis" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection>
            <div className="text-xs font-mono text-[#00D4FF]/50 tracking-[0.3em] mb-4">GENESIS // ABOUT</div>
            <h2 className="text-3xl font-bold mb-16">Origin Story</h2>
          </FadeSection>

          {/* quote card */}
          <FadeSection className="mb-16">
            <div className="relative p-8 rounded-2xl border border-[#00D4FF]/10 bg-[#0D0D14]">
              <div className="absolute top-4 left-6 text-5xl text-[#00D4FF]/10 font-serif leading-none">&ldquo;</div>
              <p className="text-lg text-white/60 italic max-w-2xl pl-8 leading-relaxed">
                Every financial transaction is either a legitimate exchange or a potential threat.
                Sentinel-X was built to tell the difference in under 50 milliseconds.
              </p>
              <div className="flex items-center gap-3 mt-6 pl-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#00FFB3]/20 flex items-center justify-center">
                  <User weight="duotone" className="w-5 h-5 text-[#00D4FF]" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Sayan Bhattacharya</div>
                  <div className="text-xs text-white/30">Creator, Sentinel-X</div>
                </div>
              </div>
            </div>
          </FadeSection>

          {/* three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeSection>
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0D0D14]">
                <Lightbulb weight="duotone" className="w-7 h-7 text-[#FFB800] mb-4" />
                <h3 className="font-semibold mb-2">The Problem</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Legacy AML systems rely on static rules that generate 95%+ false positives, drowning analysts in noise while real fraud slips through.
                </p>
              </div>
            </FadeSection>
            <FadeSection>
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0D0D14]">
                <User weight="duotone" className="w-7 h-7 text-[#00D4FF] mb-4" />
                <h3 className="font-semibold mb-2">The Builder</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Sayan Bhattacharya, Semester 5 B.Tech CS. Studying Deep Learning, Advanced ML, Embedded Systems, Quantum Computing, and Game Theory.
                </p>
              </div>
            </FadeSection>
            <FadeSection>
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0D0D14]">
                <Rocket weight="duotone" className="w-7 h-7 text-[#00FFB3] mb-4" />
                <h3 className="font-semibold mb-2">The Idea</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Born from a deep learning anomaly detection assignment. What if Isolation Forests and Graph Neural Networks could flag financial crime in real time?
                </p>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <ShieldCheck weight="duotone" className="w-4 h-4" />
            <span>Built by Sayan Bhattacharya &middot; B.Tech CS &middot; 2026</span>
          </div>
          <a
            href="https://github.com/SayAn1-dls/sentinel-x"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm"
          >
            <GithubLogo weight="duotone" className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
