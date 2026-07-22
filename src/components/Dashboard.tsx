'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Activity, AlertTriangle, ShieldCheck, Bot, Eye, Radio,
  RefreshCw, Filter, ChevronDown, Zap, Globe, Database,
  TrendingUp, Clock, BarChart3, FileDown, Search
} from 'lucide-react';
import { Transaction, RiskLevel } from '@/lib/types';
import { generateTransaction, generateInitialTransactions } from '@/lib/mock-data';
import { generateForensicPDF } from '@/lib/pdf-generator';
import TransactionRow from './TransactionRow';
import { useMouseEntropy } from '@/lib/useMouseEntropy';
import SignalPulseWidget from './SignalPulseWidget';
import RiskScoringEngine from './RiskScoringEngine';
import ThreatLandscapeMap from './ThreatLandscapeMap';

type DashboardView = 'transactions' | 'intelligence';

export default function Dashboard() {
  const entropyState = useMouseEntropy();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'synthetic' | 'human' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('transactions');
  const feedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTransactions(generateInitialTransactions(30));
  }, []);

  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTransactions(prev => {
        const newTx = generateTransaction();
        const updated = [newTx, ...prev];
        return updated.slice(0, 100);
      });
    }, 3000 + Math.random() * 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive]);

  const filtered = transactions.filter(tx => {
    if (filter === 'synthetic' && tx.entityType !== 'Synthetic AI') return false;
    if (filter === 'human' && tx.entityType !== 'Human') return false;
    if (filter === 'flagged' && !['FLAGGED', 'BLOCKED'].includes(tx.status)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return tx.id.toLowerCase().includes(q) ||
        tx.sender.toLowerCase().includes(q) ||
        tx.receiver.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: transactions.length,
    synthetic: transactions.filter(t => t.entityType === 'Synthetic AI').length,
    flagged: transactions.filter(t => ['FLAGGED', 'BLOCKED'].includes(t.status)).length,
    verified: transactions.filter(t => t.status === 'VERIFIED').length,
    blocked: transactions.filter(t => t.status === 'BLOCKED').length,
    totalVolume: transactions.reduce((s, t) => s + t.amount, 0),
    avgConfidence: transactions.length ? transactions.reduce((s, t) => s + t.confidence, 0) / transactions.length : 0,
  };

  const syntheticRate = stats.total ? ((stats.synthetic / stats.total) * 100).toFixed(1) : '0';
  const threatRate = stats.total ? ((stats.flagged / stats.total) * 100).toFixed(1) : '0';

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${(v / 1e3).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen bg-obsidian noise-overlay pb-16 sm:pb-0">
      <SignalPulseWidget entropy={entropyState} />
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-obsidian/95 backdrop-blur-xl border-b border-obsidian-border">
        <div className="h-[2px] vermilion-gradient" />
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 sm:py-3">
          {/* Top row: brand + live toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-vermilion" strokeWidth={1.5} />
                <div>
                  <h1 className="font-heading text-sm sm:text-lg font-bold text-off-white tracking-tight leading-none">SENTINEL-X</h1>
                  <p className="text-[8px] sm:text-[9px] font-mono text-off-white-dim tracking-widest hidden sm:block">KINEXYS FORENSIC INTELLIGENCE</p>
                </div>
              </div>
              <div className="h-5 sm:h-6 w-px bg-obsidian-border mx-1 sm:mx-2 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLive ? 'bg-emerald animate-pulse' : 'bg-off-white-dim'}`} />
                <span className="text-[9px] sm:text-[10px] font-mono text-off-white-dim">{isLive ? 'LIVE' : 'PAUSED'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* View Switcher */}
              <div className="flex items-center border border-obsidian-border rounded-md overflow-hidden">
                <button
                  onClick={() => setActiveView('transactions')}
                  className={`px-2 sm:px-2.5 py-1.5 text-[9px] font-mono transition-all cursor-pointer ${
                    activeView === 'transactions'
                      ? 'bg-vermilion/15 text-vermilion'
                      : 'text-off-white-dim hover:text-off-white hover:bg-obsidian-hover'
                  }`}
                >
                  <span className="hidden sm:inline">TRANSACTIONS</span>
                  <span className="sm:hidden">TXNS</span>
                </button>
                <div className="w-px h-4 bg-obsidian-border" />
                <button
                  onClick={() => setActiveView('intelligence')}
                  className={`px-2 sm:px-2.5 py-1.5 text-[9px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    activeView === 'intelligence'
                      ? 'bg-vermilion/15 text-vermilion'
                      : 'text-off-white-dim hover:text-off-white hover:bg-obsidian-hover'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">INTELLIGENCE</span>
                  <span className="sm:hidden">INTEL</span>
                </button>
              </div>

              {/* Search — full on desktop, icon-expandable on mobile */}
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-off-white-dim" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-obsidian-card border border-obsidian-border rounded-md pl-8 pr-3 py-1.5 text-xs text-off-white placeholder:text-off-white-dim/50 focus:outline-none focus:border-vermilion/50 w-48 lg:w-56 font-mono"
                />
              </div>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                  isLive
                    ? 'border-emerald/30 text-emerald bg-emerald-glow'
                    : 'border-obsidian-border text-off-white-dim hover:border-off-white-dim/30'
                }`}
              >
                <Radio className="w-3 h-3" />
                {isLive ? 'LIVE' : 'PAUSED'}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="mt-2 relative sm:hidden">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-off-white-dim" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-obsidian-card border border-obsidian-border rounded-md pl-8 pr-3 py-1.5 text-xs text-off-white placeholder:text-off-white-dim/50 focus:outline-none focus:border-vermilion/50 w-full font-mono"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6 relative z-10">
        {/* Stat Cards — fluid grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: 'TOTAL TXNS', value: stats.total.toString(), icon: Database, color: 'text-off-white' },
            { label: 'VOLUME', value: formatVolume(stats.totalVolume), icon: TrendingUp, color: 'text-off-white' },
            { label: 'SYNTHETIC AI', value: stats.synthetic.toString(), sub: `${syntheticRate}%`, icon: Bot, color: 'text-vermilion' },
            { label: 'FLAGGED', value: stats.flagged.toString(), sub: `${threatRate}%`, icon: AlertTriangle, color: 'text-vermilion' },
            { label: 'BLOCKED', value: stats.blocked.toString(), icon: Shield, color: 'text-vermilion' },
            { label: 'VERIFIED', value: stats.verified.toString(), icon: ShieldCheck, color: 'text-emerald' },
            { label: 'AVG CONFIDENCE', value: `${stats.avgConfidence.toFixed(1)}%`, icon: BarChart3, color: 'text-off-white' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-obsidian-card border border-obsidian-border rounded-lg p-2.5 sm:p-3 hover:border-obsidian-hover transition-colors">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${color}`} />
                <span className="text-[7px] sm:text-[8px] font-mono text-off-white-dim tracking-wider">{label}</span>
              </div>
              <p className={`text-lg sm:text-xl font-heading font-bold ${color}`}>{value}</p>
              {sub && <p className="text-[9px] sm:text-[10px] font-mono text-off-white-dim mt-0.5">{sub} of total</p>}
            </div>
          ))}
        </div>

        {/* Intelligence View */}
        {activeView === 'intelligence' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <RiskScoringEngine />
              <ThreatLandscapeMap />
            </div>
          </div>
        )}

        {/* Transaction View */}
        {activeView === 'transactions' && (
          <>
            {/* Filter Bar — horizontally scrollable on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                {(
                  [
                    { key: 'all', label: 'All', fullLabel: 'All Transactions', count: transactions.length },
                    { key: 'synthetic', label: 'Synthetic', fullLabel: 'Synthetic AI', count: stats.synthetic },
                    { key: 'flagged', label: 'Flagged', fullLabel: 'Flagged / Blocked', count: stats.flagged },
                    { key: 'human', label: 'Human', fullLabel: 'Human Verified', count: stats.verified },
                  ] as const
                ).map(({ key, label, fullLabel, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      filter === key
                        ? 'border-vermilion/40 text-vermilion bg-vermilion-glow'
                        : 'border-obsidian-border text-off-white-dim hover:border-off-white-dim/30 hover:text-off-white'
                    }`}
                  >
                    <span className="sm:hidden">{label}</span>
                    <span className="hidden sm:inline">{fullLabel}</span>
                    {' '}<span className="opacity-60">({count})</span>
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-off-white-dim shrink-0">
                <Zap className="w-3 h-3 text-amber" />
                <span>Processing {(Math.random() * 2000 + 500).toFixed(0)} txns/sec</span>
              </div>
            </div>

            {/* Transaction Feed */}
            <div className="bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden">
              {/* Table Header — hidden on mobile since rows use card layout */}
              <div className="hidden md:grid grid-cols-[2.5fr_2fr_1.2fr_1.2fr_1fr_1fr_0.5fr] gap-3 items-center px-4 py-2.5 bg-obsidian-light border-b border-obsidian-border text-[9px] font-mono tracking-wider text-off-white-dim">
                <span>TRANSACTION ID</span>
                <span>COUNTERPARTIES</span>
                <span className="text-right">AMOUNT</span>
                <span>ENTITY</span>
                <span>RISK</span>
                <span>STATUS</span>
                <span />
              </div>

              {/* Rows */}
              <div ref={feedRef} className="max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-380px)] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <Eye className="w-8 h-8 text-off-white-dim/30 mb-3" />
                    <p className="text-sm text-off-white-dim">No transactions match your criteria</p>
                  </div>
                ) : (
                  filtered.map((tx, i) => (
                    <TransactionRow key={tx.id} tx={tx} index={i} />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center sm:justify-between text-[8px] sm:text-[9px] font-mono text-off-white-dim/50 gap-1">
          <span>SENTINEL-X™ v4.2.1 · Kinexys Forensic Intelligence Platform</span>
          <span>Showing {filtered.length} of {transactions.length} transactions · {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
