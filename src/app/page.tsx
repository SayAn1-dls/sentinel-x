'use client';
import Link from 'next/link';
import { NeonButton } from '@/components/ui/NeonButton';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { PLATFORM_NAME, PLATFORM_VERSION, PLATFORM_CODENAME } from '@/lib/constants';

const FEATURES = [
  { icon: '⚡', title: 'Real-Time Forensics', desc: 'Live transaction monitoring with sub-second threat detection across all network gateways.', color: '#FF6B00' },
  { icon: '🧠', title: 'AI Pattern Engine', desc: 'Neural forensic scanner detects smurfing, layering, and round-tripping patterns autonomously.', color: '#00CFFF' },
  { icon: '🔒', title: 'Silicon Security', desc: 'AES-256 encrypted gateways with TLS 1.3 across all data pipelines and audit channels.', color: '#00FF88' },
  { icon: '📋', title: 'Deep-Trace Audit', desc: 'Immutable audit ledger with full session tracking, IP logging, and export-ready reports.', color: '#FFD700' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5"
        style={{ backdropFilter: 'blur(60px)', background: 'rgba(5,5,5,0.8)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-500 font-black tracking-[0.4em] text-sm">{PLATFORM_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"><NeonButton variant="ghost" size="sm">DASHBOARD</NeonButton></Link>
          <Link href="/audit"><NeonButton variant="ghost" size="sm">AUDIT LOGS</NeonButton></Link>
          <Link href="/network"><NeonButton size="sm">ENTER HQ</NeonButton></Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-500 text-xs tracking-widest uppercase">{PLATFORM_CODENAME} · v{PLATFORM_VERSION}</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6 leading-none">
          <span style={{ color: '#FF6B00' }}>FORENSIC</span>
          <br />
          <span className="text-white">GUARD</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>PLATFORM</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mb-12 leading-relaxed">
          Institutional-grade AI-powered transaction forensics. Real-time threat detection, deep-trace audit logs, and encrypted network monitoring for elite compliance operations.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><NeonButton size="lg">LAUNCH DASHBOARD</NeonButton></Link>
          <Link href="/analysis"><NeonButton variant="ghost" size="lg">AI ANALYSIS</NeonButton></Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {FEATURES.map(f => (
            <SiliconCard key={f.title}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-black text-sm tracking-widest uppercase mb-2" style={{ color: f.color }}>{f.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </SiliconCard>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between">
        <span className="text-white/20 text-xs tracking-widest">{PLATFORM_NAME} · {PLATFORM_CODENAME} · {PLATFORM_VERSION}</span>
        <span className="text-white/20 text-xs">CLASSIFIED · INTERNAL USE ONLY</span>
      </footer>
    </main>
  );
}
