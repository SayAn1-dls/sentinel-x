'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { Fingerprint, GoogleLogo, ShieldCheck, LockKey } from '@phosphor-icons/react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState('');

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
      setBioError(/NotAllowedError|abort|cancel|timed out/i.test(msg) ? 'Biometric prompt was cancelled or unavailable on this device.' : msg);
      setBioBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <section className="relative flex-1 flex flex-col justify-center px-10 lg:px-20 py-16 border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="inline-flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.4)]">
            <ShieldCheck size={22} weight="fill" />
          </div>
          <span className="text-2xl font-[900] uppercase tracking-tighter">SENTINEL<span className="text-orange-500">X</span></span>
        </div>
        <h1 className="font-bebas text-6xl lg:text-8xl leading-[0.85] uppercase mb-8 drop-shadow-[0_0_60px_rgba(255,107,0,0.2)]">
          RESTRICTED<br /><span className="text-orange-500 italic">COMMAND ACCESS.</span>
        </h1>
        <p className="text-white/40 max-w-md text-sm leading-relaxed uppercase tracking-wide">
          Identity verification required. Sessions are encrypted, logged to the immutable audit ledger, and bound to your clearance level.
        </p>
        <div className="mt-12 flex items-center gap-8 text-white/30 text-[10px] tracking-[0.35em] uppercase">
          <span className="flex items-center gap-2"><LockKey size={16} /> TLS 1.3</span>
          <span className="flex items-center gap-2"><Fingerprint size={16} /> WEBAUTHN FIDO2</span>
          <span className="flex items-center gap-2"><ShieldCheck size={16} /> RBAC ENFORCED</span>
        </div>
      </section>

      <section className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-md rounded-2xl border border-white/10 p-10"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)' }}
          data-testid="login-card"
        >
          <div className="mb-8">
            <h2 className="text-orange-500 font-black tracking-[0.3em] uppercase text-sm mb-2">OPERATIVE SIGN-IN</h2>
            <p className="text-white/40 text-xs">Authenticate to enter the command center.</p>
          </div>

          <button
            onClick={googleLogin}
            data-testid="google-login-btn"
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-black text-xs tracking-[0.25em] uppercase py-4 rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-200"
          >
            <GoogleLogo size={18} weight="bold" /> Sign in with Google
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-[10px] tracking-[0.4em] uppercase">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={biometricLogin}
            disabled={bioBusy}
            data-testid="biometric-login-btn"
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-orange-500/40 text-orange-500 font-black text-xs tracking-[0.25em] uppercase py-4 rounded-xl hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200 disabled:opacity-50"
          >
            <Fingerprint size={20} weight="bold" className={bioBusy ? 'animate-pulse' : ''} />
            {bioBusy ? 'Awaiting biometric...' : 'Biometric quick login'}
          </button>

          {bioError && (
            <p className="mt-4 text-red-400 text-xs leading-relaxed" data-testid="biometric-error" role="alert">{bioError}</p>
          )}

          <p className="mt-8 text-white/25 text-[10px] leading-relaxed uppercase tracking-wider">
            First sign-in provisions an ADMIN clearance. Subsequent operatives join as ANALYST. Enable biometrics from the Security console after login.
          </p>
        </div>
      </section>
    </main>
  );
}
