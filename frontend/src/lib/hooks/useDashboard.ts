'use client';
import { useMemo } from 'react';
import { useForensic } from './useForensic';
import { useThreat } from './useThreat';
import { useNetwork } from './useNetwork';
import { calculateThreatIndex } from '../utils';

export function useDashboard() {
  const { transactions, stats } = useForensic();
  const { active: activeAlerts, criticalCount } = useThreat();
  const { healthScore, avgLatency } = useNetwork();

  const threatIndex = useMemo(() => calculateThreatIndex(transactions), [transactions]);

  const overallStatus = useMemo(() => {
    if (criticalCount > 0) return 'CRITICAL';
    if (activeAlerts.length > 3) return 'HIGH';
    if (healthScore < 80) return 'MEDIUM';
    return 'NOMINAL';
  }, [criticalCount, activeAlerts.length, healthScore]);

  return {
    transactions,
    stats,
    activeAlerts,
    criticalCount,
    healthScore,
    avgLatency,
    threatIndex,
    overallStatus,
  };
}
