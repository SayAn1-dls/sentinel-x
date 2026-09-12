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
  {
    step: '01',
    icon: CloudArrowUp,
    title: 'Ingest',
    desc: 'Transaction streams ingested via WebSocket from banking nodes. Multi-source aggregation with deduplication and schema normalization.',
    color: '#00D4FF',
  },
  {
    step: '02',
    icon: Brain,
    title: 'Analyze',
    desc: 'ML pipeline scores each transaction in <50ms. Isolation Forest + Graph Neural Network detect anomalous clusters and entity relationships.',
    color: '#00FFB3',
  },
  {
    step: '03',
    icon: Siren,
    title: 'Alert',
    desc: 'Severity-ranked alerts dispatched instantly to analysts. Sanctions screening, PEP matching, and audit trail written atomically.',
    color: '#FF6B00',
  },
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