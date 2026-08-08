'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, Fingerprint, Globe, ArrowRight, LockKey } from '@phosphor-icons/react';

const STATS = [
  { label: 'MONITORED', value: '4.2Cr', icon: Database },
  { label: 'THREATS NEUTRALIZED', value: '12K+', icon: ShieldCheck },
  { label: 'ACTIVE NODES', value: '890', icon: Globe },
];

const CAPABILITIES = [
  { icon: Fingerprint, title: 'BIOMETRIC ACCESS', desc: 'WebAuthn FIDO2 passkeys — fingerprint & Face ID quick login.' },
  { icon: LockKey, title: 'HARDENED SESSIONS', desc: 'Google OAuth identity with encrypted, audited 7-day sessions.' },
  { icon: Database, title: 'LIVE FORENSICS', desc: 'Real transaction ledger with AI risk scoring, persisted end-to-end.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-orange-500 overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />
      <div className="fixed inset-0 pointer-events-none z-[101] bg-[radial-gradient(circle_at_50%_50%,rgba(255,77,0,0.05),transparent_70%)]" />

      <nav className="fixed top-0 inset-x-0 z-[200] p-6 md:p-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto group cursor-pointer">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,77,0,0.4)] rotate-[-10deg] group-hover:rotate-0 transition-transform">
            <ShieldCheck size={28} weight="fill" />
          </div>
          <span className="text-3xl font-[900] uppercase tracking-tighter">SENTINEL<span className="text-orange-500">X</span></span>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/auth">
            <button data-testid="access-hq-btn" className="bg-white/5 border border-white/10 backdrop-blur-3xl px-8 py-3 rounded-2xl font-black text-[10px] tracking-[0.4em] hover:bg-orange-500 hover:border-orange-500 transition-all uppercase">Access HQ</button>
          </Link>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 px-6 py-2 rounded-full mb-12 backdrop-blur-2xl">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            <span className="font-black text-[10px] tracking-[0.5em] uppercase text-white/40">SYSTEM STATUS: OPTIMAL // V4.0.2</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-[14vw] md:text-[10vw] font-[900] leading-[0.8] mb-12 tracking-tighter uppercase drop-shadow-[0_0_80px_rgba(255,77,0,0.2)] font-bebas">
            FORENSIC <br />
            <span className="text-orange-500 italic">GUARD.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-2xl md:text-3xl text-white/30 max-w-3xl mx-auto mb-16 font-bold uppercase tracking-tight italic">
            &ldquo;INSTITUTIONAL-GRADE AI FORENSICS FOR ELITE FINANCIAL OPERATIONS. ZERO NETWORK LAG. ZERO DRAMA.&rdquo;
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link href="/dashboard">
              <button data-testid="enter-dashboard-btn" className="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-[900] px-16 py-8 rounded-[2.5rem] uppercase tracking-widest transition-all shadow-[0_0_60px_rgba(255,77,0,0.4)] flex items-center gap-4 text-3xl font-bebas">
                ENTER COMMAND CENTER <ArrowRight size={40} weight="bold" />
              </button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-2xl hover:border-orange-500/40 transition-colors">
                <Icon size={26} className="text-orange-500 mb-4" />
                <div className="font-black text-xs tracking-[0.3em] uppercase mb-2">{title}</div>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 flex flex-wrap justify-center gap-10">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 text-white/40">
                <Icon size={20} className="text-orange-500" />
                <span className="font-black text-xl text-white">{value}</span>
                <span className="text-[10px] tracking-[0.3em] uppercase">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center relative z-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">© 2026 SENTINEL-X COMMAND • INSTITUTIONAL GRADE</p>
      </footer>
    </main>
  );
}
