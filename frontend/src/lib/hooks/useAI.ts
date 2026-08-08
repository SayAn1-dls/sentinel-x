'use client';
import { useState, useEffect, useCallback } from 'react';
import { ForensicScan } from '../types';

export function useAI() {
  const [scanning, setScanning] = useState(false);
  const [scans, setScans] = useState<ForensicScan[]>([]);
  const [currentScan, setCurrentScan] = useState<ForensicScan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = useCallback(async (target: string) => {
    if (!target.trim()) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      if (!res.ok) throw new Error('Scan failed');
      const { data } = await res.json();
      setCurrentScan(data);
      setScans(prev => [data, ...prev]);
    } catch {
      setError('Scan failed. Please retry.');
    } finally {
      setScanning(false);
    }
  }, []);

  const clearScan = useCallback(() => {
    setCurrentScan(null);
    setError(null);
  }, []);

  return { scanning, scans, currentScan, error, runScan, clearScan };
}

export function useScans(pollMs = 15000) {
  const [scans, setScans] = useState<ForensicScan[]>([]);

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/scan', { credentials: 'include' });
      if (res.ok) setScans((await res.json()).recentScans ?? []);
    } catch {
      // keep last known state
    }
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, pollMs);
    return () => clearInterval(interval);
  }, [reload, pollMs]);

  return { scans, reload };
}
