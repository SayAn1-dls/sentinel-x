'use client';
import { useForensicStore } from '@/lib/store';

export function useTransactions() {
  return useForensicStore((s) => ({
    transactions: s.transactions,
    setTransactions: s.setTransactions,
  }));
}

export function useAlerts() {
  return useForensicStore((s) => ({
    alerts: s.alerts,
    setAlerts: s.setAlerts,
  }));
}

export function useAuditLogStore() {
  return useForensicStore((s) => ({
    auditLogs: s.auditLogs,
    addAuditLog: s.addAuditLog,
  }));
}

export function useNetworkStore() {
  return useForensicStore((s) => ({
    networkNodes: s.networkNodes,
    setNetworkNodes: s.setNetworkNodes,
  }));
}

export function useRiskScore() {
  return useForensicStore((s) => ({
    riskScore: s.riskScore,
    setRiskScore: s.setRiskScore,
  }));
}

export function useScanStatus() {
  return useForensicStore((s) => ({
    isScanning: s.isScanning,
    setIsScanning: s.setIsScanning,
  }));
}

export function useActivePanel() {
  return useForensicStore((s) => ({
    activePanel: s.activePanel,
    setActivePanel: s.setActivePanel,
  }));
}
