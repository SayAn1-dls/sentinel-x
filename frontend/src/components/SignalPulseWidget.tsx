'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { EntropyState } from '@/lib/useMouseEntropy';

interface SignalPulseWidgetProps {
  entropy: EntropyState;
}

function HeartbeatWaveform({ signal, entropy }: { signal: EntropyState['signal']; entropy: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      offsetRef.current += (signal === 'BIOLOGICAL' ? 1.8 : 0.6);
      const offset = offsetRef.current;

      if (signal === 'BIOLOGICAL') {
        const bioColor = '#10B981';
        const glowColor = 'rgba(16,185,129,0.3)';

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const t = (x + offset) * 0.04;
          const beatPhase = t % (Math.PI * 2);
          let y = midY;

          if (beatPhase > 1.2 && beatPhase < 1.6) {
            const local = (beatPhase - 1.2) / 0.4;
            y = midY - Math.sin(local * Math.PI) * (6 + entropy * 4);
          } else if (beatPhase > 2.0 && beatPhase < 2.3) {
            const local = (beatPhase - 2.0) / 0.3;
            y = midY + Math.sin(local * Math.PI) * 4;
          } else if (beatPhase > 2.3 && beatPhase < 2.8) {
            const local = (beatPhase - 2.3) / 0.5;
            y = midY - Math.sin(local * Math.PI) * (14 + entropy * 10);
          } else if (beatPhase > 2.8 && beatPhase < 3.1) {
            const local = (beatPhase - 2.8) / 0.3;
            y = midY + Math.sin(local * Math.PI) * 6;
          } else if (beatPhase > 3.6 && beatPhase < 4.2) {
            const local = (beatPhase - 3.6) / 0.6;
            y = midY - Math.sin(local * Math.PI) * (5 + entropy * 3);
          } else {
            y = midY + (Math.random() - 0.5) * 1.2;
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = bioColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const t = (x + offset) * 0.04;
          const beatPhase = t % (Math.PI * 2);
          let y = midY;

          if (beatPhase > 1.2 && beatPhase < 1.6) {
            const local = (beatPhase - 1.2) / 0.4;
            y = midY - Math.sin(local * Math.PI) * (6 + entropy * 4);
          } else if (beatPhase > 2.0 && beatPhase < 2.3) {
            const local = (beatPhase - 2.0) / 0.3;
            y = midY + Math.sin(local * Math.PI) * 4;
          } else if (beatPhase > 2.3 && beatPhase < 2.8) {
            const local = (beatPhase - 2.3) / 0.5;
            y = midY - Math.sin(local * Math.PI) * (14 + entropy * 10);
          } else if (beatPhase > 2.8 && beatPhase < 3.1) {
            const local = (beatPhase - 2.8) / 0.3;
            y = midY + Math.sin(local * Math.PI) * 6;
          } else if (beatPhase > 3.6 && beatPhase < 4.2) {
            const local = (beatPhase - 3.6) / 0.6;
            y = midY - Math.sin(local * Math.PI) * (5 + entropy * 3);
          } else {
            y = midY + (Math.random() - 0.5) * 0.8;
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (signal === 'SYNTHETIC') {
        const synthColor = '#E63946';
        const glowColor = 'rgba(230,57,70,0.3)';

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const t = (x + offset) * 0.02;
          let y = midY;
          const glitchPhase = t % (Math.PI * 8);
          if (glitchPhase > 6.0 && glitchPhase < 6.15) {
            y = midY - 8;
          } else if (glitchPhase > 6.15 && glitchPhase < 6.3) {
            y = midY + 5;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = synthColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const t = (x + offset) * 0.02;
          let y = midY;
          const glitchPhase = t % (Math.PI * 8);
          if (glitchPhase > 6.0 && glitchPhase < 6.15) {
            y = midY - 8;
          } else if (glitchPhase > 6.15 && glitchPhase < 6.3) {
            y = midY + 5;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else {
        ctx.strokeStyle = 'rgba(107,107,107,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const t = (x + offset) * 0.03;
          const y = midY + Math.sin(t) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const dotX = W - 4;
      const dotColor = signal === 'BIOLOGICAL' ? '#10B981'
        : signal === 'SYNTHETIC' ? '#E63946'
        : '#6B6B6B';
      ctx.fillStyle = dotColor;
      ctx.shadowColor = dotColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(dotX, midY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [signal, entropy]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="block"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}

function EntropyBar({ value }: { value: number }) {
  const segments = 12;
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: segments }, (_, i) => {
        const threshold = (i + 1) / segments;
        const active = value >= threshold;
        const color = threshold < 0.35
          ? 'bg-vermilion'
          : threshold < 0.65
            ? 'bg-amber'
            : 'bg-emerald';
        return (
          <div
            key={i}
            className={`w-[3px] h-[10px] rounded-[1px] transition-all duration-200 ${
              active ? color : 'bg-obsidian-border'
            }`}
            style={active ? { opacity: 0.6 + value * 0.4 } : undefined}
          />
        );
      })}
    </div>
  );
}

export default function SignalPulseWidget({ entropy }: SignalPulseWidgetProps) {
  const { signal, entropy: entropyValue, sampleCount, velocity, directionChanges } = entropy;
  const [flashActive, setFlashActive] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const prevSignalRef = useRef(signal);

  useEffect(() => {
    if (prevSignalRef.current !== signal && signal !== 'CALIBRATING') {
      setFlashActive(true);
      const timer = setTimeout(() => setFlashActive(false), 600);
      prevSignalRef.current = signal;
      return () => clearTimeout(timer);
    }
    prevSignalRef.current = signal;
  }, [signal]);

  const isBio = signal === 'BIOLOGICAL';
  const isSynthetic = signal === 'SYNTHETIC';

  const borderColor = isBio
    ? 'border-emerald/30'
    : isSynthetic
      ? 'border-vermilion/30'
      : 'border-obsidian-border';

  const bgGlow = isBio
    ? 'bg-emerald-glow'
    : isSynthetic
      ? 'bg-vermilion-glow'
      : '';

  return (
    <div
      className={`
        entropy-widget
        fixed z-[100]
        bottom-3 left-3 right-3
        sm:bottom-auto sm:left-auto sm:right-4 sm:top-[60px]
        sm:w-[260px]
        bg-obsidian-card/95 backdrop-blur-xl
        border ${borderColor}
        rounded-lg overflow-hidden
        shadow-2xl
        transition-all duration-500
        ${flashActive ? 'entropy-flash' : ''}
      `}
    >
      {/* Top accent line */}
      <div
        className={`h-[2px] transition-all duration-500 ${
          isBio ? 'emerald-gradient' : isSynthetic ? 'vermilion-gradient' : 'bg-obsidian-border'
        }`}
      />

      {/* Header \u2014 always visible, acts as toggle on mobile */}
      <div
        className={`px-3 py-2 ${bgGlow} cursor-pointer sm:cursor-default`}
        onClick={() => setCollapsed(prev => !prev)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
                isBio
                  ? 'bg-emerald entropy-dot-pulse'
                  : isSynthetic
                    ? 'bg-vermilion entropy-alert-flash'
                    : 'bg-off-white-dim animate-pulse'
              }`}
            />
            <span
              className={`text-[10px] font-mono font-semibold tracking-wider transition-colors duration-300 truncate ${
                isBio ? 'text-emerald' : isSynthetic ? 'text-vermilion' : 'text-off-white-dim'
              }`}
            >
              {isBio
                ? 'SIGNAL: BIOLOGICAL'
                : isSynthetic
                  ? '\u26a0 THREAT: SYNTHETIC'
                  : '\u25cc CALIBRATING...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[8px] font-mono text-off-white-dim/60 hidden sm:inline">BEM v1.0</span>
            <button
              className="sm:hidden text-off-white-dim/60 hover:text-off-white-dim p-0.5"
              onClick={(e) => { e.stopPropagation(); setCollapsed(prev => !prev); }}
              aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
            >
              {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isSynthetic && !collapsed && (
          <div className="mt-1">
            <span className="text-[8px] font-mono text-vermilion/80 tracking-widest">
              SCRIPT DETECTED \u00b7 LOW ENTROPY
            </span>
          </div>
        )}
      </div>

      {/* Collapsible body \u2014 collapsed by default on mobile via CSS, always visible on sm+ */}
      <div className={`${collapsed ? 'hidden' : 'block'} sm:block`}>
        {/* Waveform */}
        <div className="px-3 py-1.5 border-t border-obsidian-border/50">
          <HeartbeatWaveform signal={signal} entropy={entropyValue} />
        </div>

        {/* Metrics */}
        <div className="px-3 py-2 border-t border-obsidian-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] font-mono text-off-white-dim tracking-wider">ENTROPY</span>
            <EntropyBar value={entropyValue} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[7px] font-mono text-off-white-dim/60 tracking-wider">H(\u03b8)</div>
              <div className="text-[11px] font-mono text-off-white font-medium">
                {entropyValue.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[7px] font-mono text-off-white-dim/60 tracking-wider">VEL</div>
              <div className="text-[11px] font-mono text-off-white font-medium">
                {velocity.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[7px] font-mono text-off-white-dim/60 tracking-wider">\u0394 DIR</div>
              <div className="text-[11px] font-mono text-off-white font-medium">
                {directionChanges}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-obsidian-border/50 flex items-center justify-between">
          <span className="text-[7px] font-mono text-off-white-dim/40 tracking-widest">
            BEHAVIORAL ENTROPY MONITOR
          </span>
          <div className="flex items-center gap-1">
            <div className={`w-1 h-1 rounded-full ${sampleCount >= 12 ? 'bg-emerald' : 'bg-off-white-dim'}`} />
            <span className="text-[7px] font-mono text-off-white-dim/40">{sampleCount}/{64}</span>
          </div>
        </div>
      </div>
    </div>
  );
}