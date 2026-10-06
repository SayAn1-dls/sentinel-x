'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, TrendingUp, Activity, ShieldAlert, Gauge } from 'lucide-react';

interface RiskSignal {
  id: string;
  label: string;
  category: 'BEHAVIORAL' | 'NETWORK' | 'IDENTITY' | 'TEMPORAL';
  weight: number;
  value: number;
  threshold: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  active: boolean;
}

const SIGNAL_TEMPLATES: Omit<RiskSignal, 'value' | 'active'>[] = [
  { id: 'cursor_vel', label: 'Anomalous Cursor Velocity', category: 'BEHAVIORAL', weight: 0.15, threshold: 72, severity: 'HIGH' },
  { id: 'asn_route', label: 'Unauthorized ASN Route', category: 'NETWORK', weight: 0.18, threshold: 65, severity: 'CRITICAL' },
  { id: 'temporal_jitter', label: 'Temporal Jitter Deviation', category: 'TEMPORAL', weight: 0.12, threshold: 58, severity: 'HIGH' },
  { id: 'session_fp', label: 'Session Fingerprint Collision', category: 'IDENTITY', weight: 0.14, threshold: 70, severity: 'CRITICAL' },
  { id: 'tls_downgrade', label: 'TLS Downgrade Attempt', category: 'NETWORK', weight: 0.16, threshold: 60, severity: 'CRITICAL' },
  { id: 'bio_liveness', label: 'Biometric Liveness Failure', category: 'BEHAVIORAL', weight: 0.10, threshold: 55, severity: 'HIGH' },
  { id: 'keystroke_cadence', label: 'Keystroke Cadence Anomaly', category: 'BEHAVIORAL', weight: 0.08, threshold: 50, severity: 'MEDIUM' },
  { id: 'geo_impossible', label: 'Impossible Travel Detection', category: 'NETWORK', weight: 0.17, threshold: 80, severity: 'CRITICAL' },
  { id: 'device_drift', label: 'Device Fingerprint Drift', category: 'IDENTITY', weight: 0.09, threshold: 48, severity: 'MEDIUM' },
  { id: 'api_pattern', label: 'Scripted API Access Pattern', category: 'TEMPORAL', weight: 0.11, threshold: 62, severity: 'HIGH' },
];

