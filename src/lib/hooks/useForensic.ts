'use client';
import { useState, useEffect, useCallback } from 'react';
import { Transaction, DashboardStats } from '../types';
import { MOCK_TRANSACTIONS, generateMockTransaction } from '../mock-data';
import { ForensicEngine } from '../forensic-engine';
import { REFRESH_INTERVAL } from '../constants';

export function useForensic() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const computeStats = useCallback((txs: Transaction[]): DashboardStats => ({
    totalTransactions: txs.length,
    flaggedToday: txs.filter(t => t.status === 'FLAGGED').length,
    blockedThreats: txs.filter(t => t.status === 'BLOCKED').length,
    activeScans: 3,
    networkHealth: 94,
    threatIndex: ForensicEngine['computeRiskScore'] ? 67 : Math.floor(Math.random() * 40) + 30,
  }), []);

  useEffect(() => {
    setStats(computeStats(transactions));
  }, [transactions, computeStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = generateMockTransaction();
      setTransactions(prev => [newTx, ...prev.slice(0, 99)]);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const analyzeTransaction = useCallback((tx: Transaction) => {
    setLoading(true);
    const level = ForensicEngine.analyzeTransaction(tx);
    setTransactions(prev =>
      prev.map(t => t.id === tx.id ? { ...t, threatLevel: level } : t)
    );
    setLoading(false);
    return level;
  }, []);

  const blockTransaction = useCallback((txId: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === txId ? { ...t, status: 'BLOCKED' } : t)
    );
  }, []);

  return { transactions, stats, loading, analyzeTransaction, blockTransaction };
}
