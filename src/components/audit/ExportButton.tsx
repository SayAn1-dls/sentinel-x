'use client';
import { useState } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { AuditLog } from '@/lib/types';

type ExportFormat = 'CSV' | 'JSON';

interface ExportButtonProps {
  logs: AuditLog[];
  filename?: string;
}

export function ExportButton({ logs, filename = 'sentinel-x-audit' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const exportData = (format: ExportFormat) => {
    setExporting(true);
    setTimeout(() => {
      let content: string;
      let mimeType: string;
      let ext: string;

      if (format === 'CSV') {
        const headers = 'ID,Timestamp,Action,Actor,Target,Severity,IP,Session\n';
        const rows = logs.map(l =>
          `${l.id},${new Date(l.timestamp).toISOString()},${l.action},${l.actor},${l.target},${l.severity},${l.ipAddress},${l.sessionId}`
        ).join('\n');
        content = headers + rows;
        mimeType = 'text/csv';
        ext = 'csv';
      } else {
        content = JSON.stringify(logs, null, 2);
        mimeType = 'application/json';
        ext = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 300);
  };

  return (
    <div className="flex items-center gap-2">
      <NeonButton variant="ghost" size="sm" onClick={() => exportData('CSV')} disabled={exporting}>
        EXPORT CSV
      </NeonButton>
      <NeonButton variant="ghost" size="sm" onClick={() => exportData('JSON')} disabled={exporting}>
        EXPORT JSON
      </NeonButton>
    </div>
  );
}
