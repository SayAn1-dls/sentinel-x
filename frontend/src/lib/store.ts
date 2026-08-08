import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Transaction, AuditLog, NetworkNode, Alert } from './types';

interface ForensicState {
  transactions: Transaction[];
  auditLogs: AuditLog[];
  networkNodes: NetworkNode[];
  alerts: Alert[];
  activePanel: 'dashboard' | 'audit' | 'network' | 'analysis';
  isScanning: boolean;
  lastRefresh: number;
  riskScore: number;
  setTransactions: (txs: Transaction[]) => void;
  addAuditLog: (log: AuditLog) => void;
  setNetworkNodes: (nodes: NetworkNode[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setActivePanel: (panel: ForensicState['activePanel']) => void;
  setIsScanning: (v: boolean) => void;
  setRiskScore: (score: number) => void;
  refresh: () => void;
  reset: () => void;
}

export const useForensicStore = create<ForensicState>()(
  devtools(
    persist(
      (set) => ({
        transactions: [],
        auditLogs: [],
        networkNodes: [],
        alerts: [],
        activePanel: 'dashboard',
        isScanning: false,
        lastRefresh: Date.now(),
        riskScore: 0,
        setTransactions: (txs) => set({ transactions: txs }),
        addAuditLog: (log) =>
          set((s) => ({ auditLogs: [log, ...s.auditLogs].slice(0, 500) })),
        setNetworkNodes: (nodes) => set({ networkNodes: nodes }),
        setAlerts: (alerts) => set({ alerts }),
        setActivePanel: (panel) => set({ activePanel: panel }),
        setIsScanning: (v) => set({ isScanning: v }),
        setRiskScore: (score) => set({ riskScore: score }),
        refresh: () => set({ lastRefresh: Date.now() }),
        reset: () =>
          set({
            transactions: [],
            auditLogs: [],
            networkNodes: [],
            alerts: [],
            riskScore: 0,
            isScanning: false,
          }),
      }),
      { name: 'sentinel-x-store' }
    )
  )
);
