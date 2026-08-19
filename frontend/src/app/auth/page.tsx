'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, GoogleLogo, ShieldCheck, LockKey, CircleNotch, Warning, UserPlus } from '@phosphor-icons/react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState('');
  const [bioSuccess, setBioSuccess] = useState('');
  const [regBusy, setRegBusy] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

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
    <main className="min-h-screen bg-[#0A0F1E] text-[#E2E8F0] flex flex-col lg:flex-row overflow-hidden grid-bg">
      {/* Scanlines */}
      <div className="scanlines-overlay" />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.05),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,255,179,0.03),transparent_70%)]" />
      </div>

      {/* ── Left: Branding & Stats ── */}
      <section className="relative flex-1 flex flex-col justify-center px-10 lg:px-16 py-16 border-b lg:border-b-0 lg:border-r border-[rgba(0,212,255,0.08)] z-10">
        <div className="inline-flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] glow-cyan">
            <ShieldCheck size={22} weight="fill" className="text-[#00D4FF]" />
          </div>
          <span className="text-xl font-bold tracking-tight terminal-text">
            SENTINEL<span className="text-[#00D4FF]">-X</span>
          </span>
        </div>

        <h1 className="terminal-text text-5xl lg:text-7xl font-bold leading-[0.95] mb-6 tracking-tight">
          <span className="text-[#E2E8F0]">IDENTITY</span>
          <br />
          <span className="text-[#E2E8F0]">VERIFICATION</span>
          <br />
          <span className="neon-text-cyan">REQUIRED</span>
          <span className="terminal-cursor ml-1" />
        </h1>

        <p className="text-[rgba(148,163,184,0.5)] max-w-md text-sm leading-relaxed mb-10">
          Sessions are encrypted with AES-256, logged to the immutable audit ledger,
          and bound to your clearance level. All access is monitored in real-time.
        </p>

        {/* Security badges */}
        <div className="flex flex-wrap items-center gap-6 text-[rgba(148,163,184,0.4)]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.03)]">
            <LockKey size={14} className="text-[#00D4FF]" />
            <span className="text-[10px] tracking-[0.2em] uppercase terminal-text">TLS 1.3</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.03)]">
            <Fingerprint size={14} className="text-[#00D4FF]" />
            <span className="text-[10px] tracking-[0.2em] uppercase terminal-text">WebAuthn FIDO2</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.03)]">
            <ShieldCheck size={14} className="text-[#00D4FF]" />
            <span className="text-[10px] tracking-[0.2em] uppercase terminal-text">RBAC Enforced</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
          {[
            { label: 'Uptime', value: '99.97%' },
            { label: 'Enc. Standard', value: 'AES-256' },
            { label: 'Sessions', value: '7-Day' },
          ].map(s => (
            <div key={s.label} className="border border-[rgba(0,212,255,0.08)] rounded-lg p-3 bg-[rgba(10,15,30,0.5)]">
              <div className="terminal-text text-lg font-bold text-[#00D4FF]">{s.value}</div>
              <div className="text-[9px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.4)] terminal-text">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Right: Login Panel ── */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-16 z-10">
        <div
          className="w-full max-w-md rounded-2xl border border-[rgba(0,212,255,0.12)] p-8"
          style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)' }}
          data-testid="login-card"
        >
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

          {/* ── Biometric Login ── */}
          <button
            onClick={biometricLogin}
            disabled={bioBusy}
            data-testid="biometric-login-btn"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl terminal-text font-bold text-xs tracking-[0.2em] uppercase border border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.6)] glow-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bioBusy ? (
              <CircleNotch size={20} className="animate-spin" />
            ) : (
              <Fingerprint size={20} weight="bold" />
            )}
            {bioBusy ? 'Awaiting biometric...' : 'Biometric Login'}
          </button>

          {bioError && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.06)]" data-testid="biometric-error" role="alert">
              <Warning size={14} className="text-[#FF2D55] mt-0.5 shrink-0" />
              <p className="terminal-text text-[#FF2D55] text-[11px] leading-relaxed">{bioError}</p>
            </div>
          )}

          {bioSuccess && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.06)]">
              <ShieldCheck size={14} className="text-[#00FFB3] mt-0.5 shrink-0" />
              <p className="terminal-text text-[#00FFB3] text-[11px] leading-relaxed">{bioSuccess}</p>
            </div>
          )}

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[rgba(0,212,255,0.08)]" />
            <span className="terminal-text text-[10px] tracking-[0.4em] uppercase text-[rgba(148,163,184,0.3)]">OR</span>
            <div className="flex-1 h-px bg-[rgba(0,212,255,0.08)]" />
          </div>

          {/* ── Google Login ── */}
          <button
            onClick={googleLogin}
            data-testid="google-login-btn"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-xs tracking-[0.15em] uppercase border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-300"
          >
            <GoogleLogo size={18} weight="bold" />
            Google Secure Sign-In
          </button>

          {/* ── Biometric Registration Section ── */}
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
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg terminal-text font-bold text-[11px] tracking-[0.15em] uppercase border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.04)] text-[#00FFB3] hover:bg-[rgba(0,255,179,0.1)] hover:border-[rgba(0,255,179,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regBusy ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Fingerprint size={16} weight="bold" />
              )}
              {regBusy ? 'Registering...' : 'Register Biometric'}
            </button>

            {regError && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.06)]">
                <Warning size={14} className="text-[#FF2D55] mt-0.5 shrink-0" />
                <p className="terminal-text text-[#FF2D55] text-[11px] leading-relaxed">{regError}</p>
              </div>
            )}

            {regSuccess && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.06)]">
                <ShieldCheck size={14} className="text-[#00FFB3] mt-0.5 shrink-0" />
                <p className="terminal-text text-[#00FFB3] text-[11px] leading-relaxed">{regSuccess}</p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="mt-6 text-[rgba(148,163,184,0.25)] text-[10px] leading-relaxed terminal-text">
            First sign-in provisions ADMIN clearance. Subsequent operatives join as ANALYST.
            All sessions are logged and audited.
          </p>
        </div>
      </section>
    </main>
  );
}
