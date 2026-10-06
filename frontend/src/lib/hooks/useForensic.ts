'use client';
import { useState, useEffect, useCallback } from 'react';
import { Transaction, DashboardStats, ThreatLevel } from '../types';

export function useForensic() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (live: boolean) => {
    try {
      const [txRes, stRes] = await Promise.all([
        fetch(`/api/transactions?limit=100${live ? '&live=1' : ''}`, { credentials: 'include' }),
        fetch('/api/stats', { credentials: 'include' }),
      ]);
      if (txRes.ok) setTransactions((await txRes.json()).data);
      if (stRes.ok) setStats(await stRes.json());
    } catch {
      // network hiccup — keep last known state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), 5000);
    return () => clearInterval(interval);
  }, [load]);

  const blockTransaction = useCallback(async (txId: string) => {
    setTransactions(prev => prev.map(t => (t.id === txId ? { ...t, status: 'BLOCKED' } : t)));
    await fetch(`/api/transactions/${txId}/block`, { method: 'PATCH', credentials: 'include' });
  }, []);

  const analyzeTransaction = useCallback((tx: Transaction): ThreatLevel => tx.threatLevel, []);

  return { transactions, stats, loading, analyzeTransaction, blockTransaction };
}
