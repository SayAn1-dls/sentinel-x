'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, GoogleLogo, ShieldCheck, LockKey, CircleNotch, Warning, UserPlus, Lightning, Eye } from '@phosphor-icons/react';
import { useAuth } from '@/lib/hooks/useAuth';

const LIVE_THREATS = [
  { ts: '23:41:08', node: 'NODE-8X2', risk: 'HIGH', action: 'Quarantined', color: '#FF6B00' },
  { ts: '23:39:52', node: 'NODE-3K9', risk: 'CRITICAL', action: 'Escalated to L3', color: '#FF2D55' },
  { ts: '23:38:01', node: 'NODE-1A8', risk: 'MEDIUM', action: 'Flagged for review', color: '#FFB800' },
  { ts: '23:35:44', node: 'NODE-9F2', risk: 'CLEAR', action: 'Released', color: '#00D4FF' },
  { ts: '23:33:17', node: 'NODE-5M3', risk: 'LOW', action: 'Monitoring', color: '#00FFB3' },
  { ts: '23:30:08', node: 'NODE-7X8', risk: 'CRITICAL', action: 'Entity frozen', color: '#FF2D55' },
  { ts: '23:27:33', node: 'NODE-4L1', risk: 'HIGH', action: 'Sanctions hit', color: '#FF6B00' },
  { ts: '23:24:59', node: 'NODE-2K7', risk: 'MEDIUM', action: 'PEP match pending', color: '#FFB800' },
];

