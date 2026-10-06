'use client';
import { useState, useEffect, useCallback } from 'react';
import { NetworkGateway } from '../types';

export function useNetwork() {
  const [gateways, setGateways] = useState<NetworkGateway[]>([]);
  const [healthScore, setHealthScore] = useState(100);
  const [avgLatency, setAvgLatency] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/network', { credentials: 'include' });
      if (!res.ok) return;
      const payload = await res.json();
      setGateways(payload.gateways);
      setHealthScore(payload.stats.healthScore);
      setAvgLatency(payload.stats.avgLatency);
    } catch {
      // keep last known state
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return {
    gateways,
    healthScore,
    avgLatency,
    online: gateways.filter(g => g.status === 'ONLINE'),
  };
}
