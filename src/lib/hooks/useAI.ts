'use client';
import { useState, useCallback } from 'react';
import { ForensicScan } from '../types';
import { aiScanner } from '../ai-scanner';
import { MOCK_TRANSACTIONS } from '../mock-data';

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
      const scan = await aiScanner.scan(target.toUpperCase(), MOCK_TRANSACTIONS);
      setCurrentScan(scan);
      setScans(prev => [scan, ...prev]);
    } catch (err) {
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
