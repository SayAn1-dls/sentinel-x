'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuditLog, ThreatLevel } from '../types';

export function useAudit() {
  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [severityFilter, setSeverityFilter] = useState<ThreatLevel | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/audit?limit=300', { credentials: 'include' });
      if (res.ok) setAllLogs((await res.json()).data);
    } catch {
      // keep last known state
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(() => {
    let result = allLogs;
    if (severityFilter !== 'ALL') result = result.filter(l => l.severity === severityFilter);
    if (searchTerm) result = result.filter(l =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return result;
  }, [allLogs, severityFilter, searchTerm]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const exportCSV = useCallback(() => {
    const headers = 'ID,Timestamp,Action,Actor,Target,Severity,Details\n';
    const rows = filtered.map(l =>
      `${l.id},${new Date(l.timestamp).toISOString()},${l.action},${l.actor},${l.target},${l.severity},"${l.details}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-x-audit-${Date.now()}.csv`;
    a.click();
  }, [filtered]);

  return { logs: paginated, allLogs, total: filtered.length, page, totalPages, setPage, severityFilter, setSeverityFilter, searchTerm, setSearchTerm, exportCSV };
}

export function useAuditFeed(limit = 15) {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/audit?limit=${limit}`, { credentials: 'include' });
        if (res.ok && mounted) setLogs((await res.json()).data);
      } catch {
        // keep last known state
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [limit]);

  return logs;
}
