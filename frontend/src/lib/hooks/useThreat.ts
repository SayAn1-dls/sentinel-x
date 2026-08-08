'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThreatAlert } from '../types';

export function useThreat() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts', { credentials: 'include' });
      if (res.ok) setAlerts((await res.json()).data);
    } catch {
      // keep last known state
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const resolve = useCallback(async (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, resolved: true } : a)));
    await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve' }),
    });
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss' }),
    });
  }, []);

  const active = alerts.filter(a => !a.resolved);
  const criticalCount = active.filter(a => a.level === 'CRITICAL').length;
  const highCount = active.filter(a => a.level === 'HIGH').length;

  return { alerts, active, criticalCount, highCount, resolve, dismiss };
}
