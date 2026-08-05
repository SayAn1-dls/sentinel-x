'use client';
import { useEffect, useState } from 'react';
import { useThreat } from '@/lib/hooks/useThreat';
import { useNetwork } from '@/lib/hooks/useNetwork';

export function ForensicHUD() {
  const [time, setTime] = useState(new Date());
  const { active, criticalCount } = useThreat();
  const { healthScore, avgLatency } = useNetwork();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/10"
      style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-500 font-black tracking-[0.3em] text-sm uppercase">SENTINEL-X</span>
        </div>
        <span className="text-white/20 text-xs">|</span>
        <span className="text-white/50 text-xs tracking-widest uppercase">Forensic Guard v4.0</span>
      </div>

      <div className="flex items-center gap-6">
        <HUDStat label="ALERTS" value={active.length.toString()} color={criticalCount > 0 ? '#FF0033' : '#00FF88'} />
        <HUDStat label="NET HEALTH" value={`${healthScore}%`} color={healthScore > 80 ? '#00FF88' : '#FFD700'} />
        <HUDStat label="LATENCY" value={`${avgLatency}ms`} color="#00CFFF" />
        <HUDStat label="UTC" value={time.toUTCString().slice(17, 25)} color="#FF6B00" />
      </div>

      <nav className="flex items-center gap-2">
        {['DASHBOARD', 'AUDIT', 'NETWORK', 'AI-SCAN'].map(item => (
          <a key={item} href={`/${item.toLowerCase().replace('-', '/')}`}
            className="text-xs tracking-widest text-white/50 hover:text-orange-500 transition-colors px-3 py-1 uppercase"
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}

function HUDStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white/40 text-xs tracking-widest uppercase">{label}</span>
      <span className="font-black text-sm" style={{ color }}>{value}</span>
    </div>
  );
}
