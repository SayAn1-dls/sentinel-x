'use client';
import { useState, useCallback, useMemo } from 'react';
import { AuditLog, ThreatLevel } from '../types';
import { MOCK_AUDIT_LOGS } from '../mock-data';

export function useAudit() {
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [severityFilter, setSeverityFilter] = useState<ThreatLevel | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let result = logs;
    if (severityFilter !== 'ALL') result = result.filter(l => l.severity === severityFilter);
    if (searchTerm) result = result.filter(l =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return result;
  }, [logs, severityFilter, searchTerm]);

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

  return { logs: paginated, total: filtered.length, page, totalPages, setPage, severityFilter, setSeverityFilter, searchTerm, setSearchTerm, exportCSV };
}
