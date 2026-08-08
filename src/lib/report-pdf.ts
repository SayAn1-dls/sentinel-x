import { Transaction, ThreatAlert, AuditLog, DashboardStats } from './types';

interface ReportData {
  stats: DashboardStats;
  alerts: ThreatAlert[];
  transactions: Transaction[];
  logs: AuditLog[];
  generatedBy: string;
}

const ORANGE: [number, number, number] = [255, 107, 0];
const DARK: [number, number, number] = [10, 10, 10];
const RED: [number, number, number] = [220, 20, 50];
const GREY: [number, number, number] = [110, 110, 110];

export async function buildForensicReportPDF(data: ReportData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 14;
  const docId = `SNTX-${Date.now().toString(36).toUpperCase()}`;

  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 42, 'F');
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageW, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SENTINEL-X', margin, 16);
  doc.setTextColor(...ORANGE);
  doc.setFontSize(10);
  doc.text('FULL FORENSIC AUDIT REPORT', margin, 24);
  doc.setTextColor(170, 170, 170);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Document ID: ${docId}   |   Generated: ${new Date().toUTCString()}   |   Operative: ${data.generatedBy}`, margin, 31);
  doc.text('CLASSIFICATION: CONFIDENTIAL — AUTHORIZED PERSONNEL ONLY', margin, 36);

  const tableTheme = {
    styles: { fontSize: 6.5, cellPadding: 1.6, textColor: [40, 40, 40] as [number, number, number] },
    headStyles: { fillColor: DARK, textColor: ORANGE, fontStyle: 'bold' as const, fontSize: 6.5 },
    alternateRowStyles: { fillColor: [246, 244, 242] as [number, number, number] },
    margin: { left: margin, right: margin },
  };

  const section = (title: string, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...ORANGE);
    doc.text(`■ ${title}`, margin, y);
    return y + 3;
  };

  let y = section('PLATFORM SUMMARY', 52);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['TOTAL TX', 'FLAGGED (24H)', 'BLOCKED', 'ACTIVE SCANS', 'NET HEALTH', 'THREAT INDEX', 'ACTIVE ALERTS']],
    body: [[
      String(data.stats.totalTransactions),
      String(data.stats.flaggedToday),
      String(data.stats.blockedThreats),
      String(data.stats.activeScans),
      `${data.stats.networkHealth}%`,
      `${data.stats.threatIndex}/100`,
      String(data.alerts.filter(a => !a.resolved).length),
    ]],
  });

  y = section('ACTIVE THREAT ALERTS', (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9);
  const activeAlerts = data.alerts.filter(a => !a.resolved).slice(0, 15);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['LEVEL', 'MESSAGE', 'SOURCE', 'TIMESTAMP']],
    body: activeAlerts.length
      ? activeAlerts.map(a => [a.level, a.message, a.source, new Date(a.timestamp).toUTCString()])
      : [['—', 'No active alerts', '—', '—']],
    didParseCell: hook => {
      if (hook.section === 'body' && hook.column.index === 0) {
        const lvl = String(hook.cell.raw);
        hook.cell.styles.fontStyle = 'bold';
        hook.cell.styles.textColor = lvl === 'CRITICAL' || lvl === 'HIGH' ? RED : lvl === 'MEDIUM' ? ORANGE : GREY;
      }
    },
  });

  y = section('HIGHEST-RISK TRANSACTIONS', (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9);
  const topRisk = [...data.transactions].sort((a, b) => b.riskScore - a.riskScore).slice(0, 20);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['TX ID', 'CORRIDOR', 'AMOUNT', 'RISK', 'LEVEL', 'STATUS', 'FLAGS']],
    body: topRisk.map(t => [
      t.id,
      `${t.sender} → ${t.receiver}`,
      `${t.currency} ${t.amount.toLocaleString()}`,
      `${t.riskScore}`,
      t.threatLevel,
      t.status,
      t.flags.join(', ') || '—',
    ]),
    didParseCell: hook => {
      if (hook.section === 'body' && hook.column.index === 4) {
        const lvl = String(hook.cell.raw);
        hook.cell.styles.fontStyle = 'bold';
        hook.cell.styles.textColor = lvl === 'CRITICAL' || lvl === 'HIGH' ? RED : lvl === 'MEDIUM' ? ORANGE : GREY;
      }
    },
  });

  y = section('AUDIT TRAIL (MOST RECENT)', (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['TIMESTAMP', 'ACTION', 'ACTOR', 'SEVERITY', 'DETAILS']],
    body: data.logs.slice(0, 30).map(l => [
      new Date(l.timestamp).toUTCString(),
      l.action,
      l.actor,
      l.severity,
      l.details,
    ]),
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...GREY);
    doc.text('SENTINEL-X™ Forensic Guard Platform — CONFIDENTIAL — Do Not Distribute', margin, 291);
    doc.text(`${docId}  |  Page ${i} of ${pageCount}`, pageW - margin, 291, { align: 'right' });
  }

  doc.save(`SENTINEL-X_Forensic_Report_${Date.now()}.pdf`);
}
