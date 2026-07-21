import { Transaction } from './types';

export async function generateForensicPDF(tx: Transaction): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  const colors = {
    obsidian: [10, 10, 10] as [number, number, number],
    card: [20, 20, 20] as [number, number, number],
    border: [30, 30, 30] as [number, number, number],
    vermilion: [230, 57, 70] as [number, number, number],
    emerald: [16, 185, 129] as [number, number, number],
    amber: [245, 158, 11] as [number, number, number],
    white: [252, 250, 249] as [number, number, number],
    muted: [163, 163, 163] as [number, number, number],
    dim: [107, 107, 107] as [number, number, number],
  };

  const riskColor = (level: string): [number, number, number] => {
    switch (level) {
      case 'CRITICAL': return colors.vermilion;
      case 'HIGH': return colors.vermilion;
      case 'MEDIUM': return colors.amber;
      default: return colors.emerald;
    }
  };

  // Background
  doc.setFillColor(...colors.obsidian);
  doc.rect(0, 0, 210, 297, 'F');

  // Header bar
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 45, 'F');
  doc.setDrawColor(...colors.border);
  doc.line(0, 45, 210, 45);

  // Classification banner
  const rc = riskColor(tx.riskLevel);
  doc.setFillColor(...rc);
  doc.rect(0, 0, 210, 4, 'F');

  // Title
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SENTINEL-X', margin, 18);
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text('FORENSIC INTELLIGENCE DOSSIER', margin, 25);
  doc.setFontSize(7);
  doc.setTextColor(...colors.dim);
  doc.text(`Classification: ${tx.riskLevel} | Generated: ${new Date().toISOString()}`, margin, 32);
  doc.text(`Document ID: SNTX-${Date.now().toString(36).toUpperCase()}`, margin, 37);

  // Classification badge
  doc.setFillColor(...rc);
  doc.roundedRect(pageW - margin - 35, 10, 35, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(tx.riskLevel, pageW - margin - 17.5, 17.5, { align: 'center' });

  y = 55;

  // Helper: Section header
  const sectionHeader = (title: string, yPos: number): number => {
    doc.setFillColor(...colors.card);
    doc.roundedRect(margin, yPos, contentW, 8, 1, 1, 'F');
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, yPos, contentW, 8, 1, 1, 'S');
    doc.setTextColor(...rc);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`■ ${title}`, margin + 3, yPos + 5.5);
    return yPos + 12;
  };

  // Helper: Key-value pair
  const kvPair = (key: string, value: string, yPos: number, xOffset: number = margin + 3): number => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.dim);
    doc.text(key, xOffset, yPos);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text(value, xOffset + 40, yPos);
    return yPos + 5;
  };

  // Transaction Overview
  y = sectionHeader('TRANSACTION OVERVIEW', y);
  y = kvPair('Transaction ID', tx.id, y);
  y = kvPair('Timestamp', new Date(tx.timestamp).toLocaleString(), y);
  y = kvPair('Amount', `$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.currency}`, y);
  y = kvPair('Corridor', tx.corridor, y);
  y = kvPair('Network', tx.network, y);
  y = kvPair('Settlement', tx.settlementTime, y);
  y = kvPair('Memo', tx.memo, y);

  y += 5;

  // Counterparties
  y = sectionHeader('COUNTERPARTY INFORMATION', y);
  y = kvPair('Originator', tx.sender, y);
  y = kvPair('Originator Acct', tx.senderAccount, y);
  y = kvPair('Beneficiary', tx.receiver, y);
  y = kvPair('Beneficiary Acct', tx.receiverAccount, y);

  y += 5;

  // Detective Engine Results
  y = sectionHeader('DETECTIVE ENGINE ANALYSIS', y);
  y = kvPair('Entity Class', tx.entityType, y);
  y = kvPair('Confidence', `${tx.confidence}%`, y);
  y = kvPair('Risk Level', tx.riskLevel, y);
  y = kvPair('Status', tx.status, y);

  y += 5;

  // Biometric Telemetry
  y = sectionHeader('BIOMETRIC TELEMETRY SIGNALS', y);

  const bioMetrics = [
    ['Keystroke Cadence', `${tx.biometrics.keystrokeCadence}`, tx.biometrics.keystrokeCadence > 50 ? 'NORMAL' : 'ANOMALOUS'],
    ['Temporal Jitter', `${tx.biometrics.temporalJitter}ms`, tx.biometrics.temporalJitter > 10 ? 'NORMAL' : 'ANOMALOUS'],
    ['Biometric Liveness', `${(tx.biometrics.biometricLiveness * 100).toFixed(1)}%`, tx.biometrics.biometricLiveness > 0.7 ? 'PASS' : 'FAIL'],
    ['Mouse Entropy', `${tx.biometrics.mouseEntropy}`, tx.biometrics.mouseEntropy > 40 ? 'NORMAL' : 'ANOMALOUS'],
    ['IP Reputation', `${tx.biometrics.ipReputation}/100`, tx.biometrics.ipReputation > 60 ? 'TRUSTED' : 'SUSPICIOUS'],
    ['Device Trust', `${tx.biometrics.deviceTrust}/100`, tx.biometrics.deviceTrust > 60 ? 'TRUSTED' : 'UNTRUSTED'],
    ['Behavioral Score', `${tx.biometrics.behavioralScore}/100`, tx.biometrics.behavioralScore > 60 ? 'NORMAL' : 'ANOMALOUS'],
    ['Session ID', tx.biometrics.sessionFingerprint, ''],
  ];

  // Table header
  doc.setFillColor(18, 18, 18);
  doc.rect(margin, y, contentW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...colors.muted);
  doc.text('SIGNAL', margin + 3, y + 4);
  doc.text('VALUE', margin + 60, y + 4);
  doc.text('STATUS', margin + 110, y + 4);
  y += 7;

  bioMetrics.forEach(([signal, value, status]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.white);
    doc.text(signal, margin + 3, y + 3);
    doc.setTextColor(...colors.muted);
    doc.text(value, margin + 60, y + 3);
    if (status) {
      const isGood = ['NORMAL', 'PASS', 'TRUSTED'].includes(status);
      doc.setTextColor(...(isGood ? colors.emerald : colors.vermilion));
      doc.setFont('helvetica', 'bold');
      doc.text(status, margin + 110, y + 3);
    }
    doc.setDrawColor(25, 25, 25);
    doc.line(margin, y + 5, margin + contentW, y + 5);
    y += 6;
  });

  y += 5;

  // Flags
  if (tx.flags.length > 0) {
    y = sectionHeader('THREAT INDICATORS', y);
    tx.flags.forEach((flag, i) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...colors.vermilion);
      doc.text(`⚠  ${i + 1}. ${flag}`, margin + 3, y + 3);
      y += 5;
    });
  }

  // Footer
  const footerY = 280;
  doc.setDrawColor(...colors.border);
  doc.line(margin, footerY, margin + contentW, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...colors.dim);
  doc.text('SENTINEL-X™ Forensic Intelligence Platform | JP Morgan Kinexys Division', margin, footerY + 4);
  doc.text('CONFIDENTIAL — For Authorized Personnel Only — Do Not Distribute', margin, footerY + 8);
  doc.text(`Page 1 of 1 | ${new Date().toISOString()}`, pageW - margin, footerY + 4, { align: 'right' });

  doc.save(`SENTINEL-X_Dossier_${tx.id}.pdf`);
}
