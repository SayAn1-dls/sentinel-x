'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Lock, Fingerprint, Eye, ChevronRight,
  Scan, Activity, AlertTriangle, Radio, Cpu, Waves, Binary, KeyRound
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

interface ScanPhaseConfig {
  label: string;
  detail: string;
  icon: typeof Scan;
  duration: number;
}

const SCAN_PHASES: ScanPhaseConfig[] = [
  { label: 'RETINAL PATTERN', detail: 'Iris topology mapping', icon: Eye, duration: 18 },
  { label: 'FACE GEOMETRY', detail: '3D depth mesh analysis', icon: Scan, duration: 22 },
  { label: 'NEURAL SIGNATURE', detail: 'Cognitive cadence match', icon: Cpu, duration: 20 },
  { label: 'PULSE WAVEFORM', detail: 'Micro-vascular liveness', icon: Activity, duration: 18 },
  { label: 'VOICE SPECTRA', detail: 'Sub-harmonic verification', icon: Waves, duration: 22 },
];

const STORAGE_KEY = 'sentinel-x-admin-code';
const CODE_LENGTH = 6;

function DataStream({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cols = Math.floor(W / 14);
    const drops = new Array(cols).fill(0).map(() => Math.random() * H);
    const chars = '01\u03b1\u03b2\u03b3\u03b4\u03b5\u2211\u220f\u222b\u2202\u2207\u03a3\u03a6\u03a8\u03a9abcdef'.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '11px JetBrains Mono, monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();
        if (brightness > 0.7) {
          ctx.fillStyle = `rgba(230, 57, 70, ${0.3 + brightness * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(230, 57, 70, ${0.05 + brightness * 0.15})`;
        }
        ctx.fillText(char, i * 14, drops[i]);
        if (drops[i] > H && Math.random() > 0.96) {
          drops[i] = 0;
        }
        drops[i] += 14;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

function BiometricWaveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const draw = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const w = W / 2;
      const h = H / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.5;

      for (let line = 0; line < 3; line++) {
        ctx.beginPath();
        const alpha = 0.3 - line * 0.08;
        ctx.strokeStyle = `rgba(230, 57, 70, ${alpha})`;
        for (let x = 0; x < w; x++) {
          const freq = 0.02 + line * 0.008;
          const amp = (h / 4) * (1 - line * 0.2);
          const y = h / 2 + Math.sin(x * freq + t + line * 1.2) * amp * Math.sin(t * 0.5 + line);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16"
      style={{ display: 'block' }}
    />
  );
}

type AuthStep = 'init' | 'set-code' | 'enter-code';

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [showContent, setShowContent] = useState(false);
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [phaseStatuses, setPhaseStatuses] = useState<('pending' | 'scanning' | 'done')[]>(
    SCAN_PHASES.map(() => 'pending')
  );
  const [telemetryLines, setTelemetryLines] = useState<string[]>([]);

  const [authStep, setAuthStep] = useState<AuthStep>('init');
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [confirmDigits, setConfirmDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isConfirmPhase, setIsConfirmPhase] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAuthStep('enter-code');
    } else {
      setAuthStep('set-code');
    }
  }, []);

  const focusInput = useCallback((refs: React.MutableRefObject<(HTMLInputElement | null)[]>, idx: number) => {
    setTimeout(() => refs.current[idx]?.focus(), 0);
  }, []);

  const handleDigitChange = (
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    idx: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const updated = [...digits];
    updated[idx] = digit;
    setDigits(updated);
    setCodeError('');

    if (digit && idx < CODE_LENGTH - 1) {
      focusInput(refs, idx + 1);
    }
  };

  const handleKeyDown = (
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const updated = [...digits];
        updated[idx] = '';
        setDigits(updated);
      } else if (idx > 0) {
        focusInput(refs, idx - 1);
        const updated = [...digits];
        updated[idx - 1] = '';
        setDigits(updated);
      }
      setCodeError('');
    }
  };

  const handlePaste = (
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pasted.length > 0) {
      const updated = Array(CODE_LENGTH).fill('');
      pasted.split('').forEach((d, i) => { updated[i] = d; });
      setDigits(updated);
      const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
      focusInput(refs, nextFocus);
    }
  };

  const handleSetCode = () => {
    const code = codeDigits.join('');
    if (code.length < CODE_LENGTH) {
      setCodeError(`Enter all ${CODE_LENGTH} digits`);
      return;
    }
    if (!isConfirmPhase) {
      setIsConfirmPhase(true);
      setConfirmDigits(Array(CODE_LENGTH).fill(''));
      setCodeError('');
      setCodeSuccess('');
      setTimeout(() => confirmRefs.current[0]?.focus(), 100);
      return;
    }
    const confirmCode = confirmDigits.join('');
    if (confirmCode.length < CODE_LENGTH) {
      setCodeError(`Confirm all ${CODE_LENGTH} digits`);
      return;
    }
    if (code !== confirmCode) {
      setCodeError('ACCESS CODES DO NOT MATCH \u2014 RETRY');
      setConfirmDigits(Array(CODE_LENGTH).fill(''));
      setTimeout(() => confirmRefs.current[0]?.focus(), 100);
      return;
    }
    localStorage.setItem(STORAGE_KEY, code);
    setCodeSuccess('ACCESS CODE ESTABLISHED');
    setCodeError('');
    setTimeout(() => {
      setAuthenticated(true);
      setCodeSuccess('');
    }, 800);
  };

  const handleEnterCode = () => {
    const code = codeDigits.join('');
    if (code.length < CODE_LENGTH) {
      setCodeError(`Enter all ${CODE_LENGTH} digits`);
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (code !== stored) {
      setCodeError('ACCESS DENIED \u2014 INVALID CODE');
      setCodeDigits(Array(CODE_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return;
    }
    setCodeSuccess('CODE ACCEPTED \u2014 INITIATING BIOMETRIC SCAN');
    setCodeError('');
    setTimeout(() => {
      setAuthenticated(true);
      setCodeSuccess('');
    }, 600);
  };

  const TELEMETRY_POOL = [
    'INIT: biometric_pipeline v4.2.1',
    'LOAD: retinal_topology_model [384MB]',
    'SYNC: depth_sensor_calibration OK',
    'EXEC: face_landmark_detection \u2192 468 points',
    'CALC: inter-pupillary_distance = 62.4mm',
    'EVAL: micro-expression_baseline CAPTURED',
    'SCAN: infrared_vascular_map ACQUIRED',
    'HASH: neural_sig \u2192 0xA7F3..2E91',
    'VRFY: pulse_oximetry \u2192 98.2% SpO2',
    'COMP: voice_spectrogram FFT 16384pt',
    'MATC: template_correlation r=0.9847',
    'AUTH: multi-factor_consensus PASS',
    'SEAL: cryptographic_attestation SHA-512',
    'EMIT: liveness_proof_token GENERATED',
    'POST: audit_record \u2192 kinexys_vault',
  ];

  const handleAuth = () => {
    setScanPhase('scanning');
    setCurrentPhaseIdx(0);
    setPhaseStatuses(SCAN_PHASES.map(() => 'pending'));
    setTelemetryLines([]);

    let progress = 0;
    let phaseIdx = 0;
    let telIdx = 0;
    const phaseBoundaries = SCAN_PHASES.reduce<number[]>((acc, p) => {
      acc.push((acc[acc.length - 1] || 0) + p.duration);
      return acc;
    }, []);

    const telemetryInterval = setInterval(() => {
      if (telIdx < TELEMETRY_POOL.length) {
        setTelemetryLines(prev => [...prev, TELEMETRY_POOL[telIdx]]);
        telIdx++;
      }
    }, 200);

    const interval = setInterval(() => {
      progress += 1;
      setScanProgress(progress);

      const newPhaseIdx = phaseBoundaries.findIndex(b => progress <= b);
      const actualIdx = newPhaseIdx === -1 ? SCAN_PHASES.length - 1 : newPhaseIdx;

      if (actualIdx !== phaseIdx) {
        setPhaseStatuses(prev => {
          const updated = [...prev];
          updated[phaseIdx] = 'done';
          if (actualIdx < SCAN_PHASES.length) updated[actualIdx] = 'scanning';
          return updated;
        });
        phaseIdx = actualIdx;
        setCurrentPhaseIdx(actualIdx);
      } else if (progress <= 2) {
        setPhaseStatuses(prev => {
          const updated = [...prev];
          updated[0] = 'scanning';
          return updated;
        });
      }

      if (progress >= 100) {
        clearInterval(interval);
        clearInterval(telemetryInterval);
        setPhaseStatuses(SCAN_PHASES.map(() => 'done'));
        setScanPhase('verified');
        setTimeout(() => onEnter(), 1400);
      }
    }, 35);
  };

  const renderPinInput = (
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    autoFocusFirst?: boolean
  ) => (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={d}
          autoFocus={autoFocusFirst && idx === 0}
          onChange={(e) => handleDigitChange(digits, setDigits, refs, idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(digits, setDigits, refs, idx, e)}
          onPaste={(e) => handlePaste(setDigits, refs, e)}
          className="w-9 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-mono font-semibold text-off-white bg-obsidian border border-obsidian-border rounded-md focus:border-vermilion focus:ring-1 focus:ring-vermilion/40 focus:outline-none transition-all duration-200 caret-vermilion placeholder:text-off-white-dim/20"
          style={{ letterSpacing: '0.1em' }}
        />
      ))}
    </div>
  );

  const showPasswordUI = !authenticated && (authStep === 'set-code' || authStep === 'enter-code');
  const showBiometricUI = authenticated;

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center relative overflow-hidden noise-overlay px-4 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,57,70,0.04)_0%,transparent_70%)]" />
      <div className="absolute inset-0 grid-bg" />

      {scanPhase === 'scanning' && <DataStream active />}

      {scanPhase === 'scanning' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-vermilion to-transparent animate-scan-line shadow-[0_0_15px_rgba(230,57,70,0.6)]" />
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-vermilion/40 to-transparent animate-scan-line-reverse" />
        </div>
      )}

      {scanPhase === 'verified' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)] animate-fade-in" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-vermilion to-transparent opacity-60" />

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
        <Radio className="w-3 h-3 text-vermilion animate-pulse" />
        <span className="font-mono text-[10px] text-off-white-dim tracking-widest hidden sm:inline">SENTINEL-X v4.2.1</span>
      </div>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <span className="font-mono text-[10px] text-off-white-dim tracking-widest hidden sm:inline">KINEXYS SECURE NETWORK</span>
        <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
      </div>

      <div className={`relative z-10 flex flex-col items-center w-full max-w-md transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 blur-3xl bg-vermilion/10 rounded-full scale-150" />
          <div className={`relative w-18 h-18 sm:w-24 sm:h-24 border rounded-2xl flex items-center justify-center bg-obsidian-card backdrop-blur-sm transition-all duration-500 ${
            scanPhase === 'verified' ? 'border-emerald shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
            scanPhase === 'scanning' ? 'border-vermilion/50 shadow-[0_0_20px_rgba(230,57,70,0.2)]' :
            'border-obsidian-border'
          }`}>
            <Shield className={`w-9 h-9 sm:w-12 sm:h-12 transition-colors duration-500 ${scanPhase === 'verified' ? 'text-emerald' : 'text-vermilion'}`} strokeWidth={1.5} />
            {scanPhase === 'verified' && (
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald animate-pulse" />
            )}
            {scanPhase === 'scanning' && (
              <div className="absolute inset-0 rounded-2xl border border-vermilion/30 animate-glow-pulse" />
            )}
          </div>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-off-white tracking-tight mb-3 text-center">
          SENTINEL-X
        </h1>
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-vermilion" />
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-vermilion uppercase">
            The Forensic Guard
          </p>
          <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-vermilion" />
        </div>
        <p className="text-off-white-dim text-xs sm:text-sm font-body max-w-md text-center mt-2 leading-relaxed px-2">
          AI-Powered Transaction Forensics for Institutional Finance.
          <br />
          Detecting synthetic entities across the Kinexys network.
        </p>

        <div className="mt-8 sm:mt-12 w-full">
          {showPasswordUI && authStep === 'set-code' && (
            <div className="border border-obsidian-border bg-obsidian-card rounded-lg overflow-hidden animate-fade-in">
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <KeyRound className="w-5 h-5 text-vermilion shrink-0" />
                  <div className="min-w-0">
                    <p className="text-off-white text-sm font-medium">
                      {isConfirmPhase ? 'Confirm Access Code' : 'Initialize Access Code'}
                    </p>
                    <p className="text-off-white-dim text-[10px] font-mono truncate">
                      {isConfirmPhase
                        ? 'RE-ENTER 6-DIGIT CODE TO CONFIRM'
                        : 'SET A 6-DIGIT ADMINISTRATIVE CODE'}
                    </p>
                  </div>
                </div>

                {!isConfirmPhase && renderPinInput(codeDigits, setCodeDigits, inputRefs, true)}
                {isConfirmPhase && renderPinInput(confirmDigits, setConfirmDigits, confirmRefs, true)}

                {codeError && (
                  <div className="mt-3 flex items-center gap-2 justify-center">
                    <AlertTriangle className="w-3 h-3 text-vermilion shrink-0" />
                    <p className="text-[10px] font-mono text-vermilion tracking-wider">{codeError}</p>
                  </div>
                )}
                {codeSuccess && (
                  <div className="mt-3 flex items-center gap-2 justify-center">
                    <Lock className="w-3 h-3 text-emerald shrink-0" />
                    <p className="text-[10px] font-mono text-emerald tracking-wider">{codeSuccess}</p>
                  </div>
                )}

                <button
                  onClick={handleSetCode}
                  className="mt-4 sm:mt-5 w-full border border-obsidian-border hover:border-vermilion/50 bg-obsidian hover:bg-obsidian-hover rounded-md px-4 py-3 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-vermilion" />
                    <span className="text-off-white text-xs font-mono tracking-wider">
                      {isConfirmPhase ? 'CONFIRM & ESTABLISH' : 'SET ACCESS CODE'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-off-white-dim group-hover:text-vermilion transition-colors" />
                  </div>
                </button>
              </div>
              <div className="border-t border-obsidian-border bg-obsidian/80 px-4 py-2">
                <p className="text-[9px] font-mono text-off-white-dim/40 text-center tracking-wider">
                  THIS CODE WILL BE REQUIRED ON EVERY ACCESS
                </p>
              </div>
            </div>
          )}

          {showPasswordUI && authStep === 'enter-code' && (
            <div className="border border-obsidian-border bg-obsidian-card rounded-lg overflow-hidden animate-fade-in">
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <KeyRound className="w-5 h-5 text-vermilion shrink-0" />
                  <div className="min-w-0">
                    <p className="text-off-white text-sm font-medium">Administrative Access</p>
                    <p className="text-off-white-dim text-[10px] font-mono">ENTER 6-DIGIT ACCESS CODE</p>
                  </div>
                </div>

                {renderPinInput(codeDigits, setCodeDigits, inputRefs, true)}

                {codeError && (
                  <div className="mt-3 flex items-center gap-2 justify-center">
                    <AlertTriangle className="w-3 h-3 text-vermilion shrink-0" />
                    <p className="text-[10px] font-mono text-vermilion tracking-wider">{codeError}</p>
                  </div>
                )}
                {codeSuccess && (
                  <div className="mt-3 flex items-center gap-2 justify-center">
                    <Lock className="w-3 h-3 text-emerald shrink-0" />
                    <p className="text-[10px] font-mono text-emerald tracking-wider">{codeSuccess}</p>
                  </div>
                )}

                <button
                  onClick={handleEnterCode}
                  className="mt-4 sm:mt-5 w-full border border-obsidian-border hover:border-vermilion/50 bg-obsidian hover:bg-obsidian-hover rounded-md px-4 py-3 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Fingerprint className="w-4 h-4 text-vermilion" />
                    <span className="text-off-white text-xs font-mono tracking-wider">AUTHENTICATE</span>
                    <ChevronRight className="w-3 h-3 text-off-white-dim group-hover:text-vermilion transition-colors" />
                  </div>
                </button>
              </div>
              <div className="border-t border-obsidian-border bg-obsidian/80 px-4 py-2">
                <p className="text-[9px] font-mono text-off-white-dim/40 text-center tracking-wider">
                  CODE REQUIRED BEFORE BIOMETRIC VERIFICATION
                </p>
              </div>
            </div>
          )}

          {showBiometricUI && scanPhase === 'idle' && (
            <button
              onClick={handleAuth}
              className="group w-full relative overflow-hidden border border-obsidian-border hover:border-vermilion/50 bg-obsidian-card hover:bg-obsidian-hover rounded-lg px-4 sm:px-6 py-4 transition-all duration-300 cursor-pointer animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Fingerprint className="w-5 h-5 text-vermilion shrink-0" />
                  <div className="min-w-0">
                    <p className="text-off-white text-sm font-medium">Biometric Liveness Scan</p>
                    <p className="text-off-white-dim text-[10px] font-mono truncate">CLEARANCE LEVEL: RESTRICTED \u00b7 5-FACTOR BIOMETRIC</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-off-white-dim group-hover:text-vermilion transition-colors shrink-0" />
              </div>
            </button>
          )}

          {scanPhase === 'scanning' && (
            <div className="border border-vermilion/30 bg-obsidian-card rounded-lg overflow-hidden">
              <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <Scan className="w-5 h-5 text-vermilion animate-pulse" />
                    <div className="absolute inset-0 w-5 h-5 border border-vermilion/40 rounded-full animate-ping" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-vermilion text-xs sm:text-sm font-mono font-medium truncate">Biometric Liveness Verification</p>
                    <p className="text-off-white-dim text-[10px] font-mono truncate">
                      {currentPhaseIdx < SCAN_PHASES.length ? SCAN_PHASES[currentPhaseIdx].detail : 'Finalizing...'}
                    </p>
                  </div>
                  <span className="text-vermilion text-sm font-mono font-bold shrink-0">{scanProgress}%</span>
                </div>

                <div className="w-full h-1.5 bg-obsidian-border rounded-full overflow-hidden mb-3 sm:mb-4">
                  <div
                    className="h-full vermilion-gradient rounded-full transition-all duration-75 relative"
                    style={{ width: `${scanProgress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  {SCAN_PHASES.map((phase, idx) => {
                    const PhaseIcon = phase.icon;
                    const status = phaseStatuses[idx];
                    return (
                      <div key={idx} className={`flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded transition-all duration-300 ${
                        status === 'scanning' ? 'bg-vermilion/8 border border-vermilion/20' :
                        status === 'done' ? 'bg-emerald/5 border border-emerald/15' :
                        'border border-transparent'
                      }`}>
                        <PhaseIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-colors ${
                          status === 'scanning' ? 'text-vermilion animate-pulse' :
                          status === 'done' ? 'text-emerald' :
                          'text-off-white-dim/40'
                        }`} />
                        <span className={`text-[9px] sm:text-[10px] font-mono tracking-wider flex-1 ${
                          status === 'scanning' ? 'text-vermilion' :
                          status === 'done' ? 'text-emerald' :
                          'text-off-white-dim/40'
                        }`}>
                          {phase.label}
                        </span>
                        <span className={`text-[8px] sm:text-[9px] font-mono shrink-0 ${
                          status === 'scanning' ? 'text-vermilion' :
                          status === 'done' ? 'text-emerald' :
                          'text-off-white-dim/30'
                        }`}>
                          {status === 'done' ? '\u2713 PASS' : status === 'scanning' ? 'SCANNING...' : 'QUEUED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <BiometricWaveform active />

              <div className="border-t border-obsidian-border bg-obsidian/80 px-3 sm:px-4 py-2 max-h-20 overflow-hidden">
                <div className="space-y-0.5">
                  {telemetryLines.slice(-5).map((line, i) => (
                    <p key={i} className={`text-[8px] sm:text-[9px] font-mono transition-opacity duration-200 truncate ${
                      i === telemetryLines.slice(-5).length - 1 ? 'text-vermilion/80' : 'text-off-white-dim/30'
                    }`}>
                      {'>'} {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {scanPhase === 'verified' && (
            <div className="border border-emerald/30 bg-emerald-glow rounded-lg px-4 sm:px-6 py-4 sm:py-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative shrink-0">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-emerald" />
                  <div className="absolute inset-0 rounded-full border border-emerald/50 animate-ping" />
                </div>
                <div className="min-w-0">
                  <p className="text-emerald text-xs sm:text-sm font-medium">Liveness Confirmed \u2014 Identity Verified</p>
                  <p className="text-emerald/60 text-[9px] sm:text-[10px] font-mono truncate">5/5 BIOMETRIC FACTORS AUTHENTICATED \u00b7 ACCESS GRANTED</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {SCAN_PHASES.map((phase, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 py-1">
                    <phase.icon className="w-3 h-3 text-emerald" />
                    <span className="text-[7px] font-mono text-emerald/70">\u2713 PASS</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mt-16 flex items-center gap-2 px-3 sm:px-4 py-2 border border-obsidian-border rounded bg-obsidian-card/50 max-w-full">
          <Lock className="w-3 h-3 text-off-white-dim shrink-0" />
          <p className="text-[8px] sm:text-[10px] font-mono text-off-white-dim tracking-wider truncate">
            AUTHORIZED PERSONNEL ONLY \u2014 ALL ACCESS IS MONITORED & LOGGED
          </p>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-4 sm:gap-8 w-full">
          {[
            { icon: Activity, label: 'TRANSACTIONS / DAY', value: '2.4M+' },
            { icon: AlertTriangle, label: 'THREATS BLOCKED', value: '12,847' },
            { icon: Shield, label: 'DETECTION RATE', value: '99.97%' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-off-white-dim mb-1" />
              <p className="text-off-white text-sm sm:text-lg font-heading font-bold">{value}</p>
              <p className="text-[7px] sm:text-[9px] font-mono text-off-white-dim tracking-wider text-center">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-obsidian-border to-transparent" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
        <p className="text-[8px] sm:text-[9px] font-mono text-off-white-dim/40 tracking-wider text-center">
          \u00a9 2026 SENTINEL-X\u2122 \u00b7 JP MORGAN KINEXYS DIVISION \u00b7 CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}