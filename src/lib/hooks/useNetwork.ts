'use client';
import { useState, useEffect } from 'react';
import { NetworkGateway } from '../types';
import { networkMonitor } from '../network-security';

export function useNetwork() {
  const [gateways, setGateways] = useState<NetworkGateway[]>(networkMonitor.getAll());
  const [healthScore, setHealthScore] = useState(networkMonitor.getHealthScore());
  const [avgLatency, setAvgLatency] = useState(networkMonitor.getAverageLatency());

  useEffect(() => {
    const interval = setInterval(() => {
      networkMonitor.simulateHeartbeat();
      setGateways([...networkMonitor.getAll()]);
      setHealthScore(networkMonitor.getHealthScore());
      setAvgLatency(networkMonitor.getAverageLatency());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return { gateways, healthScore, avgLatency, online: networkMonitor.getOnline() };
}
