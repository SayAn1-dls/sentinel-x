'use client';
import { useState } from 'react';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { useAuth } from '@/lib/hooks/useAuth';
import { buildForensicReportPDF } from '@/lib/report-pdf';

type ActionKey = 'scan' | 'lock' | 'export' | 'clear';

interface Status {
  type: 'ok' | 'err' | 'busy';
  text: string;
}

export function QuickActions() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Partial<Record<ActionKey, Status>>>({});
  const [locked, setLocked] = useState(false);

  const setSt = (key: ActionKey, st: Status | undefined) =>
    setStatus(prev => ({ ...prev, [key]: st }));

  const fullScan = async () => {
    setSt('scan', { type: 'busy', text: 'SWEEPING LEDGER...' });
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'FULL-LEDGER' }),
      });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setSt('scan', { type: 'ok', text: `${data.threatLevel} · ${data.findings.length} FINDINGS · ${data.confidence}%` });
    } catch {
      setSt('scan', { type: 'err', text: 'SCAN FAILED' });
    }
  };

  const lockGateways = async () => {
    setSt('lock', { type: 'busy', text: 'EXECUTING...' });
    try {
      const res = await fetch('/api/network/lock', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error();
      const payload = await res.json();
      setLocked(payload.locked);
      setSt('lock', { type: 'ok', text: payload.locked ? `${payload.count} GATEWAYS OFFLINE` : `${payload.count} GATEWAYS RESTORED` });
    } catch {
      setSt('lock', { type: 'err', text: 'LOCK FAILED' });
    }
  };

  const exportReport = async () => {
    setSt('export', { type: 'busy', text: 'COMPILING PDF...' });
    try {
      const [txRes, alertRes, auditRes, statsRes] = await Promise.all([
        fetch('/api/transactions?limit=200', { credentials: 'include' }),
        fetch('/api/alerts', { credentials: 'include' }),
        fetch('/api/audit?limit=30', { credentials: 'include' }),
        fetch('/api/stats', { credentials: 'include' }),
      ]);
      if (!txRes.ok || !alertRes.ok || !auditRes.ok || !statsRes.ok) throw new Error();
      await buildForensicReportPDF({
        stats: await statsRes.json(),
        alerts: (await alertRes.json()).data,
        transactions: (await txRes.json()).data,
        logs: (await auditRes.json()).data,
        generatedBy: user?.email ?? 'unknown',
      });
      await fetch('/api/audit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXPORT_REPORT', details: 'Full forensic PDF report exported from dashboard' }),
      });
      setSt('export', { type: 'ok', text: 'PDF DOWNLOADED' });
    } catch {
      setSt('export', { type: 'err', text: 'EXPORT FAILED' });
    }
  };

  const clearAlerts = async () => {
    setSt('clear', { type: 'busy', text: 'RESOLVING...' });
    try {
      const res = await fetch('/api/alerts/clear', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error();
      const { resolved } = await res.json();
      setSt('clear', { type: 'ok', text: `${resolved} ALERTS RESOLVED` });
    } catch {
      setSt('clear', { type: 'err', text: 'CLEAR FAILED' });
    }
  };

  const ACTIONS: { key: ActionKey; label: string; icon: string; desc: string; onClick: () => void; testId: string }[] = [
    { key: 'scan', label: 'FULL SCAN', icon: '🧠', desc: 'Run AI deep scan on all transactions', onClick: fullScan, testId: 'qa-full-scan-btn' },
    { key: 'lock', label: locked ? 'UNLOCK GATEWAYS' : 'LOCK GATEWAYS', icon: '🔒', desc: locked ? 'Restore all network gateways online' : 'Emergency lock all network gateways', onClick: lockGateways, testId: 'qa-lock-gateways-btn' },
    { key: 'export', label: 'EXPORT REPORT', icon: '📋', desc: 'Export full forensic audit report (PDF)', onClick: exportReport, testId: 'qa-export-report-btn' },
    { key: 'clear', label: 'CLEAR ALERTS', icon: '✓', desc: 'Resolve all non-critical alerts', onClick: clearAlerts, testId: 'qa-clear-alerts-btn' },
  ];

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">QUICK ACTIONS</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(action => {
          const st = status[action.key];
          return (
            <button
              key={action.key}
              onClick={action.onClick}
              disabled={st?.type === 'busy'}
              data-testid={action.testId}
              className="flex flex-col items-start p-3 rounded-lg border border-white/5 hover:border-orange-500/40 transition-all hover:bg-white/5 text-left disabled:opacity-60"
            >
              <span className="text-xl mb-2">{action.icon}</span>
              <span className="text-xs font-black tracking-widest uppercase text-white/80">{action.label}</span>
              <span className="text-white/30 text-xs mt-1 leading-tight">{action.desc}</span>
              {st && (
                <span
                  data-testid={`qa-status-${action.key}`}
                  className={`text-[10px] font-black tracking-widest mt-2 ${st.type === 'ok' ? 'text-green-400' : st.type === 'err' ? 'text-red-400' : 'text-orange-400 animate-pulse'}`}
                >
                  {st.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </SiliconCard>
  );
}
