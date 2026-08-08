'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignOut } from '@phosphor-icons/react';
import { useThreat } from '@/lib/hooks/useThreat';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_LINKS = [
  { label: 'DASHBOARD', href: '/dashboard' },
  { label: 'AUDIT', href: '/audit' },
  { label: 'NETWORK', href: '/network' },
  { label: 'AI LAB', href: '/analysis' },
  { label: 'SECURITY', href: '/security' },
];

export function ForensicHUD() {
  const [time, setTime] = useState<Date | null>(null);
  const { active, criticalCount } = useThreat();
  const { healthScore, avgLatency } = useNetwork();
  const { user, logout } = useAuth();

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/10"
      style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)' }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-500 font-black tracking-[0.3em] text-sm uppercase">SENTINEL-X</span>
        </Link>
        <span className="text-white/20 text-xs hidden lg:inline">|</span>
        <span className="text-white/50 text-xs tracking-widest uppercase hidden lg:inline">Forensic Guard v4.0</span>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <HUDStat label="ALERTS" value={active.length.toString()} color={criticalCount > 0 ? '#FF0033' : '#00FF88'} />
        <HUDStat label="NET HEALTH" value={`${healthScore}%`} color={healthScore > 80 ? '#00FF88' : '#FFD700'} />
        <HUDStat label="LATENCY" value={`${avgLatency}ms`} color="#00CFFF" />
        <HUDStat label="UTC" value={time ? time.toUTCString().slice(17, 25) : '--:--:--'} color="#FF6B00" />
      </div>

      <div className="flex items-center gap-3">
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
              className="text-xs tracking-widest text-white/50 hover:text-orange-500 transition-colors px-2.5 py-1 uppercase"
            >
              {label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-white/10" data-testid="hud-user-chip">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full border border-orange-500/40" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-[10px] font-black">
                {user.name?.[0] ?? '?'}
              </div>
            )}
            <div className="hidden xl:flex flex-col leading-none">
              <span className="text-white/80 text-xs font-bold" data-testid="hud-user-name">{user.name}</span>
              <span className="text-[9px] tracking-widest uppercase" style={{ color: user.role === 'ADMIN' ? '#FF6B00' : '#00CFFF' }} data-testid="hud-user-role">{user.role}</span>
            </div>
            <button
              onClick={logout}
              data-testid="logout-btn"
              aria-label="Logout"
              className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded border border-white/10 hover:border-red-500/40"
            >
              <SignOut size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>
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
