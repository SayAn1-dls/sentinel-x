'use client';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { FilterPanel } from '@/components/audit/FilterPanel';
import { useAudit } from '@/lib/hooks/useAudit';
import { SiliconCard } from '@/components/ui/SiliconCard';

export default function AuditPage() {
  const { logs, total, page, totalPages, setPage, severityFilter, setSeverityFilter, searchTerm, setSearchTerm, exportCSV } = useAudit();

  return (
    <div className="min-h-screen">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        <div className="py-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">AUDIT LOG</h1>
            <p className="text-white/40 text-sm mt-1">Deep-trace forensic event history</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs tracking-widest uppercase">{total} records indexed</span>
          </div>
        </div>

        <div className="space-y-4">
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
      </main>
    </div>
  );
}
