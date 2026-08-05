'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThreatAlert } from '../types';
import { MOCK_ALERTS } from '../mock-data';
import { generateId } from '../utils';

export function useThreat() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>(MOCK_ALERTS);

  const resolve = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const active = alerts.filter(a => !a.resolved);
  const criticalCount = active.filter(a => a.level === 'CRITICAL').length;
  const highCount = active.filter(a => a.level === 'HIGH').length;

  return { alerts, active, criticalCount, highCount, resolve, dismiss };
}
