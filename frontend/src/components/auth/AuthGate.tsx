'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingPulse } from '@/components/ui/LoadingPulse';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const processed = useRef(false);
  const [exchanging, setExchanging] = useState(false);
  const [checkedHash, setCheckedHash] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('session_id=')) {
      if (!processed.current) {
        processed.current = true;
        setExchanging(true);
        const sessionId = hash.split('session_id=')[1].split('&')[0];
        fetch('/api/auth/session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
          .then(r => {
            if (!r.ok) throw new Error('exchange failed');
            return r.json();
          })
          .then(u => setUser(u))
          .catch(() => router.replace('/auth'))
          .finally(() => {
            window.history.replaceState(null, '', window.location.pathname);
            setExchanging(false);
          });
      }
    }
    setCheckedHash(true);
  }, [router, setUser]);

  useEffect(() => {
    if (checkedHash && !exchanging && !loading && !user && !processed.current) {
      router.replace('/auth');
    }
  }, [checkedHash, exchanging, loading, user, router]);

  if (user) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" data-testid="auth-loading">
      <LoadingPulse color="#FF6B00" size="lg" label={exchanging ? 'ESTABLISHING SECURE SESSION' : 'VERIFYING CLEARANCE'} />
      <span className="text-white/30 text-xs tracking-[0.4em] uppercase">SENTINEL-X ACCESS CONTROL</span>
    </div>
  );
}
