'use client';

import { Transaction } from '@/lib/types';
import {
  AlertTriangle, Shield, ShieldCheck, ShieldAlert, Clock,
  Bot, User, ChevronDown, ChevronUp, FileDown,
  Network, Fingerprint, Keyboard, MousePointer, Wifi, Cpu, Globe, Hash
} from 'lucide-react';
import { useState } from 'react';
import { generateForensicPDF } from '@/lib/pdf-generator';

interface TransactionRowProps {
  tx: Transaction;
  index: number;
}

type DetailTab = 'overview' | 'signals';

export default function TransactionRow({ tx, index }: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  const riskStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: { bg: 'bg-vermilion/10', text: 'text-vermilion', border: 'border-vermilion/30', dot: 'bg-vermilion' },
    HIGH: { bg: 'bg-vermilion/8', text: 'text-vermilion', border: 'border-vermilion/20', dot: 'bg-vermilion' },
    MEDIUM: { bg: 'bg-amber/10', text: 'text-amber', border: 'border-amber/20', dot: 'bg-amber' },
    LOW: { bg: 'bg-emerald/8', text: 'text-emerald', border: 'border-emerald/20', dot: 'bg-emerald' },
    CLEAR: { bg: 'bg-emerald/5', text: 'text-emerald', border: 'border-emerald/15', dot: 'bg-emerald' },
  };

  const statusStyles: Record<string, { bg: string; text: string }> = {
    BLOCKED: { bg: 'bg-vermilion/15', text: 'text-vermilion' },
    FLAGGED: { bg: 'bg-vermilion/10', text: 'text-vermilion' },
    UNDER_REVIEW: { bg: 'bg-amber/10', text: 'text-amber' },
    VERIFIED: { bg: 'bg-emerald/10', text: 'text-emerald' },
  };

  const style = riskStyles[tx.riskLevel];
  const statusStyle = statusStyles[tx.status];

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setGenerating(true);
    try {
      await generateForensicPDF(tx);
    } finally {
      setGenerating(false);
    }
  };

  const formatAmount = (n: number) => {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(2)}`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const BiometricBar = ({ value, max = 100, danger = false }: { value: number; max?: number; danger?: boolean }) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
      <div className="w-full h-1 bg-obsidian-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${danger ? 'bg-vermilion' : pct > 60 ? 'bg-emerald' : pct > 30 ? 'bg-amber' : 'bg-vermilion'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  const MiniGauge = ({ value, max = 100, label, unit = '' }: { value: number; max?: number; label: string; unit?: string }) => {
    const pct = Math.min((value / max) * 100, 100);
    const isGood = pct > 60;
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-off-white-dim w-32 shrink-0">{label}</span>
        <div className="flex-1 h-1.5 bg-obsidian-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-emerald' : pct > 30 ? 'bg-amber' : 'bg-vermilion'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-[10px] font-mono w-16 text-right ${isGood ? 'text-emerald' : pct > 30 ? 'text-amber' : 'text-vermilion'}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
    );
  };

  const renderSignalAnalysis = () => {
    const bt = tx.behavioralTelemetry;
    const nf = tx.networkForensics;
    const ip = tx.identityProof;

    return (
      <div className="space-y-5">
        {/* Behavioral Telemetry */}
        <div className="bg-obsidian border border-obsidian-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-4 h-4 text-vermilion" />
            <h4 className="text-[11px] font-mono text-off-white tracking-wider font-medium">BEHAVIORAL TELEMETRY</h4>
            <div className="flex-1 h-px bg-obsidian-border" />
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
              bt.keystrokeIntervalStdDev < 5 ? 'bg-vermilion/10 text-vermilion' : 'bg-emerald/10 text-emerald'
            }`}>
              {bt.keystrokeIntervalStdDev < 5 ? 'ANOMALOUS' : 'NORMAL'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            <div className="col-span-2 mb-1">
              <p className="text-[9px] font-mono text-off-white-dim tracking-wider mb-2">KEYSTROKE DYNAMICS</p>
            </div>
            <MiniGauge label="Interval Mean" value={bt.keystrokeIntervalMean} max={300} unit="ms" />
            <MiniGauge label="Interval StdDev" value={bt.keystrokeIntervalStdDev} max={100} unit="ms" />
            <MiniGauge label="Flight Time" value={bt.keystrokeFlightTime} max={150} unit="ms" />
            <MiniGauge label="Dwell Time" value={bt.keystrokeDwellTime} max={200} unit="ms" />

            <div className="col-span-2 mt-2 mb-1">
              <p className="text-[9px] font-mono text-off-white-dim tracking-wider mb-2">MOUSE & INTERACTION ENTROPY</p>
            </div>
            <MiniGauge label="Velocity Mean" value={bt.mouseVelocityMean} max={800} unit="px/s" />
            <MiniGauge label="Velocity StdDev" value={bt.mouseVelocityStdDev} max={250} unit="px/s" />
            <MiniGauge label="Acceleration" value={bt.mouseAcceleration} max={500} unit="px/s²" />
            <MiniGauge label="Scroll Entropy" value={bt.scrollPatternEntropy} max={10} unit="" />
            <MiniGauge label="Click Precision" value={bt.clickPrecision} max={100} unit="%" />
            <MiniGauge label="Idle Time Ratio" value={bt.idleTimeRatio * 100} max={100} unit="%" />

            <div className="col-span-2 mt-2 pt-2 border-t border-obsidian-border/50">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-off-white-dim font-mono">COPY/PASTE FREQ</span>
                  <span className={`text-[10px] font-mono font-bold ${bt.copyPasteFrequency > 0.5 ? 'text-vermilion' : 'text-emerald'}`}>
                    {(bt.copyPasteFrequency * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-off-white-dim font-mono">TAB SWITCHES</span>
                  <span className={`text-[10px] font-mono font-bold ${bt.tabSwitchCount < 3 ? 'text-vermilion' : 'text-emerald'}`}>
                    {bt.tabSwitchCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Forensics */}
        <div className="bg-obsidian border border-obsidian-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-4 h-4 text-vermilion" />
            <h4 className="text-[11px] font-mono text-off-white tracking-wider font-medium">NETWORK FORENSICS</h4>
            <div className="flex-1 h-px bg-obsidian-border" />
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
              nf.hopCount > 10 ? 'bg-vermilion/10 text-vermilion' : 'bg-emerald/10 text-emerald'
            }`}>
              {nf.hopCount > 10 ? 'SUSPICIOUS ROUTING' : 'DIRECT PATH'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="space-y-1.5">
              <MiniGauge label="Hop Count" value={nf.hopCount} max={25} unit="" />
              <MiniGauge label="Packet Jitter" value={nf.packetJitter} max={100} unit="ms" />
              <MiniGauge label="Latency" value={nf.latencyMs} max={1000} unit="ms" />
              <MiniGauge label="Packet Loss" value={nf.packetLoss} max={20} unit="%" />
              <MiniGauge label="DNS Resolution" value={nf.dnsResolutionMs} max={500} unit="ms" />
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-1">TLS VERSION</span>
                <span className={`text-[10px] font-mono font-bold ${nf.tlsVersion === 'TLS 1.3' ? 'text-emerald' : 'text-vermilion'}`}>
                  {nf.tlsVersion}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-1">PROTOCOL STACK</span>
                <span className="text-[10px] font-mono text-off-white">{nf.protocolStack}</span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-1">MTU</span>
                <span className={`text-[10px] font-mono font-bold ${nf.mtu === 1500 ? 'text-emerald' : 'text-amber'}`}>
                  {nf.mtu}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-1">ASN PATH</span>
                <span className="text-[9px] font-mono text-off-white/70 break-all">{nf.asnPath}</span>
              </div>
            </div>
          </div>

          {nf.geoHops.length > 0 && (
            <div className="mt-3 pt-3 border-t border-obsidian-border/50">
              <span className="text-[9px] text-off-white-dim font-mono block mb-2">GEO-ROUTING PATH</span>
              <div className="flex items-center gap-1 flex-wrap">
                {nf.geoHops.map((hop, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-off-white bg-obsidian-card px-1.5 py-0.5 rounded border border-obsidian-border">
                      <Globe className="w-2.5 h-2.5 inline mr-1 text-off-white-dim" />{hop}
                    </span>
                    {i < nf.geoHops.length - 1 && <span className="text-off-white-dim text-[9px]">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Identity Proof */}
        <div className="bg-obsidian border border-obsidian-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="w-4 h-4 text-vermilion" />
            <h4 className="text-[11px] font-mono text-off-white tracking-wider font-medium">IDENTITY PROOF</h4>
            <div className="flex-1 h-px bg-obsidian-border" />
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
              ip.deviceFingerprintMatch > 70 ? 'bg-emerald/10 text-emerald' : 'bg-vermilion/10 text-vermilion'
            }`}>
              {ip.deviceFingerprintMatch > 70 ? 'DEVICE MATCH' : 'FINGERPRINT MISMATCH'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            <div className="col-span-2">
              <MiniGauge label="Fingerprint Match" value={ip.deviceFingerprintMatch} max={100} unit="%" />
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">CANVAS HASH</span>
                <span className="text-[10px] font-mono text-off-white break-all">{ip.canvasHash}</span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">WebGL RENDERER</span>
                <span className={`text-[10px] font-mono ${
                  ip.webglRenderer.includes('SwiftShader') || ip.webglRenderer.includes('llvmpipe') ? 'text-vermilion' : 'text-off-white'
                }`}>{ip.webglRenderer}</span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">AUDIO FINGERPRINT</span>
                <span className="text-[10px] font-mono text-off-white">{ip.audioFingerprint}</span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">PLUGIN HASH</span>
                <span className="text-[10px] font-mono text-off-white">{ip.pluginHash}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">SCREEN RESOLUTION</span>
                <span className="text-[10px] font-mono text-off-white">{ip.screenResolution}</span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">TIMEZONE OFFSET</span>
                <span className="text-[10px] font-mono text-off-white">UTC{ip.timezoneOffset >= 0 ? '+' : ''}{ip.timezoneOffset}</span>
              </div>
              <div>
                <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">LANGUAGE PROFILE</span>
                <span className="text-[10px] font-mono text-off-white">{ip.languageProfile}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">FONTS</span>
                  <span className={`text-[10px] font-mono font-bold ${ip.fontEnumeration < 20 ? 'text-vermilion' : 'text-emerald'}`}>
                    {ip.fontEnumeration}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-off-white-dim font-mono block mb-0.5">CPU CORES</span>
                  <span className={`text-[10px] font-mono font-bold ${ip.hardwareConcurrency <= 2 ? 'text-vermilion' : 'text-emerald'}`}>
                    {ip.hardwareConcurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`group border-b border-obsidian-border/60 transition-all duration-200 animate-fade-in ${expanded ? 'bg-obsidian-light' : 'hover:bg-obsidian-hover'}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Main Row */}
      <div
        className="grid grid-cols-[2.5fr_2fr_1.2fr_1.2fr_1fr_1fr_0.5fr] gap-3 items-center px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-1.5 h-8 rounded-full ${style.dot} ${tx.riskLevel === 'CRITICAL' ? 'animate-pulse' : ''}`} />
          <div className="min-w-0">
            <p className="text-off-white text-xs font-mono truncate">{tx.id}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-off-white-dim" />
              <p className="text-[10px] text-off-white-dim font-mono">{formatTime(tx.timestamp)}</p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-off-white truncate">{tx.sender}</p>
          <p className="text-[10px] text-off-white-dim mt-0.5">→ {tx.receiver}</p>
        </div>

        <div className="text-right">
          <p className="text-xs font-mono text-off-white font-medium">{formatAmount(tx.amount)}</p>
          <p className="text-[10px] text-off-white-dim font-mono">{tx.corridor}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {tx.entityType === 'Synthetic AI' ? (
            <>
              <Bot className="w-3.5 h-3.5 text-vermilion" />
              <span className="text-xs text-vermilion font-medium">Synthetic AI</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-emerald" />
              <span className="text-xs text-emerald font-medium">Human</span>
            </>
          )}
        </div>

        <div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${style.bg} ${style.text} border ${style.border}`}>
            {(tx.riskLevel === 'CRITICAL' || tx.riskLevel === 'HIGH') && <AlertTriangle className="w-2.5 h-2.5" />}
            {tx.riskLevel}
          </span>
        </div>

        <div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${statusStyle.bg} ${statusStyle.text}`}>
            {tx.status === 'VERIFIED' && <ShieldCheck className="w-2.5 h-2.5" />}
            {tx.status === 'BLOCKED' && <ShieldAlert className="w-2.5 h-2.5" />}
            {tx.status === 'FLAGGED' && <Shield className="w-2.5 h-2.5" />}
            {tx.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex justify-end">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-off-white-dim" />
          ) : (
            <ChevronDown className="w-4 h-4 text-off-white-dim opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 animate-slide-up">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 mb-3">
            <button
              onClick={() => setDetailTab('overview')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                detailTab === 'overview'
                  ? 'border-vermilion/40 text-vermilion bg-vermilion-glow'
                  : 'border-obsidian-border text-off-white-dim hover:border-off-white-dim/30 hover:text-off-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setDetailTab('signals')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                detailTab === 'signals'
                  ? 'border-vermilion/40 text-vermilion bg-vermilion-glow'
                  : 'border-obsidian-border text-off-white-dim hover:border-off-white-dim/30 hover:text-off-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              Signal Analysis Detail
            </button>
          </div>

          {detailTab === 'overview' && (
            <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-4">
              <div className="grid grid-cols-3 gap-6">
                {/* Biometric Signals */}
                <div>
                  <h4 className="text-[10px] font-mono text-off-white-dim tracking-wider mb-3 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    BIOMETRIC TELEMETRY
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Keystroke Cadence', value: tx.biometrics.keystrokeCadence, max: 100 },
                      { label: 'Temporal Jitter', value: tx.biometrics.temporalJitter, max: 50 },
                      { label: 'Biometric Liveness', value: tx.biometrics.biometricLiveness * 100, max: 100 },
                      { label: 'Mouse Entropy', value: tx.biometrics.mouseEntropy, max: 100 },
                    ].map(({ label, value, max }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-off-white-dim">{label}</span>
                          <span className="text-[10px] font-mono text-off-white">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                        </div>
                        <BiometricBar value={value} max={max} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Scores */}
                <div>
                  <h4 className="text-[10px] font-mono text-off-white-dim tracking-wider mb-3 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    TRUST METRICS
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { label: 'IP Reputation', value: tx.biometrics.ipReputation },
                      { label: 'Device Trust', value: tx.biometrics.deviceTrust },
                      { label: 'Behavioral Score', value: tx.biometrics.behavioralScore },
                      { label: 'Confidence', value: tx.confidence },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-off-white-dim">{label}</span>
                          <span className="text-[10px] font-mono text-off-white">{value.toFixed(1)}%</span>
                        </div>
                        <BiometricBar value={value} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flags & Actions */}
                <div>
                  <h4 className="text-[10px] font-mono text-off-white-dim tracking-wider mb-3 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    THREAT INDICATORS
                  </h4>
                  {tx.flags.length > 0 ? (
                    <div className="space-y-1.5 mb-4">
                      {tx.flags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-1.5 bg-vermilion/5 border border-vermilion/10 rounded px-2 py-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-vermilion mt-0.5 shrink-0" />
                          <span className="text-[10px] text-vermilion/90">{flag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald/70 mb-4 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> No threat indicators detected
                    </p>
                  )}

                  <div className="space-y-1 mb-4 text-[10px] font-mono">
                    <div className="flex justify-between text-off-white-dim">
                      <span>Session</span>
                      <span className="text-off-white">{tx.biometrics.sessionFingerprint}</span>
                    </div>
                    <div className="flex justify-between text-off-white-dim">
                      <span>Network</span>
                      <span className="text-off-white">{tx.network}</span>
                    </div>
                    <div className="flex justify-between text-off-white-dim">
                      <span>Settlement</span>
                      <span className="text-off-white">{tx.settlementTime}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleExportPDF}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-obsidian border border-obsidian-border hover:border-vermilion/50 rounded text-xs text-off-white hover:text-vermilion transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {generating ? 'Generating Dossier...' : 'Export Forensic Report'}
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-obsidian-border">
                <span className="text-[10px] text-off-white-dim font-mono">MEMO: </span>
                <span className="text-[10px] text-off-white">{tx.memo}</span>
              </div>
            </div>
          )}

          {detailTab === 'signals' && renderSignalAnalysis()}
        </div>
      )}
    </div>
  );
}
