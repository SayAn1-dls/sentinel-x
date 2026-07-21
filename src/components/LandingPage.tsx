'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Lock, Fingerprint, Eye, ChevronRight,
  Scan, Activity, AlertTriangle, Radio
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'verified'>('idle');

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleAuth = () => {
    setScanPhase('scanning');
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanPhase('verified');
          setAuthenticated(true);
          setTimeout(() => onEnter(), 1200);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center relative overflow-hidden noise-overlay">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,57,70,0.04)_0%,transparent_70%)]" />
      <div className="absolute inset-0 grid-bg" />

      {/* Scanning line effect */}
      {scanPhase === 'scanning' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-vermilion to-transparent animate-scan-line" />
        </div>
      )}

      {/* Top Classification Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-vermilion to-transparent opacity-60" />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Radio className="w-3 h-3 text-vermilion animate-pulse" />
        <span className="font-mono text-[10px] text-off-white-dim tracking-widest">SENTINEL-X v4.2.1</span>
      </div>
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className="font-mono text-[10px] text-off-white-dim tracking-widest">KINEXYS SECURE NETWORK</span>
        <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Shield Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl bg-vermilion/10 rounded-full scale-150" />
          <div className="relative w-24 h-24 border border-obsidian-border rounded-2xl flex items-center justify-center bg-obsidian-card backdrop-blur-sm">
            <Shield className="w-12 h-12 text-vermilion" strokeWidth={1.5} />
            {scanPhase === 'verified' && (
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald animate-pulse" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-off-white tracking-tight mb-3">
          SENTINEL-X
        </h1>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-vermilion" />
          <p className="font-mono text-xs tracking-[0.3em] text-vermilion uppercase">
            The Forensic Guard
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-vermilion" />
        </div>
        <p className="text-off-white-dim text-sm font-body max-w-md text-center mt-2 leading-relaxed">
          AI-Powered Transaction Forensics for Institutional Finance.
          <br />
          Detecting synthetic entities across the Kinexys network.
        </p>

        {/* Auth Section */}
        <div className="mt-12 w-full max-w-sm">
          {scanPhase === 'idle' && (
            <button
              onClick={handleAuth}
              className="group w-full relative overflow-hidden border border-obsidian-border hover:border-vermilion/50 bg-obsidian-card hover:bg-obsidian-hover rounded-lg px-6 py-4 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-vermilion" />
                  <div className="text-left">
                    <p className="text-off-white text-sm font-medium">Biometric Authentication</p>
                    <p className="text-off-white-dim text-[10px] font-mono">CLEARANCE LEVEL: RESTRICTED</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-off-white-dim group-hover:text-vermilion transition-colors" />
              </div>
            </button>
          )}

          {scanPhase === 'scanning' && (
            <div className="border border-vermilion/30 bg-obsidian-card rounded-lg px-6 py-4">
              <div className="flex items-center gap-3 mb-3">
                <Scan className="w-5 h-5 text-vermilion animate-pulse" />
                <p className="text-vermilion text-sm font-mono">Authenticating...</p>
              </div>
              <div className="w-full h-1 bg-obsidian-border rounded-full overflow-hidden">
                <div
                  className="h-full vermilion-gradient rounded-full transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-[10px] font-mono text-off-white-dim">SCANNING BIOMETRIC MARKERS</span>
                <span className="text-[10px] font-mono text-vermilion">{scanProgress}%</span>
              </div>
            </div>
          )}

          {scanPhase === 'verified' && (
            <div className="border border-emerald/30 bg-emerald-glow rounded-lg px-6 py-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-emerald" />
                <div>
                  <p className="text-emerald text-sm font-medium">Identity Verified</p>
                  <p className="text-emerald/60 text-[10px] font-mono">ACCESS GRANTED — REDIRECTING</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Classification Notice */}
        <div className="mt-16 flex items-center gap-2 px-4 py-2 border border-obsidian-border rounded bg-obsidian-card/50">
          <Lock className="w-3 h-3 text-off-white-dim" />
          <p className="text-[10px] font-mono text-off-white-dim tracking-wider">
            AUTHORIZED PERSONNEL ONLY — ALL ACCESS IS MONITORED & LOGGED
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-8">
          {[
            { icon: Activity, label: 'TRANSACTIONS / DAY', value: '2.4M+' },
            { icon: AlertTriangle, label: 'THREATS BLOCKED', value: '12,847' },
            { icon: Shield, label: 'DETECTION RATE', value: '99.97%' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="w-4 h-4 text-off-white-dim mb-1" />
              <p className="text-off-white text-lg font-heading font-bold">{value}</p>
              <p className="text-[9px] font-mono text-off-white-dim tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-obsidian-border to-transparent" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <p className="text-[9px] font-mono text-off-white-dim/40 tracking-wider">
          © 2026 SENTINEL-X™ · JP MORGAN KINEXYS DIVISION · CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}