function RiskGauge({ score, size = 160 }: { score: number; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedScore = useRef(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 16;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalArc = endAngle - startAngle;

    const draw = () => {
      animatedScore.current += (score - animatedScore.current) * 0.06;
      const currentScore = animatedScore.current;

      ctx.clearRect(0, 0, size, size);

      // Outer track
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(30,30,30,0.8)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tick marks
      for (let i = 0; i <= 20; i++) {
        const angle = startAngle + (i / 20) * totalArc;
        const tickOuter = radius + 4;
        const tickInner = i % 5 === 0 ? radius - 8 : radius - 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * tickInner, cy + Math.sin(angle) * tickInner);
        ctx.lineTo(cx + Math.cos(angle) * tickOuter, cy + Math.sin(angle) * tickOuter);
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(252,250,249,0.3)' : 'rgba(252,250,249,0.1)';
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.8;
        ctx.stroke();
      }

      // Score arc
      const scoreAngle = startAngle + (currentScore / 100) * totalArc;
      const gradient = ctx.createConicGradient(startAngle, cx, cy);
      if (currentScore > 70) {
        gradient.addColorStop(0, '#E63946');
        gradient.addColorStop(0.5, '#E63946');
        gradient.addColorStop(1, '#C62D38');
      } else if (currentScore > 40) {
        gradient.addColorStop(0, '#F59E0B');
        gradient.addColorStop(0.5, '#E63946');
        gradient.addColorStop(1, '#E63946');
      } else {
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(0.5, '#F59E0B');
        gradient.addColorStop(1, '#F59E0B');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow effect
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      const glowColor = currentScore > 70 ? 'rgba(230,57,70,0.3)' : currentScore > 40 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)';
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Center score
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 36px "Libre Baskerville", Georgia, serif';
      ctx.fillStyle = currentScore > 70 ? '#E63946' : currentScore > 40 ? '#F59E0B' : '#10B981';
      ctx.fillText(Math.round(currentScore).toString(), cx, cy - 6);

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(107,107,107,0.8)';
      ctx.fillText('RISK INDEX', cx, cy + 18);

      // Needle dot at scoreAngle
      const dotX = cx + Math.cos(scoreAngle) * radius;
      const dotY = cy + Math.sin(scoreAngle) * radius;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = currentScore > 70 ? '#E63946' : currentScore > 40 ? '#F59E0B' : '#10B981';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [score, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="block"
    />
  );
}

export default function RiskScoringEngine() {
  const [riskScore, setRiskScore] = useState(42);
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [trend, setTrend] = useState<'rising' | 'falling' | 'stable'>('stable');
  const [alertCount, setAlertCount] = useState(0);
  const prevScore = useRef(42);
  const tickRef = useRef(0);

  const generateSignals = useCallback((): RiskSignal[] => {
    const tick = tickRef.current;
    return SIGNAL_TEMPLATES.map((template) => {
      const base = Math.sin(tick * 0.02 + template.weight * 100) * 30 + 50;
      const noise = (Math.random() - 0.5) * 25;
      const spike = Math.random() > 0.92 ? 30 : 0;
      const value = Math.max(0, Math.min(100, base + noise + spike));
      return {
        ...template,
        value: Math.round(value * 10) / 10,
        active: value > template.threshold,
      };
    });
  }, []);

  useEffect(() => {
    const update = () => {
      tickRef.current++;
      const newSignals = generateSignals();
      setSignals(newSignals);

      const activeSignals = newSignals.filter(s => s.active);
      const weightedScore = activeSignals.reduce((sum, s) => {
        const contribution = (s.value / 100) * s.weight * 100;
        return sum + contribution;
      }, 0);

      const baselineRisk = 15 + Math.sin(tickRef.current * 0.005) * 8;
      const totalScore = Math.min(100, Math.max(0, Math.round(baselineRisk + weightedScore)));

      setRiskScore(prev => {
        const diff = totalScore - prev;
        setTrend(diff > 2 ? 'rising' : diff < -2 ? 'falling' : 'stable');
        return prev + Math.round(diff * 0.3);
      });

      setAlertCount(activeSignals.filter(s => s.severity === 'CRITICAL').length);
    };

    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [generateSignals]);

  const activeSignals = signals.filter(s => s.active).sort((a, b) => b.value - a.value);
  const riskLevel = riskScore > 70 ? 'CRITICAL' : riskScore > 50 ? 'ELEVATED' : riskScore > 30 ? 'MODERATE' : 'NOMINAL';
  const riskColor = riskScore > 70 ? 'text-vermilion' : riskScore > 50 ? 'text-amber' : riskScore > 30 ? 'text-off-white' : 'text-emerald';
  const riskBorderColor = riskScore > 70 ? 'border-vermilion/30' : riskScore > 50 ? 'border-amber/30' : 'border-obsidian-border';

  const severityColors: Record<string, string> = {
    CRITICAL: 'text-vermilion bg-vermilion/10 border-vermilion/20',
    HIGH: 'text-vermilion bg-vermilion/8 border-vermilion/15',
    MEDIUM: 'text-amber bg-amber/10 border-amber/20',
    LOW: 'text-emerald bg-emerald/10 border-emerald/20',
  };

  const categoryColors: Record<string, string> = {
    BEHAVIORAL: 'text-amber',
    NETWORK: 'text-vermilion',
    IDENTITY: 'text-off-white',
    TEMPORAL: 'text-emerald',
  };

  return (
    <div className={`bg-obsidian-card border ${riskBorderColor} rounded-lg overflow-hidden transition-all duration-500`}>
      <div className={`h-[2px] transition-all duration-500 ${riskScore > 70 ? 'vermilion-gradient' : riskScore > 50 ? 'bg-amber' : riskScore > 30 ? 'bg-obsidian-border' : 'emerald-gradient'}`} />

      <div className="px-4 py-3 border-b border-obsidian-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-vermilion" />
            <h3 className="text-[11px] font-mono text-off-white tracking-wider font-medium">RISK SCORING ENGINE</h3>
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-vermilion/10 text-vermilion border border-vermilion/20 risk-alert-pulse">
                <ShieldAlert className="w-3 h-3" />
                {alertCount} CRITICAL
              </span>
            )}
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
              riskScore > 70 ? 'bg-vermilion/10 text-vermilion border-vermilion/20' :
              riskScore > 50 ? 'bg-amber/10 text-amber border-amber/20' :
              'bg-emerald/10 text-emerald border-emerald/20'
            }`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Gauge */}
          <div className="flex flex-col items-center shrink-0">
            <RiskGauge score={riskScore} size={140} />
            <div className="flex items-center gap-1.5 mt-1">
              <Activity className={`w-3 h-3 ${riskColor}`} />
              <span className={`text-[9px] font-mono ${riskColor} tracking-wider`}>
                {trend === 'rising' ? '▲ ESCALATING' : trend === 'falling' ? '▼ STABILIZING' : '— STEADY'}
              </span>
            </div>
          </div>

          {/* Active signal breakdown */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-off-white-dim tracking-wider">ACTIVE THREAT SIGNALS</span>
              <span className="text-[9px] font-mono text-off-white-dim">{activeSignals.length}/{signals.length}</span>
            </div>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto risk-signal-list">
              {activeSignals.length === 0 ? (
                <div className="flex items-center gap-2 py-3 justify-center">
                  <span className="text-[10px] font-mono text-emerald/70">ALL SIGNALS NOMINAL</span>
                </div>
              ) : (
                activeSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded border transition-all duration-300 ${
                      signal.severity === 'CRITICAL'
                        ? 'bg-vermilion/5 border-vermilion/15'
                        : signal.severity === 'HIGH'
                          ? 'bg-vermilion/3 border-vermilion/10'
                          : 'bg-obsidian border-obsidian-border'
                    }`}
                  >
                    <div className={`w-1 h-6 rounded-full shrink-0 ${
                      signal.severity === 'CRITICAL' ? 'bg-vermilion' :
                      signal.severity === 'HIGH' ? 'bg-vermilion/70' :
                      'bg-amber'
                    } ${signal.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-off-white truncate">{signal.label}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-mono ${categoryColors[signal.category]} tracking-wider`}>
                          {signal.category}
                        </span>
                        <div className="flex-1 h-[3px] bg-obsidian-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              signal.value > 70 ? 'bg-vermilion' : signal.value > 50 ? 'bg-amber' : 'bg-emerald'
                            }`}
                            style={{ width: `${signal.value}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-mono font-bold shrink-0 ${
                          signal.value > 70 ? 'text-vermilion' : signal.value > 50 ? 'text-amber' : 'text-emerald'
                        }`}>
                          {signal.value.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${severityColors[signal.severity]}`}>
                      {signal.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-obsidian-border/50 flex items-center justify-between">
        <span className="text-[7px] font-mono text-off-white-dim/40 tracking-widest">RSE v2.1 · KINEXYS THREAT INTELLIGENCE</span>
        <span className="text-[7px] font-mono text-off-white-dim/40">REFRESH: 2s</span>
      </div>
    </div>
  );
}