function LiveThreatFeed() {
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount(prev => (prev < LIVE_THREATS.length ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-8 w-full max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
        <span className="terminal-text text-[10px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.5)]">
          Live Threat Feed
        </span>
      </div>
      <div className="space-y-1 max-h-[220px] overflow-hidden">
        {LIVE_THREATS.slice(0, visibleCount).map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-[rgba(0,212,255,0.06)] bg-[rgba(6,11,24,0.6)] data-row-enter"
          >
            <span className="terminal-text text-[10px] text-[rgba(148,163,184,0.3)] w-[60px] shrink-0">{t.ts}</span>
            <span className="terminal-text text-[10px] text-[rgba(148,163,184,0.4)] w-[70px] shrink-0">{t.node}</span>
            <span
              className="terminal-text text-[9px] font-bold tracking-wider w-[65px] shrink-0"
              style={{ color: t.color }}
            >
              {t.risk}
            </span>
            <span className="terminal-text text-[10px] text-[rgba(148,163,184,0.5)] truncate">{t.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FingerprintPulse() {
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <div className="absolute inset-0 rounded-full bg-[rgba(0,212,255,0.1)] animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute inset-2 rounded-full bg-[rgba(0,212,255,0.08)] animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
      <Fingerprint size={32} weight="bold" className="text-[#00D4FF] relative z-10 animate-pulse" />
    </div>
  );
}

function ParticleGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="auth-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="rgba(0,212,255,0.08)" />
          </pattern>
          <linearGradient id="auth-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="auth-mask">
            <rect width="100%" height="100%" fill="url(#auth-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" mask="url(#auth-mask)" />
      </svg>
    </div>
  );
}

export default function AuthPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState('');
  const [bioSuccess, setBioSuccess] = useState('');
  const [regBusy, setRegBusy] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const biometricLogin = async () => {
    setBioBusy(true);
    setBioError('');
    setBioSuccess('');
    try {
      const optRes = await fetch('/api/passkeys/login/options', { method: 'POST', credentials: 'include' });
      if (!optRes.ok) throw new Error('Could not start biometric login');
      const { options, flowId } = await optRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch('/api/passkeys/login/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId, credential: assertion }),
      });
      const payload = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(payload.error || 'Biometric authentication failed');
      setUser(payload);
      router.replace('/dashboard');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Biometric authentication failed';
      setBioError(
        /NotAllowedError|abort|cancel|timed out/i.test(msg)
          ? 'Biometric prompt was cancelled or unavailable on this device.'
          : msg
      );
      setBioBusy(false);
    }
  };

  const registerBiometric = async () => {
    setRegBusy(true);
    setRegError('');
    setRegSuccess('');
    try {
      const optRes = await fetch('/api/passkeys/register/options', {
        method: 'POST',
        credentials: 'include',
      });
      if (!optRes.ok) {
        const errData = await optRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Must be signed in to register a passkey. Sign in with Google first.');
      }
      const { options } = await optRes.json();
      const regResponse = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch('/api/passkeys/register/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regResponse),
      });
      const payload = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(payload.error || 'Registration verification failed');
      setRegSuccess('Biometric passkey registered successfully. You can now use it to sign in.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Biometric registration failed';
      setRegError(
        /NotAllowedError|abort|cancel|timed out/i.test(msg)
          ? 'Registration was cancelled or not supported on this device.'
          : msg
      );
    } finally {
      setRegBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-[#E2E8F0] flex flex-col lg:flex-row overflow-hidden relative">
      {/* Particle grid background */}
      <ParticleGrid />

      {/* Scanlines */}
      <div className="scanlines-overlay" />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.06),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,255,179,0.04),transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,212,255,0.02),transparent_60%)]" />
      </div>

      {/* Left: Branding, Stats & Live Threat Feed */}
      <section className="relative flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-16 border-b lg:border-b-0 lg:border-r border-[rgba(0,212,255,0.08)] z-10">
        {/* Top bar with version & time */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] glow-cyan">
              <ShieldCheck size={22} weight="fill" className="text-[#00D4FF]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight terminal-text">
                SENTINEL<span className="text-[#00D4FF]">-X</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.3)] terminal-text">v4.0</span>
                <div className="w-1 h-1 rounded-full bg-[#00FFB3]" />
                <span className="text-[8px] tracking-[0.2em] uppercase text-[#00FFB3] terminal-text">ONLINE</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded border border-[rgba(0,212,255,0.08)] bg-[rgba(6,11,24,0.6)]">
            <Eye size={12} className="text-[rgba(148,163,184,0.3)]" />
            <span className="terminal-text text-[10px] text-[#00D4FF] tabular-nums">{currentTime}</span>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="terminal-text text-4xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] mb-6 tracking-tight">
          <span className="text-[#E2E8F0]">IDENTITY</span>
          <br />
          <span className="text-[#E2E8F0]">VERIFICATION</span>
          <br />
          <span className="neon-text-cyan">REQUIRED</span>
          <span className="terminal-cursor ml-1" />
        </h1>

        <p className="text-[rgba(148,163,184,0.5)] max-w-md text-sm leading-relaxed mb-8">
          Sessions are encrypted with AES-256, logged to the immutable audit ledger,
          and bound to your clearance level. All access is monitored in real-time.
        </p>

        {/* Security badges */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {[
            { icon: LockKey, label: 'TLS 1.3' },
            { icon: Fingerprint, label: 'WebAuthn FIDO2' },
            { icon: ShieldCheck, label: 'RBAC Enforced' },
            { icon: Lightning, label: 'Sub-50ms Scoring' },
          ].map(b => (
            <div
              key={b.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.03)] transition-colors hover:border-[rgba(0,212,255,0.2)]"
            >
              <b.icon size={12} className="text-[#00D4FF]" />
              <span className="text-[9px] tracking-[0.2em] uppercase terminal-text text-[rgba(148,163,184,0.4)]">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
          {[
            { label: 'Uptime', value: '99.97%', glow: false },
            { label: 'Encryption', value: 'AES-256', glow: false },
            { label: 'Session TTL', value: '7 Days', glow: false },
          ].map(s => (
            <div
              key={s.label}
              className="border border-[rgba(0,212,255,0.08)] rounded-lg p-3 bg-[rgba(10,15,30,0.5)] card-hover"
            >
              <div className="terminal-text text-base font-bold text-[#00D4FF]">{s.value}</div>
              <div className="text-[8px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.35)] terminal-text mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Live Threat Feed */}
        <LiveThreatFeed />
      </section>

      {/* Right: Login Panel */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-12 lg:py-16 z-10">
        <div
          className="w-full max-w-md rounded-2xl border border-[rgba(0,212,255,0.12)] p-8 relative"
          style={{
            background: 'rgba(10,15,30,0.85)',
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
          }}
          data-testid="login-card"
        >
          {/* Decorative top edge glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-40" />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
              <h2 className="terminal-text text-[#00D4FF] font-bold tracking-[0.2em] uppercase text-xs">
                Identity Verification Required
              </h2>
            </div>
            <p className="text-[rgba(148,163,184,0.4)] text-xs terminal-text">
              Authenticate to enter the command center.
            </p>
          </div>

          {/* Biometric Login */}
          <button
            onClick={biometricLogin}
            disabled={bioBusy}
            data-testid="biometric-login-btn"
            className="group w-full flex items-center justify-center gap-3 py-4 rounded-xl terminal-text font-bold text-xs tracking-[0.2em] uppercase border border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.6)] hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] glow-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.08)] to-transparent" />

            {bioBusy ? (
              <FingerprintPulse />
            ) : (
              <Fingerprint size={20} weight="bold" className="relative z-10" />
            )}
            <span className="relative z-10">{bioBusy ? 'Awaiting biometric...' : 'Biometric Login'}</span>
          </button>

          {/* Biometric status messages */}
          {bioError && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.06)]" data-testid="biometric-error" role="alert">
              <Warning size={14} className="text-[#FF2D55] mt-0.5 shrink-0" />
              <p className="terminal-text text-[#FF2D55] text-[11px] leading-relaxed">
                <span className="text-[rgba(255,45,85,0.5)]">[ERR]</span> {bioError}
              </p>
            </div>
          )}

          {bioSuccess && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.06)]">
              <ShieldCheck size={14} className="text-[#00FFB3] mt-0.5 shrink-0" />
              <p className="terminal-text text-[#00FFB3] text-[11px] leading-relaxed">
                <span className="text-[rgba(0,255,179,0.5)]">[OK]</span> {bioSuccess}
              </p>
            </div>
          )}

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.12)] to-transparent" />
            <span className="terminal-text text-[10px] tracking-[0.4em] uppercase text-[rgba(148,163,184,0.3)]">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.12)] to-transparent" />
          </div>

          {/* Google Login */}
          <button
            onClick={googleLogin}
            data-testid="google-login-btn"
            className="group w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-xs tracking-[0.15em] uppercase border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.04)] to-transparent" />
            <GoogleLogo size={18} weight="bold" className="relative z-10" />
            <span className="relative z-10">Google Secure Sign-In</span>
          </button>

          {/* Biometric Registration Section */}
          <div className="mt-8 pt-6 border-t border-[rgba(0,212,255,0.08)]">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus size={14} className="text-[rgba(148,163,184,0.4)]" />
              <span className="terminal-text text-[10px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.4)]">
                Biometric Enrollment
              </span>
            </div>
            <p className="text-[rgba(148,163,184,0.3)] text-[11px] leading-relaxed mb-3 terminal-text">
              Register a passkey for quick biometric access. Requires an active session (sign in with Google first).
            </p>

            <button
              onClick={registerBiometric}
              disabled={regBusy}
              className="group w-full flex items-center justify-center gap-3 py-3 rounded-lg terminal-text font-bold text-[11px] tracking-[0.15em] uppercase border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.04)] text-[#00FFB3] hover:bg-[rgba(0,255,179,0.1)] hover:border-[rgba(0,255,179,0.4)] hover:shadow-[0_0_25px_rgba(0,255,179,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[rgba(0,255,179,0.06)] to-transparent" />
              {regBusy ? (
                <CircleNotch size={16} className="animate-spin relative z-10" />
              ) : (
                <Fingerprint size={16} weight="bold" className="relative z-10" />
              )}
              <span className="relative z-10">{regBusy ? 'Registering...' : 'Register Biometric'}</span>
            </button>

            {regError && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.06)]">
                <Warning size={14} className="text-[#FF2D55] mt-0.5 shrink-0" />
                <p className="terminal-text text-[#FF2D55] text-[11px] leading-relaxed">
                  <span className="text-[rgba(255,45,85,0.5)]">[ERR]</span> {regError}
                </p>
              </div>
            )}

            {regSuccess && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.06)]">
                <ShieldCheck size={14} className="text-[#00FFB3] mt-0.5 shrink-0" />
                <p className="terminal-text text-[#00FFB3] text-[11px] leading-relaxed">
                  <span className="text-[rgba(0,255,179,0.5)]">[OK]</span> {regSuccess}
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-[rgba(0,212,255,0.06)]">
            <p className="text-[rgba(148,163,184,0.2)] text-[9px] leading-relaxed terminal-text">
              <span className="text-[rgba(0,212,255,0.3)]">$</span> First sign-in provisions ADMIN clearance. Subsequent operatives join as ANALYST.
              All sessions are logged and audited.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
