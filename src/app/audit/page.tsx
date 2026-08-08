'use client';
import { AuthGate } from '@/components/auth/AuthGate';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { FilterPanel } from '@/components/audit/FilterPanel';
import { TimelineView } from '@/components/audit/TimelineView';
import { ExportButton } from '@/components/audit/ExportButton';
import { useAudit } from '@/lib/hooks/useAudit';

function AuditContent() {
  const { logs, allLogs, total, page, totalPages, setPage, severityFilter, setSeverityFilter, searchTerm, setSearchTerm, exportCSV } = useAudit();

  return (
    <div className="min-h-screen" data-testid="audit-page">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        <div className="py-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">AUDIT LOG</h1>
            <p className="text-white/40 text-sm mt-1">Deep-trace forensic event history · {total} records indexed</p>
          </div>
          <ExportButton logs={allLogs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <FilterPanel
              severity={severityFilter}
              onSeverityChange={setSeverityFilter}
              search={searchTerm}
              onSearchChange={setSearchTerm}
              onExport={exportCSV}
            />
            <AuditLogTable
              logs={logs}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
          <TimelineView logs={allLogs} />
        </div>
      </main>
    </div>
  );
}

export default function AuditPage() {
  return (
    <AuthGate>
      <AuditContent />
    </AuthGate>
  );
}
