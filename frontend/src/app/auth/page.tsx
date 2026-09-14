'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connection lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRegister = useCallback(async () => {
    if (!username.trim()) {
      setStatus('error');
      setStatusMsg('Username required');
      return;
    }

    setStatus('loading');
    setStatusMsg('Initializing biometric registration...');

    try {
      const optRes = await fetch('/api/passkeys/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!optRes.ok) throw new Error((await optRes.json()).error || 'Failed to get registration options');
      const options = await optRes.json();

      setStatusMsg('Waiting for biometric verification...');

      const regResponse = await startRegistration({ optionsJSON: options });

      setStatusMsg('Verifying credentials...');

      const verifyRes = await fetch('/api/passkeys/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, response: regResponse }),
      });
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error || 'Verification failed');

      setStatus('success');
      setStatusMsg('Passkey registered successfully!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Registration failed');
    }
  }, [username, router]);

  const handleLogin = useCallback(async () => {
    if (!username.trim()) {
      setStatus('error');
      setStatusMsg('Username required');
      return;
    }

    setStatus('loading');
    setStatusMsg('Initializing biometric authentication...');

    try {
      const optRes = await fetch('/api/passkeys/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!optRes.ok) throw new Error((await optRes.json()).error || 'Failed to get login options');
      const options = await optRes.json();

      setStatusMsg('Waiting for biometric verification...');

      const authResponse = await startAuthentication({ optionsJSON: options });

      setStatusMsg('Verifying credentials...');

      const verifyRes = await fetch('/api/passkeys/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, response: authResponse }),
      });
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error || 'Verification failed');

      setStatus('success');
      setStatusMsg('Authentication successful!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Login failed');
    }
  }, [username, router]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse delay-750" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l1.5 1.5L15 9M12 3c4.97 0 9 4.03 9 9 0 3.64-2.16 6.78-5.27 8.23-.18.08-.37.16-.57.23-.74.26-1.53.39-2.35.39s-1.61-.13-2.35-.39c-.2-.07-.39-.15-.57-.23C5.16 18.78 3 15.64 3 12c0-4.97 4.03-9 9-9z" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Sentinel-X
          </h1>
          <p className="text-gray-500 text-sm mt-1">Elite Cybersecurity Command Center</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 mb-8">
            {(['Register', 'Login'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m.toLowerCase() as 'register' | 'login'); setStatus('idle'); setStatusMsg(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  mode === m.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Username input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Operator ID</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h10" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'register' ? handleRegister() : handleLogin())}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {/* Action button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={mode === 'register' ? handleRegister : handleLogin}
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
          >
            {status === 'loading' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10V14M12 18H12M21 12A9 9 0 113 12A9 9 0 0121 12Z" />
                </svg>
                <span>{mode === 'register' ? 'Register Passkey' : 'Authenticate'}</span>
              </div>
            )}
          </motion.button>

          {/* Status message */}
          <AnimatePresence>
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
                  status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : status === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {status === 'success' ? '✅' : status === 'error' ? '⚠' : '🔄'}
                <span>{statusMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security note */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2M6 9h6V6a6 6 0 0112 0v3h-6M6 9a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2H6z" />
              </svg>
              <span>Secured by WebAuthn &amp; FIDO2 protocol</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}