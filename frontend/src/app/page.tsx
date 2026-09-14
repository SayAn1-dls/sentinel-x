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
  { id: 'TX-C=1D', amount: '$128,500.00', from: 'NODE-1A8', to: 'NODE-9F2', risk: 'HIGH', time: '00:00:07' },
  { id: 'TX-F4E7', amount: '$8,920.00', from: 'NODE-5M3l', to: 'NODE-2J6', risk: 'CLEAR', time: '00:00:11' },
  { id: 'TX-B28A', amount: '$256,000.00', from: 'NODE-4P1', to: 'NODE-8W5', risk: 'CRITICAL', time: '00:00:15' },
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

export default function SentinelXPage() {
  return <div>Placeholder</div>;
}
