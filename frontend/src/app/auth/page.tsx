'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();
  useEffect(() => {
    try { router.replace('/dashboard'); } catch (_) { window.location.href = '/dashboard'; }
  }, [router]);
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
    </div>
  );
}
